#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://uprohtkbghujvjwjnqyv.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDU3MCwiZXhwIjoyMDYzMzQ2NTcwfQ.cGDovFQK8K7H4J7M3QRXFJGm1iTJJnTWqCDq3HbWmKI";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createStravaConnectionsTable() {
  console.log('🔨 Creando tabla strava_connections...\n');

  try {
    // Eliminar tabla anterior si existe
    console.log('🗑️ Eliminando tabla anterior si existe...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      query: 'DROP TABLE IF EXISTS public.strava_connections CASCADE;'
    });

    if (dropError) {
      console.log('⚠️ Error eliminando tabla (puede no existir):', dropError.message);
    } else {
      console.log('✅ Tabla anterior eliminada (si existía)');
    }

    // Crear nueva tabla
    console.log('🏗️ Creando nueva tabla strava_connections...');
    const createTableSQL = `
      CREATE TABLE public.strava_connections (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        strava_user_id BIGINT,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at BIGINT NOT NULL,
        athlete_name TEXT,
        athlete_email TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', {
      query: createTableSQL
    });

    if (createError) {
      console.log('❌ Error creando tabla:', createError.message);
      return;
    }

    console.log('✅ Tabla strava_connections creada exitosamente');

    // Deshabilitar RLS
    console.log('🔓 Deshabilitando RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE public.strava_connections DISABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.log('⚠️ Error deshabilitando RLS:', rlsError.message);
    } else {
      console.log('✅ RLS deshabilitado');
    }

    // Crear índices
    console.log('📊 Creando índices...');
    const indexSQL = `
      CREATE INDEX idx_strava_connections_user_id ON public.strava_connections(user_id);
      CREATE INDEX idx_strava_connections_strava_user_id ON public.strava_connections(strava_user_id);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', {
      query: indexSQL
    });

    if (indexError) {
      console.log('⚠️ Error creando índices:', indexError.message);
    } else {
      console.log('✅ Índices creados');
    }

    // Crear función y trigger para updated_at
    console.log('⚙️ Creando función y trigger...');
    const functionSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_strava_connections_updated_at ON public.strava_connections;
      CREATE TRIGGER update_strava_connections_updated_at
          BEFORE UPDATE ON public.strava_connections
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', {
      query: functionSQL
    });

    if (triggerError) {
      console.log('⚠️ Error creando función/trigger:', triggerError.message);
    } else {
      console.log('✅ Función y trigger creados');
    }

    console.log('\n🎉 ¡Tabla strava_connections configurada completamente!');

    // Verificar tabla
    console.log('\n🔍 Verificando tabla...');
    const { data: tableCheck, error: checkError } = await supabase
      .from('strava_connections')
      .select('count')
      .limit(1);

    if (checkError) {
      console.log('❌ Error verificando tabla:', checkError.message);
    } else {
      console.log('✅ Tabla verificada y funcional');
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar si es el script principal
if (import.meta.main) {
  createStravaConnectionsTable();
}

export { createStravaConnectionsTable };
