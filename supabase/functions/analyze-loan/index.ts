import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const applicationData = await req.json();
    console.log('Received loan application:', applicationData);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare the prompt for AI analysis
    const prompt = `You are an expert loan officer with deep knowledge of financial risk assessment. Analyze this loan application and provide a fair, unbiased decision.

Application Details:
- Name: ${applicationData.name}
- Age: ${applicationData.age}
- Gender: ${applicationData.gender}
- Annual Income: $${applicationData.income}
- Credit Score: ${applicationData.creditScore}
- Loan Amount Requested: $${applicationData.loanAmount}
- Loan Term: ${applicationData.loanTerm} months
- Loan Purpose: ${applicationData.loanPurpose}
- Employment Status: ${applicationData.employmentStatus}
- Existing Loans: $${applicationData.existingLoans}
- Savings Balance: $${applicationData.savingsBalance}

Provide your analysis in the following format:
1. Decision: APPROVED or REJECTED
2. Confidence Level: (percentage from 0-100)
3. Fairness Score: (percentage from 0-100, indicating how unbiased this decision is)
4. Explanation: (2-3 sentences explaining the key factors in your decision)

Important: Base your decision only on financial factors. Do not discriminate based on age or gender. Focus on debt-to-income ratio, creditworthiness, savings, and loan terms.`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a fair and ethical loan officer AI. Provide objective financial assessments without bias.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiAnalysis = aiData.choices[0].message.content;
    console.log('AI Analysis:', aiAnalysis);

    // Parse AI response
    const decisionMatch = aiAnalysis.match(/Decision:\s*(APPROVED|REJECTED)/i);
    const confidenceMatch = aiAnalysis.match(/Confidence Level:\s*(\d+)/);
    const fairnessMatch = aiAnalysis.match(/Fairness Score:\s*(\d+)/);
    const explanationMatch = aiAnalysis.match(/Explanation:\s*(.+?)(?=\n\n|\n[A-Z]|$)/s);

    const prediction = decisionMatch ? decisionMatch[1].toUpperCase() : 'REJECTED';
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;
    const fairnessScore = fairnessMatch ? parseInt(fairnessMatch[1]) : 85;
    const explanation = explanationMatch ? explanationMatch[1].trim() : aiAnalysis;

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: savedApplication, error: dbError } = await supabase
      .from('loan_applications')
      .insert({
        name: applicationData.name,
        age: applicationData.age,
        gender: applicationData.gender,
        income: applicationData.income,
        credit_score: applicationData.creditScore,
        loan_amount: applicationData.loanAmount,
        loan_term: applicationData.loanTerm,
        loan_purpose: applicationData.loanPurpose,
        employment_status: applicationData.employmentStatus,
        existing_loans: applicationData.existingLoans,
        savings_balance: applicationData.savingsBalance,
        prediction,
        confidence,
        fairness_score: fairnessScore,
        explanation,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Saved application:', savedApplication);

    // If approved, also save to approved_loans
    if (prediction === 'APPROVED') {
      const monthlyEMI = (applicationData.loanAmount * (1 + 0.05)) / applicationData.loanTerm;
      
      const { error: approvedError } = await supabase
        .from('approved_loans')
        .insert({
          application_id: savedApplication.id,
          name: applicationData.name,
          loan_amount: applicationData.loanAmount,
          monthly_emi: monthlyEMI,
          next_notification_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });

      if (approvedError) {
        console.error('Error saving to approved_loans:', approvedError);
      }
    }

    return new Response(
      JSON.stringify({
        prediction,
        confidence,
        fairnessScore,
        explanation,
        applicationId: savedApplication.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-loan function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred processing your application';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});