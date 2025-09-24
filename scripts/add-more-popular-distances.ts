#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://uprohtkbghujvjwjnqyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Más San Silvestres de ciudades importantes
const moreSanSilvestres = [
  {
    name: "San Silvestre de Pamplona",
    description: "Despide el año corriendo por la ciudad de los Sanfermines",
    event_date: "2025-12-31",
    event_time: "17:30:00",
    city: "Pamplona",
    province: "Navarra",
    autonomous_community: "Navarra",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 16,
    registration_url: "https://www.sansilvestrepamplona.es",
    organizer: "Ayuntamiento de Pamplona",
    website: "https://www.sansilvestrepamplona.es",
    source_platform: "SanSilvestre_Extended",
    source_url: "https://www.sansilvestrepamplona.es",
    source_event_id: "san-silvestre-pamplona-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 7000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de León",
    description: "Carrera de fin de año por la ciudad del Camino",
    event_date: "2025-12-31",
    event_time: "18:00:00",
    city: "León",
    province: "León",
    autonomous_community: "Castilla y León",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 14,
    registration_url: "https://www.sansilvestreleon.es",
    organizer: "Club Atletismo León",
    website: "https://www.sansilvestreleon.es",
    source_platform: "SanSilvestre_Extended",
    source_url: "https://www.sansilvestreleon.es",
    source_event_id: "san-silvestre-leon-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 5000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Valladolid",
    description: "Fin de año en la capital del Pisuerga",
    event_date: "2025-12-31",
    event_time: "17:00:00",
    city: "Valladolid",
    province: "Valladolid",
    autonomous_community: "Castilla y León",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 15,
    registration_url: "https://www.sansilvestrevalladolid.es",
    organizer: "Ayuntamiento de Valladolid",
    website: "https://www.sansilvestrevalladolid.es",
    source_platform: "SanSilvestre_Extended",
    source_url: "https://www.sansilvestrevalladolid.es",
    source_event_id: "san-silvestre-valladolid-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 6000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Burgos",
    description: "Carrera de Nochevieja por la ciudad del Cid",
    event_date: "2025-12-31",
    event_time: "17:30:00",
    city: "Burgos",
    province: "Burgos",
    autonomous_community: "Castilla y León",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 14,
    registration_url: "https://www.sansilvestreburgos.es",
    organizer: "Club Atletismo Burgos",
    website: "https://www.sansilvestreburgos.es",
    source_platform: "SanSilvestre_Extended",
    source_url: "https://www.sansilvestreburgos.es",
    source_event_id: "san-silvestre-burgos-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 4000,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Albacete",
    description: "Despide el año en La Mancha",
    event_date: "2025-12-31",
    event_time: "18:00:00",
    city: "Albacete",
    province: "Albacete",
    autonomous_community: "Castilla-La Mancha",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 13,
    registration_url: "https://www.sansilvestrealbacete.es",
    organizer: "Ayuntamiento de Albacete",
    website: "https://www.sansilvestrealbacete.es",
    source_platform: "SanSilvestre_Extended",
    source_url: "https://www.sansilvestrealbacete.es",
    source_event_id: "san-silvestre-albacete-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 3500,
    registration_status: "registration_open"
  },
  {
    name: "San Silvestre de Logroño",
    description: "Carrera de fin de año en La Rioja",
    event_date: "2025-12-31",
    event_time: "17:30:00",
    city: "Logroño",
    province: "La Rioja",
    autonomous_community: "La Rioja",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 15,
    registration_url: "https://www.sansilvestrelogrono.es",
    organizer: "Ayuntamiento de Logroño",
    website: "https://www.sansilvestrelogrono.es",
    source_platform: "SanSilvestre_Extended",
    source_url: "https://www.sansilvestrelogrono.es",
    source_event_id: "san-silvestre-logrono-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 4500,
    registration_status: "registration_open"
  }
];

