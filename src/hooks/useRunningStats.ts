
import { useState, useEffect } from 'react';
import { getCompletedWorkouts } from '@/services/completedWorkoutService';

interface RunningStats {
  weeklyDistance: number;
  totalRuns: number;
  averagePace: string;
  weeklyCalories: number;
  averageDistancePerRun: number;
  monthlyDistance: number;
  paceImprovement: number;
  weeklyData: Array<{ day: string; distance: number }>;
  monthlyTotalTime: number;
  monthlyAveragePace: string;
  longestRun: number;
  bestPace: string;
  distanceVariation: number;
  paceVariation: number;
  previousMonthDistance: number;
  previousMonthAveragePace: string;
}

// Función mejorada para convertir duración a minutos
const convertDurationToMinutes = (duration: string | any): number => {
  if (!duration) return 0;
  
  // Si viene como string, procesarlo
  let durationStr = typeof duration === 'string' ? duration : String(duration);
  
  console.log(`[convertDurationToMinutes] Procesando: "${durationStr}"`);
  
  // Limpiar la cadena
  const cleanDuration = durationStr.toLowerCase().replace(/\s+/g, '');
  
  // Si ya es un número, asumimos minutos
  if (/^\d+(\.\d+)?$/.test(cleanDuration)) {
    const minutes = parseFloat(cleanDuration);
    console.log(`[convertDurationToMinutes] Número directo: ${minutes} minutos`);
    return minutes;
  }
  
  // Buscar formato "X min"
  const minMatch = cleanDuration.match(/(\d+(?:\.\d+)?)min/);
  if (minMatch) {
    const minutes = parseFloat(minMatch[1]);
    console.log(`[convertDurationToMinutes] Formato "X min": ${minutes} minutos`);
    return minutes;
  }
  
  // Buscar horas y minutos
  let totalMinutes = 0;
  
  const hoursMatch = cleanDuration.match(/(\d+(?:\.\d+)?)h/);
  if (hoursMatch) {
    totalMinutes += parseFloat(hoursMatch[1]) * 60;
  }
  
  const minutesMatch = cleanDuration.match(/(\d+(?:\.\d+)?)min/);
  if (minutesMatch) {
    totalMinutes += parseFloat(minutesMatch[1]);
  }
  
  // Formato HH:MM:SS de PostgreSQL interval
  const intervalMatch = cleanDuration.match(/(\d+):(\d+):(\d+)/);
  if (intervalMatch) {
    const hours = parseInt(intervalMatch[1]);
    const minutes = parseInt(intervalMatch[2]);
    const seconds = parseInt(intervalMatch[3]);
    totalMinutes = hours * 60 + minutes + seconds / 60;
    console.log(`[convertDurationToMinutes] Formato interval ${hours}:${minutes}:${seconds} = ${totalMinutes} minutos`);
    return totalMinutes;
  }
  
  // Formato MM:SS
  const timeMatch = cleanDuration.match(/^(\d+):(\d+)$/);
  if (timeMatch && !hoursMatch && !minutesMatch) {
    const first = parseInt(timeMatch[1]);
    const second = parseInt(timeMatch[2]);
    
    if (first > 59) {
      // HH:MM
      totalMinutes = first * 60 + second;
    } else {
      // MM:SS
      totalMinutes = first + (second / 60);
    }
    console.log(`[convertDurationToMinutes] Formato tiempo ${first}:${second} = ${totalMinutes} minutos`);
    return totalMinutes;
  }
  
  console.log(`[convertDurationToMinutes] Total calculado: ${totalMinutes} minutos`);
  return totalMinutes;
};

// Función para convertir minutos a formato de ritmo (min/km)
const convertMinutesToPace = (totalMinutes: number, totalDistance: number): string => {
  if (totalDistance === 0 || totalMinutes === 0) return "0:00 min/km";
  
  // CORRECTO: totalMinutes / totalDistance para obtener min/km
  const paceMinutes = totalMinutes / totalDistance;
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - minutes) * 60);
  
  // Asegurar que los segundos no excedan 59
  const finalSeconds = seconds >= 60 ? 59 : seconds;
  const finalMinutes = seconds >= 60 ? minutes + 1 : minutes;
  
  return `${finalMinutes}:${finalSeconds.toString().padStart(2, '0')} min/km`;
};

