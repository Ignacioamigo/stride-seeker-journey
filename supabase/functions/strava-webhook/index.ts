import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StravaWebhookEvent {
  object_type: 'activity' | 'athlete';
  object_id: number;
  aspect_type: 'create' | 'update' | 'delete';
  updates: Record<string, any>;
  owner_id: number;
  subscription_id: number;
  event_time: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Handle webhook verification (GET request)
  if (req.method === 'GET') {
    const hubMode = url.searchParams.get('hub.mode');
    const hubChallenge = url.searchParams.get('hub.challenge');
    const hubVerifyToken = url.searchParams.get('hub.verify_token');

    const WEBHOOK_VERIFY_TOKEN = Deno.env.get('STRAVA_WEBHOOK_VERIFY_TOKEN') || 'stride_seeker_verify';

    if (hubMode === 'subscribe' && hubVerifyToken === WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verification successful');
      return new Response(JSON.stringify({ 'hub.challenge': hubChallenge }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      console.log('Webhook verification failed');
      return new Response('Forbidden', { status: 403 });
    }
  }

  // Handle webhook events (POST request)
  if (req.method === 'POST') {
    try {
      const event = await req.json() as StravaWebhookEvent;
      console.log('🔔 Received webhook event:', JSON.stringify(event, null, 2));

      // Only process activity events
      if (event.object_type !== 'activity') {
        return new Response('OK', { status: 200 });
      }

      // Only process create events for now
      if (event.aspect_type !== 'create') {
        return new Response('OK', { status: 200 });
      }

      const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase credentials');
        return new Response('Server configuration error', { status: 500 });
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Find user by Strava athlete ID - USANDO NUEVA TABLA
      console.log(`🔍 [V2] Looking for user with Strava athlete ID: ${event.owner_id}`);
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from('strava_connections')
        .select('user_id, access_token, refresh_token, expires_at, strava_user_id')
        .eq('strava_user_id', event.owner_id)
        .maybeSingle();

      if (tokenError) {
        console.log(`❌ [V2] Error querying strava_connections: ${tokenError.message}`);
        return new Response('OK', { status: 200 });
      }

      if (!tokenData) {
        console.log(`❌ [V2] No user found for Strava athlete ${event.owner_id}`);
        console.log('💡 This means either:');
        console.log('   1. User never connected Strava');
        console.log('   2. strava_user_id is missing/incorrect in strava_connections table');
        return new Response('OK', { status: 200 });
      }

      console.log(`✅ Found user: ${tokenData.user_id} for athlete: ${event.owner_id}`);

      // Check if token needs refresh
      let accessToken = tokenData.access_token;
      if (Date.now() / 1000 > tokenData.expires_at) {
        const STRAVA_CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID');
        const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET');

        if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
          console.error('Strava credentials not configured');
          return new Response('OK', { status: 200 });
        }

        // Refresh token
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
          console.error('Failed to refresh Strava token');
          return new Response('OK', { status: 200 });
        }

        const refreshData = await refreshRes.json();
        accessToken = refreshData.access_token;

        // Update tokens - USANDO NUEVA TABLA
        await supabaseAdmin
          .from('strava_connections')
          .update({
            access_token: refreshData.access_token,
            refresh_token: refreshData.refresh_token,
            expires_at: refreshData.expires_at,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', tokenData.user_id);
      }

      // Fetch activity details from Strava
      const activityRes = await fetch(`https://www.strava.com/api/v3/activities/${event.object_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!activityRes.ok) {
        console.error(`Failed to fetch activity ${event.object_id} from Strava`);
        return new Response('OK', { status: 200 });
      }

      const activity = await activityRes.json();

      // Only process running activities
      if (activity.type !== 'Run') {
        console.log(`Skipping non-running activity: ${activity.type}`);
        return new Response('OK', { status: 200 });
      }

      // Check if we already imported this activity
      const { data: existingActivity } = await supabaseAdmin
        .from('published_activities')
        .select('id')
        .eq('strava_activity_id', event.object_id)
        .maybeSingle();

      if (existingActivity) {
        console.log(`Activity ${event.object_id} already imported`);
        return new Response('OK', { status: 200 });
      }

      // Prepare activity data
      const durationInSeconds = activity.elapsed_time || activity.moving_time || 0;
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = durationInSeconds % 60;
      const durationString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      // Convert distance from meters to the format expected by published_activities
      const distanceInMeters = activity.distance || 0;

      // Create published activity directly
      const { data: publishedActivity, error: insertError } = await supabaseAdmin
        .from('published_activities')
        .insert({
          user_id: tokenData.user_id,
          title: activity.name || 'Carrera desde Strava',
          description: activity.description || '',
          distance: distanceInMeters,
          duration: durationString,
          is_public: !activity.private,
          strava_activity_id: event.object_id,
          imported_from_strava: true,
          activity_date: new Date(activity.start_date).toISOString(),
          gps_points: [], // Will be populated below if available
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating published activity:', insertError);
        return new Response('OK', { status: 200 });
      }

      // Import GPS points if available
      if (activity.map && activity.map.summary_polyline) {
        try {
          const streamRes = await fetch(`https://www.strava.com/api/v3/activities/${event.object_id}/streams?keys=latlng,time,altitude&key_by_type=true`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (streamRes.ok) {
            const streams = await streamRes.json();
            const latlngStream = streams.latlng?.data || [];
            const timeStream = streams.time?.data || [];
            const altitudeStream = streams.altitude?.data || [];

            if (latlngStream.length > 0) {
              const gpsPoints = latlngStream.map((coord: [number, number], index: number) => ({
                latitude: coord[0],
                longitude: coord[1],
                timestamp: new Date(new Date(activity.start_date).getTime() + (timeStream[index] || index) * 1000).toISOString(),
                altitude: altitudeStream[index] || null,
              }));

              // Update the published activity with GPS points
              await supabaseAdmin
                .from('published_activities')
                .update({ gps_points: gpsPoints.slice(0, 1000) }) // Limit to 1000 points
                .eq('id', publishedActivity.id);
            }
          }
        } catch (error) {
          console.error('Error importing GPS data:', error);
        }
      }

      console.log(`✅ Successfully imported activity ${event.object_id} for user ${tokenData.user_id}`);
      console.log(`📊 Activity details: ${activity.name} - ${activity.distance}m - ${activity.elapsed_time}s`);
      return new Response('OK', { status: 200 });

    } catch (error) {
      console.error('Webhook processing error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});
