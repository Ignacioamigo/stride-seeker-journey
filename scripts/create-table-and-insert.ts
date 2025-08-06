#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://uprohtkbghujvjwjnqyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function setupCompleteRaceSystem() {
  console.log('🚀 Configurando sistema completo de carreras...\n');

  try {
    // 1. Crear tabla usando SQL
    console.log('📋 Paso 1: Creando tabla races...');
    
    const createTableSQL = `
      -- Crear tipos enumerados
      DO $$ BEGIN
          CREATE TYPE race_type AS ENUM (
              'carrera_popular',
              'trail_running', 
              'media_maraton',
              'maraton',
              'cross',
              'montaña',
              'ultra_trail',
              'canicross',
              'triathlon',
              'duathlon',
              'acuathlon',
              'solidaria',
              'nocturna',
              'virtual',
              'otros'
          );
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE race_status AS ENUM (
              'upcoming',
              'registration_open',
              'registration_closed',
              'completed',
              'cancelled',
              'postponed'
          );
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      -- Crear tabla races
      CREATE TABLE IF NOT EXISTS races (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          
          -- Información básica
          name TEXT NOT NULL,
          description TEXT,
          event_date DATE NOT NULL,
          
          -- Ubicación
          city TEXT NOT NULL,
          province TEXT NOT NULL,
          
          -- Detalles de carrera
          race_type race_type NOT NULL,
          distance_km DECIMAL(6,2),
          distance_text TEXT,
          elevation_gain INTEGER,
          
          -- Registro y costo
          registration_price DECIMAL(8,2),
          registration_url TEXT,
          registration_status race_status DEFAULT 'upcoming',
          max_participants INTEGER,
          
          -- Organización
          organizer TEXT,
          website TEXT,
          
          -- Fuente de datos
          source_platform TEXT NOT NULL,
          source_url TEXT NOT NULL,
          source_event_id TEXT,
          
          -- Características adicionales
          includes_tshirt BOOLEAN DEFAULT false,
          includes_medal BOOLEAN DEFAULT false,
          
          -- Metadatos
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- Restricciones
          CONSTRAINT valid_date_range CHECK (event_date >= '2025-08-05'),
          CONSTRAINT valid_distance CHECK (distance_km IS NULL OR distance_km > 0),
          CONSTRAINT valid_price CHECK (registration_price IS NULL OR registration_price >= 0)
      );

      -- Crear índices para rendimiento
      CREATE INDEX IF NOT EXISTS idx_races_event_date ON races(event_date);
      CREATE INDEX IF NOT EXISTS idx_races_city ON races(city);
      CREATE INDEX IF NOT EXISTS idx_races_province ON races(province);
      CREATE INDEX IF NOT EXISTS idx_races_race_type ON races(race_type);

      -- Habilitar RLS (Row Level Security)
      ALTER TABLE races ENABLE ROW LEVEL SECURITY;

      -- Política: Cualquiera puede leer carreras
      DROP POLICY IF EXISTS "Anyone can view races" ON races;
      CREATE POLICY "Anyone can view races" ON races
          FOR SELECT USING (true);
    `;

    // Ejecutar SQL directamente
    const { error: sqlError } = await (supabase as any).rpc('exec_sql', { sql: createTableSQL });
    
    if (sqlError) {
      console.log('⚠️  No se pudo crear tabla automáticamente. Usando método alternativo...');
      console.log('   Por favor ejecuta manualmente: create_races_table_simple.sql en Supabase');
    } else {
      console.log('✅ Tabla races creada correctamente');
    }

    // 2. Verificar que la tabla existe
    console.log('\n🔍 Paso 2: Verificando tabla...');
    
    const { data: testData, error: testError } = await supabase
      .from('races')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Tabla no disponible. Necesitas crear la tabla manualmente:');
      console.log('   1. Ve a Supabase Dashboard → SQL Editor');
      console.log('   2. Copia y pega el contenido de: create_races_table_simple.sql');
      console.log('   3. Ejecuta la query');
      console.log('   4. Luego ejecuta este script nuevamente');
      return;
    }

    console.log('✅ Tabla races disponible');

    // 3. Insertar datos de ejemplo
    console.log('\n📝 Paso 3: Insertando carreras de ejemplo...');
    
    const sampleRaces = [
      {
        name: 'Maratón de Madrid 2025',
        description: 'El maratón más importante de España, recorriendo los lugares más emblemáticos de la capital',
        event_date: '2025-04-27',
        city: 'Madrid',
        province: 'Madrid',
        race_type: 'maraton',
        distance_km: 42.195,
        distance_text: '42.2 km',
        registration_price: 45.00,
        registration_url: 'https://maratonmadrid.org',
        organizer: 'Club Atletismo Madrid',
        source_platform: 'manual_entry',
        source_url: 'https://maratonmadrid.org',
        source_event_id: 'madrid-maraton-2025',
        registration_status: 'registration_open',
        includes_tshirt: true,
        includes_medal: true,
        max_participants: 15000
      },
      {
        name: 'Media Maratón Valencia Trinidad Alfonso 2025',
        description: 'Una de las mejores medias maratones del mundo, con recorrido rápido y plano',
        event_date: '2025-10-26',
        city: 'Valencia',
        province: 'Valencia',
        race_type: 'media_maraton',
        distance_km: 21.097,
        distance_text: '21.1 km',
        registration_price: 35.00,
        registration_url: 'https://mediomaratonvalencia.com',
        organizer: 'Valencia Ciudad del Running',
        source_platform: 'manual_entry',
        source_url: 'https://mediomaratonvalencia.com',
        source_event_id: 'valencia-media-2025',
        registration_status: 'registration_open',
        includes_tshirt: true,
        includes_medal: true,
        max_participants: 20000
      },
      {
        name: 'Trail Sierra de Guadarrama',
        description: 'Trail de montaña por la Sierra de Guadarrama con vistas espectaculares',
        event_date: '2025-09-14',
        city: 'Navacerrada',
        province: 'Madrid',
        race_type: 'trail_running',
        distance_km: 25.0,
        distance_text: '25 km',
        registration_price: 30.00,
        registration_url: 'https://trailguadarrama.com',
        organizer: 'Club Montaña Madrid',
        source_platform: 'manual_entry',
        source_url: 'https://trailguadarrama.com',
        source_event_id: 'trail-guadarrama-2025',
        registration_status: 'registration_open',
        includes_medal: true,
        max_participants: 800,
        elevation_gain: 1200
      },
      {
        name: 'Carrera Popular de Barcelona',
        description: 'Carrera familiar por el centro histórico de Barcelona',
        event_date: '2025-11-02',
        city: 'Barcelona',
        province: 'Barcelona',
        race_type: 'carrera_popular',
        distance_km: 10.0,
        distance_text: '10 km',
        registration_price: 20.00,
        registration_url: 'https://popularbarcelona.com',
        organizer: 'Barcelona Running Club',
        source_platform: 'manual_entry',
        source_url: 'https://popularbarcelona.com',
        source_event_id: 'barcelona-popular-2025',
        registration_status: 'registration_open',
        includes_tshirt: true,
        max_participants: 5000
      },
      {
        name: 'Ultra Trail Pirineos',
        description: 'Ultra trail desafiante por los Pirineos aragoneses',
        event_date: '2025-08-16',
        city: 'Jaca',
        province: 'Huesca',
        race_type: 'ultra_trail',
        distance_km: 100.0,
        distance_text: '100 km',
        registration_price: 80.00,
        registration_url: 'https://ultrapirineos.com',
        organizer: 'Pirineos Trail Organization',
        source_platform: 'manual_entry',
        source_url: 'https://ultrapirineos.com',
        source_event_id: 'ultra-pirineos-2025',
        registration_status: 'registration_open',
        includes_tshirt: true,
        includes_medal: true,
        elevation_gain: 4500
      },
      {
        name: 'Carrera Nocturna Sevilla',
        description: 'Carrera nocturna por el casco histórico de Sevilla',
        event_date: '2025-08-30',
        city: 'Sevilla',
        province: 'Sevilla',
        race_type: 'nocturna',
        distance_km: 8.0,
        distance_text: '8 km',
        registration_price: 15.00,
        registration_url: 'https://nocturnasevilla.com',
        organizer: 'Sevilla Night Runners',
        source_platform: 'manual_entry',
        source_url: 'https://nocturnasevilla.com',
        source_event_id: 'sevilla-nocturna-2025',
        registration_status: 'registration_open'
      },
      {
        name: 'Transgrancanaria HG 2025',
        description: 'Ultra trail por la isla de Gran Canaria, paisajes únicos',
        event_date: '2025-02-22',
        city: 'Las Palmas',
        province: 'Las Palmas',
        race_type: 'ultra_trail',
        distance_km: 125.0,
        distance_text: '125 km',
        registration_price: 120.00,
        registration_url: 'https://transgrancanaria.net',
        organizer: 'Transgrancanaria Organization',
        source_platform: 'manual_entry',
        source_url: 'https://transgrancanaria.net',
        source_event_id: 'transgrancanaria-2025',
        registration_status: 'registration_open',
        includes_tshirt: true,
        includes_medal: true,
        elevation_gain: 7000
      },
      {
        name: 'San Silvestre Vallecana',
        description: 'La carrera popular más famosa de fin de año en España',
        event_date: '2025-12-31',
        city: 'Madrid',
        province: 'Madrid',
        race_type: 'carrera_popular',
        distance_km: 10.0,
        distance_text: '10 km',
        registration_price: 25.00,
        registration_url: 'https://sansilvestre-vallecana.com',
        organizer: 'Club Atletismo Vallecas',
        source_platform: 'manual_entry',
        source_url: 'https://sansilvestre-vallecana.com',
        source_event_id: 'sansilvestre-2025',
        registration_status: 'registration_open',
        includes_tshirt: true,
        includes_medal: true
      }
    ];

    // Verificar si ya hay datos
    const { data: existingRaces, error: checkError } = await supabase
      .from('races')
      .select('id')
      .limit(1);

    if (checkError) {
      console.log('❌ Error verificando datos existentes:', checkError.message);
      return;
    }

    if (existingRaces && existingRaces.length > 0) {
      console.log('⚠️  Ya existen carreras en la base de datos. Saltando inserción...');
    } else {
      // Insertar carreras de ejemplo
      const { data: insertedRaces, error: insertError } = await supabase
        .from('races')
        .insert(sampleRaces)
        .select();

      if (insertError) {
        console.log('❌ Error insertando datos:', insertError.message);
        return;
      } else {
        console.log(`✅ Insertadas ${insertedRaces?.length || 0} carreras de ejemplo`);
      }
    }

    // 4. Verificar datos finales
    console.log('\n🔍 Paso 4: Verificando datos insertados...');
    
    const { data: races, error: selectError } = await supabase
      .from('races')
      .select('id, name, city, event_date, race_type')
      .order('event_date')
      .limit(10);

    if (selectError) {
      console.log('❌ Error verificando datos:', selectError.message);
    } else {
      console.log(`✅ Total de carreras en la base de datos: ${races?.length || 0}`);
      console.log('\n📋 Carreras disponibles:');
      races?.forEach((race, index) => {
        console.log(`   ${index + 1}. ${race.name} - ${race.city} (${race.event_date})`);
      });
    }

    console.log('\n🎉 ¡Sistema de carreras configurado correctamente!');
    console.log('\n📱 Ahora puedes:');
    console.log('   • Ver las carreras en Supabase Dashboard → Table Editor → races');
    console.log('   • Usar el buscador en tu aplicación web');
    console.log('   • Seleccionar carreras durante el onboarding');
    console.log('   • Probar la búsqueda en: http://localhost:8080/onboarding/race-preparation');

  } catch (error) {
    console.error('❌ Error configurando sistema:', error);
  }
}

// Ejecutar setup completo
setupCompleteRaceSystem().catch(console.error);