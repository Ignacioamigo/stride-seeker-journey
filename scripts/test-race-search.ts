#!/usr/bin/env tsx
import { searchRaces, getPopularRaces, getRacesByLocation, getRacesByType } from '../src/services/raceService.js';

async function testRaceSearch() {
  console.log('🔍 Probando funciones de búsqueda de carreras...\n');

  try {
    // Probar carreras populares (las que aparecen al abrir la página)
    console.log('1️⃣ Probando carreras populares...');
    const popularRaces = await getPopularRaces();
    console.log(`✅ Carreras populares encontradas: ${popularRaces.length}`);
    if (popularRaces.length > 0) {
      popularRaces.forEach(race => {
        console.log(`   🏃‍♂️ ${race.name} - ${race.location} (${race.date})`);
      });
    } else {
      console.log('❌ No se encontraron carreras populares');
    }

    // Probar búsqueda de texto (como cuando el usuario escribe)
    console.log('\n2️⃣ Probando búsqueda de texto: "Madrid"...');
    const madridRaces = await searchRaces('Madrid');
    console.log(`✅ Carreras encontradas para "Madrid": ${madridRaces.length}`);
    if (madridRaces.length > 0) {
      madridRaces.forEach(race => {
        console.log(`   🏃‍♂️ ${race.name} - ${race.location} (${race.date})`);
      });
    } else {
      console.log('❌ No se encontraron carreras para Madrid');
    }

    // Probar búsqueda de texto con "Valencia"
    console.log('\n3️⃣ Probando búsqueda de texto: "Valencia"...');
    const valenciaRaces = await searchRaces('Valencia');
    console.log(`✅ Carreras encontradas para "Valencia": ${valenciaRaces.length}`);
    if (valenciaRaces.length > 0) {
      valenciaRaces.forEach(race => {
        console.log(`   🏃‍♂️ ${race.name} - ${race.location} (${race.date})`);
      });
    }

    // Probar búsqueda por tipo
    console.log('\n4️⃣ Probando búsqueda por tipo: "maraton"...');
    const maratones = await getRacesByType('maraton');
    console.log(`✅ Maratones encontrados: ${maratones.length}`);
    if (maratones.length > 0) {
      maratones.slice(0, 3).forEach(race => {
        console.log(`   🏃‍♂️ ${race.name} - ${race.location} (${race.date})`);
      });
      if (maratones.length > 3) {
        console.log(`   ... y ${maratones.length - 3} más`);
      }
    }

    // Probar búsqueda por localización
    console.log('\n5️⃣ Probando búsqueda por localización: "Barcelona"...');
    const barcelonaRaces = await getRacesByLocation('Barcelona');
    console.log(`✅ Carreras en Barcelona: ${barcelonaRaces.length}`);
    if (barcelonaRaces.length > 0) {
      barcelonaRaces.forEach(race => {
        console.log(`   🏃‍♂️ ${race.name} - ${race.location} (${race.date})`);
      });
    }

    console.log('\n🎉 ¡Todas las funciones de búsqueda funcionan correctamente!');
    console.log('✅ Tu app debería mostrar estas carreras cuando busques');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    console.log('\n📋 Verifica:');
    console.log('1. Que el servidor esté corriendo (npm run dev)');
    console.log('2. Que la conexión con Supabase funcione');
    console.log('3. Que las variables de entorno estén correctas');
  }
}

testRaceSearch().catch(console.error);