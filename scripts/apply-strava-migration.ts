import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qfhqzkvccgpqzxkjlgsr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaHF6a3ZjY2dwcXp4a2psZ3NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDMwMTM3MCwiZXhwIjoyMDQ1ODc3MzcwfQ.T2Ow8mYlb5sUiE8u4Qq_W8eWaJNMhAH6FaY-_TQoNfM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyStravaMigration() {
  try {
    console.log('🚀 Aplicando migración de campos de Strava...');
    
    // SQL para añadir campos de Strava
    const migrationSQL = `
      -- Add Strava fields to published_activities if they don't exist
      DO $$ 
      BEGIN
        -- Add strava_activity_id column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'published_activities' 
          AND column_name = 'strava_activity_id'
        ) THEN
          ALTER TABLE public.published_activities 
          ADD COLUMN strava_activity_id BIGINT;
          
          -- Add index for better performance
          CREATE INDEX idx_published_activities_strava_id 
          ON public.published_activities(strava_activity_id);
          
          RAISE NOTICE 'Added strava_activity_id column and index';
        ELSE
          RAISE NOTICE 'strava_activity_id column already exists';
        END IF;

        -- Add imported_from_strava column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'published_activities' 
          AND column_name = 'imported_from_strava'
        ) THEN
          ALTER TABLE public.published_activities 
          ADD COLUMN imported_from_strava BOOLEAN DEFAULT FALSE;
          
          RAISE NOTICE 'Added imported_from_strava column';
        ELSE
          RAISE NOTICE 'imported_from_strava column already exists';
        END IF;

        -- Add strava_upload_id column (if not exists)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'published_activities' 
          AND column_name = 'strava_upload_id'
        ) THEN
          ALTER TABLE public.published_activities 
          ADD COLUMN strava_upload_id TEXT;
          
          RAISE NOTICE 'Added strava_upload_id column';
        ELSE
          RAISE NOTICE 'strava_upload_id column already exists';
        END IF;

        -- Add entrenamiento_id column (if not exists) for backward compatibility
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'published_activities' 
          AND column_name = 'entrenamiento_id'
        ) THEN
          ALTER TABLE public.published_activities 
          ADD COLUMN entrenamiento_id UUID;
          
          RAISE NOTICE 'Added entrenamiento_id column';
        ELSE
          RAISE NOTICE 'entrenamiento_id column already exists';
        END IF;

      END $$;
    `;

    console.log('📝 Ejecutando migración SQL...');
    
    // Ejecutar la migración usando rpc
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ Error ejecutando migración:', error);
      return false;
    }

    console.log('✅ Migración ejecutada exitosamente');

    // Verificar la estructura actual
    console.log('🔍 Verificando estructura de la tabla...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'published_activities')
      .in('column_name', ['strava_activity_id', 'imported_from_strava', 'strava_upload_id', 'entrenamiento_id'])
      .order('column_name');

    if (columnsError) {
      console.error('❌ Error verificando columnas:', columnsError);
      return false;
    }

    console.log('📊 Campos de Strava en la tabla:');
    columns?.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Verificar que todos los campos necesarios estén presentes
    const requiredFields = ['strava_activity_id', 'imported_from_strava', 'strava_upload_id'];
    const presentFields = columns?.map(col => col.column_name) || [];
    
    const missingFields = requiredFields.filter(field => !presentFields.includes(field));
    
    if (missingFields.length > 0) {
      console.error('❌ Campos faltantes:', missingFields);
      return false;
    }

    console.log('✅ Todos los campos de Strava están presentes');
    return true;

  } catch (error) {
    console.error('💥 Error inesperado:', error);
    return false;
  }
}

// Ejecutar la migración
applyStravaMigration().then(success => {
  if (success) {
    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  } else {
    console.error('💥 Migración falló');
    process.exit(1);
  }
});
