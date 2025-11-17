
export const calculateWeeklyData = (workouts: any[]) => {
  console.log('=== CALCULANDO DATOS SEMANALES (FECHA REAL) ===');
  
  const now = new Date();
  const startOfWeek = new Date(now);
  
  // Calcular el inicio de la semana (lunes = 0)
  const dayOfWeek = now.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(now.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);
  
  console.log(`Hoy es: ${now.toLocaleDateString()} (día JS: ${dayOfWeek})`);
  console.log(`Inicio de semana (lunes): ${startOfWeek.toLocaleDateString()}`);
  
  // Filtrar entrenamientos de esta semana
  const thisWeekWorkouts = workouts.filter(w => {
    // ✅ Permitir distancia 0 (útil para pruebas y entrenamientos muy cortos)
    if (!w.fecha_completado || w.distancia_recorrida === null || w.distancia_recorrida === undefined || w.distancia_recorrida < 0) {
      return false;
    }
    
    // IMPORTANTE: Forzar fecha local para evitar problemas de timezone
    const workoutDate = new Date(w.fecha_completado + 'T12:00:00.000');
    workoutDate.setHours(0, 0, 0, 0); // Resetear a medianoche local
    const isThisWeek = workoutDate >= startOfWeek;
    
    console.log(`Entrenamiento "${w.workout_title}": ${w.fecha_completado} → ${workoutDate.toLocaleDateString()} - ¿Esta semana? ${isThisWeek}`);
    
    return isThisWeek;
  });
  
  console.log(`Entrenamientos válidos de esta semana: ${thisWeekWorkouts.length}`);
  
  // Crear array de días de la semana
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Inicializar acumulador de distancias por día
  const distancesByDay = new Map();
  for (let i = 0; i < 7; i++) {
    distancesByDay.set(i, 0);
  }
  
  // Procesar cada entrenamiento de esta semana
  thisWeekWorkouts.forEach((workout, index) => {
    // IMPORTANTE: Usar mismo parsing que el filtro
    const workoutDate = new Date(workout.fecha_completado + 'T12:00:00.000');
    
    // Obtener día de la semana (0 = domingo, 1 = lunes, etc.)
    let jsDay = workoutDate.getDay();
    
    // Convertir a nuestro índice (0 = lunes, 6 = domingo)
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
    
    // Acumular distancia
    const currentDistance = distancesByDay.get(dayIndex) || 0;
    const newDistance = currentDistance + workout.distancia_recorrida;
    distancesByDay.set(dayIndex, newDistance);
    
    console.log(`[${index + 1}] Procesando entrenamiento:`);
    console.log(`  - Título: ${workout.workout_title}`);
    console.log(`  - Fecha: ${workoutDate.toLocaleDateString()}`);
    console.log(`  - Día JS: ${jsDay} -> Índice: ${dayIndex} (${daysOfWeek[dayIndex]})`);
    console.log(`  - Distancia: ${workout.distancia_recorrida}km`);
    console.log(`  - Distancia previa del día: ${currentDistance}km`);
    console.log(`  - Nueva distancia del día: ${newDistance}km`);
  });
  
  // Crear array final con los datos del gráfico
  const weeklyData = [];
  console.log('=== CONSTRUCCIÓN FINAL DEL GRÁFICO ===');
  
  for (let i = 0; i < 7; i++) {
    const dayDistance = distancesByDay.get(i);
    const roundedDistance = Math.round(dayDistance * 10) / 10;
    
    weeklyData.push({
      day: daysOfWeek[i],
      distance: roundedDistance
    });
    
    console.log(`${daysOfWeek[i]}: ${roundedDistance}km`);
  }
  
  // Verificar coherencia
  const totalFromDays = weeklyData.reduce((sum, day) => sum + day.distance, 0);
  const totalFromWorkouts = thisWeekWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0);
  
  console.log(`=== VERIFICACIÓN FINAL ===`);
  console.log(`Total desde entrenamientos: ${totalFromWorkouts}km`);
  console.log(`Total desde gráfico: ${totalFromDays}km`);
  console.log(`Diferencia: ${Math.abs(totalFromWorkouts - totalFromDays)}km`);
  
  if (Math.abs(totalFromWorkouts - totalFromDays) > 0.1) {
    console.warn('⚠️ INCONSISTENCIA: Los totales no coinciden');
  } else {
    console.log('✅ COHERENCIA: Los totales coinciden correctamente');
  }
  
  return {
    weeklyData,
    weeklyDistance: Math.round(totalFromWorkouts * 10) / 10
  };
};