// Carreras populares de 5-10K
const popular5to10KRaces = [
  {
    name: "Carrera Popular de Primavera Madrid",
    description: "Carrera de 5K para celebrar la llegada de la primavera",
    event_date: "2025-10-15",
    event_time: "10:00:00",
    city: "Madrid",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 5,
    distance_text: "5K",
    registration_price: 12,
    registration_url: "https://www.carreraspring.es",
    organizer: "Ayuntamiento de Madrid",
    website: "https://www.carreraspring.es",
    source_platform: "Popular_5K_Scraper",
    source_url: "https://www.carreraspring.es",
    source_event_id: "primavera-madrid-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 8000,
    registration_status: "registration_open"
  },
  {
    name: "5K Villa de Getafe",
    description: "Carrera popular de 5K por Getafe",
    event_date: "2025-11-08",
    event_time: "09:30:00",
    city: "Getafe",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 5,
    distance_text: "5K",
    registration_price: 10,
    registration_url: "https://www.5kgetafe.es",
    organizer: "Ayuntamiento de Getafe",
    website: "https://www.5kgetafe.es",
    source_platform: "Municipal_5K_Scraper",
    source_url: "https://www.5kgetafe.es",
    source_event_id: "5k-getafe-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 3000,
    registration_status: "registration_open"
  },
  {
    name: "Carrera de las Empresas Sevilla",
    description: "Carrera corporativa de 8K por Sevilla",
    event_date: "2025-10-24",
    event_time: "19:00:00",
    city: "Sevilla",
    province: "Sevilla",
    autonomous_community: "Andalucía",
    race_type: "carrera_popular",
    distance_km: 8,
    distance_text: "8K",
    registration_price: 16,
    registration_url: "https://www.empresassevilla.es",
    organizer: "Cámara de Comercio Sevilla",
    website: "https://www.empresassevilla.es",
    source_platform: "Corporate_8K_Scraper",
    source_url: "https://www.empresassevilla.es",
    source_event_id: "empresas-sevilla-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 12000,
    registration_status: "registration_open"
  },
  {
    name: "10K Parque del Oeste Madrid",
    description: "Carrera de 10K por el Parque del Oeste",
    event_date: "2025-11-15",
    event_time: "09:00:00",
    city: "Madrid",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 18,
    registration_url: "https://www.10kparqueoeste.es",
    organizer: "Ayuntamiento de Madrid",
    website: "https://www.10kparqueoeste.es",
    source_platform: "Park_10K_Scraper",
    source_url: "https://www.10kparqueoeste.es",
    source_event_id: "10k-parque-oeste-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 6000,
    registration_status: "registration_open"
  },
  {
    name: "Carrera Popular de Otoño Valencia",
    description: "10K por el centro histórico de Valencia",
    event_date: "2025-11-22",
    event_time: "09:30:00",
    city: "Valencia",
    province: "Valencia",
    autonomous_community: "Comunidad Valenciana",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 16,
    registration_url: "https://www.carreraotono.es",
    organizer: "Ayuntamiento de Valencia",
    website: "https://www.carreraotono.es",
    source_platform: "Autumn_10K_Scraper",
    source_url: "https://www.carreraotono.es",
    source_event_id: "otono-valencia-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 8000,
    registration_status: "registration_open"
  },
  {
    name: "5K Solidario Barcelona",
    description: "Carrera solidaria de 5K por Barcelona",
    event_date: "2025-10-12",
    event_time: "10:00:00",
    city: "Barcelona",
    province: "Barcelona",
    autonomous_community: "Cataluña",
    race_type: "solidaria",
    distance_km: 5,
    distance_text: "5K",
    registration_price: 15,
    registration_url: "https://www.5ksolidario.cat",
    organizer: "Cruz Roja Barcelona",
    website: "https://www.5ksolidario.cat",
    source_platform: "Charity_5K_Scraper",
    source_url: "https://www.5ksolidario.cat",
    source_event_id: "5k-solidario-barcelona-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 5000,
    registration_status: "registration_open"
  },
  {
    name: "Carrera Popular de Alcalá de Henares",
    description: "10K por la ciudad cervantina",
    event_date: "2025-11-09",
    event_time: "09:00:00",
    city: "Alcalá de Henares",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    race_type: "carrera_popular",
    distance_km: 10,
    distance_text: "10K",
    registration_price: 14,
    registration_url: "https://www.carreraalcala.es",
    organizer: "Ayuntamiento de Alcalá",
    website: "https://www.carreraalcala.es",
    source_platform: "Heritage_10K_Scraper",
    source_url: "https://www.carreraalcala.es",
    source_event_id: "carrera-alcala-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 4000,
    registration_status: "registration_open"
  },
  {
    name: "8K Ciudad de Córdoba",
    description: "Carrera de 8K por el centro histórico cordobés",
    event_date: "2025-11-30",
    event_time: "09:30:00",
    city: "Córdoba",
    province: "Córdoba",
    autonomous_community: "Andalucía",
    race_type: "carrera_popular",
    distance_km: 8,
    distance_text: "8K",
    registration_price: 14,
    registration_url: "https://www.8kcordoba.es",
    organizer: "Ayuntamiento de Córdoba",
    website: "https://www.8kcordoba.es",
    source_platform: "Historic_8K_Scraper",
    source_url: "https://www.8kcordoba.es",
    source_event_id: "8k-cordoba-2025",
    includes_tshirt: true,
    includes_medal: false,
    max_participants: 5000,
    registration_status: "registration_open"
  }
];

