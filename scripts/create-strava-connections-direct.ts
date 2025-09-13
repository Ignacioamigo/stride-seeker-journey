#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://uprohtkbghujvjwjnqyv.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDU3MCwiZXhwIjoyMDYzMzQ2NTcwfQ.cGDovFQK8K7H4J7M3QRXFJGm1iTJJnTWqCDq3HbWmKI";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createStravaConnectionsTable() {
  console.log('🔨 Creando tabla strava_connections...\n');

  try {
    // SQL completo para crear la tabla
    const fullSQL = `
      -- Eliminar tabla anterior si existe
      DROP TABLE IF EXISTS public.strava_connections CASCADE;

      -- Crear nueva tabla con estructura simple y sin RLS
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

      -- NO aplicar RLS - tabla completamente abierta
      ALTER TABLE public.strava_connections DISABLE ROW LEVEL SECURITY;

      -- Crear índice para búsquedas rápidas
      CREATE INDEX idx_strava_connections_user_id ON public.strava_connections(user_id);
      CREATE INDEX idx_strava_connections_strava_user_id ON public.strava_connections(strava_user_id);

      -- Función para actualizar updated_at automáticamente
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Trigger para actualizar updated_at
      DROP TRIGGER IF EXISTS update_strava_connections_updated_at ON public.strava_connections;
      CREATE TRIGGER update_strava_connections_updated_at
          BEFORE UPDATE ON public.strava_connections
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    console.log('🏗️ Ejecutando SQL para crear tabla...');
    
    // Usar el SQL directo
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ 
        sql: fullSQL 
      })
    });

    if (!response.ok) {
      console.log('❌ Error ejecutando SQL:', await response.text());
      
      // Alternativa: ejecutar paso a paso
      console.log('🔄 Intentando crear tabla paso a paso...');
      
      // Solo crear la tabla básica
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'strava_connections')
        .eq('table_schema', 'public');

      console.log('Verificando si tabla existe:', { data, error });

      return;
    }

    console.log('✅ Tabla strava_connections creada exitosamente');

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

createStravaConnectionsTable();
