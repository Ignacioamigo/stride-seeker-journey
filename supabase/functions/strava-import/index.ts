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
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
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

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userResult?.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    const userId = userResult.user.id;

    console.log(`🔍 Manual import requested for user: ${userId}`);

    // Get Strava tokens
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('strava_tokens')
      .select('access_token, refresh_token, expires_at, athlete_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Strava not connected', needsConnection: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`🔑 Found tokens for athlete: ${tokenData.athlete_id}`);

    // Check if token needs refresh
    let accessToken = tokenData.access_token;
    if (Date.now() / 1000 > tokenData.expires_at) {
      console.log('🔄 Refreshing expired token...');
      
      const STRAVA_CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID');
      const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET');

      if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
        return new Response(
          JSON.stringify({ error: 'Strava credentials not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const refreshRes = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: tokenData.refresh_token,
        }),
      });

      if (!refreshRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to refresh Strava token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
        );
      }

      const refreshData = await refreshRes.json();
      accessToken = refreshData.access_token;

      // Update tokens in database
      await supabaseAdmin
        .from('strava_tokens')
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token,
          expires_at: refreshData.expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

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
      return new Response(
        JSON.stringify({ error: 'Failed to fetch activities from Strava' }),
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

      console.log(`📝 Importing activity: ${activity.name} (${activity.id})`);

      try {
        // Create completed workout record
        const durationInSeconds = activity.elapsed_time || activity.moving_time || 0;
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
        const durationString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const { data: workoutData, error: workoutError } = await supabaseAdmin
          .from('entrenamientos_completados')
          .insert({
            user_id: userId,
            workout_title: activity.name || 'Carrera desde Strava',
            workout_type: 'carrera',
            distancia_recorrida: activity.distance || 0,
            duracion: durationString,
            fecha_completado: new Date(activity.start_date).toISOString(),
          })
          .select()
          .single();

        if (workoutError) {
          console.error(`❌ Error creating workout: ${workoutError.message}`);
          continue;
        }

        // Create published activity
        await supabaseAdmin
          .from('published_activities')
          .insert({
            user_id: userId,
            entrenamiento_id: workoutData.id,
            title: activity.name || 'Carrera desde Strava',
            description: activity.description || '',
            is_public: !activity.private,
            strava_activity_id: activity.id,
            imported_from_strava: true,
          });

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
        imported: importedCount,
        skipped: skippedCount,
        total: activities.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
