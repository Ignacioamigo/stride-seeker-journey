// Test script para verificar la conexión con Strava
const SUPABASE_URL = 'https://uprohtkbghujvjwjnqyv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzMzc3MzUsImV4cCI6MjA0OTkxMzczNX0.ZJmhOCr7d7338694c498f8bb7e85afe';

// Simular el flujo completo
async function testStravaFlow() {
  console.log('🚀 Iniciando test de Strava...');
  
  // 1. Generar userId como en la app
  const userId = 'test_user_' + Date.now();
  console.log('👤 User ID generado:', userId);
  
  // 2. Construir URL de autorización
  const stravaClientId = "172613";
  const redirectUri = `${SUPABASE_URL}/functions/v1/strava-public`;
  const scope = "read,activity:read,activity:read_all";
  
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}&state=${userId}`;
  
  console.log('🔗 URL de autorización:');
  console.log(authUrl);
  
  // 3. Test de la función Edge (simulando respuesta de Strava)
  console.log('\n📡 Testeando función Edge...');
  
  try {
    const testUrl = `${SUPABASE_URL}/functions/v1/strava-public?code=test_code&state=${userId}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Status:', response.status);
    
    const responseText = await response.text();
    console.log('📄 Response:', responseText.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar test
testStravaFlow();
