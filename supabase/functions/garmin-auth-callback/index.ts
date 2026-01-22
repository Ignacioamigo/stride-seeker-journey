import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Garmin OAuth 2.0 Token URL (from official PKCE docs)
const TOKEN_URL = 'https://diauth.garmin.com/di-oauth2-service/oauth/token'
const USER_ID_URL = 'https://apis.garmin.com/wellness-api/rest/user/id'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const APP_URL = Deno.env.get('APP_URL') || 'capacitor://localhost'

  try {
    const GARMIN_CLIENT_ID = Deno.env.get('GARMIN_CLIENT_ID')
    const GARMIN_CLIENT_SECRET = Deno.env.get('GARMIN_CLIENT_SECRET')
    const GARMIN_REDIRECT_URI = Deno.env.get('GARMIN_REDIRECT_URI') || 
      'https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback'

    if (!GARMIN_CLIENT_ID || !GARMIN_CLIENT_SECRET) {
      throw new Error('Garmin credentials not configured')
    }

    console.log('🔄 Processing Garmin OAuth 2.0 callback')

    // Parse callback parameters from URL
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')

    if (error) {
      console.error('❌ OAuth error from Garmin:', error, errorDescription)
      throw new Error(`OAuth error: ${error} - ${errorDescription}`)
    }

    if (!code) {
      console.error('❌ Missing code parameter')
      throw new Error('Missing authorization code')
    }

    if (!state) {
      console.error('❌ Missing state parameter')
      throw new Error('Missing state parameter')
    }

    console.log('📥 Received authorization code')
    console.log('📥 State:', state)

    // Get code_verifier from temporary storage using state
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: tempData, error: tempError } = await supabaseAdmin
      .from('garmin_oauth_temp')
      .select('*')
      .eq('oauth_token', state)
      .maybeSingle()

    if (tempError || !tempData) {
      console.error('❌ Failed to retrieve code_verifier:', tempError)
      throw new Error('Invalid state or expired session')
    }

    const codeVerifier = tempData.oauth_token_secret
    const userId = tempData.user_id

    console.log('✅ Found PKCE data for user:', userId)
    console.log('✅ Code verifier length:', codeVerifier.length)

    // Exchange authorization code for access token
    console.log('🔄 Exchanging code for access token...')
    console.log('📡 Token URL:', TOKEN_URL)

    // Build request body for OAuth 2.0 PKCE token exchange (form-urlencoded as per Garmin docs)
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: GARMIN_REDIRECT_URI,
      code_verifier: codeVerifier,
      client_id: GARMIN_CLIENT_ID,
      client_secret: GARMIN_CLIENT_SECRET,
    })

    console.log('📤 Token request params:', tokenParams.toString().replace(GARMIN_CLIENT_SECRET, '***'))

    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    })

    const tokenText = await tokenResponse.text()
    console.log('📥 Token response status:', tokenResponse.status)
    console.log('📥 Token response:', tokenText.substring(0, 200))

    if (!tokenResponse.ok) {
      console.error('❌ Token exchange failed:', tokenText)
      throw new Error(`Failed to exchange token: ${tokenResponse.status} - ${tokenText}`)
    }

    let tokenData
    try {
      tokenData = JSON.parse(tokenText)
    } catch {
      console.error('❌ Failed to parse token response as JSON')
      throw new Error('Invalid token response format')
    }

    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    const expiresIn = tokenData.expires_in || 3600
    const tokenType = tokenData.token_type

    if (!accessToken) {
      console.error('❌ No access token in response:', tokenData)
      throw new Error('No access token received')
    }

    console.log('✅ Access token received')
    console.log('  Token type:', tokenType)
    console.log('  Expires in:', expiresIn, 'seconds')

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Get Garmin User ID
    console.log('👤 Fetching Garmin User ID...')

    const userIdResponse = await fetch(USER_ID_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    let garminUserId = null

    if (userIdResponse.ok) {
      const userData = await userIdResponse.json()
      garminUserId = userData.userId
      console.log('✅ Garmin User ID:', garminUserId)
    } else {
      console.warn('⚠️ Could not fetch Garmin User ID:', await userIdResponse.text())
    }

    // Save connection to database
    console.log('💾 Saving Garmin connection...')

    const { error: upsertError } = await supabaseAdmin
      .from('garmin_connections')
      .upsert({
        user_auth_id: userId,
        garmin_user_id: garminUserId,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_auth_id'
      })

    if (upsertError) {
      console.error('❌ Error saving connection:', upsertError)
      throw upsertError
    }

    console.log('✅ Garmin connection saved successfully')

    // Clean up temporary data
    await supabaseAdmin
      .from('garmin_oauth_temp')
      .delete()
      .eq('oauth_token', state)

    console.log('🧹 Cleaned up temporary data')

    // Redirect back to app with success
    // For Capacitor apps, we need to redirect to a URL the app can handle
    const successUrl = `${APP_URL}/settings?garmin=success`
    
    console.log('🔗 Redirecting to:', successUrl)

    // Return HTML that redirects and also tries to close the browser
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Garmin Connected</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
  <p style="font-size: 18px; text-align: center;">Te has conectado correctamente a Garmin.</p>
  <script>
    setTimeout(function() {
      window.location.href = '${successUrl}';
    }, 1500);
  </script>
</body>
</html>
`

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('❌ Error in garmin-auth-callback:', error)
    
    // Return error HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #dc3545 0%, #a71d2a 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      max-width: 400px;
    }
    h1 { font-size: 24px; margin-bottom: 16px; }
    p { font-size: 14px; opacity: 0.9; word-break: break-word; }
    .icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✕</div>
    <h1>Error de Conexión</h1>
    <p>${error.message || 'Error desconocido'}</p>
    <p style="margin-top: 20px;">Cierra esta ventana e inténtalo de nuevo.</p>
  </div>
</body>
</html>
`

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }
})
