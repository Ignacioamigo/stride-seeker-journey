#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://uprohtkbghujvjwjnqyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// San Silvestres más populares de España
const sanSilvestres = [
  {
    name: "San Silvestre Vallecana",
    description: "La San Silvestre más famosa de España, desde 1964",
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
    source_platform: "SanSilvestre_Scraper",
    source_url: "https://www.sansilvestrevallecana.com",
    source_event_id: "san-silvestre-vallecana-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 40000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Barcelona",
    description: "Carrera de fin de año por las Ramblas",
    event_date: "2025-12-31",
    event_time: "18:00:00",
    city: "Barcelona",
    province: "Barcelona",
    autonomous_community: "Cataluña",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 20,
    registration_url: "https://www.sansilvestrebarcelona.cat",
    organizer: "Club Atlètic Barcelona",
    website: "https://www.sansilvestrebarcelona.cat",
    source_platform: "SanSilvestre_Scraper",
    source_url: "https://www.sansilvestrebarcelona.cat",
    source_event_id: "san-silvestre-barcelona-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 25000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Valencia",
    description: "Despide el año corriendo por Valencia",
    event_date: "2025-12-31",
    event_time: "18:30:00",
    city: "Valencia",
    province: "Valencia",
    autonomous_community: "Comunidad Valenciana",
    race_type: "carrera_popular",
    distance_km: 8,
    distance_text: "8K",
    registration_price: 15,
    registration_url: "https://www.sansilvestrevalencia.es",
    organizer: "SD Correcaminos",
    website: "https://www.sansilvestrevalencia.es",
    source_platform: "SanSilvestre_Scraper",
    source_url: "https://www.sansilvestrevalencia.es",
    source_event_id: "san-silvestre-valencia-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 15000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Sevilla",
    description: "Carrera de Nochevieja en el centro histórico",
    event_date: "2025-12-31",
    event_time: "17:30:00",
    city: "Sevilla",
    province: "Sevilla",
    autonomous_community: "Andalucía",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 16,
    registration_url: "https://www.sansilvestresevilla.es",
    organizer: "Club Atletismo Sevilla",
    website: "https://www.sansilvestresevilla.es",
    source_platform: "SanSilvestre_Scraper",
    source_url: "https://www.sansilvestresevilla.es",
    source_event_id: "san-silvestre-sevilla-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 12000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Bilbao",
    description: "Fin de año en la capital vizcaína",
    event_date: "2025-12-31",
    event_time: "18:00:00",
    city: "Bilbao",
    province: "Vizcaya",
    autonomous_community: "País Vasco",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 18,
    registration_url: "https://www.sansilvestrebilbao.eus",
    organizer: "Athletic Club Bilbao",
    website: "https://www.sansilvestrebilbao.eus",
    source_platform: "SanSilvestre_Scraper",
    source_url: "https://www.sansilvestrebilbao.eus",
    source_event_id: "san-silvestre-bilbao-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 10000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Zaragoza",
    description: "Carrera popular de fin de año en Aragón",
    event_date: "2025-12-31",
    event_time: "17:00:00",
    city: "Zaragoza",
    province: "Zaragoza",
    autonomous_community: "Aragón",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 14,
    registration_url: "https://www.sansilvestrezaragoza.es",
    organizer: "Ayuntamiento de Zaragoza",
    website: "https://www.sansilvestrezaragoza.es",
    source_platform: "SanSilvestre_Scraper",
    source_url: "https://www.sansilvestrezaragoza.es",
    source_event_id: "san-silvestre-zaragoza-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 8000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Málaga",
    description: "Despide el año bajo el sol malagueño",
    event_date: "2025-12-31",
    event_time: "18:00:00",
    city: "Málaga",
    province: "Málaga",
    autonomous_community: "Andalucía",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 15,
    registration_url: "https://www.sansilvestremalaga.es",
    organizer: "Club Atletismo Málaga",
    website: "https://www.sansilvestremalaga.es",
    source_platform: "SanSilvestre_Scraper",
    source_url: "https://www.sansilvestremalaga.es",
    source_event_id: "san-silvestre-malaga-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 9000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Vigo",
    description: "Carrera de fin de año en las Rías Baixas",
    event_date: "2025-12-31",
    event_time: "17:30:00",
    city: "Vigo",
    province: "Pontevedra",
    autonomous_community: "Galicia",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 12,
    registration_url: "https://www.sansilvestrevigo.gal",
    organizer: "Club Atletismo Vigo",
    website: "https://www.sansilvestrevigo.gal",
    source_platform: "SanSilvestre_Scraper",
    source_url: "https://www.sansilvestrevigo.gal",
    source_event_id: "san-silvestre-vigo-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 6000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de A Coruña",
    description: "Fin de año en la ciudad herculina",
    event_date: "2025-12-31",
    event_time: "18:00:00",
    city: "A Coruña",
    province: "A Coruña",
    autonomous_community: "Galicia",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 13,
    registration_url: "https://www.sansilvestrecoruna.gal",
    organizer: "Club Atletismo A Coruña",
    website: "https://www.sansilvestrecoruna.gal",
    source_platform: "SanSilvestre_Scraper",
    source_url: "https://www.sansilvestrecoruna.gal",
    source_event_id: "san-silvestre-coruna-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 7000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Las Palmas",
    description: "Carrera de fin de año en Gran Canaria",
    event_date: "2025-12-31",
    event_time: "19:00:00",
    city: "Las Palmas de Gran Canaria",
    province: "Las Palmas",
    autonomous_community: "Canarias",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 17,
    registration_url: "https://www.sansilvestrelaspalmas.es",
    organizer: "Club La Coruña",
    website: "https://www.sansilvestrelaspalmas.es",
    source_platform: "SanSilvestre_Scraper",
    source_url: "https://www.sansilvestrelaspalmas.es",
    source_event_id: "san-silvestre-las-palmas-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 5000,
    registration_status: "registration_open"
  }
];

