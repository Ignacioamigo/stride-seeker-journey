import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadRequest {
  activityId: string;
  title?: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { activityId, title, description } = await req.json() as UploadRequest;

    if (!activityId) {
      return new Response(
        JSON.stringify({ error: 'Missing activityId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

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

    // Get Strava tokens
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('strava_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Strava not connected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if token needs refresh
    let accessToken = tokenData.access_token;
    if (Date.now() / 1000 > tokenData.expires_at) {
      const STRAVA_CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID');
      const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET');

      if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
        return new Response(
          JSON.stringify({ error: 'Strava credentials not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
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
    }

    // Get activity data from database
    const { data: activity, error: activityError } = await supabaseAdmin
      .from('published_activities')
      .select(`
        *,
        runSession:entrenamientos_completados!inner(
          id,
          distancia_recorrida,
          duracion,
          fecha_completado,
          gpsPoints:gps_points(latitude, longitude, timestamp, altitude, speed)
        )
      `)
      .eq('id', activityId)
      .eq('user_id', userId)
      .maybeSingle();

    if (activityError || !activity) {
      return new Response(
        JSON.stringify({ error: 'Activity not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Generate GPX from GPS points
    let gpxData = '';
    if (activity.runSession.gpsPoints && activity.runSession.gpsPoints.length > 0) {
      const points = activity.runSession.gpsPoints
        .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((point: any) => {
          const elevation = point.altitude ? ` <ele>${point.altitude}</ele>` : '';
          const time = `    <time>${new Date(point.timestamp).toISOString()}</time>`;
          return `   <trkpt lat="${point.latitude}" lon="${point.longitude}">
${elevation}${time}
   </trkpt>`;
        }).join('\n');

      gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Stride Seeker" xmlns="http://www.topografix.com/GPX/1/1">
 <trk>
  <name>${title || activity.title}</name>
  <trkseg>
${points}
  </trkseg>
 </trk>
</gpx>`;
    }

    // Prepare form data for Strava upload
    const formData = new FormData();
    formData.append('name', title || activity.title);
    formData.append('description', description || activity.description || '');
    formData.append('type', 'Run');
    formData.append('sport_type', 'Run');
    
    if (gpxData) {
      const gpxBlob = new Blob([gpxData], { type: 'application/gpx+xml' });
      formData.append('file', gpxBlob, 'activity.gpx');
      formData.append('data_type', 'gpx');
    } else {
      // Fallback to manual entry if no GPS data
      formData.append('distance', (activity.runSession.distancia_recorrida || 0).toString());
      
      if (activity.runSession.duracion) {
        const [hours, minutes, seconds] = activity.runSession.duracion.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        formData.append('elapsed_time', totalSeconds.toString());
      }
      
      if (activity.runSession.fecha_completado) {
        formData.append('start_date_local', new Date(activity.runSession.fecha_completado).toISOString());
      }
    }

    // Upload to Strava
    const uploadRes = await fetch('https://www.strava.com/api/v3/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      return new Response(
        JSON.stringify({ error: 'Failed to upload to Strava', details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: uploadRes.status }
      );
    }

    const uploadResult = await uploadRes.json();

    // Save Strava upload ID to our database
    await supabaseAdmin
      .from('published_activities')
      .update({ 
        strava_upload_id: uploadResult.id,
        strava_activity_id: uploadResult.activity_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', activityId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        upload_id: uploadResult.id,
        activity_id: uploadResult.activity_id,
        status: uploadResult.status 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
