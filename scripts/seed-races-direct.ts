#!/usr/bin/env tsx

/**
 * Direct race seeding script that bypasses RLS using service role
 * This will populate the database with 300+ Spanish races
 */

import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for seeding
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uprohtkbghujvjwjnqyv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing Supabase service key. Please set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Spanish provinces and their autonomous communities
const SPANISH_PROVINCES = {
  'Madrid': 'Comunidad de Madrid',
  'Barcelona': 'Cataluña',
  'Valencia': 'Comunidad Valenciana',
  'Sevilla': 'Andalucía',
  'Málaga': 'Andalucía',
  'Alicante': 'Comunidad Valenciana',
  'Murcia': 'Región de Murcia',
  'Las Palmas': 'Canarias',
  'Vizcaya': 'País Vasco',
  'A Coruña': 'Galicia',
  'Cádiz': 'Andalucía',
  'Granada': 'Andalucía',
  'Córdoba': 'Andalucía',
  'Zaragoza': 'Aragón',
  'Asturias': 'Principado de Asturias',
  'Baleares': 'Islas Baleares',
  'Tenerife': 'Canarias',
  'Cantabria': 'Cantabria',
  'Toledo': 'Castilla-La Mancha',
  'León': 'Castilla y León',
  'Castellón': 'Comunidad Valenciana',
  'Almería': 'Andalucía',
  'Huelva': 'Andalucía',
  'Jaén': 'Andalucía',
  'Girona': 'Cataluña',
  'Tarragona': 'Cataluña',
  'Lleida': 'Cataluña',
  'Burgos': 'Castilla y León',
  'Valladolid': 'Castilla y León',
  'Salamanca': 'Castilla y León',
  'Cáceres': 'Extremadura',
  'Badajoz': 'Extremadura',
  'Pontevedra': 'Galicia',
  'Lugo': 'Galicia',
  'Ourense': 'Galicia',
  'Guipúzcoa': 'País Vasco',
  'Álava': 'País Vasco',
  'Navarra': 'Comunidad Foral de Navarra',
  'La Rioja': 'La Rioja',
  'Huesca': 'Aragón',
  'Teruel': 'Aragón',
  'Ciudad Real': 'Castilla-La Mancha',
  'Cuenca': 'Castilla-La Mancha',
  'Guadalajara': 'Castilla-La Mancha',
  'Albacete': 'Castilla-La Mancha',
  'Ávila': 'Castilla y León',
  'Palencia': 'Castilla y León',
  'Segovia': 'Castilla y León',
  'Soria': 'Castilla y León',
  'Zamora': 'Castilla y León',
  'Ceuta': 'Ceuta',
  'Melilla': 'Melilla'
};

const RACE_TYPES = ['carrera_popular', 'trail_running', 'media_maraton', 'maraton', 'cross', 'nocturna', 'solidaria', 'montaña'];
const DISTANCES = [5, 10, 15, 21.1, 25, 30, 42.2];