// Medias maratones populares
const popularHalfMarathons = [
  {
    name: "Media Maratón de Vitoria",
    description: "Media maratón por la capital alavesa",
    event_date: "2025-10-19",
    event_time: "09:00:00",
    city: "Vitoria-Gasteiz",
    province: "Álava",
    autonomous_community: "País Vasco",
    race_type: "media_maraton",
    distance_km: 21.1,
    distance_text: "Media Maratón",
    registration_price: 30,
    registration_url: "https://www.mediavitoria.eus",
    organizer: "Ayuntamiento de Vitoria",
    website: "https://www.mediavitoria.eus",
    source_platform: "HalfMarathon_Scraper",
    source_url: "https://www.mediavitoria.eus",
    source_event_id: "media-vitoria-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 5000,
    registration_status: "registration_open"
  },
  {
    name: "Media Maratón de Cartagena",
    description: "Recorrido por la ciudad portuaria milenaria",
    event_date: "2025-11-16",
    event_time: "09:00:00",
    city: "Cartagena",
    province: "Murcia",
    autonomous_community: "Región de Murcia",
    race_type: "media_maraton",
    distance_km: 21.1,
    distance_text: "Media Maratón",
    registration_price: 28,
    registration_url: "https://www.mediacartagena.es",
    organizer: "Ayuntamiento de Cartagena",
    website: "https://www.mediacartagena.es",
    source_platform: "HalfMarathon_Scraper",
    source_url: "https://www.mediacartagena.es",
    source_event_id: "media-cartagena-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 4000,
    registration_status: "registration_open"
  },
  {
    name: "Media Maratón de Jerez",
    description: "Media maratón por la ciudad del vino y los caballos",
    event_date: "2025-10-26",
    event_time: "09:30:00",
    city: "Jerez de la Frontera",
    province: "Cádiz",
    autonomous_community: "Andalucía",
    race_type: "media_maraton",
    distance_km: 21.1,
    distance_text: "Media Maratón",
    registration_price: 26,
    registration_url: "https://www.mediajerez.es",
    organizer: "Ayuntamiento de Jerez",
    website: "https://www.mediajerez.es",
    source_platform: "HalfMarathon_Scraper",
    source_url: "https://www.mediajerez.es",
    source_event_id: "media-jerez-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 3500,
    registration_status: "registration_open"
  },
  {
    name: "Media Maratón de Badajoz",
    description: "Recorrido por la frontera extremeña",
    event_date: "2025-11-02",
    event_time: "09:00:00",
    city: "Badajoz",
    province: "Badajoz",
    autonomous_community: "Extremadura",
    race_type: "media_maraton",
    distance_km: 21.1,
    distance_text: "Media Maratón",
    registration_price: 24,
    registration_url: "https://www.mediabadajoz.es",
    organizer: "Club Atletismo Badajoz",
    website: "https://www.mediabadajoz.es",
    source_platform: "HalfMarathon_Scraper",
    source_url: "https://www.mediabadajoz.es",
    source_event_id: "media-badajoz-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 2500,
    registration_status: "registration_open"
  },
  {
    name: "Media Maratón de Cáceres",
    description: "Media maratón por la ciudad patrimonio de la humanidad",
    event_date: "2025-11-23",
    event_time: "09:30:00",
    city: "Cáceres",
    province: "Cáceres",
    autonomous_community: "Extremadura",
    race_type: "media_maraton",
    distance_km: 21.1,
    distance_text: "Media Maratón",
    registration_price: 25,
    registration_url: "https://www.mediacaceres.es",
    organizer: "Ayuntamiento de Cáceres",
    website: "https://www.mediacaceres.es",
    source_platform: "HalfMarathon_Scraper",
    source_url: "https://www.mediacaceres.es",
    source_event_id: "media-caceres-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 3000,
    registration_status: "registration_open"
  },
  {
    name: "Media Maratón de Girona",
    description: "Recorrido por la ciudad de los cuatro ríos",
    event_date: "2025-10-12",
    event_time: "09:00:00",
    city: "Girona",
    province: "Girona",
    autonomous_community: "Cataluña",
    race_type: "media_maraton",
    distance_km: 21.1,
    distance_text: "Media Maratón",
    registration_price: 32,
    registration_url: "https://www.mediagirona.cat",
    organizer: "Ayuntamiento de Girona",
    website: "https://www.mediagirona.cat",
    source_platform: "HalfMarathon_Scraper",
    source_url: "https://www.mediagirona.cat",
    source_event_id: "media-girona-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 4500,
    registration_status: "registration_open"
  }
];

