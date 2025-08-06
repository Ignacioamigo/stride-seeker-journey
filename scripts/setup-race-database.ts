#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://uprohtkbghujvjwjnqyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function setupRaceDatabase() {
  console.log('🚀 Configurando base de datos de carreras...\n');

  try {
    // 1. Verificar conexión con Supabase
    console.log('📋 Paso 1: Verificando conexión con Supabase...');
    
    const { data: testData, error: testError } = await supabase
      .from('races')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('⚠️  La tabla "races" no existe. Por favor:');
      console.log('   1. Ve a Supabase Dashboard → SQL Editor');
      console.log('   2. Ejecuta el archivo: supabase/migrations/001_create_races_table.sql');
      console.log('   3. Luego ejecuta este script nuevamente');
      return;
    } else {
      console.log('✅ Conexión con Supabase exitosa');
    }

    // 2. Insertar datos de ejemplo
    console.log('\n📝 Paso 2: Insertando datos de ejemplo...');
    
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
        name: 'Cross Universitario Valladolid',
        description: 'Cross universitario en el campus de Valladolid',
        event_date: '2025-12-15',
        city: 'Valladolid',
        province: 'Valladolid',
        race_type: 'cross',
        distance_km: 6.0,
        distance_text: '6 km',
        registration_price: 12.00,
        registration_url: 'https://crossvalladolid.com',
        organizer: 'Universidad de Valladolid',
        source_platform: 'manual_entry',
        source_url: 'https://crossvalladolid.com',
        source_event_id: 'cross-valladolid-2025',
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
      }
    ];

    // Insertar carreras de ejemplo
    const { data: insertedRaces, error: insertError } = await supabase
      .from('races')
      .insert(sampleRaces)
      .select();

    if (insertError) {
      console.log('⚠️  Error insertando datos de ejemplo:', insertError.message);
    } else {
      console.log(`✅ Insertadas ${insertedRaces?.length || 0} carreras de ejemplo`);
    }

    // 3. Verificar que los datos se insertaron correctamente
    console.log('\n🔍 Paso 3: Verificando datos insertados...');
    
    const { data: races, error: selectError } = await supabase
      .from('races')
      .select('id, name, city, event_date, race_type')
      .limit(10);

    if (selectError) {
      console.log('❌ Error verificando datos:', selectError.message);
    } else {
      console.log(`✅ Encontradas ${races?.length || 0} carreras en la base de datos:`);
      races?.forEach((race, index) => {
        console.log(`   ${index + 1}. ${race.name} - ${race.city} (${race.event_date})`);
      });
    }

    // 4. Probar función de búsqueda
    console.log('\n🔍 Paso 4: Probando función de búsqueda...');
    
    const { data: searchResults, error: searchError } = await supabase
      .rpc('search_races', {
        search_term: 'Madrid',
        limit_count: 5
      });

    if (searchError) {
      console.log('⚠️  Error en búsqueda (puede que la función no exista aún):', searchError.message);
    } else {
      console.log(`✅ Búsqueda funcionando: encontradas ${searchResults?.length || 0} carreras con "Madrid"`);
    }

    console.log('\n🎉 ¡Sistema de carreras configurado correctamente!');
    console.log('\n📱 Ahora puedes:');
    console.log('   • Ver las carreras en Supabase Dashboard');
    console.log('   • Usar el buscador en tu aplicación');
    console.log('   • Seleccionar carreras durante el onboarding');

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
  }
}

// Ejecutar setup
setupRaceDatabase().catch(console.error);

export { setupRaceDatabase };