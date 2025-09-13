import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qfhqzkvccgpqzxkjlgsr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaHF6a3ZjY2dwcXp4a2psZ3NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDMwMTM3MCwiZXhwIjoyMDQ1ODc3MzcwfQ.T2Ow8mYlb5sUiE8u4Qq_W8eWaJNMhAH6FaY-_TQoNfM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura actual de la tabla published_activities...');
    
    // Intentar hacer una consulta simple para ver si la tabla existe
    const { data: testData, error: testError } = await supabase
      .from('published_activities')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Error accediendo a la tabla:', testError);
      return false;
    }

    console.log('✅ Tabla published_activities accesible');

    // Verificar si los campos de Strava ya existen
    console.log('🔍 Verificando campos de Strava...');
    
    // Intentar insertar un registro de prueba con campos de Strava
    const testRecord = {
      title: 'Test Strava Activity',
      description: 'Test record to verify Strava fields',
      distance: 0,
      duration: '00:00:00',
      is_public: false,
      activity_date: new Date().toISOString(),
      user_id: '00000000-0000-0000-0000-000000000000', // UUID de prueba
      strava_activity_id: 12345,
      imported_from_strava: true,
      strava_upload_id: 'test_upload_123'
    };

    console.log('📝 Intentando insertar registro de prueba...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('published_activities')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.error('❌ Error insertando registro de prueba:', insertError);
      
      // Si falla, probablemente faltan los campos
      if (insertError.message.includes('strava_activity_id') || 
          insertError.message.includes('imported_from_strava') ||
          insertError.message.includes('strava_upload_id')) {
        
        console.log('⚠️ Campos de Strava faltantes. Necesitas ejecutar la migración manualmente.');
        console.log('📋 Copia y pega este SQL en el Editor SQL de Supabase:');
        console.log('');
        console.log('-- MIGRACIÓN MANUAL REQUERIDA');
        console.log('-- Ejecuta esto en el SQL Editor de Supabase:');
        console.log('');
        console.log(`
          -- Add Strava fields to published_activities
          ALTER TABLE public.published_activities 
          ADD COLUMN IF NOT EXISTS strava_activity_id BIGINT;
          
          ALTER TABLE public.published_activities 
          ADD COLUMN IF NOT EXISTS imported_from_strava BOOLEAN DEFAULT FALSE;
          
          ALTER TABLE public.published_activities 
          ADD COLUMN IF NOT EXISTS strava_upload_id TEXT;
          
          ALTER TABLE public.published_activities 
          ADD COLUMN IF NOT EXISTS entrenamiento_id UUID;
          
          -- Add index for better performance
          CREATE INDEX IF NOT EXISTS idx_published_activities_strava_id 
          ON public.published_activities(strava_activity_id);
        `);
        
        return false;
      }
      
      return false;
    }

    console.log('✅ Campos de Strava están presentes y funcionando');
    
    // Limpiar el registro de prueba
    if (insertData && insertData[0]) {
      await supabase
        .from('published_activities')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Registro de prueba eliminado');
    }

    return true;

  } catch (error) {
    console.error('💥 Error inesperado:', error);
    return false;
  }
}

// Ejecutar la verificación
checkTableStructure().then(success => {
  if (success) {
    console.log('🎉 La tabla ya tiene todos los campos de Strava necesarios');
    process.exit(0);
  } else {
    console.log('⚠️ Se requiere migración manual. Revisa las instrucciones arriba.');
    process.exit(1);
  }
});