export const useRunningStats = () => {
  const [stats, setStats] = useState<RunningStats>({
    weeklyDistance: 0,
    totalRuns: 0,
    averagePace: "0:00 min/km",
    weeklyCalories: 0,
    averageDistancePerRun: 0,
    monthlyDistance: 0,
    paceImprovement: 0,
    weeklyData: [
      { day: 'Lun', distance: 0 },
      { day: 'Mar', distance: 0 },
      { day: 'Mié', distance: 0 },
      { day: 'Jue', distance: 0 },
      { day: 'Vie', distance: 0 },
      { day: 'Sáb', distance: 0 },
      { day: 'Dom', distance: 0 }
    ],
    monthlyTotalTime: 0,
    monthlyAveragePace: "0:00 min/km",
    longestRun: 0,
    bestPace: "0:00 min/km",
    distanceVariation: 0,
    paceVariation: 0,
    previousMonthDistance: 0,
    previousMonthAveragePace: "0:00 min/km"
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = async () => {
    try {
      setIsLoading(true);
      
      console.log('=== CALCULANDO ESTADÍSTICAS DESDE ENTRENAMIENTOS_COMPLETADOS ===');
      
      // Obtener entrenamientos de la nueva tabla
      const workouts = await getCompletedWorkouts();
      
      if (!workouts || workouts.length === 0) {
        console.log('No hay entrenamientos, reseteando estadísticas');
        resetStats();
        return;
      }

      console.log('Entrenamientos encontrados:', workouts.length);
      calculateStatsFromData(workouts);
    } catch (error) {
      console.error('Error calculating stats:', error);
      resetStats();
    }
  };

  const calculateStatsFromData = (workouts: any[]) => {
    if (!workouts || workouts.length === 0) {
      resetStats();
      return;
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    // CORRECCIÓN: Calcular el inicio de la semana correctamente (lunes = 1, domingo = 0)
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Si es domingo (0), restar 6, sino restar (dayOfWeek - 1)
    startOfWeek.setDate(now.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    console.log(`=== CÁLCULO DE SEMANA ACTUAL ===`);
    console.log(`Hoy es: ${now.toLocaleDateString()} (día ${dayOfWeek})`);
    console.log(`Inicio de semana (lunes): ${startOfWeek.toLocaleDateString()}`);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Filtrar entrenamientos por períodos usando fecha_completado
    const thisWeekWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.fecha_completado);
      const isThisWeek = workoutDate >= startOfWeek;
      console.log(`Entrenamiento ${w.workout_title}: ${workoutDate.toLocaleDateString()} - ¿Esta semana? ${isThisWeek}`);
      return isThisWeek;
    });

    console.log(`Entrenamientos de esta semana: ${thisWeekWorkouts.length}`);

    const thisMonthWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.fecha_completado);
      return workoutDate >= startOfMonth;
    });

    const lastMonthWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.fecha_completado);
      return workoutDate >= startOfLastMonth && workoutDate <= endOfLastMonth;
    });

    // Solo considerar entrenamientos con distancia real
    const validWorkouts = workouts.filter(w => w.distancia_recorrida && w.distancia_recorrida > 0);
    const validThisWeekWorkouts = thisWeekWorkouts.filter(w => w.distancia_recorrida && w.distancia_recorrida > 0);
    const validThisMonthWorkouts = thisMonthWorkouts.filter(w => w.distancia_recorrida && w.distancia_recorrida > 0);
    const validLastMonthWorkouts = lastMonthWorkouts.filter(w => w.distancia_recorrida && w.distancia_recorrida > 0);

    // Calcular distancia semanal
    const weeklyDistance = validThisWeekWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0);

    // Total de carreras
    const totalRuns = validWorkouts.length;

    // Promedio de distancia por carrera
    const totalDistanceAllRuns = validWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0);
    const averageDistancePerRun = totalRuns > 0 ? totalDistanceAllRuns / totalRuns : 0;

    // CÁLCULO CORRECTO: Ritmo promedio global
    let totalTimeMinutes = 0;
    let totalDistance = 0;

    console.log('=== CALCULANDO RITMO PROMEDIO GLOBAL ===');
    validWorkouts.forEach(w => {
      if (w.duracion && w.distancia_recorrida) {
        const timeInMinutes = convertDurationToMinutes(w.duracion);
        totalTimeMinutes += timeInMinutes;
        totalDistance += w.distancia_recorrida;
        
        console.log(`Entrenamiento: ${w.workout_title}`);
        console.log(`  - Distancia: ${w.distancia_recorrida}km`);
        console.log(`  - Duración original: "${w.duracion}"`);
        console.log(`  - Duración en minutos: ${timeInMinutes}`);
        console.log(`  - Ritmo individual: ${timeInMinutes / w.distancia_recorrida} min/km`);
      }
    });

    console.log(`TOTALES GLOBALES:`);
    console.log(`  - Total tiempo: ${totalTimeMinutes} minutos`);
    console.log(`  - Total distancia: ${totalDistance} km`);
    console.log(`  - Ritmo promedio: ${totalTimeMinutes / totalDistance} min/km`);

    // CORRECCIÓN: usar la función corregida para el ritmo promedio GLOBAL
    const averagePace = totalDistance > 0 && totalTimeMinutes > 0 ? 
      convertMinutesToPace(totalTimeMinutes, totalDistance) : "0:00 min/km";

    // Calorías estimadas
    const weeklyCalories = Math.round(weeklyDistance * 60);

    // Distancia mensual
    const monthlyDistance = validThisMonthWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0);

    // CÁLCULO CORRECTO: Tiempo total mensual
    let monthlyTotalTime = 0;
    let monthlyTotalDistance = 0;

    console.log('=== CALCULANDO RITMO PROMEDIO MENSUAL ===');
    validThisMonthWorkouts.forEach(w => {
      if (w.duracion && w.distancia_recorrida) {
        const timeInMinutes = convertDurationToMinutes(w.duracion);
        monthlyTotalTime += timeInMinutes;
        monthlyTotalDistance += w.distancia_recorrida;
        
        console.log(`Entrenamiento mensual: ${w.workout_title} - ${timeInMinutes}min / ${w.distancia_recorrida}km`);
      }
    });

    console.log(`TOTALES MENSUALES:`);
    console.log(`  - Tiempo mensual: ${monthlyTotalTime} minutos`);
    console.log(`  - Distancia mensual: ${monthlyTotalDistance} km`);
    console.log(`  - Ritmo mensual: ${monthlyTotalTime / monthlyTotalDistance} min/km`);

    // CORRECCIÓN: usar la función corregida para el ritmo promedio mensual
    const monthlyAveragePace = monthlyTotalDistance > 0 && monthlyTotalTime > 0 ? 
      convertMinutesToPace(monthlyTotalTime, monthlyTotalDistance) : "0:00 min/km";

    // Carrera más larga del mes
    const longestRun = validThisMonthWorkouts.length > 0 ? 
      Math.max(...validThisMonthWorkouts.map(w => w.distancia_recorrida)) : 0;

    // CÁLCULO CORRECTO: Mejor ritmo del mes
    let bestPaceValue = Infinity;
    console.log('=== CALCULANDO MEJOR RITMO DEL MES ===');
    validThisMonthWorkouts.forEach(w => {
      if (w.duracion && w.distancia_recorrida) {
        const timeInMinutes = convertDurationToMinutes(w.duracion);
        // CORRECCIÓN: el mejor ritmo es el menor tiempo por kilómetro
        const pace = timeInMinutes / w.distancia_recorrida;
        console.log(`  - ${w.workout_title}: ${timeInMinutes}min / ${w.distancia_recorrida}km = ${pace} min/km`);
        if (pace < bestPaceValue && pace > 0) {
          bestPaceValue = pace;
        }
      }
    });

    console.log(`MEJOR RITMO: ${bestPaceValue} min/km`);

    // CORRECCIÓN: convertir el mejor ritmo usando la función corregida
    const bestPace = bestPaceValue === Infinity ? "0:00 min/km" : 
      convertMinutesToPace(bestPaceValue, 1);

    // CÁLCULO CORRECTO: Variaciones del mes anterior
    const previousMonthDistance = validLastMonthWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0);
    
    let previousMonthTotalTime = 0;
    let previousMonthTotalDistance = 0;

    validLastMonthWorkouts.forEach(w => {
      if (w.duracion && w.distancia_recorrida) {
        const timeInMinutes = convertDurationToMinutes(w.duracion);
        previousMonthTotalTime += timeInMinutes;
        previousMonthTotalDistance += w.distancia_recorrida;
      }
    });

    // CORRECCIÓN: usar la función corregida para el ritmo promedio del mes anterior
    const previousMonthAveragePace = previousMonthTotalDistance > 0 && previousMonthTotalTime > 0 ? 
      convertMinutesToPace(previousMonthTotalTime, previousMonthTotalDistance) : "0:00 min/km";

    // Variación de distancia
    const distanceVariation = previousMonthDistance > 0 ? 
      Math.round(((monthlyDistance - previousMonthDistance) / previousMonthDistance) * 100) : 0;

    // CÁLCULO CORRECTO: Variación de ritmo
    const currentPaceMinutes = monthlyTotalDistance > 0 ? monthlyTotalTime / monthlyTotalDistance : 0;
    const previousPaceMinutes = previousMonthTotalDistance > 0 ? previousMonthTotalTime / previousMonthTotalDistance : 0;
    
    // Para el ritmo, una mejora significa un tiempo menor (ritmo más rápido)
    const paceVariation = previousPaceMinutes > 0 && currentPaceMinutes > 0 ? 
      Math.round(((previousPaceMinutes - currentPaceMinutes) / previousPaceMinutes) * 100) : 0;

    // NUEVA LÓGICA: Datos semanales por día - CORREGIDA Y MEJORADA
    console.log('=== GENERANDO DATOS SEMANALES POR DÍA (ACTUALIZACIÓN) ===');
    const weeklyData = [];
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    // Crear un mapa para agrupar entrenamientos por día de la semana
    const workoutsByDay = new Map();
    
    // Inicializar todos los días con 0
    for (let i = 0; i < 7; i++) {
      workoutsByDay.set(i, 0);
    }
    
    console.log(`Procesando ${validThisWeekWorkouts.length} entrenamientos válidos de esta semana:`);
    
    // Agrupar entrenamientos de esta semana por día
    validThisWeekWorkouts.forEach((w, index) => {
      const workoutDate = new Date(w.fecha_completado);
      let dayIndex = workoutDate.getDay(); // 0 = domingo, 1 = lunes, etc.
      
      // Convertir domingo (0) a índice 6 para que lunes sea 0
      dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      
      const currentDistance = workoutsByDay.get(dayIndex) || 0;
      workoutsByDay.set(dayIndex, currentDistance + w.distancia_recorrida);
      
      console.log(`[${index + 1}] Entrenamiento: ${w.workout_title}`);
      console.log(`  - Fecha: ${workoutDate.toLocaleDateString()}`);
      console.log(`  - Día JS: ${workoutDate.getDay()} -> Índice: ${dayIndex} (${daysOfWeek[dayIndex]})`);
      console.log(`  - Distancia: ${w.distancia_recorrida}km`);
      console.log(`  - Acumulado día: ${workoutsByDay.get(dayIndex)}km`);
    });
    
    // Crear el array final con los datos
    console.log('DATOS FINALES DEL GRÁFICO SEMANAL:');
    for (let i = 0; i < 7; i++) {
      const dayDistance = workoutsByDay.get(i);
      weeklyData.push({
        day: daysOfWeek[i],
        distance: Math.round(dayDistance * 10) / 10
      });
      
      console.log(`${daysOfWeek[i]}: ${dayDistance}km`);
    }

    // Verificar coherencia total
    const totalFromDays = weeklyData.reduce((sum, day) => sum + day.distance, 0);
    console.log(`=== VERIFICACIÓN DE COHERENCIA ===`);
    console.log(`Total desde weeklyDistance: ${weeklyDistance}km`);
    console.log(`Total desde weeklyData: ${totalFromDays}km`);
    console.log(`Diferencia: ${Math.abs(weeklyDistance - totalFromDays)}km`);

    console.log('=== RESULTADOS FINALES ===');
    console.log(`Ritmo promedio global: ${averagePace}`);
    console.log(`Ritmo promedio mensual: ${monthlyAveragePace}`);
    console.log(`Mejor ritmo: ${bestPace}`);
    console.log(`Variación de ritmo: ${paceVariation}%`);
    console.log('Datos semanales:', weeklyData);

    setStats({
      weeklyDistance: Math.round(weeklyDistance * 10) / 10,
      totalRuns,
      averagePace,
      weeklyCalories,
      averageDistancePerRun: Math.round(averageDistancePerRun * 10) / 10,
      monthlyDistance: Math.round(monthlyDistance * 10) / 10,
      paceImprovement: paceVariation,
      weeklyData,
      monthlyTotalTime: Math.round(monthlyTotalTime),
      monthlyAveragePace,
      longestRun: Math.round(longestRun * 10) / 10,
      bestPace,
      distanceVariation,
      paceVariation,
      previousMonthDistance: Math.round(previousMonthDistance * 10) / 10,
      previousMonthAveragePace
    });

    setIsLoading(false);
  };

  const resetStats = () => {
    console.log('Reseteando estadísticas a valores por defecto');
    setStats({
      weeklyDistance: 0,
      totalRuns: 0,
      averagePace: "0:00 min/km",
      weeklyCalories: 0,
      averageDistancePerRun: 0,
      monthlyDistance: 0,
      paceImprovement: 0,
      weeklyData: [
        { day: 'Lun', distance: 0 },
        { day: 'Mar', distance: 0 },
        { day: 'Mié', distance: 0 },
        { day: 'Jue', distance: 0 },
        { day: 'Vie', distance: 0 },
        { day: 'Sáb', distance: 0 },
        { day: 'Dom', distance: 0 }
      ],
      monthlyTotalTime: 0,
      monthlyAveragePace: "0:00 min/km",
      longestRun: 0,
      bestPace: "0:00 min/km",
      distanceVariation: 0,
      paceVariation: 0,
      previousMonthDistance: 0,
      previousMonthAveragePace: "0:00 min/km"
    });
    setIsLoading(false);
  };

  useEffect(() => {
    calculateStats();
  }, []);

  const refreshStats = () => {
    console.log('useRunningStats: refreshStats llamado - recalculando datos del gráfico');
    calculateStats();
  };

  return {
    stats,
    isLoading,
    refreshStats,
    resetStats
  };
};
