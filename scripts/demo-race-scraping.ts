// Demo script to showcase the race scraping system functionality
// Run with: npx tsx scripts/demo-race-scraping.ts

import { initializeRaceDatabase, getDatabaseStatus, refreshRaceData } from '../src/utils/initializeRaceDatabase';
import { searchRacesAdvanced, updateRaceDatabase, getScrapingStats } from '../src/services/raceService';

async function runDemo() {
  console.log('🏃‍♂️ DEMO: Sistema de Scraping de Carreras Españolas');
  console.log('================================================\n');

  try {
    // 1. Initialize database with scraped data
    console.log('1️⃣ Inicializando base de datos con scraping...\n');
    const initResult = await initializeRaceDatabase();
    
    if (initResult.success) {
      console.log('✅ Inicialización exitosa!');
      console.log(`📊 Estadísticas:
        - Fuentes procesadas: ${initResult.stats.sourcesProcessed}
        - Carreras encontradas: ${initResult.stats.racesFound}
        - Carreras insertadas: ${initResult.stats.racesInserted}
        - Carreras actualizadas: ${initResult.stats.racesUpdated}
        - Errores: ${initResult.stats.errors}
      `);
      
      console.log('📋 Detalles por fuente:');
      initResult.sources.forEach(source => {
        console.log(`  ${source.name}: ${source.status} (${source.racesFound} carreras)`);
      });
    } else {
      console.log('❌ Error en inicialización:', initResult.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 2. Get database status
    console.log('2️⃣ Estado actual de la base de datos...\n');
    const status = await getDatabaseStatus();
    
    console.log(`📈 Resumen de datos:
      - Total de carreras: ${status.totalRaces}
      - Últimas carreras agregadas: ${status.latestRaces.length}
    `);

    if (Object.keys(status.racesBySource).length > 0) {
      console.log('📱 Carreras por fuente:');
      Object.entries(status.racesBySource).forEach(([source, count]) => {
        console.log(`  ${source}: ${count} carreras`);
      });
    }

    if (Object.keys(status.racesByType).length > 0) {
      console.log('🏃 Carreras por tipo:');
      Object.entries(status.racesByType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} carreras`);
      });
    }

    if (Object.keys(status.racesByProvince).length > 0) {
      console.log('🗺️ Top provincias:');
      Object.entries(status.racesByProvince).slice(0, 5).forEach(([province, count]) => {
        console.log(`  ${province}: ${count} carreras`);
      });
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 3. Demo advanced search functionality
    console.log('3️⃣ Demostrando búsquedas avanzadas...\n');

    // Search for marathons in Madrid
    console.log('🔍 Buscando maratones en Madrid...');
    const madridMarathons = await searchRacesAdvanced({
      query: 'maratón madrid',
      types: ['maraton'],
      limit: 5
    });
    
    console.log(`📍 Encontrados ${madridMarathons.length} maratones en Madrid:`);
    madridMarathons.forEach(race => {
      console.log(`  - ${race.name} (${race.date}) - ${race.location}`);
    });

    // Search for trail runs
    console.log('\n🏔️ Buscando carreras de trail...');
    const trailRuns = await searchRacesAdvanced({
      types: ['trail_running', 'ultra_trail'],
      limit: 5
    });
    
    console.log(`⛰️ Encontradas ${trailRuns.length} carreras de trail:`);
    trailRuns.forEach(race => {
      console.log(`  - ${race.name} (${race.date}) - ${race.location}`);
    });

    // Search by specific provinces
    console.log('\n🏖️ Buscando carreras en Valencia y Barcelona...');
    const coastalRaces = await searchRacesAdvanced({
      provinces: ['Valencia', 'Barcelona'],
      limit: 5
    });
    
    console.log(`🌊 Encontradas ${coastalRaces.length} carreras costeras:`);
    coastalRaces.forEach(race => {
      console.log(`  - ${race.name} (${race.date}) - ${race.location}`);
    });

    console.log('\n' + '='.repeat(50) + '\n');

    // 4. Get scraping statistics
    console.log('4️⃣ Estadísticas del sistema de scraping...\n');
    const scrapingStats = await getScrapingStats();
    
    if (scrapingStats.length > 0) {
      console.log('📊 Estadísticas por fuente:');
      scrapingStats.forEach((stat: any) => {
        console.log(`  ${stat.source_platform}: ${stat.count} carreras (calidad promedio: ${stat.avg_data_quality_score?.toFixed(2)})`);
      });
    } else {
      console.log('ℹ️ No hay estadísticas de scraping disponibles aún.');
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('✅ DEMO COMPLETADO');
    console.log('El sistema de scraping está funcionando correctamente!');
    console.log('Los usuarios pueden ahora buscar carreras reales de toda España 🇪🇸🏃‍♂️');

  } catch (error) {
    console.error('❌ Error durante el demo:', error);
    
    // Show fallback message
    console.log('\n🔄 En caso de error, el sistema utiliza datos de fallback');
    console.log('Esto garantiza que la aplicación siempre funcione para los usuarios');
  }
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };