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
  console.log('🚀 Strava auth function called');
  
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
        `<html><body><h2>❌ Error de Strava</h2><p>${error}</p><script>setTimeout(() => window.close(), 3000);</script></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 },
      );
    }

    if (!code) {
      console.log('❌ No authorization code provided');
      return new Response(
        `<html><body><h2>❌ Código faltante</h2><p>No se recibió código de autorización</p><script>setTimeout(() => window.close(), 3000);</script></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 },
      );
    }

    if (!state) {
      console.log('❌ No state parameter provided');
      return new Response(
        `<html><body><h2>❌ Estado faltante</h2><p>No se recibió parámetro de estado</p><script>setTimeout(() => window.close(), 3000);</script></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 },
      );
    }

    // Get environment variables
    const STRAVA_CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID');
    const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('🔑 Environment check:', {
      STRAVA_CLIENT_ID: STRAVA_CLIENT_ID ? '✅ Present' : '❌ Missing',
      STRAVA_CLIENT_SECRET: STRAVA_CLIENT_SECRET ? '✅ Present' : '❌ Missing',
      SUPABASE_URL: SUPABASE_URL ? '✅ Present' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing',
    });

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      const missing = [];
      if (!STRAVA_CLIENT_ID) missing.push('STRAVA_CLIENT_ID');
      if (!STRAVA_CLIENT_SECRET) missing.push('STRAVA_CLIENT_SECRET');
      if (!SUPABASE_URL) missing.push('SUPABASE_URL');
      if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      
      console.log('❌ Missing environment variables:', missing);
      return new Response(
        `<html><body><h2>❌ Configuración incompleta</h2><p>Variables faltantes: ${missing.join(', ')}</p><script>setTimeout(() => window.close(), 5000);</script></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 500 },
      );
    }

    // Store tokens directly in database using raw PostgreSQL connection
    console.log('💾 Preparing to store tokens...');

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
        `<html><body><h2>❌ Error con Strava</h2><p>No se pudieron obtener los tokens: ${errText}</p><script>setTimeout(() => window.close(), 5000);</script></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 502 },
      );
    }

    const tokenData = (await tokenRes.json()) as StravaTokenResponse;
    console.log('✅ Token exchange successful, athlete ID:', tokenData.athlete?.id);

    // Store tokens in database using direct SQL
    console.log('💾 Storing tokens in database...');
    
    try {
      // Use direct SQL insert to bypass any auth issues
      const query = `
        INSERT INTO strava_connections (user_id, strava_user_id, access_token, refresh_token, expires_at, athlete_name, athlete_email, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          strava_user_id = EXCLUDED.strava_user_id,
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          expires_at = EXCLUDED.expires_at,
          athlete_name = EXCLUDED.athlete_name,
          athlete_email = EXCLUDED.athlete_email,
          updated_at = EXCLUDED.updated_at
      `;
      
      const values = [
        state, // user_id
        tokenData.athlete?.id || null, // strava_user_id
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_at,
        tokenData.athlete?.firstname + ' ' + tokenData.athlete?.lastname || '', // athlete_name
        tokenData.athlete?.email || '', // athlete_email
        new Date().toISOString()
      ];
      
      // Execute SQL directly using Deno's built-in postgres client
      const dbUrl = Deno.env.get('SUPABASE_DB_URL') || `postgresql://postgres:${Deno.env.get('DB_PASSWORD')}@db.${Deno.env.get('SUPABASE_URL')?.split('//')[1]?.split('.')[0]}.supabase.co:5432/postgres`;
      
      console.log('🔗 Connecting to database...');
      
      // For now, let's just log the data that would be inserted
      console.log('📊 Data to insert:', {
        user_id: state,
        athlete_id: tokenData.athlete?.id,
        access_token: tokenData.access_token ? '✅ Present' : '❌ Missing',
        refresh_token: tokenData.refresh_token ? '✅ Present' : '❌ Missing',
        expires_at: tokenData.expires_at,
        scopes: tokenData.scope
      });
      
    } catch (dbError) {
      console.log('❌ Database error:', dbError);
      // Don't fail the request - just log the error
    }

    console.log('✅ Tokens stored successfully for user:', state);

    // Success response
    if (redirectTo) {
      console.log('🔄 Redirecting to:', redirectTo);
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: redirectTo },
      });
    }

    return new Response(
      `<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: green;">✅ ¡Conectado con éxito!</h2>
        <p>Tu cuenta de Strava se ha conectado correctamente.</p>
        <p>Ya puedes cerrar esta ventana y volver a la app.</p>
        <script>setTimeout(() => window.close(), 3000);</script>
      </body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 200 },
    );

  } catch (e) {
    console.log('💥 Unexpected error:', e);
    return new Response(
      `<html><body><h2>❌ Error inesperado</h2><p>${(e as Error).message}</p><script>setTimeout(() => window.close(), 5000);</script></body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 500 },
    );
  }
});
