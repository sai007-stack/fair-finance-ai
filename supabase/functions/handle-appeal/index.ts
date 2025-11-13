import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { loanId, userId, reasonCodes } = await req.json();

    console.log('Creating appeal for loan:', loanId);

    // Create appeal entry
    const { data: appeal, error: appealError } = await supabase
      .from('appeals')
      .insert({
        loan_id: loanId,
        user_id: userId,
        reason_codes: reasonCodes,
        status: 'pending'
      })
      .select()
      .single();

    if (appealError) {
      console.error('Error creating appeal:', appealError);
      throw appealError;
    }

    console.log('Appeal created successfully:', appeal.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        appealId: appeal.id,
        message: 'Your appeal has been submitted. A bank officer will review it.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handle-appeal function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});