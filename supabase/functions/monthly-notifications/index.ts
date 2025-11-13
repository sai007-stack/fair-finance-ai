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

    console.log('Running monthly notifications job');

    // Get all unique user IDs who have applied for loans
    const { data: applications, error: fetchError } = await supabase
      .from('loan_applications')
      .select('name')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching applications:', fetchError);
      throw fetchError;
    }

    if (!applications || applications.length === 0) {
      console.log('No loan applications found');
      return new Response(
        JSON.stringify({ message: 'No users to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get unique names (using name as user identifier since there's no auth)
    const uniqueUsers = [...new Set(applications.map(app => app.name))];

    console.log(`Creating notifications for ${uniqueUsers.length} users`);

    // Create notifications for all users
    const notifications = uniqueUsers.map(name => ({
      user_id: name, // Using name as user_id for now
      message: 'Your monthly loan update is ready. Your eligibility and insights have been refreshed.'
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Error creating notifications:', insertError);
      throw insertError;
    }

    console.log(`Successfully created ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true,
        notificationsCreated: notifications.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in monthly-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});