function generateRaceName(city: string, raceType: string, distance: number): string {
  const prefixes = {
    'carrera_popular': 'Carrera Popular de',
    'trail_running': 'Trail de',
    'media_maraton': 'Media Maratón de',
    'maraton': 'Maratón de',
    'cross': 'Cross de',
    'nocturna': 'Nocturna de',
    'solidaria': 'Carrera Solidaria de',
    'montaña': 'Trail de Montaña de'
  };
  
  const suffixes = ['', ' - Primavera', ' - Otoño', ' - Navideña', ' del Parque', ' de la Costa', ' de Montaña', ' Popular'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const prefix = prefixes[raceType as keyof typeof prefixes] || 'Carrera de';
  
  return `${prefix} ${city}${suffix}`;
}

function calculatePrice(distance: number, raceType: string): number {
  let basePrice = 15;
  
  if (distance >= 42) basePrice = 60;
  else if (distance >= 21) basePrice = 30;
  else if (distance >= 15) basePrice = 20;
  else if (distance >= 10) basePrice = 15;
  else basePrice = 12;
  
  if (raceType === 'trail_running') basePrice += 5;
  if (raceType === 'montaña') basePrice += 8;
  if (raceType === 'solidaria') basePrice -= 5;
  
  return Math.max(basePrice + Math.floor(Math.random() * 10) - 5, 8);
}

function generateRandomDate(): string {
  const start = new Date('2025-10-01');
  const end = new Date('2026-12-31');
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

async function generateAndInsertRaces() {
  console.log('🚀 Starting direct race database seeding...');
  
  const races = [];
  let raceCounter = 1;
  
  // Generate races for each province
  for (const [province, community] of Object.entries(SPANISH_PROVINCES)) {
    const racesPerProvince = Math.floor(Math.random() * 8) + 4; // 4-12 races per province
    
    for (let i = 0; i < racesPerProvince; i++) {
      const raceType = RACE_TYPES[Math.floor(Math.random() * RACE_TYPES.length)];
      const distance = DISTANCES[Math.floor(Math.random() * DISTANCES.length)];
      const eventDate = generateRandomDate();
      
      // Generate realistic city names for the province
      const cities = {
        'Madrid': ['Madrid', 'Alcalá de Henares', 'Móstoles', 'Fuenlabrada', 'Leganés', 'Getafe'],
        'Barcelona': ['Barcelona', 'L\'Hospitalet de Llobregat', 'Badalona', 'Terrassa', 'Sabadell', 'Mataró'],
        'Valencia': ['Valencia', 'Gandia', 'Torrent', 'Sagunto', 'Alzira', 'Xàtiva'],
        'Sevilla': ['Sevilla', 'Dos Hermanas', 'Alcalá de Guadaíra', 'Utrera', 'Mairena del Aljarafe'],
        // Add more as needed, but default to province name
      };
      
      const cityOptions = cities[province as keyof typeof cities] || [province];
      const city = cityOptions[Math.floor(Math.random() * cityOptions.length)];
      
      const race = {
        name: generateRaceName(city, raceType, distance),
        description: `Carrera ${raceType.replace('_', ' ')} en ${city}, ${province}. Una experiencia única para corredores de todos los niveles.`,
        event_date: eventDate,
        event_time: `${8 + Math.floor(Math.random() * 4)}:${Math.random() > 0.5 ? '00' : '30'}:00`,
        city: city,
        province: province,
        autonomous_community: community,
        country: 'España',
        race_type: raceType,
        distance_km: distance,
        distance_text: distance === 21.1 ? 'Media Maratón' : distance === 42.2 ? 'Maratón' : `${distance}K`,
        registration_price: calculatePrice(distance, raceType),
        registration_url: `https://inscripciones-carreras.es/${city.toLowerCase().replace(/\s+/g, '-')}-${raceCounter}`,
        registration_status: 'registration_open',
        max_participants: Math.floor(Math.random() * 5000) + 500,
        organizer: `Club Atlético ${city}`,
        website: `https://carrera-${city.toLowerCase().replace(/\s+/g, '-')}.es`,
        source_platform: 'SeedScript',
        source_url: `https://seed.example.com/race/${raceCounter}`,
        source_event_id: `seed-${raceCounter}`,
        includes_tshirt: Math.random() > 0.3,
        includes_medal: Math.random() > 0.4,
        wheelchair_accessible: Math.random() > 0.7,
        data_quality_score: 0.80 + Math.random() * 0.15, // 0.80-0.95
        scraped_at: new Date().toISOString(),
        next_scrape_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
      
      races.push(race);
      raceCounter++;
    }
  }
  
  console.log(`📊 Generated ${races.length} races across ${Object.keys(SPANISH_PROVINCES).length} provinces`);
  
  // Insert races in batches
  const batchSize = 50;
  let totalInserted = 0;
  
  for (let i = 0; i < races.length; i += batchSize) {
    const batch = races.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('races')
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
      } else {
        totalInserted += data?.length || 0;
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${data?.length || 0} races`);
      }
    } catch (error) {
      console.error(`💥 Exception in batch ${Math.floor(i / batchSize) + 1}:`, error);
    }
  }
  
  console.log(`🎉 Successfully inserted ${totalInserted} races into the database!`);
  
  // Verify insertion
  const { data: raceCount, error: countError } = await supabase
    .from('races')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ Error getting race count:', countError);
  } else {
    console.log(`📈 Total races in database: ${raceCount?.length || 0}`);
  }
  
  // Show breakdown by type
  const { data: typeBreakdown } = await supabase
    .from('races')
    .select('race_type')
    .gte('event_date', '2025-10-01');
  
  if (typeBreakdown) {
    const typeCounts: Record<string, number> = {};
    typeBreakdown.forEach(race => {
      typeCounts[race.race_type] = (typeCounts[race.race_type] || 0) + 1;
    });
    
    console.log('\n📊 Races by type:');
    Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  • ${type}: ${count} races`);
      });
  }
  
  return totalInserted;
}

async function main() {
  console.log('================================================================================');
  console.log('🏃‍♂️ DIRECT SPANISH RACE DATABASE SEEDING 🏃‍♀️');
  console.log('================================================================================\n');
  
  try {
    const inserted = await generateAndInsertRaces();
    
    if (inserted >= 300) {
      console.log('\n🎉 SUCCESS! Database populated with 300+ Spanish races!');
      console.log('   Users can now search and select from comprehensive race data during onboarding.');
    } else {
      console.log(`\n⚠️  Inserted ${inserted} races. You may want to run the script again to reach 300+.`);
    }
    
  } catch (error) {
    console.error('\n💥 Critical error:', error);
    process.exit(1);
  }
  
  console.log('\n================================================================================');
  console.log('🏁 RACE SEEDING COMPLETED');
  console.log('================================================================================\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
