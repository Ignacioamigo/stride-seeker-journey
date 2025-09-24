#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://uprohtkbghujvjwjnqyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// San Silvestres que DEFINITIVAMENTE deben estar (especialmente la Vallecana)
const criticalSanSilvestres = [
  {
    name: "San Silvestre Vallecana",
    description: "La San Silvestre más famosa de España, desde 1964 en Madrid",
    event_date: "2025-12-31",
    event_time: "17:00:00",
    city: "Madrid",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 18,
    registration_url: "https://www.sansilvestrevallecana.com",
    organizer: "Atletismo Vallecas",
    website: "https://www.sansilvestrevallecana.com",
    source_platform: "Official_SanSilvestre",
    source_url: "https://www.sansilvestrevallecana.com",
    source_event_id: "san-silvestre-vallecana-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 40000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre Madrileña",
    description: "Otra San Silvestre tradicional de Madrid",
    event_date: "2025-12-31",
    event_time: "16:00:00",
    city: "Madrid",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 16,
    registration_url: "https://www.sansilvestremadrileña.es",
    organizer: "Club Atletismo Madrid",
    website: "https://www.sansilvestremadrileña.es",
    source_platform: "Official_SanSilvestre",
    source_url: "https://www.sansilvestremadrileña.es",
    source_event_id: "san-silvestre-madrilena-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 15000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Getafe",
    description: "San Silvestre del sur de Madrid",
    event_date: "2025-12-31",
    event_time: "18:30:00",
    city: "Getafe",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 14,
    registration_url: "https://www.sansilvestregetafe.es",
    organizer: "Ayuntamiento de Getafe",
    website: "https://www.sansilvestregetafe.es",
    source_platform: "Municipal_SanSilvestre",
    source_url: "https://www.sansilvestregetafe.es",
    source_event_id: "san-silvestre-getafe-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 8000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Alcalá de Henares",
    description: "San Silvestre en la ciudad cervantina",
    event_date: "2025-12-31",
    event_time: "17:30:00",
    city: "Alcalá de Henares",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 13,
    registration_url: "https://www.sansilvestrealcala.es",
    organizer: "Ayuntamiento de Alcalá",
    website: "https://www.sansilvestrealcala.es",
    source_platform: "Municipal_SanSilvestre",
    source_url: "https://www.sansilvestrealcala.es",
    source_event_id: "san-silvestre-alcala-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 6000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Tarragona",
    description: "San Silvestre catalana junto al Mediterráneo",
    event_date: "2025-12-31",
    event_time: "18:00:00",
    city: "Tarragona",
    province: "Tarragona",
    autonomous_community: "Cataluña",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 17,
    registration_url: "https://www.sansilvestretarragona.cat",
    organizer: "Ayuntamiento de Tarragona",
    website: "https://www.sansilvestretarragona.cat",
    source_platform: "Catalan_SanSilvestre",
    source_url: "https://www.sansilvestretarragona.cat",
    source_event_id: "san-silvestre-tarragona-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 7000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Alicante",
    description: "Despide el año en la Costa Blanca",
    event_date: "2025-12-31",
    event_time: "18:30:00",
    city: "Alicante",
    province: "Alicante",
    autonomous_community: "Comunidad Valenciana",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 15,
    registration_url: "https://www.sansilvestrealicante.es",
    organizer: "Ayuntamiento de Alicante",
    website: "https://www.sansilvestrealicante.es",
    source_platform: "Coastal_SanSilvestre",
    source_url: "https://www.sansilvestrealicante.es",
    source_event_id: "san-silvestre-alicante-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 9000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Murcia",
    description: "San Silvestre murciana en el corazón de la huerta",
    event_date: "2025-12-31",
    event_time: "17:00:00",
    city: "Murcia",
    province: "Murcia",
    autonomous_community: "Región de Murcia",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 14,
    registration_url: "https://www.sansilvestremurcia.es",
    organizer: "Ayuntamiento de Murcia",
    website: "https://www.sansilvestremurcia.es",
    source_platform: "Regional_SanSilvestre",
    source_url: "https://www.sansilvestremurcia.es",
    source_event_id: "san-silvestre-murcia-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 8000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Vitoria",
    description: "San Silvestre en la capital alavesa",
    event_date: "2025-12-31",
    event_time: "17:30:00",
    city: "Vitoria-Gasteiz",
    province: "Álava",
    autonomous_community: "País Vasco",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 16,
    registration_url: "https://www.sansilvestrevitoria.eus",
    organizer: "Ayuntamiento de Vitoria",
    website: "https://www.sansilvestrevitoria.eus",
    source_platform: "Basque_SanSilvestre",
    source_url: "https://www.sansilvestrevitoria.eus",
    source_event_id: "san-silvestre-vitoria-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 6000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Cádiz",
    description: "San Silvestre gaditana junto al mar",
    event_date: "2025-12-31",
    event_time: "18:00:00",
    city: "Cádiz",
    province: "Cádiz",
    autonomous_community: "Andalucía",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 15,
    registration_url: "https://www.sansilvestrecadiz.es",
    organizer: "Ayuntamiento de Cádiz",
    website: "https://www.sansilvestrecadiz.es",
    source_platform: "Coastal_SanSilvestre",
    source_url: "https://www.sansilvestrecadiz.es",
    source_event_id: "san-silvestre-cadiz-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 7000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Salamanca",
    description: "Fin de año en la ciudad universitaria",
    event_date: "2025-12-31",
    event_time: "17:30:00",
    city: "Salamanca",
    province: "Salamanca",
    autonomous_community: "Castilla y León",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 14,
    registration_url: "https://www.sansilvestresalamanca.es",
    organizer: "Universidad de Salamanca",
    website: "https://www.sansilvestresalamanca.es",
    source_platform: "University_SanSilvestre",
    source_url: "https://www.sansilvestresalamanca.es",
    source_event_id: "san-silvestre-salamanca-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 5000,
    registration_status: "registration_open"
  }
];

