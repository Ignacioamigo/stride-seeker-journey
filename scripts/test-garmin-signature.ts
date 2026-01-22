// Test script to verify HMAC-SHA1 signature generation for Garmin OAuth 1.0a
// Run with: deno run scripts/test-garmin-signature.ts

import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const GARMIN_CLIENT_ID = 'b8e7d840-e16b-4db5-84ba-b110a8e7a516'
const GARMIN_CLIENT_SECRET = 'nc4ZgcLZP5JD6y/TJIxzDiK2t6XXEVYg31yCFf3jYk0'
const REQUEST_TOKEN_URL = 'https://connectapi.garmin.com/oauth-service/oauth/request_token'
const CALLBACK_URL = 'https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback'

// RFC 3986 compliant percent encoding
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E')
}

// Generate nonce
function generateNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let nonce = ''
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return nonce
}

// Generate OAuth 1.0a signature using HMAC-SHA1
async function generateSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = ''
): Promise<string> {
  const sortedKeys = Object.keys(params).sort()
  
  const paramString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&')
  
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString)
  ].join('&')
  
  console.log('\n📝 SIGNATURE BASE STRING:')
  console.log(signatureBaseString)
  
  // The signing key according to OAuth 1.0a spec
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`
  
  console.log('\n🔑 SIGNING KEY:')
  console.log(signingKey)
  
  const encoder = new TextEncoder()
  const keyData = encoder.encode(signingKey)
  const messageData = encoder.encode(signatureBaseString)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  
  return base64Encode(new Uint8Array(signature))
}

// Build Authorization header
function buildAuthHeader(params: Record<string, string>): string {
  const headerParts = Object.keys(params)
    .filter(key => key.startsWith('oauth_'))
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(params[key])}"`)
  
  return `OAuth ${headerParts.join(', ')}`
}

async function testGarminOAuth() {
  console.log('🧪 Testing Garmin OAuth 1.0a signature generation\n')
  
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = generateNonce()
  
  console.log('📋 Parameters:')
  console.log('  Consumer Key:', GARMIN_CLIENT_ID)
  console.log('  Consumer Secret:', GARMIN_CLIENT_SECRET)
  console.log('  Timestamp:', timestamp)
  console.log('  Nonce:', nonce)
  console.log('  Callback:', CALLBACK_URL)
  
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: GARMIN_CLIENT_ID,
    oauth_callback: CALLBACK_URL,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0',
  }
  
  const signature = await generateSignature(
    'POST',
    REQUEST_TOKEN_URL,
    oauthParams,
    GARMIN_CLIENT_SECRET,
    ''
  )
  
  console.log('\n✅ SIGNATURE:', signature)
  
  oauthParams.oauth_signature = signature
  const authHeader = buildAuthHeader(oauthParams)
  
  console.log('\n📤 AUTHORIZATION HEADER:')
  console.log(authHeader)
  
  // Test the actual request
  console.log('\n📡 Making request to Garmin...')
  
  try {
    const response = await fetch(REQUEST_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    const responseText = await response.text()
    
    console.log('\n📥 Response status:', response.status)
    console.log('📥 Response body:', responseText)
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! OAuth request token obtained.')
    } else {
      console.log('\n❌ FAILED. Check the error above.')
    }
  } catch (error) {
    console.error('\n❌ Request error:', error)
  }
}

testGarminOAuth()






