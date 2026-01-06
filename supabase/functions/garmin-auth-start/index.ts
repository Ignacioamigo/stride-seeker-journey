import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as base64UrlEncode } from "https://deno.land/std@0.168.0/encoding/base64url.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Garmin OAuth 2.0 Authorization URL (from official docs)
const AUTHORIZATION_URL = 'https://connect.garmin.com/oauth2Confirm'

// Generate cryptographically secure random string for code_verifier
function generateCodeVerifier(): string {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return base64UrlEncode(randomBytes).replace(/=/g, '')
}

// Generate code_challenge from code_verifier (SHA-256 hash)
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(hash)).replace(/=/g, '')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GARMIN_CLIENT_ID = Deno.env.get('GARMIN_CLIENT_ID')
    const GARMIN_REDIRECT_URI = Deno.env.get('GARMIN_REDIRECT_URI') || 
      'https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback'

    if (!GARMIN_CLIENT_ID) {
      console.error('❌ Missing GARMIN_CLIENT_ID')
      throw new Error('Garmin Client ID not configured')
    }

    console.log('🚀 Starting Garmin OAuth 2.0 PKCE flow')
    console.log('📋 Client ID:', GARMIN_CLIENT_ID)
    console.log('🔗 Redirect URI:', GARMIN_REDIRECT_URI)

    // Get user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    console.log('👤 User ID:', user.id)

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const state = crypto.randomUUID()

    console.log('🔐 PKCE parameters generated')
    console.log('  Code Verifier length:', codeVerifier.length)
    console.log('  Code Challenge length:', codeChallenge.length)
    console.log('  State:', state)

    // Store code_verifier temporarily in database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Clean old entries first (older than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    await supabaseAdmin
      .from('garmin_oauth_temp')
      .delete()
      .lt('created_at', tenMinutesAgo)

    // Store new state and code_verifier
    const { error: insertError } = await supabaseAdmin
      .from('garmin_oauth_temp')
      .insert({
        oauth_token: state,  // Using oauth_token column for state
        oauth_token_secret: codeVerifier,  // Using secret column for code_verifier
        user_id: user.id
      })

    if (insertError) {
      console.error('❌ Error storing PKCE data:', insertError)
      throw new Error('Failed to store PKCE parameters')
    }

    console.log('✅ PKCE data stored in database')

    // Build OAuth 2.0 authorization URL
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: GARMIN_CLIENT_ID,
      redirect_uri: GARMIN_REDIRECT_URI,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    const authUrl = `${AUTHORIZATION_URL}?${authParams.toString()}`

    console.log('🔗 Authorization URL:', authUrl)

    return new Response(
      JSON.stringify({ authUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Error in garmin-auth-start:', error)
    
    let statusCode = 400
    if (error.message?.includes('not authenticated')) {
      statusCode = 401
    } else if (error.message?.includes('not configured')) {
      statusCode = 500
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      },
    )
  }
})
