import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 STRAVA-IMPORT - Iniciando importación V2 PÚBLICA');
    console.log('📝 Method:', req.method);
    console.log('🔗 Headers:', Object.fromEntries(req.headers.entries()));
    
    // NUEVO SISTEMA PÚBLICO: Obtener user_id del body
    const requestBody = await req.text();
    console.log('📄 Request body:', requestBody);
    
    let user_id;
    try {
      const parsed = JSON.parse(requestBody);
      user_id = parsed.user_id;
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`🔍 Manual import requested for user: ${user_id}`);

    // Get user's Strava tokens
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('strava_connections')
      .select('access_token, refresh_token, expires_at, athlete_id')
      .eq('user_id', user_id)
      .single();

    if (tokenError || !tokenData) {
      console.error('❌ No Strava connection found for user:', user_id);
      return new Response(
        JSON.stringify({ error: 'No Strava connection found. Please connect your Strava account first.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let accessToken = tokenData.access_token;

    // Check if token is expired and refresh if needed
    if (tokenData.expires_at && Date.now() >= tokenData.expires_at * 1000) {
      console.log('🔄 Token expired, refreshing...');
      
      const refreshRes = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: Deno.env.get('STRAVA_CLIENT_ID'),
          client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
          grant_type: 'refresh_token',
          refresh_token: tokenData.refresh_token,
        }),
      });

      if (!refreshRes.ok) {
        console.error('❌ Failed to refresh token:', refreshRes.status);
        return new Response(
          JSON.stringify({ error: 'Failed to refresh Strava token. Please reconnect your account.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const refreshData = await refreshRes.json();
      accessToken = refreshData.access_token;

      // Update tokens in NEW TABLE
      await supabaseAdmin
        .from('strava_connections')
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token,
          expires_at: refreshData.expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id);

      console.log('✅ Token refreshed successfully');
    }

    // Get latest activities from Strava (last 30 activities)
    console.log('📥 Fetching latest activities from Strava...');
    const activitiesRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=30', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!activitiesRes.ok) {
      console.error(`❌ Failed to fetch activities: ${activitiesRes.status}`);
      const errorText = await activitiesRes.text();
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch activities from Strava: ${activitiesRes.status}`,
          details: errorText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    const activities = await activitiesRes.json();
    console.log(`📊 Found ${activities.length} activities from Strava`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const activity of activities) {
      // Only process running activities
      if (activity.type !== 'Run') {
        continue;
      }

      // Check if we already imported this activity
      const { data: existingActivity } = await supabaseAdmin
        .from('published_activities')
        .select('id')
        .eq('strava_activity_id', activity.id)
        .maybeSingle();

      if (existingActivity) {
        skippedCount++;
        continue;
      }

      console.log(`�� Importing activity: ${activity.name} (${activity.id})`);

      try {
        // Create published activity directly (no need for entrenamientos_completados)
        const durationInSeconds = activity.elapsed_time || activity.moving_time || 0;
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
        const durationString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Create published activity with ALL required fields
        const { error: publishError } = await supabaseAdmin
          .from('published_activities')
          .insert({
            user_id: user_id,
            title: activity.name || 'Carrera desde Strava',
            description: activity.description || '',
            distance: activity.distance || 0,
            duration: durationString,
            activity_date: new Date(activity.start_date).toISOString(),
            is_public: !activity.private,
            strava_activity_id: activity.id,
            imported_from_strava: true,
            gps_points: [], // Will be populated below if available
          });

        if (publishError) {
          console.error(`❌ Error creating published activity: ${publishError.message}`);
          continue;
        }

        // Try to get GPS data if available
        if (activity.has_kudoed === false) { // This indicates the activity has GPS data
          try {
            const gpsRes = await fetch(`https://www.strava.com/api/v3/activities/${activity.id}/export_gpx`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            });

            if (gpsRes.ok) {
              const gpxData = await gpsRes.text();
              // Update the activity with GPS data
              await supabaseAdmin
                .from('published_activities')
                .update({ 
                  gps_points: gpxData,
                  updated_at: new Date().toISOString()
                })
                .eq('strava_activity_id', activity.id);
              console.log(`✅ GPS data added for activity ${activity.id}`);
            }
          } catch (gpsError) {
            console.log(`⚠️ Could not fetch GPS data for activity ${activity.id}:`, gpsError);
          }
        }

        importedCount++;
        console.log(`✅ Imported: ${activity.name}`);

      } catch (error) {
        console.error(`❌ Error importing activity ${activity.id}:`, error);
      }
    }

    console.log(`🎯 Import completed: ${importedCount} imported, ${skippedCount} skipped`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported_count: importedCount,
        skipped_count: skippedCount,
        total: activities.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
