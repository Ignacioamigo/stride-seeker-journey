import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdpavfgplomezosyujmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcGF2ZmdwbG9tZXpvc3l1am1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1NDMxOTEsImV4cCI6MjA0MTExOTE5MX0.dLdDFITXZU5rwqyQBcKODM3ZnLmdEYelqOl0s5j6a8E';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 MONITOR WORKOUTS_SIMPLE: Iniciando monitoreo en tiempo real...');
console.log('📊 Tabla monitoreada: workouts_simple');
console.log('⏰ Verificando cada 3 segundos...');
console.log('=====================================\n');

let lastKnownCount = 0;

async function checkWorkouts() {
  try {
    // Obtener todos los workouts
    const { data, error } = await supabase
      .from('workouts_simple')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo workouts:', error.message);
      return;
    }

    const currentCount = data?.length || 0;
    
    // Mostrar estado inicial
    if (lastKnownCount === 0) {
      console.log(`📊 Estado inicial: ${currentCount} workouts en workouts_simple`);
      
      if (currentCount > 0) {
        console.log('\n📋 Workouts existentes:');
        data.slice(0, 3).forEach((workout, index) => {
          console.log(`   ${index + 1}. ${workout.workout_title} - ${workout.distance}km - ${workout.duration_minutes}min`);
          console.log(`      📧 Usuario: ${workout.user_email}`);
          console.log(`      📅 Fecha: ${workout.completed_date}`);
          console.log(`      ⏰ Creado: ${new Date(workout.created_at).toLocaleString()}`);
        });
        if (currentCount > 3) {
          console.log(`      ... y ${currentCount - 3} más`);
        }
      }
      console.log('');
    }

    // Detectar nuevos workouts
    if (currentCount > lastKnownCount) {
      const newWorkouts = currentCount - lastKnownCount;
      console.log(`\n🎉 ¡NUEVO WORKOUT DETECTADO! (+${newWorkouts})`);
      console.log(`📊 Total ahora: ${currentCount} workouts`);
      
      // Mostrar detalles del nuevo workout
      const latestWorkout = data[0];
      console.log('🏃 Último workout guardado:');
      console.log(`   📝 Título: ${latestWorkout.workout_title}`);
      console.log(`   🏃 Tipo: ${latestWorkout.workout_type}`);
      console.log(`   📏 Distancia: ${latestWorkout.distance} km`);
      console.log(`   ⏱️ Duración: ${latestWorkout.duration_minutes} min`);
      console.log(`   📧 Usuario: ${latestWorkout.user_email}`);
      console.log(`   📅 Fecha: ${latestWorkout.completed_date}`);
      console.log(`   📋 Plan: ${latestWorkout.plan_info || 'Sin plan'}`);
      console.log(`   📝 Notas: ${latestWorkout.notes}`);
      console.log(`   ⏰ Guardado: ${new Date(latestWorkout.created_at).toLocaleString()}`);
      
      console.log('\n✅ ¡LA TABLA workouts_simple ESTÁ FUNCIONANDO CORRECTAMENTE!\n');
    }

    lastKnownCount = currentCount;

  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Monitor inicial
checkWorkouts();

// Monitor cada 3 segundos
setInterval(checkWorkouts, 3000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deteniendo monitor...');
  console.log('📊 Resumen final:');
  console.log(`   - Últimos workouts detectados: ${lastKnownCount}`);
  console.log('   - Monitor funcionó correctamente ✅');
  console.log('\n¡Hasta luego! 👋');
  process.exit(0);
});
