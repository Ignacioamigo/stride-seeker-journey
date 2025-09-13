// NUEVA FUNCIÓN STRAVA-CONNECT-V2 - SISTEMA COMPLETAMENTE PÚBLICO
// Sin autenticación, sin RLS, sin restricciones

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuración CORS permisiva
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 STRAVA-CONNECT-V2 - Nueva función iniciada')
    console.log('📝 Method:', req.method)
    console.log('📝 URL:', req.url)
    
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // Este es nuestro user_id
    const redirectTo = url.searchParams.get('redirect_to')
    
    console.log('📝 OAuth parameters:', { code: !!code, state, redirectTo })

    if (!code || !state) {
      console.log('❌ Missing required parameters')
      return new Response(
        JSON.stringify({ error: 'Missing code or state parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Configuración de Strava
    const STRAVA_CLIENT_ID = '172613'
    const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET')
    
    if (!STRAVA_CLIENT_SECRET) {
      console.log('❌ Missing STRAVA_CLIENT_SECRET')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔑 Exchanging code for tokens...')
    
    // Intercambiar código por tokens
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code'
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.log('❌ Strava token exchange failed:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to exchange code for tokens' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ Tokens received from Strava')
    console.log('📝 Token data keys:', Object.keys(tokenData))

    // Crear cliente Supabase SIN autenticación
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Usar service key
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('💾 Saving to new strava_connections table...')

    // Guardar en nueva tabla strava_connections
    const { data, error } = await supabase
      .from('strava_connections')
      .upsert({
        user_id: state, // Nuestro UUID generado
        strava_user_id: tokenData.athlete?.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        athlete_name: tokenData.athlete?.firstname + ' ' + tokenData.athlete?.lastname,
        athlete_email: tokenData.athlete?.email,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()

    if (error) {
      console.log('❌ Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Database error', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Successfully saved to database')
    console.log('📝 Saved data:', data)

    // Redirigir de vuelta a la app
    if (redirectTo) {
      console.log('🔄 Redirecting to:', redirectTo)
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': redirectTo + '?strava_connected=true'
        }
      })
    }

    // Respuesta de éxito
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Strava connected successfully',
        user_id: state,
        athlete_name: tokenData.athlete?.firstname + ' ' + tokenData.athlete?.lastname
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.log('❌ Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
