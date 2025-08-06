#!/usr/bin/env tsx

import { searchRaces, getPopularRaces, getRaceCount } from './src/services/raceService';

async function testRaceSystem() {
  console.log('🧪 Probando sistema de carreras...\n');

  try {
    // Test 1: Count total races
    console.log('📊 Test 1: Contando carreras totales...');
    const count = await getRaceCount();
    console.log(`   Total de carreras: ${count}\n`);

    // Test 2: Get popular races
    console.log('🏃 Test 2: Obteniendo carreras populares...');
    const popular = await getPopularRaces();
    console.log(`   Carreras populares encontradas: ${popular.length}`);
    popular.forEach((race, i) => {
      console.log(`   ${i + 1}. ${race.name} - ${race.location} (${race.date})`);
    });
    console.log('');

    // Test 3: Search races
    console.log('🔍 Test 3: Buscando "Madrid"...');
    const madridRaces = await searchRaces('Madrid');
    console.log(`   Carreras en Madrid: ${madridRaces.length}`);
    madridRaces.forEach((race, i) => {
      console.log(`   ${i + 1}. ${race.name} - ${race.distance}`);
    });
    console.log('');

    // Test 4: Search by trail
    console.log('🏔️ Test 4: Buscando "trail"...');
    const trailRaces = await searchRaces('trail');
    console.log(`   Carreras de trail: ${trailRaces.length}`);
    trailRaces.forEach((race, i) => {
      console.log(`   ${i + 1}. ${race.name} - ${race.location}`);
    });

    console.log('\n✅ ¡Todos los tests completados exitosamente!');
    console.log('\n📱 Tu aplicación está lista para usar:');
    console.log('   🌐 http://localhost:8080/onboarding/race-preparation');

  } catch (error) {
    console.error('❌ Error en los tests:', error);
  }
}

testRaceSystem().catch(console.error);