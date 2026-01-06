import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GARMIN_CLIENT_ID = Deno.env.get('GARMIN_CLIENT_ID')
    const GARMIN_CLIENT_SECRET = Deno.env.get('GARMIN_CLIENT_SECRET')

    if (!GARMIN_CLIENT_ID || !GARMIN_CLIENT_SECRET) {
      throw new Error('Garmin credentials not configured')
    }

    console.log('🔄 Starting token refresh process')

    // Get user from request (optional - can also be called from cron job)
    let userId: string | null = null
    
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )

      const { data: { user } } = await supabaseClient.auth.getUser()
      if (user) {
        userId = user.id
        console.log('👤 Refreshing tokens for user:', userId)
      }
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find connections that need token refresh (expires in < 10 minutes)
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    let query = supabaseAdmin
      .from('garmin_connections')
      .select('*')
      .lt('token_expires_at', tenMinutesFromNow)
      .not('refresh_token', 'is', null)

    // If specific user, only refresh their token
    if (userId) {
      query = query.eq('user_auth_id', userId)
    }

    const { data: connections, error: fetchError } = await query

    if (fetchError) {
      console.error('❌ Error fetching connections:', fetchError)
      throw fetchError
    }

    if (!connections || connections.length === 0) {
      console.log('✅ No tokens need refreshing')
      return new Response(
        JSON.stringify({ 
          message: 'No tokens need refreshing',
          refreshed: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    console.log(`🔄 Found ${connections.length} connection(s) that need token refresh`)

    const results = []

    // Refresh each connection
    for (const connection of connections) {
      try {
        console.log(`🔄 Refreshing token for user: ${connection.user_auth_id}`)

        const tokenUrl = 'https://diauth.garmin.com/di-oauth2-service/oauth/token'
        
        const tokenParams = new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: GARMIN_CLIENT_ID,
          client_secret: GARMIN_CLIENT_SECRET,
          refresh_token: connection.refresh_token,
        })

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams.toString(),
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          console.error(`❌ Token refresh failed for user ${connection.user_auth_id}:`, errorText)
          
          // If refresh token is invalid/expired, mark for manual re-authentication
          if (tokenResponse.status === 401 || tokenResponse.status === 400) {
            console.warn(`⚠️ Refresh token expired for user ${connection.user_auth_id}`)
            results.push({
              user_id: connection.user_auth_id,
              success: false,
              error: 'Refresh token expired - manual re-authentication required'
            })
            continue
          }
          
          throw new Error(`Failed to refresh token: ${tokenResponse.statusText}`)
        }

        const tokenData = await tokenResponse.json()
        
        const newAccessToken = tokenData.access_token
        const newRefreshToken = tokenData.refresh_token
        const expiresIn = tokenData.expires_in || 86400
        const refreshTokenExpiresIn = tokenData.refresh_token_expires_in || 7775998

        const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
        const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenExpiresIn * 1000).toISOString()

        console.log(`✅ New tokens obtained for user ${connection.user_auth_id}`)

        // Update connection with new tokens
        const { error: updateError } = await supabaseAdmin
          .from('garmin_connections')
          .update({
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            token_expires_at: tokenExpiresAt,
            refresh_token_expires_at: refreshTokenExpiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('user_auth_id', connection.user_auth_id)

        if (updateError) {
          console.error(`❌ Error updating tokens for user ${connection.user_auth_id}:`, updateError)
          results.push({
            user_id: connection.user_auth_id,
            success: false,
            error: updateError.message
          })
          continue
        }

        console.log(`✅ Tokens updated successfully for user ${connection.user_auth_id}`)
        results.push({
          user_id: connection.user_auth_id,
          success: true,
          expires_at: tokenExpiresAt
        })

      } catch (error) {
        console.error(`❌ Error refreshing token for user ${connection.user_auth_id}:`, error)
        results.push({
          user_id: connection.user_auth_id,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    console.log(`✅ Token refresh complete: ${successCount}/${connections.length} successful`)

    return new Response(
      JSON.stringify({ 
        message: 'Token refresh complete',
        total: connections.length,
        refreshed: successCount,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error in garmin-refresh-token:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})




