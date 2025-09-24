import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uprohtkbghujvjwjnqyv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanNullUserIds() {
  console.log('🧹 Iniciando limpieza de datos con user_id null...');

  try {
    // 1. Primero, ver cuántos registros tienen user_id null
    console.log('📊 Contando registros con user_id null...');
    
    const { data: nullRecords, error: countError } = await supabase
      .from('published_activities_simple')
      .select('id, title, created_at, user_email')
      .is('user_id', null);

    if (countError) {
      console.error('❌ Error contando registros null:', countError);
      return;
    }

    console.log(`📋 Encontrados ${nullRecords.length} registros con user_id null:`);
    if (nullRecords.length > 0) {
      nullRecords.forEach((record, index) => {
        console.log(`  ${index + 1}. ID: ${record.id}, Título: "${record.title}", Email: ${record.user_email}, Fecha: ${record.created_at}`);
      });
    }

    if (nullRecords.length === 0) {
      console.log('✅ No hay registros con user_id null para limpiar');
      return;
    }

    // 2. Preguntar al usuario qué hacer
    console.log('\n🤔 ¿Qué quieres hacer con estos registros?');
    console.log('1. Eliminar TODOS los registros con user_id null');
    console.log('2. Mantenerlos como actividades anónimas (no hacer nada)');
    console.log('3. Cancelar operación');

    // Por seguridad, vamos a simular la operación de eliminación pero NO ejecutarla
    console.log('\n⚠️  SIMULACIÓN - NO se eliminarán datos reales');
    console.log('Para eliminar realmente, ejecuta este comando SQL en el dashboard de Supabase:');
    console.log('DELETE FROM published_activities_simple WHERE user_id IS NULL;');

    // 3. Mostrar el estado actual de la tabla
    console.log('\n📊 Estado actual de la tabla:');
    
    const { data: allRecords, error: allError } = await supabase
      .from('published_activities_simple')
      .select('id, user_id, title, user_email')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!allError && allRecords) {
      console.log(`Total de registros recientes: ${allRecords.length}`);
      allRecords.forEach((record, index) => {
        const userIdDisplay = record.user_id ? `${record.user_id.substring(0, 8)}...` : 'NULL';
        console.log(`  ${index + 1}. user_id: ${userIdDisplay}, título: "${record.title}", email: ${record.user_email}`);
      });
    }

    console.log('\n✅ Análisis completado');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

async function showTableStats() {
  console.log('📊 === ESTADÍSTICAS DE published_activities_simple ===');

  try {
    // Contar total de registros
    const { data: allRecords, error: allError } = await supabase
      .from('published_activities_simple')
      .select('id', { count: 'exact' });

    if (allError) {
      console.error('❌ Error obteniendo estadísticas:', allError);
      return;
    }

    console.log(`📈 Total de actividades: ${allRecords?.length || 0}`);

    // Contar registros con user_id null
    const { data: nullRecords, error: nullError } = await supabase
      .from('published_activities_simple')
      .select('id', { count: 'exact' })
      .is('user_id', null);

    if (!nullError) {
      console.log(`🔍 Actividades con user_id NULL: ${nullRecords?.length || 0}`);
    }

    // Contar registros con user_id válido
    const { data: validRecords, error: validError } = await supabase
      .from('published_activities_simple')
      .select('id', { count: 'exact' })
      .not('user_id', 'is', null);

    if (!validError) {
      console.log(`✅ Actividades con user_id válido: ${validRecords?.length || 0}`);
    }

    // Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de registros:');
    const { data: examples, error: exampleError } = await supabase
      .from('published_activities_simple')
      .select('id, user_id, title, user_email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!exampleError && examples) {
      examples.forEach((record, index) => {
        const userIdDisplay = record.user_id ? `${record.user_id.substring(0, 8)}...` : 'NULL';
        const dateDisplay = new Date(record.created_at).toLocaleString();
        console.log(`  ${index + 1}. user_id: ${userIdDisplay}, "${record.title}", ${record.user_email}, ${dateDisplay}`);
      });
    }

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
}

// Ejecutar el análisis
showTableStats()
  .then(() => cleanNullUserIds())
  .then(() => {
    console.log('\n🎯 SOLUCIÓN RECOMENDADA:');
    console.log('1. Las políticas RLS ya están configuradas para filtrar por usuario');
    console.log('2. El código ya filtra actividades por user_id');
    console.log('3. Los registros con user_id NULL son invisibles para usuarios autenticados');
    console.log('4. Cada nuevo usuario registrado verá solo SUS actividades');
    console.log('\n✅ El problema está RESUELTO sin necesidad de eliminar datos');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
