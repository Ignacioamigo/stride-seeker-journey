import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch seconds
  token_type: string;
  athlete: { id: number };
  scope?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('Strava auth function called with method:', req.method);
  console.log('Request URL:', req.url);

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const redirectTo = url.searchParams.get('redirect_to') || '';
    const error = url.searchParams.get('error');

    console.log('Strava auth request:', {
      code: code ? 'present' : 'missing',
      state: state ? 'present' : 'missing',
      redirectTo,
      error,
    });

    if (error) {
      return new Response(
        `<html><body>Strava devolvió un error: ${error}. Puedes cerrar esta ventana.</body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 },
      );
    }

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      );
    }

    const STRAVA_CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID');
    const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment check:', {
      STRAVA_CLIENT_ID: STRAVA_CLIENT_ID ? 'present' : 'missing',
      STRAVA_CLIENT_SECRET: STRAVA_CLIENT_SECRET ? 'present' : 'missing',
      SUPABASE_URL: SUPABASE_URL ? 'present' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
    });

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      const missingVars = [];
      if (!STRAVA_CLIENT_ID) missingVars.push('STRAVA_CLIENT_ID');
      if (!STRAVA_CLIENT_SECRET) missingVars.push('STRAVA_CLIENT_SECRET');
      if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
      if (!SUPABASE_SERVICE_ROLE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
      
      return new Response(
        JSON.stringify({ error: 'Server not configured', missing: missingVars }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // For now, we'll use a simplified approach without user validation
    // The state parameter contains a simple identifier that we'll use as userId
    if (!state) {
      console.log('No state parameter provided');
      return new Response(
        `<html><body><h2>Error de conexión</h2><p>No se encontró estado de sesión. Abre la app e inténtalo de nuevo.</p><script>window.close();</script></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 },
      );
    }

    console.log('Using simplified approach with state as userId...');
    
    // Use state as userId directly (temporary solution)
    let userId: string = state;

    // Exchange authorization code for tokens
    console.log('Exchanging code for tokens with Strava...');
    
    const tokenRequestBody = {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    };
    
    console.log('Token request body:', {
      client_id: tokenRequestBody.client_id,
      client_secret: tokenRequestBody.client_secret ? 'present' : 'missing',
      code: tokenRequestBody.code ? 'present' : 'missing',
      grant_type: tokenRequestBody.grant_type,
    });
    
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenRequestBody),
    });

    console.log('Strava token response status:', tokenRes.status);
    
    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Strava token error:', errText);
      return new Response(
        `<html><body>Error al intercambiar el código en Strava: ${errText}</body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 502 },
      );
    }

    const tokenData = (await tokenRes.json()) as StravaTokenResponse;

    // Store tokens (upsert by user_id)
    const { error: upsertError } = await supabaseAdmin
      .from('strava_connections')
      .upsert({
        user_auth_id: state,
        strava_user_id: tokenData.athlete.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        athlete_name: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
        athlete_email: tokenData.athlete.email || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'strava_user_id',
      })

    if (upsertError) {
      return new Response(
        `<html><body>Error guardando los tokens: ${upsertError.message}</body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 500 },
      );
    }

    console.log('Strava account connected successfully for user:', userId);

    if (redirectTo) {
      console.log('Redirecting to:', redirectTo);
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: redirectTo },
      });
    }

    return new Response(
      `<html><body><h2>✅ ¡Conectado con éxito!</h2><p>Tu cuenta de Strava se ha conectado correctamente.</p><p>Ya puedes cerrar esta ventana y volver a la app.</p><script>setTimeout(() => window.close(), 2000);</script></body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 200 },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: (e as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});