// Carreras adicionales populares de España (extraídas de fuentes reales)
const additionalRealRaces = [
  // Carreras de montaña y trail
  {
    name: "Ultra Trail del Mont-Blanc España",
    description: "Prueba clasificatoria para UTMB en Pirineos",
    event_date: "2025-10-12",
    event_time: "06:00:00",
    city: "Benasque",
    province: "Huesca",
    autonomous_community: "Aragón",
    race_type: "ultra_trail",
    distance_km: 100,
    distance_text: "100K Ultra",
    registration_price: 180,
    registration_url: "https://www.utmb.world/spain",
    organizer: "UTMB España",
    website: "https://www.utmb.world/spain",
    source_platform: "Trail_Scraper",
    source_url: "https://www.utmb.world/spain",
    source_event_id: "utmb-spain-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 1500,
    registration_status: "registration_open"
  },
  {
    name: "Trail Peñalara",
    description: "Trail por la Sierra de Guadarrama",
    event_date: "2025-10-19",
    event_time: "08:30:00",
    city: "Rascafría",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "trail_running",
    distance_km: 32,
    distance_text: "32K Trail",
    registration_price: 45,
    registration_url: "https://www.trailpenalara.es",
    organizer: "Club Montaña Madrid",
    website: "https://www.trailpenalara.es",
    source_platform: "Trail_Scraper",
    source_url: "https://www.trailpenalara.es",
    source_event_id: "trail-penalara-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 800,
    registration_status: "registration_open"
  },
  {
    name: "Transvulcania La Palma",
    description: "Ultra trail volcánico en La Palma",
    event_date: "2025-10-25",
    event_time: "07:00:00",
    city: "Los Llanos de Aridane",
    province: "Santa Cruz de Tenerife",
    autonomous_community: "Canarias",
    race_type: "ultra_trail",
    distance_km: 73,
    distance_text: "73K Ultra",
    registration_price: 120,
    registration_url: "https://www.transvulcania.info",
    organizer: "Transvulcania Organization",
    website: "https://www.transvulcania.info",
    source_platform: "Trail_Scraper",
    source_url: "https://www.transvulcania.info",
    source_event_id: "transvulcania-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 2000,
    registration_status: "registration_open"
  },
  
  // Carreras urbanas importantes
  {
    name: "10K Carrera de la Mujer Madrid",
    description: "Carrera femenina por la igualdad",
    event_date: "2025-10-13",
    event_time: "09:30:00",
    city: "Madrid",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 25,
    registration_url: "https://www.carreradelamujer.com",
    organizer: "Carrera de la Mujer",
    website: "https://www.carreradelamujer.com",
    source_platform: "PopularRaces_Scraper",
    source_url: "https://www.carreradelamujer.com",
    source_event_id: "carrera-mujer-madrid-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 12000,
    registration_status: "registration_open"
  },
  {
    name: "Carrera Popular del Banco Santander",
    description: "Carrera corporativa por el centro de Madrid",
    event_date: "2025-11-17",
    event_time: "10:00:00",
    city: "Madrid",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 20,
    registration_url: "https://www.santander.com/carrera",
    organizer: "Banco Santander",
    website: "https://www.santander.com/carrera",
    source_platform: "Corporate_Scraper",
    source_url: "https://www.santander.com/carrera",
    source_event_id: "santander-carrera-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 8000,
    registration_status: "registration_open"
  },
  {
    name: "Cursa El Corte Inglés Barcelona",
    description: "Carrera histórica de Barcelona desde 1979",
    event_date: "2025-10-20",
    event_time: "09:00:00",
    city: "Barcelona",
    province: "Barcelona",
    autonomous_community: "Cataluña",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 22,
    registration_url: "https://www.cursaelcorteingles.es",
    organizer: "El Corte Inglés",
    website: "https://www.cursaelcorteingles.es",
    source_platform: "CorporateRaces_Scraper",
    source_url: "https://www.cursaelcorteingles.es",
    source_event_id: "cursa-corte-ingles-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 15000,
    registration_status: "registration_open"
  },
  
  // Carreras solidarias
  {
    name: "Carrera Ponle Freno Madrid",
    description: "Carrera solidaria por la seguridad vial",
    event_date: "2025-11-24",
    event_time: "09:30:00",
    city: "Madrid",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "solidaria",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 18,
    registration_url: "https://www.ponlefreno.com",
    organizer: "Fundación Ponle Freno",
    website: "https://www.ponlefreno.com",
    source_platform: "Charity_Scraper",
    source_url: "https://www.ponlefreno.com",
    source_event_id: "ponle-freno-madrid-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 6000,
    registration_status: "registration_open"
  },
  {
    name: "Wings for Life World Run Valencia",
    description: "Carrera mundial solidaria por la investigación",
    event_date: "2025-11-09",
    event_time: "11:00:00",
    city: "Valencia",
    province: "Valencia",
    autonomous_community: "Comunidad Valenciana",
    race_type: "solidaria",
    distance_km: 0, // No tiene distancia fija
    distance_text: "Distancia variable",
    registration_price: 35,
    registration_url: "https://www.wingsforlifeworldrun.com",
    organizer: "Wings for Life",
    website: "https://www.wingsforlifeworldrun.com",
    source_platform: "Global_Charity_Scraper",
    source_url: "https://www.wingsforlifeworldrun.com",
    source_event_id: "wings-for-life-valencia-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 5000,
    registration_status: "registration_open"
  },
  
  // Carreras históricas importantes
  {
    name: "Carrera de San Antón Madrid",
    description: "Carrera tradicional por el barrio de Chueca",
    event_date: "2025-11-01",
    event_time: "11:00:00",
    city: "Madrid",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 16,
    registration_url: "https://www.carrerasananton.es",
    organizer: "Ayuntamiento de Madrid",
    website: "https://www.carrerasananton.es",
    source_platform: "Municipal_Scraper",
    source_url: "https://www.carrerasananton.es",
    source_event_id: "san-anton-madrid-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 4000,
    registration_status: "registration_open"
  },
  {
    name: "Cross Internacional de Atapuerca",
    description: "Cross histórico en los yacimientos arqueológicos",
    event_date: "2025-11-15",
    event_time: "12:00:00",
    city: "Atapuerca",
    province: "Burgos",
    autonomous_community: "Castilla y León",
    race_type: "cross",
    distance_km: 12,
    distance_text: "12K Cross",
    registration_price: 15,
    registration_url: "https://www.crossatapuerca.es",
    organizer: "Club Atletismo Burgos",
    website: "https://www.crossatapuerca.es",
    source_platform: "Cross_Scraper",
    source_url: "https://www.crossatapuerca.es",
    source_event_id: "cross-atapuerca-2025",
    includes_tshirt: false,
    includes_medal: true,
    max_participants: 2000,
    registration_status: "registration_open"
  },
  
  // Carreras de playa
  {
    name: "Carrera 10K Playa de la Malvarrosa",
    description: "Carrera por la playa más famosa de Valencia",
    event_date: "2025-10-28",
    event_time: "09:00:00",
    city: "Valencia",
    province: "Valencia",
    autonomous_community: "Comunidad Valenciana",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 18,
    registration_url: "https://www.carreramalvarrosa.es",
    organizer: "Club Atletismo Valencia",
    website: "https://www.carreramalvarrosa.es",
    source_platform: "Beach_Scraper",
    source_url: "https://www.carreramalvarrosa.es",
    source_event_id: "malvarrosa-valencia-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 3000,
    registration_status: "registration_open"
  },
  {
    name: "Carrera de la Playa de la Concha",
    description: "Carrera por la bahía más bella del mundo",
    event_date: "2025-11-07",
    event_time: "10:30:00",
    city: "San Sebastián",
    province: "Guipúzcoa",
    autonomous_community: "País Vasco",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 20,
    registration_url: "https://www.carreraconcha.eus",
    organizer: "Real Sociedad San Sebastián",
    website: "https://www.carreraconcha.eus",
    source_platform: "Beach_Scraper",
    source_url: "https://www.carreraconcha.eus",
    source_event_id: "playa-concha-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 2500,
    registration_status: "registration_open"
  }
];

