// Test script to verify HMAC-SHA1 signature generation for Garmin OAuth 1.0a
// Run with: node scripts/test-garmin-signature.js

import crypto from 'crypto';

const GARMIN_CLIENT_ID = 'b8e7d840-e16b-4db5-84ba-b110a8e7a516';
const GARMIN_CLIENT_SECRET = 'nc4ZgcLZP5JD6y/TJIxzDiK2t6XXEVYg31yCFf3jYk0';
const REQUEST_TOKEN_URL = 'https://connectapi.garmin.com/oauth-service/oauth/request_token';
const CALLBACK_URL = 'https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback';

// RFC 3986 compliant percent encoding
function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

// Generate nonce
function generateNonce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

// Test 1: With percent encoding on signing key
function generateSignatureV1(method, url, params, consumerSecret, tokenSecret = '') {
  const sortedKeys = Object.keys(params).sort();
  
  const paramString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');
  
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString)
  ].join('&');
  
  // WITH percent encoding on signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  
  const hmac = crypto.createHmac('sha1', signingKey);
  hmac.update(signatureBaseString);
  return { signature: hmac.digest('base64'), signingKey, signatureBaseString };
}

// Test 2: WITHOUT percent encoding on signing key
function generateSignatureV2(method, url, params, consumerSecret, tokenSecret = '') {
  const sortedKeys = Object.keys(params).sort();
  
  const paramString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');
  
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString)
  ].join('&');
  
  // WITHOUT percent encoding on signing key (raw)
  const signingKey = `${consumerSecret}&${tokenSecret}`;
  
  const hmac = crypto.createHmac('sha1', signingKey);
  hmac.update(signatureBaseString);
  return { signature: hmac.digest('base64'), signingKey, signatureBaseString };
}

// Build Authorization header
function buildAuthHeader(params) {
  const headerParts = Object.keys(params)
    .filter(key => key.startsWith('oauth_'))
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(params[key])}"`);
  
  return `OAuth ${headerParts.join(', ')}`;
}

async function testRequest(signature, authHeader, version) {
  console.log(`\n📡 Testing Version ${version}...`);
  
  try {
    const response = await fetch(REQUEST_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const responseText = await response.text();
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log(`   ✅ SUCCESS!`);
      console.log(`   Body: ${responseText}`);
      return true;
    } else {
      console.log(`   ❌ Failed`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return false;
  }
}

async function testGarminOAuth() {
  console.log('🧪 Testing Garmin OAuth 1.0a signature generation\n');
  console.log('Credentials:');
  console.log('  Consumer Key:', GARMIN_CLIENT_ID);
  console.log('  Consumer Secret:', GARMIN_CLIENT_SECRET);
  console.log('  Callback:', CALLBACK_URL);
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();
  
  console.log('\nOAuth params:');
  console.log('  Timestamp:', timestamp);
  console.log('  Nonce:', nonce);
  
  const oauthParams = {
    oauth_consumer_key: GARMIN_CLIENT_ID,
    oauth_callback: CALLBACK_URL,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0',
  };
  
  // Test V1: With percent encoding
  console.log('\n\n===== TEST V1: With percent encoding on signing key =====');
  const v1 = generateSignatureV1('POST', REQUEST_TOKEN_URL, oauthParams, GARMIN_CLIENT_SECRET, '');
  console.log('Signing Key:', v1.signingKey);
  console.log('Signature:', v1.signature);
  
  const params1 = { ...oauthParams, oauth_signature: v1.signature };
  const header1 = buildAuthHeader(params1);
  await testRequest(v1.signature, header1, '1');
  
  // Test V2: Without percent encoding
  console.log('\n\n===== TEST V2: Without percent encoding on signing key =====');
  const v2 = generateSignatureV2('POST', REQUEST_TOKEN_URL, oauthParams, GARMIN_CLIENT_SECRET, '');
  console.log('Signing Key:', v2.signingKey);
  console.log('Signature:', v2.signature);
  
  const params2 = { ...oauthParams, oauth_signature: v2.signature };
  const header2 = buildAuthHeader(params2);
  await testRequest(v2.signature, header2, '2');
  
  console.log('\n\n🔍 ANALYSIS:');
  console.log('If both fail with "Invalid signature", the issue is likely:');
  console.log('1. The Consumer Secret is incorrect or has been regenerated');
  console.log('2. The application has been migrated to OAuth 2.0 only');
  console.log('3. The application is disabled or has restricted permissions');
  console.log('\nRecommendation: Check your Garmin Developer Portal settings');
}

testGarminOAuth();
