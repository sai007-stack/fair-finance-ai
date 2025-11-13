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

    const { appealId, reviewComment, finalDecision } = await req.json();

    console.log('Reviewing appeal:', appealId);

    // Update appeal status
    const { data: appeal, error: appealError } = await supabase
      .from('appeals')
      .update({
        status: 'reviewed',
        review_comment: reviewComment,
        final_decision: finalDecision,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', appealId)
      .select('*, loan_applications(name)')
      .single();

    if (appealError) {
      console.error('Error updating appeal:', appealError);
      throw appealError;
    }

    // Create notification for customer
    const notificationMessage = `Your appeal has been reviewed. Decision: ${
      finalDecision === 'approved_after_review' ? 'Approved' : 'Rejected - AI Result Stands'
    }. ${reviewComment}`;

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: appeal.user_id,
        message: notificationMessage
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    console.log('Appeal reviewed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Appeal reviewed and customer notified'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in review-appeal function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});