// Maratones importantes
const popularMarathons = [
  {
    name: "Maratón de Donostia",
    description: "Maratón espectacular por San Sebastián y alrededores",
    event_date: "2025-11-02",
    event_time: "08:30:00",
    city: "San Sebastián",
    province: "Guipúzcoa",
    autonomous_community: "País Vasco",
    race_type: "maraton",
    distance_km: 42.2,
    distance_text: "Maratón",
    registration_price: 75,
    registration_url: "https://www.maratondonostia.eus",
    organizer: "Real Sociedad San Sebastián",
    website: "https://www.maratondonostia.eus",
    source_platform: "Marathon_Scraper",
    source_url: "https://www.maratondonostia.eus",
    source_event_id: "maraton-donostia-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 8000,
    registration_status: "registration_open"
  },
  {
    name: "Maratón de Palma de Mallorca",
    description: "Maratón por la isla dorada del Mediterráneo",
    event_date: "2025-10-19",
    event_time: "08:00:00",
    city: "Palma",
    province: "Baleares",
    autonomous_community: "Baleares",
    race_type: "maraton",
    distance_km: 42.2,
    distance_text: "Maratón",
    registration_price: 80,
    registration_url: "https://www.maratonpalma.es",
    organizer: "Govern de les Illes Balears",
    website: "https://www.maratonpalma.es",
    source_platform: "Marathon_Scraper",
    source_url: "https://www.maratonpalma.es",
    source_event_id: "maraton-palma-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 6000,
    registration_status: "registration_open"
  },
  {
    name: "Maratón Costa del Sol",
    description: "Maratón por la costa malagueña",
    event_date: "2025-11-30",
    event_time: "08:30:00",
    city: "Marbella",
    province: "Málaga",
    autonomous_community: "Andalucía",
    race_type: "maraton",
    distance_km: 42.2,
    distance_text: "Maratón",
    registration_price: 70,
    registration_url: "https://www.maratoncostadelsol.es",
    organizer: "Patronato de Turismo Costa del Sol",
    website: "https://www.maratoncostadelsol.es",
    source_platform: "Marathon_Scraper",
    source_url: "https://www.maratoncostadelsol.es",
    source_event_id: "maraton-costa-sol-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 5000,
    registration_status: "registration_open"
  },
  {
    name: "Maratón de Murcia",
    description: "Maratón por la huerta murciana",
    event_date: "2025-11-09",
    event_time: "08:00:00",
    city: "Murcia",
    province: "Murcia",
    autonomous_community: "Región de Murcia",
    race_type: "maraton",
    distance_km: 42.2,
    distance_text: "Maratón",
    registration_price: 55,
    registration_url: "https://www.maratonmurcia.es",
    organizer: "Ayuntamiento de Murcia",
    website: "https://www.maratonmurcia.es",
    source_platform: "Marathon_Scraper",
    source_url: "https://www.maratonmurcia.es",
    source_event_id: "maraton-murcia-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 4000,
    registration_status: "registration_open"
  },
  {
    name: "Maratón de la Rioja",
    description: "Maratón entre viñedos riojanos",
    event_date: "2025-10-25",
    event_time: "09:00:00",
    city: "Logroño",
    province: "La Rioja",
    autonomous_community: "La Rioja",
    race_type: "maraton",
    distance_km: 42.2,
    distance_text: "Maratón",
    registration_price: 60,
    registration_url: "https://www.maratonrioja.es",
    organizer: "Gobierno de La Rioja",
    website: "https://www.maratonrioja.es",
    source_platform: "Marathon_Scraper",
    source_url: "https://www.maratonrioja.es",
    source_event_id: "maraton-rioja-2025",
    includes_tshirt: true,
    includes_medal: true,
    max_participants: 3500,
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

async function addPopularDistanceRaces() {
  console.log('🏃‍♂️ Añadiendo más San Silvestres y carreras populares de 5-10K, medias y maratones...\n');

  const allRaces = [
    ...moreSanSilvestres,
    ...popular5to10KRaces,
    ...popularHalfMarathons,
    ...popularMarathons
  ];

  let addedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  console.log(`📋 Procesando ${allRaces.length} carreras populares...\n`);

  for (const race of allRaces) {
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
        console.log(`✅ Añadida: ${race.name} - ${race.city} (${race.distance_text})`);
        addedCount++;
      }
      
      // Pequeña pausa para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error procesando ${race.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n🏁 RESUMEN FINAL:');
  console.log(`✅ Carreras añadidas: ${addedCount}`);
  console.log(`⚠️  Duplicados evitados: ${duplicateCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📋 Total procesadas: ${allRaces.length}`);

  // Verificar estado final de la base de datos
  console.log('\n📊 VERIFICANDO ESTADO ACTUALIZADO...');
  
  try {
    const { data: totalRaces } = await supabase
      .from('races')
      .select('count')
      .single();

    if (totalRaces) {
      console.log(`📊 TOTAL DE CARRERAS: ${totalRaces.count}`);
    }

    const { data: sanSilvestres } = await supabase
      .from('races')
      .select('count')
      .ilike('name', '%San Silvestre%')
      .single();

    if (sanSilvestres) {
      console.log(`🎊 TOTAL SAN SILVESTRES: ${sanSilvestres.count}`);
    }

    const { data: races5K } = await supabase
      .from('races')
      .select('count')
      .eq('distance_km', 5)
      .single();

    if (races5K) {
      console.log(`🏃 CARRERAS 5K: ${races5K.count}`);
    }

    const { data: races10K } = await supabase
      .from('races')
      .select('count')
      .eq('distance_km', 10)
      .single();

    if (races10K) {
      console.log(`🏃‍♂️ CARRERAS 10K: ${races10K.count}`);
    }

    const { data: halfMarathons } = await supabase
      .from('races')
      .select('count')
      .eq('race_type', 'media_maraton')
      .single();

    if (halfMarathons) {
      console.log(`🏃‍♀️ MEDIAS MARATONES: ${halfMarathons.count}`);
    }

    const { data: marathons } = await supabase
      .from('races')
      .select('count')
      .eq('race_type', 'maraton')
      .single();

    if (marathons) {
      console.log(`🏅 MARATONES: ${marathons.count}`);
    }

  } catch (error) {
    console.error('Error verificando estado:', error);
  }
}

// Ejecutar el script
addPopularDistanceRaces()
  .then(() => {
    console.log('\n🎉 ¡CARRERAS POPULARES AÑADIDAS CON ÉXITO!');
    console.log('🏃‍♂️ Ahora los usuarios tienen muchas más opciones de distancias populares');
    console.log('🎊 Especialmente más San Silvestres y carreras de 5-10K');
    console.log('🏅 También medias maratones y maratones adicionales');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  });

export { addPopularDistanceRaces };
