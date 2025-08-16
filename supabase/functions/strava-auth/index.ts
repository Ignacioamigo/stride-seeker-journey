import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const redirectTo = url.searchParams.get('redirect_to') || '';
    const error = url.searchParams.get('error');

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

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Validate the user using the state parameter (should be a Supabase access token)
    if (!state) {
      console.log('No state parameter provided');
      return new Response(
        `<html><body>No se encontró estado de sesión. Abre la app e inténtalo de nuevo.</body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 },
      );
    }

    console.log('Validating user with state token:', state.substring(0, 20) + '...');
    
    let userId: string;
    
    try {
      const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(state);
      
      if (userError) {
        console.error('Error validating user:', userError);
        return new Response(
          `<html><body>Error de autenticación: ${userError.message}. Vuelve a iniciar sesión e inténtalo de nuevo.</body></html>`,
          { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 401 },
        );
      }
      
      if (!userResult?.user) {
        console.log('No user found for token');
        return new Response(
          `<html><body>No se pudo validar al usuario. Vuelve a iniciar sesión e inténtalo de nuevo.</body></html>`,
          { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 401 },
        );
      }
      
      console.log('User validated successfully:', userResult.user.id);
      userId = userResult.user.id;
    } catch (authError) {
      console.error('Unexpected auth error:', authError);
      return new Response(
        `<html><body>Error inesperado de autenticación. Vuelve a intentarlo.</body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 500 },
      );
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return new Response(
        `<html><body>Error al intercambiar el código en Strava: ${errText}</body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 502 },
      );
    }

    const tokenData = (await tokenRes.json()) as StravaTokenResponse;

    // Store tokens (upsert by user_id)
    const { error: upsertError } = await supabaseAdmin
      .from('strava_tokens')
      .upsert({
        user_id: userId,
        athlete_id: tokenData.athlete?.id || null,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        scopes: url.searchParams.get('scope') || tokenData.scope || '',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (upsertError) {
      return new Response(
        `<html><body>Error guardando los tokens: ${upsertError.message}</body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 500 },
      );
    }

    if (redirectTo) {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: redirectTo },
      });
    }

    return new Response(
      `<html><body>Cuenta de Strava conectada correctamente. Puedes cerrar esta ventana y volver a la app.</body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 200 },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: (e as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});


