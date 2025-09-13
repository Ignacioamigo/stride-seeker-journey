import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdpavfgplomezosyujmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcGF2ZmdwbG9tZXpvc3l1am1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1NDMxOTEsImV4cCI6MjA0MTExOTE5MX0.dLdDFITXZU5rwqyQBcKODM3ZnLmdEYelqOl0s5j6a8E';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 MONITOR PUBLISHED_ACTIVITIES_SIMPLE: Iniciando...');
console.log('📊 Tabla monitoreada: published_activities_simple');
console.log('⏰ Verificando cada 3 segundos...');
console.log('=====================================\n');

let lastKnownCount = 0;

async function checkActivities() {
  try {
    const { data, error } = await supabase
      .from('published_activities_simple')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo actividades:', error.message);
      return;
    }

    const currentCount = data?.length || 0;
    
    if (lastKnownCount === 0) {
      console.log(`📊 Estado inicial: ${currentCount} actividades en published_activities_simple`);
      
      if (currentCount > 0) {
        console.log('\n📋 Actividades existentes:');
        data.slice(0, 3).forEach((activity, index) => {
          console.log(`   ${index + 1}. ${activity.title}`);
          console.log(`      🏃 Distancia: ${activity.distance} km`);
          console.log(`      ⏱️ Duración: ${activity.duration}`);
          console.log(`      🔥 Calorías: ${activity.calories} cal`);
          console.log(`      📧 Usuario: ${activity.user_email}`);
          console.log(`      📅 Fecha: ${new Date(activity.created_at).toLocaleString()}`);
        });
        if (currentCount > 3) {
          console.log(`      ... y ${currentCount - 3} más`);
        }
      }
      console.log('');
    }

    if (currentCount > lastKnownCount) {
      const newActivities = currentCount - lastKnownCount;
      console.log(`\n🎉 ¡NUEVA ACTIVIDAD DETECTADA! (+${newActivities})`);
      console.log(`📊 Total ahora: ${currentCount} actividades`);
      
      const latestActivity = data[0];
      console.log('🏃 Última actividad guardada:');
      console.log(`   📝 Título: ${latestActivity.title}`);
      console.log(`   📄 Descripción: ${latestActivity.description}`);
      console.log(`   🏃 Distancia: ${latestActivity.distance} km`);
      console.log(`   ⏱️ Duración: ${latestActivity.duration}`);
      console.log(`   🔥 Calorías: ${latestActivity.calories} cal`);
      console.log(`   📧 Usuario: ${latestActivity.user_email}`);
      console.log(`   📅 Actividad: ${new Date(latestActivity.activity_date).toLocaleString()}`);
      console.log(`   ⏰ Creado: ${new Date(latestActivity.created_at).toLocaleString()}`);
      
      console.log('\n✅ ¡PUBLISHED_ACTIVITIES_SIMPLE FUNCIONANDO CORRECTAMENTE!');
      console.log('🎯 La actividad debería aparecer en la app en "Mis Actividades"\n');
    }

    lastKnownCount = currentCount;

  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Monitor inicial
checkActivities();

// Monitor cada 3 segundos
setInterval(checkActivities, 3000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deteniendo monitor...');
  console.log('📊 Resumen final:');
  console.log(`   - Actividades detectadas: ${lastKnownCount}`);
  console.log('   - Monitor funcionó correctamente ✅');
  console.log('\n¡Hasta luego! 👋');
  process.exit(0);
});
