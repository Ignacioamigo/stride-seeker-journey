#!/usr/bin/env tsx

/**
 * Script para actualizar las carreras de la base de datos a fechas de 2026
 * Ejecutar: npx tsx scripts/update-races-to-2026.ts
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://uprohtkbghujvjwjnqyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Fecha actual: 22 de enero de 2026
const TODAY = new Date('2026-01-22');

// Función para obtener una nueva fecha en 2026-2027
function getNewDateFor2026(originalDate: string): string {
  const original = new Date(originalDate);
  const month = original.getMonth(); // 0-11
  const day = original.getDate();
  
  // Si la fecha original era en 2025 o principios de 2026 (antes de hoy),
  // la movemos a 2026 o 2027
  let newYear: number;
  
  // Meses de febrero a diciembre: los ponemos en 2026
  // Enero: lo ponemos en 2027
  if (month === 0) { // Enero
    newYear = 2027;
  } else if (month === 1) { // Febrero
    newYear = 2026; // Febrero 2026 es futuro
  } else {
    newYear = 2026;
  }
  
  // Asegurar que la fecha sea futura (después del 22 de enero de 2026)
  const newDate = new Date(newYear, month, day);
  if (newDate <= TODAY) {
    // Si aún está en el pasado, añadir un año
    newDate.setFullYear(newDate.getFullYear() + 1);
  }
  
  return newDate.toISOString().split('T')[0];
}

// Función especial para carreras con fechas fijas (San Silvestre = 31 dic)
function getSpecialEventDate(raceName: string, originalDate: string): string {
  const lowerName = raceName.toLowerCase();
  
  // San Silvestre siempre el 31 de diciembre
  if (lowerName.includes('san silvestre') || lowerName.includes('nochevieja')) {
    return '2026-12-31';
  }
  
  // Carrera de Reyes siempre el 6 de enero
  if (lowerName.includes('reyes')) {
    return '2027-01-06';
  }
  
  // Cross de la Constitución siempre el 6 de diciembre
  if (lowerName.includes('constitución') || lowerName.includes('constitucion')) {
    return '2026-12-06';
  }
  
  // Para otras carreras, usar la lógica general
  return getNewDateFor2026(originalDate);
}

async function updateRacesToFuture() {
  console.log('🏃 Iniciando actualización de carreras a fechas de 2026...\n');
  console.log(`📅 Fecha actual: ${TODAY.toISOString().split('T')[0]}\n`);

  // Obtener todas las carreras
  const { data: races, error: fetchError } = await supabase
    .from('races')
    .select('*');

  if (fetchError) {
    console.error('❌ Error obteniendo carreras:', fetchError);
    return;
  }

  if (!races || races.length === 0) {
    console.log('⚠️ No hay carreras en la base de datos');
    return;
  }

  console.log(`📊 Total de carreras encontradas: ${races.length}\n`);

  // Contar carreras pasadas
  const pastRaces = races.filter(r => new Date(r.event_date) < TODAY);
  const futureRaces = races.filter(r => new Date(r.event_date) >= TODAY);

  console.log(`📅 Carreras con fecha pasada: ${pastRaces.length}`);
  console.log(`📅 Carreras con fecha futura: ${futureRaces.length}\n`);

  if (pastRaces.length === 0) {
    console.log('✅ Todas las carreras ya tienen fechas futuras. No hay nada que actualizar.');
    return;
  }

  console.log('🔄 Actualizando carreras con fechas pasadas...\n');

  let updatedCount = 0;
  let errorCount = 0;

  for (const race of pastRaces) {
    try {
      // Calcular nueva fecha
      const newDate = getSpecialEventDate(race.name, race.event_date);

      // Actualizar la carrera
      const { error: updateError } = await supabase
        .from('races')
        .update({ 
          event_date: newDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', race.id);

      if (updateError) {
        console.error(`❌ Error actualizando ${race.name}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`✅ ${race.name} (${race.city}): ${race.event_date} → ${newDate}`);
        updatedCount++;
      }

      // Pequeña pausa para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error) {
      console.error(`❌ Error procesando ${race.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE ACTUALIZACIÓN:');
  console.log('='.repeat(60));
  console.log(`✅ Carreras actualizadas: ${updatedCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📋 Total procesadas: ${pastRaces.length}`);

  // Verificar estado final
  console.log('\n🔍 Verificando estado final de la base de datos...\n');
  
  const { data: finalRaces, error: finalError } = await supabase
    .from('races')
    .select('*');

  if (!finalError && finalRaces) {
    const finalPast = finalRaces.filter(r => new Date(r.event_date) < TODAY);
    const finalFuture = finalRaces.filter(r => new Date(r.event_date) >= TODAY);

    console.log(`📅 Carreras con fecha pasada: ${finalPast.length}`);
    console.log(`📅 Carreras con fecha futura: ${finalFuture.length}`);
    console.log(`📊 Total de carreras: ${finalRaces.length}`);

    // Mostrar distribución por tipo
    console.log('\n📊 DISTRIBUCIÓN POR TIPO DE CARRERA:');
    const typeCount: Record<string, number> = {};
    finalFuture.forEach(r => {
      typeCount[r.race_type] = (typeCount[r.race_type] || 0) + 1;
    });
    Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

    // Mostrar próximas 10 carreras
    console.log('\n📅 PRÓXIMAS 10 CARRERAS:');
    const nextRaces = finalFuture
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 10);
    
    nextRaces.forEach(r => {
      console.log(`   ${r.event_date} - ${r.name} (${r.city})`);
    });
  }
}

// Ejecutar
updateRacesToFuture()
  .then(() => {
    console.log('\n🎉 ¡Actualización completada!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  });
