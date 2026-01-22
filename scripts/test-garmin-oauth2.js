// Test script for Garmin OAuth 2.0
// Run with: node scripts/test-garmin-oauth2.js

import crypto from 'crypto';

const GARMIN_CLIENT_ID = 'b8e7d840-e16b-4db5-84ba-b110a8e7a516';
const GARMIN_CLIENT_SECRET = 'nc4ZgcLZP5JD6y/TJIxzDiK2t6XXEVYg31yCFf3jYk0';
const REDIRECT_URI = 'https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback';
const AUTHORIZATION_URL = 'https://connect.garmin.com/oauthConfirm';

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

async function testOAuth2() {
  console.log('🧪 Testing Garmin OAuth 2.0 PKCE\n');
  
  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomUUID();
  
  console.log('📋 Configuration:');
  console.log('  Client ID:', GARMIN_CLIENT_ID);
  console.log('  Redirect URI:', REDIRECT_URI);
  console.log('');
  console.log('🔐 PKCE Parameters:');
  console.log('  Code Verifier:', codeVerifier);
  console.log('  Code Challenge:', codeChallenge);
  console.log('  State:', state);
  
  // Build authorization URL
  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: GARMIN_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  
  const authUrl = `${AUTHORIZATION_URL}?${authParams.toString()}`;
  
  console.log('\n🔗 Authorization URL:');
  console.log(authUrl);
  
  console.log('\n📝 Instructions:');
  console.log('1. Open the URL above in your browser');
  console.log('2. Log in to Garmin Connect and authorize the app');
  console.log('3. After authorization, you will be redirected to the callback URL');
  console.log('4. The callback will receive the authorization code');
  
  console.log('\n⚠️  Note: This is a test to verify the OAuth 2.0 URL format is correct.');
  console.log('The actual flow will be handled by the Edge Functions.');
}

testOAuth2();