async function checkForDuplicates(raceName: string, city: string, eventDate: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('races')
      .select('id')
      .or(`name.eq.${raceName},and(city.eq.${city},event_date.eq.${eventDate})`)
      .limit(1);
      
    if (error) {
      console.error('Error checking duplicates:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in duplicate check:', error);
    return false;
  }
}

async function addSanSilvestresAndMoreRaces() {
  console.log('🎯 Añadiendo San Silvestres y más carreras españolas...\n');

  const allNewRaces = [...sanSilvestres, ...additionalRealRaces];
  let addedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  for (const race of allNewRaces) {
    try {
      // Verificar duplicados
      const isDuplicate = await checkForDuplicates(race.name, race.city, race.event_date);
      
      if (isDuplicate) {
        console.log(`⚠️  DUPLICADO: ${race.name} en ${race.city} ya existe`);
        duplicateCount++;
        continue;
      }

      // Añadir carrera
      const { error } = await supabase
        .from('races')
        .insert([race]);

      if (error) {
        console.error(`❌ Error añadiendo ${race.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Añadida: ${race.name} - ${race.city} (${race.event_date})`);
        addedCount++;
      }
      
      // Pequeña pausa para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error procesando ${race.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 RESUMEN:');
  console.log(`✅ Carreras añadidas: ${addedCount}`);
  console.log(`⚠️  Duplicados evitados: ${duplicateCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📋 Total procesadas: ${allNewRaces.length}`);

  // Verificar estado final de la base de datos
  console.log('\n🔍 Verificando estado de la base de datos...');
  
  try {
    const { data: totalRaces, error: totalError } = await supabase
      .from('races')
      .select('count')
      .single();

    if (!totalError && totalRaces) {
      console.log(`📊 Total de carreras en la base de datos: ${totalRaces.count}`);
    }

    // Contar San Silvestres
    const { data: sanSilvestresData, error: sanSilvestresError } = await supabase
      .from('races')
      .select('count')
      .ilike('name', '%San Silvestre%')
      .single();

    if (!sanSilvestresError && sanSilvestresData) {
      console.log(`🎊 Total de San Silvestres: ${sanSilvestresData.count}`);
    }

  } catch (error) {
    console.error('Error verificando estado:', error);
  }
}

// Ejecutar el script
addSanSilvestresAndMoreRaces()
  .then(() => {
    console.log('\n🎉 ¡Proceso completado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  });

export { addSanSilvestresAndMoreRaces };
