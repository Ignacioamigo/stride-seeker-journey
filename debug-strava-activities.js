/**
 * Script de diagnóstico para actividades de Strava
 * Ejecutar en la consola del navegador cuando la app esté abierta
 */

async function debugStravaActivities() {
  console.log('🔍 === DIAGNÓSTICO DE ACTIVIDADES DE STRAVA ===');
  console.log('');
  
  // Importar supabase client
  const { createClient } = supabaseClient;
  const supabase = createClient(
    'https://uprohtkbghujvjwjnqyv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxODgwMjUsImV4cCI6MjA0NDc2NDAyNX0.C5sXJpxd_wlnTJFV11i0BCtAq7Lgg45nCEvhQlPEHr0'
  );
  
  // 1. Verificar usuario autenticado
  console.log('1️⃣ VERIFICANDO USUARIO AUTENTICADO');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error('❌ Error obteniendo usuario:', authError);
    return;
  }
  
  if (!user) {
    console.error('❌ No hay usuario autenticado');
    return;
  }
  
  console.log('✅ Usuario autenticado:', {
    id: user.id,
    email: user.email
  });
  console.log('');
  
  // 2. Verificar actividades en published_activities_simple
  console.log('2️⃣ VERIFICANDO ACTIVIDADES EN published_activities_simple');
  
  // Sin filtro (debería fallar si RLS está activo)
  const { data: allActivities, error: allError } = await supabase
    .from('published_activities_simple')
    .select('*')
    .order('created_at', { ascending: false });
  
  console.log('Sin filtro:', {
    error: allError?.message || 'ninguno',
    count: allActivities?.length || 0,
    data: allActivities
  });
  console.log('');
  
  // Con filtro por user_id
  const { data: userActivities, error: userError } = await supabase
    .from('published_activities_simple')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  console.log('Con filtro user_id:', {
    error: userError?.message || 'ninguno',
    count: userActivities?.length || 0,
    data: userActivities
  });
  console.log('');
  
  // Solo de Strava
  const { data: stravaActivities, error: stravaError } = await supabase
    .from('published_activities_simple')
    .select('*')
    .eq('user_id', user.id)
    .eq('imported_from_strava', true)
    .order('created_at', { ascending: false });
  
  console.log('Solo Strava:', {
    error: stravaError?.message || 'ninguno',
    count: stravaActivities?.length || 0,
    data: stravaActivities
  });
  console.log('');
  
  // 3. Verificar workouts_simple
  console.log('3️⃣ VERIFICANDO WORKOUTS EN workouts_simple');
  
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts_simple')
    .select('*')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false })
    .limit(10);
  
  console.log('Workouts:', {
    error: workoutsError?.message || 'ninguno',
    count: workouts?.length || 0,
    data: workouts
  });
  console.log('');
  
  // 4. Verificar conexión de Strava
  console.log('4️⃣ VERIFICANDO CONEXIÓN DE STRAVA');
  
  const { data: stravaConnection, error: connectionError } = await supabase
    .from('strava_connections')
    .select('*')
    .eq('user_auth_id', user.id)
    .maybeSingle();
  
  console.log('Conexión Strava:', {
    error: connectionError?.message || 'ninguno',
    connected: !!stravaConnection,
    data: stravaConnection ? {
      strava_user_id: stravaConnection.strava_user_id,
      athlete_name: stravaConnection.athlete_name,
      athlete_email: stravaConnection.athlete_email
    } : null
  });
  console.log('');
  
  // 5. Resumen
  console.log('📊 === RESUMEN ===');
  console.log('');
  console.log('Usuario:', user.email, `(${user.id})`);
  console.log('Actividades totales:', userActivities?.length || 0);
  console.log('Actividades de Strava:', stravaActivities?.length || 0);
  console.log('Workouts:', workouts?.length || 0);
  console.log('Strava conectado:', !!stravaConnection);
  console.log('');
  
  if ((userActivities?.length || 0) === 0 && (workouts?.length || 0) > 0) {
    console.warn('⚠️ HAY WORKOUTS PERO NO ACTIVIDADES');
    console.warn('⚠️ Posible problema: RLS bloqueando acceso o user_id incorrecto');
  }
  
  if ((stravaActivities?.length || 0) === 0 && stravaConnection) {
    console.warn('⚠️ STRAVA CONECTADO PERO NO HAY ACTIVIDADES');
    console.warn('⚠️ Posible causa:');
    console.warn('   1. El webhook no se ha disparado');
    console.warn('   2. La actividad no es tipo "Run"');
    console.warn('   3. RLS bloqueando el acceso');
    console.warn('   4. user_id no coincide');
  }
  
  console.log('');
  console.log('✅ Diagnóstico completado');
}

// Ejecutar automáticamente
debugStravaActivities().catch(console.error);


