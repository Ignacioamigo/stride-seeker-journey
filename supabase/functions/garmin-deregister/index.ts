import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔌 Garmin deregister request received');

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('👤 User ID:', user.id);

    // Get Garmin credentials
    const GARMIN_CLIENT_ID = Deno.env.get('GARMIN_CLIENT_ID');
    const GARMIN_CLIENT_SECRET = Deno.env.get('GARMIN_CLIENT_SECRET');

    if (!GARMIN_CLIENT_ID || !GARMIN_CLIENT_SECRET) {
      throw new Error('Garmin credentials not configured');
    }

    // Get user's Garmin connection
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: connection, error: connectionError } = await supabaseAdmin
      .from('garmin_connections')
      .select('garmin_user_id, access_token')
      .eq('user_auth_id', user.id)
      .maybeSingle();

    if (connectionError) {
      console.error('❌ Error fetching connection:', connectionError);
      throw new Error('Failed to fetch Garmin connection');
    }

    if (!connection) {
      console.log('ℹ️ No Garmin connection found for user');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No Garmin connection to deregister' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log('🔍 Found Garmin connection:', connection.garmin_user_id);

    // Deregister from Garmin API
    // Según la documentación, se hace un DELETE a /userAccessToken
    console.log('📤 Deregistering from Garmin API...');
    
    try {
      const deregisterUrl = 'https://apis.garmin.com/wellness-api/rest/userAccessToken';
      const deregisterResponse = await fetch(deregisterUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
        }
      });

      if (!deregisterResponse.ok) {
        const errorText = await deregisterResponse.text();
        console.error('⚠️ Garmin API deregister failed:', errorText);
        // Continue anyway to remove local connection
      } else {
        console.log('✅ Deregistered from Garmin API');
      }
    } catch (apiError) {
      console.error('⚠️ Error calling Garmin API:', apiError);
      // Continue anyway to remove local connection
    }

    // Delete local connection
    console.log('🗑️ Deleting local Garmin connection...');
    const { error: deleteError } = await supabaseAdmin
      .from('garmin_connections')
      .delete()
      .eq('user_auth_id', user.id);

    if (deleteError) {
      console.error('❌ Error deleting connection:', deleteError);
      throw new Error('Failed to delete Garmin connection');
    }

    console.log('✅ Garmin connection deleted successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Garmin connection removed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in garmin-deregister:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});







