import fetch from 'node-fetch';

const SUPABASE_URL = 'https://uprohtkbghujvjwjnqyv.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4';

let lastKnownCount = 0;
let isMonitoring = true;

async function getRealTimeData() {
  try {
    // Obtener el último entrenamiento completado
    const response = await fetch(`${SUPABASE_URL}/rest/v1/entrenamientos_completados?select=*&order=created_at.desc&limit=1`, {
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data[0] || null;
    }
  } catch (error) {
    console.error('❌ Error monitoring:', error.message);
  }
  return null;
}

async function startMonitoring() {
  console.log('🔴 MONITOR EN TIEMPO REAL INICIADO');
  console.log('📱 AHORA COMPLETA UN ENTRENAMIENTO EN LA APP');
  console.log('👀 Monitoreando entrenamientos_completados cada 2 segundos...\n');
  
  // Estado inicial
  const initialData = await getRealTimeData();
  if (initialData) {
    console.log('📊 ESTADO INICIAL:');
    console.log(`   🕐 Último entrenamiento: ${initialData.created_at}`);
    console.log(`   📝 Notas: ${initialData.notas || initialData.workout_title}`);
    console.log(`   📏 Distancia: ${initialData.distancia_recorrida || initialData.distancia} km`);
    console.log(`   ⏱️ Duración: ${initialData.duracion} min`);
    console.log('');
  } else {
    console.log('📊 ESTADO INICIAL: No hay entrenamientos en la BD\n');
  }
  
  let lastEntrenamiento = initialData;
  
  const monitorInterval = setInterval(async () => {
    if (!isMonitoring) {
      clearInterval(monitorInterval);
      return;
    }
    
    const currentData = await getRealTimeData();
    
    if (currentData && (!lastEntrenamiento || currentData.id !== lastEntrenamiento.id)) {
      // ¡NUEVO ENTRENAMIENTO DETECTADO!
      console.log('🚨 ¡NUEVO ENTRENAMIENTO DETECTADO!');
      console.log('📋 DETALLES:');
      console.log(`   📋 ID: ${currentData.id}`);
      console.log(`   👤 User ID: ${currentData.user_id || 'NULL'}`);
      console.log(`   🏃 Tipo: ${currentData.workout_type || currentData.tipo}`);
      console.log(`   📏 Distancia: ${currentData.distancia_recorrida || currentData.distancia} km`);
      console.log(`   ⏱️ Duración: ${currentData.duracion} min`);
      console.log(`   📅 Fecha: ${currentData.fecha_completado || currentData.fecha}`);
      console.log(`   📝 Notas: ${currentData.notas}`);
      console.log(`   📋 Plan ID: ${currentData.plan_id || 'NULL'}`);
      console.log(`   📅 Semana: ${currentData.week_number || 'NULL'}`);
      console.log(`   🕐 Created: ${currentData.created_at}`);
      console.log('');
      console.log('✅ ¡EL ENTRENAMIENTO SE GUARDÓ CORRECTAMENTE!');
      console.log('');
      
      lastEntrenamiento = currentData;
      
      // También verificar published_activities
      await checkPublishedActivity(currentData.id);
    }
    
    // Mostrar punto de vida cada 10 segundos
    if (Date.now() % 10000 < 2000) {
      process.stdout.write('.');
    }
    
  }, 2000);
  
  // Detener después de 3 minutos
  setTimeout(() => {
    isMonitoring = false;
    clearInterval(monitorInterval);
    console.log('\n⏰ Monitor detenido después de 3 minutos');
    console.log('📊 Si no se detectó ningún entrenamiento, hay un problema en el frontend');
    process.exit(0);
  }, 180000);
}

async function checkPublishedActivity(entrenamientoId) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/published_activities?select=*&entrenamiento_id=eq.${entrenamientoId}`, {
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        console.log('📊 PUBLISHED_ACTIVITY TAMBIÉN CREADO:');
        console.log(`   📋 ID: ${data[0].id}`);
        console.log(`   📝 Título: ${data[0].title}`);
        console.log(`   👁️ Público: ${data[0].is_public ? 'Sí' : 'No'}`);
        console.log('');
      } else {
        console.log('⚠️ Published_activity NO creado para este entrenamiento');
        console.log('');
      }
    }
  } catch (error) {
    console.error('❌ Error verificando published_activity:', error.message);
  }
}

// Manejar Ctrl+C para salir limpiamente
process.on('SIGINT', () => {
  isMonitoring = false;
  console.log('\n🛑 Monitor detenido manualmente');
  process.exit(0);
});

startMonitoring();
