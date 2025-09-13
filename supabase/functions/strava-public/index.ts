import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
  athlete: { id: number };
  scope?: string;
}

serve(async (req) => {
  console.log('🚀 Strava public function called');
  console.log('🔗 Request URL:', req.url);
  console.log('📡 Request method:', req.method);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const redirectTo = url.searchParams.get('redirect_to') || '';
    const error = url.searchParams.get('error');

    console.log('📥 Parameters received:', {
      code: code ? '✅ Present' : '❌ Missing',
      state: state ? '✅ Present' : '❌ Missing',
      redirectTo: redirectTo || 'None',
      error: error || 'None'
    });

    if (error) {
      console.log('❌ Strava returned error:', error);
      return new Response(
        `<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: red;">❌ Error de Strava</h2>
          <p>${error}</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 },
      );
    }

    if (!code) {
      console.log('❌ No authorization code provided');
      return new Response(
        `<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: red;">❌ Código faltante</h2>
          <p>No se recibió código de autorización de Strava</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 },
      );
    }

    if (!state) {
      console.log('❌ No state parameter provided');
      return new Response(
        `<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: red;">❌ Estado faltante</h2>
          <p>No se recibió parámetro de estado</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 },
      );
    }

    // Get environment variables
    const STRAVA_CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID');
    const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET');

    console.log('🔑 Environment check:', {
      STRAVA_CLIENT_ID: STRAVA_CLIENT_ID ? '✅ Present' : '❌ Missing',
      STRAVA_CLIENT_SECRET: STRAVA_CLIENT_SECRET ? '✅ Present' : '❌ Missing',
    });

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      const missing = [];
      if (!STRAVA_CLIENT_ID) missing.push('STRAVA_CLIENT_ID');
      if (!STRAVA_CLIENT_SECRET) missing.push('STRAVA_CLIENT_SECRET');
      
      console.log('❌ Missing environment variables:', missing);
      return new Response(
        `<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: red;">❌ Configuración incompleta</h2>
          <p>Variables faltantes: ${missing.join(', ')}</p>
          <script>setTimeout(() => window.close(), 5000);</script>
        </body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 500 },
      );
    }

    // Exchange authorization code for tokens
    console.log('🔄 Exchanging code for tokens...');
    
    const tokenRequestBody = {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    };
    
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenRequestBody),
    });

    console.log('📡 Strava response status:', tokenRes.status);
    
    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.log('❌ Strava token exchange failed:', errText);
      return new Response(
        `<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: red;">❌ Error con Strava</h2>
          <p>No se pudieron obtener los tokens</p>
          <details>
            <summary>Detalles técnicos</summary>
            <pre>${errText}</pre>
          </details>
          <script>setTimeout(() => window.close(), 5000);</script>
        </body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 502 },
      );
    }

    const tokenData = (await tokenRes.json()) as StravaTokenResponse;
    console.log('✅ Token exchange successful!');
    console.log('👤 Athlete ID:', tokenData.athlete?.id);
    console.log('🔑 Access token received:', tokenData.access_token ? 'Yes' : 'No');
    console.log('🔄 Refresh token received:', tokenData.refresh_token ? 'Yes' : 'No');
    console.log('⏰ Expires at:', new Date(tokenData.expires_at * 1000).toISOString());

    // Store in database using Supabase client
    console.log('💾 Storing tokens in database...');
    
    try {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        // Import Supabase client dynamically
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.43.1');
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const { error: upsertError } = await supabaseAdmin
          .from('strava_connections')
          .upsert({
            user_id: state, // Now this should be a valid UUID
            strava_user_id: tokenData.athlete?.id || null,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_at,
            athlete_name: tokenData.athlete?.firstname + ' ' + tokenData.athlete?.lastname || '',
            athlete_email: tokenData.athlete?.email || '',
            updated_at: new Date().toISOString(),
          });

        if (upsertError) {
          console.log('❌ Database error:', upsertError);
        } else {
          console.log('✅ Tokens stored successfully in database!');
        }
      } else {
        console.log('⚠️ Database credentials not available, skipping storage');
      }
    } catch (dbError) {
      console.log('❌ Database connection error:', dbError);
    }

    console.log('✅ Strava connection successful for user:', state);

    // Success response
    if (redirectTo) {
      console.log('🔄 Redirecting to:', redirectTo);
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: redirectTo },
      });
    }

    return new Response(
      `<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column;">
        <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px);">
          <h1 style="font-size: 3em; margin: 0;">✅</h1>
          <h2 style="margin: 20px 0;">¡Conectado con éxito!</h2>
          <p style="margin: 10px 0;">Tu cuenta de Strava se ha conectado correctamente.</p>
          <p style="margin: 10px 0;">Athlete ID: ${tokenData.athlete?.id}</p>
          <p style="margin: 10px 0; opacity: 0.8;">Ya puedes cerrar esta ventana y volver a la app.</p>
        </div>
        <script>setTimeout(() => window.close(), 5000);</script>
      </body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 200 },
    );

  } catch (e) {
    console.log('💥 Unexpected error:', e);
    return new Response(
      `<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: red;">❌ Error inesperado</h2>
        <p>${(e as Error).message}</p>
        <script>setTimeout(() => window.close(), 5000);</script>
      </body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 500 },
    );
  }
});
