#!/usr/bin/env tsx
import { supabase } from '../src/integrations/supabase/client.js';

async function verifyRacesDatabase() {
  console.log('🔍 Verificando base de datos de carreras...\n');

  try {
    // Verificar si la tabla races existe intentando contar
    console.log('1️⃣ Verificando si existe la tabla races...');

    // Verificar cuántas carreras hay
    const { count, error: countError } = await supabase
      .from('races')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      if (countError.code === '42P01') {
        console.log('❌ La tabla "races" NO existe en Supabase');
        console.log('📋 Necesitas ejecutar primero el SQL para crear la tabla');
        return;
      }
      console.error('❌ Error contando carreras:', countError);
      return;
    }

    console.log('✅ La tabla "races" existe');
    console.log(`📊 Total de carreras en la base de datos: ${count || 0}`);

    if (count === 0) {
      console.log('❌ La tabla está VACÍA - no hay carreras');
      console.log('📋 Necesitas ejecutar los archivos SQL para insertar las carreras');
      return;
    }

    // Mostrar algunas carreras de ejemplo
    console.log('\n3️⃣ Mostrando algunas carreras de ejemplo...');
    const { data: sampleRaces, error: sampleError } = await supabase
      .from('races')
      .select('name, city, event_date, race_type')
      .limit(5);

    if (sampleError) {
      console.error('❌ Error obteniendo ejemplos:', sampleError);
      return;
    }

    if (sampleRaces && sampleRaces.length > 0) {
      console.log('✅ Ejemplos de carreras encontradas:');
      sampleRaces.forEach(race => {
        console.log(`   🏃‍♂️ ${race.name} - ${race.city} (${race.event_date}) - ${race.race_type}`);
      });
    }

    // Verificar búsqueda
    console.log('\n4️⃣ Probando búsqueda de carreras...');
    const { data: madridRaces, error: searchError } = await supabase
      .from('races')
      .select('name, city')
      .ilike('city', '%Madrid%')
      .limit(3);

    if (searchError) {
      console.error('❌ Error en búsqueda:', searchError);
      return;
    }

    console.log(`🔍 Carreras encontradas en Madrid: ${madridRaces?.length || 0}`);
    if (madridRaces && madridRaces.length > 0) {
      madridRaces.forEach(race => {
        console.log(`   🏃‍♂️ ${race.name} - ${race.city}`);
      });
    }

    console.log('\n🎉 ¡Base de datos de carreras funcionando correctamente!');
    console.log('✅ Tu app puede acceder a las carreras desde Supabase');

  } catch (error) {
    console.error('❌ Error general:', error);
    console.log('\n📋 Posibles soluciones:');
    console.log('1. Verifica que las variables de entorno de Supabase estén correctas');
    console.log('2. Ejecuta los archivos SQL en Supabase Dashboard');
    console.log('3. Verifica que la tabla races existe y tiene datos');
  }
}

verifyRacesDatabase().catch(console.error);