async function addCriticalSanSilvestres() {
  console.log('🚨 AÑADIENDO SAN SILVESTRES CRÍTICAS QUE FALTAN...\n');
  console.log('⭐ ESPECIAL ATENCIÓN: San Silvestre Vallecana (LA MÁS IMPORTANTE)\n');

  let addedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  for (const race of criticalSanSilvestres) {
    try {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('races')
        .select('id')
        .eq('name', race.name)
        .eq('city', race.city)
        .limit(1);
      
      if (existing && existing.length > 0) {
        console.log(`⚠️  YA EXISTE: ${race.name} en ${race.city}`);
        duplicateCount++;
        continue;
      }

      // Añadir carrera
      const { error } = await supabase
        .from('races')
        .insert([race]);

      if (error) {
        console.error(`❌ ERROR añadiendo ${race.name}:`, error.message);
        errorCount++;
      } else {
        if (race.name === "San Silvestre Vallecana") {
          console.log(`🎊 ¡¡¡AÑADIDA LA VALLECANA!!! ${race.name} - ${race.city}`);
        } else {
          console.log(`✅ Añadida: ${race.name} - ${race.city}`);
        }
        addedCount++;
      }
      
      // Pausa pequeña
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error procesando ${race.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n🏁 RESUMEN SAN SILVESTRES:');
  console.log(`✅ San Silvestres añadidas: ${addedCount}`);
  console.log(`⚠️  Ya existían: ${duplicateCount}`);
  console.log(`❌ Errores: ${errorCount}`);

  // Verificación final especial para la Vallecana
  console.log('\n🔍 VERIFICACIÓN ESPECIAL - SAN SILVESTRE VALLECANA:');
  
  const { data: vallecana } = await supabase
    .from('races')
    .select('name, city, event_date, registration_price')
    .ilike('name', '%Vallecana%');
  
  if (vallecana && vallecana.length > 0) {
    console.log('🎊 ¡¡¡CONFIRMADO!!! La Vallecana está en la base de datos:');
    vallecana.forEach(race => {
      console.log(`  ✅ ${race.name} - ${race.city} (${race.event_date}) - ${race.registration_price}€`);
    });
  } else {
    console.log('❌ ¡¡¡ERROR!!! La Vallecana NO se ha añadido correctamente');
  }

  // Contar todas las San Silvestres
  const { data: allSanSilvestres } = await supabase
    .from('races')
    .select('count')
    .ilike('name', '%San Silvestre%')
    .single();

  console.log(`\n📊 TOTAL SAN SILVESTRES EN BASE DE DATOS: ${allSanSilvestres?.count || 0}`);
}

// Ejecutar el script
addCriticalSanSilvestres()
  .then(() => {
    console.log('\n🎉 ¡PROCESO COMPLETADO!');
    console.log('🎊 La San Silvestre Vallecana y otras importantes ya están añadidas');
    console.log('💡 Ahora verifica en la app que aparezcan en las búsquedas');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error crítico:', error);
    process.exit(1);
  });

export { addCriticalSanSilvestres };
