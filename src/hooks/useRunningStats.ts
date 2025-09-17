import { useState, useEffect } from 'react';
import { getCompletedWorkouts } from '@/services/completedWorkoutService';
import { calculateWeeklyData } from './utils/weeklyStatsCalculator';

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

export const useRunningStats = (updateCounter?: number) => {
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
      console.log(`🔥 === CALCULANDO ESTADÍSTICAS (updateCounter: ${updateCounter}) ===`);
      console.log(`🔥 useRunningStats: Función calculateStats iniciada`);
      setIsLoading(true);
      
      // 🧹 LIMPIEZA AUTOMÁTICA DE DATOS CORRUPTOS
      const localWorkouts = localStorage.getItem('completedWorkouts');
      if (localWorkouts) {
        try {
          const parsed = JSON.parse(localWorkouts);
          const hasCorruptData = parsed.some(w => 
            !w || !w.workout_title || w.fecha_completado === 'undefined' || w.distancia_recorrida === undefined
          );
          
          if (hasCorruptData) {
            console.log('🧹 DETECTADOS DATOS CORRUPTOS - LIMPIANDO localStorage...');
            localStorage.removeItem('completedWorkouts');
            console.log('🧹 localStorage limpiado exitosamente');
          }
        } catch (e) {
          console.log('🧹 Error parsing localStorage - LIMPIANDO...');
          localStorage.removeItem('completedWorkouts');
        }
      }
      
      // Pequeño delay para asegurar que la DB se haya actualizado
      await new Promise(resolve => setTimeout(resolve, 200));
      
      let workouts = await getCompletedWorkouts();
      console.log(`Hook: Entrenamientos obtenidos: ${workouts?.length || 0}`);
      
      // FALLBACK CRÍTICO: Si Supabase está vacío, usar localStorage
      if (!workouts || workouts.length === 0) {
        console.log('🔄 Hook: Supabase vacío, intentando fallback a localStorage...');
        const localWorkouts = localStorage.getItem('completedWorkouts');
        if (localWorkouts) {
          const parsedWorkouts = JSON.parse(localWorkouts);
          console.log(`🔄 Hook: Encontrados ${parsedWorkouts.length} entrenamientos en localStorage`);
          
          // FILTRAR DATOS VÁLIDOS - ELIMINAR CORRUPTOS
          const validWorkouts = parsedWorkouts.filter(w => {
            const isValid = w && 
                           w.workout_title && 
                           w.fecha_completado && 
                           w.fecha_completado !== 'undefined' &&
                           w.distancia_recorrida !== undefined && 
                           w.distancia_recorrida !== null &&
                           !isNaN(w.distancia_recorrida);
            
            if (!isValid) {
              console.log(`🗑️ Hook: Eliminando entrenamiento corrupto:`, w);
            } else {
              console.log(`✅ Hook: Entrenamiento válido: ${w.workout_title} - ${w.fecha_completado} - ${w.distancia_recorrida}km`);
            }
            
            return isValid;
          });
          
          console.log(`🔄 Hook: Entrenamientos válidos después de filtro: ${validWorkouts.length}`);
          
          // LIMPIAR LOCALSTORAGE DE DATOS CORRUPTOS
          if (validWorkouts.length !== parsedWorkouts.length) {
            console.log('🧹 Hook: LIMPIANDO localStorage de datos corruptos...');
            localStorage.setItem('completedWorkouts', JSON.stringify(validWorkouts));
          }
          
          workouts = validWorkouts;
        }
      }
      
      if (!workouts || workouts.length === 0) {
        console.log('🔥 Hook: No hay entrenamientos, reseteando estadísticas');
        resetStats();
        setIsLoading(false);
        return;
      }

      console.log('🔥 Hook: INICIANDO CÁLCULO CON DATOS VÁLIDOS');
      console.log('🔥 Hook: Workouts recibidos para calcular:', workouts.length);
      
      // FORZAR ACTUALIZACIÓN INMEDIATA DE STATS
      calculateStatsFromData(workouts);
      
      console.log('🔥 Hook: CÁLCULO COMPLETADO - Stats deberían estar actualizados');
    } catch (error) {
      console.error('Hook: Error calculating stats:', error);
      resetStats();
    }
  };

  const calculateStatsFromData = (workouts: any[]) => {
    console.log('🚀 calculateStatsFromData INICIADO');
    console.log('🚀 Workouts recibidos:', workouts?.length || 0);
    
    if (!workouts || workouts.length === 0) {
      console.log('🚀 Sin workouts - reseteando');
      resetStats();
      return;
    }

    console.log('🚀 INICIANDO CÁLCULO REAL DE ESTADÍSTICAS');
    console.log('🚀 Datos de workouts:', workouts.map(w => ({ 
      title: w.workout_title, 
      fecha: w.fecha_completado, 
      distancia: w.distancia_recorrida 
    })));

    // USAR LA NUEVA FUNCIÓN PARA DATOS SEMANALES
    const { weeklyData, weeklyDistance } = calculateWeeklyData(workouts);
    
    console.log('Hook: Datos semanales calculados:', {
      weeklyDistance,
      weeklyData: JSON.stringify(weeklyData, null, 2)
    });

    // Filtrar entrenamientos por períodos usando fecha_completado
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

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
    const validThisMonthWorkouts = thisMonthWorkouts.filter(w => w.distancia_recorrida && w.distancia_recorrida > 0);
    const validLastMonthWorkouts = lastMonthWorkouts.filter(w => w.distancia_recorrida && w.distancia_recorrida > 0);

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

    const newStats = {
      weeklyDistance,
      totalRuns: validWorkouts.length,
      averagePace,
      weeklyCalories: Math.round(weeklyDistance * 60),
      averageDistancePerRun: Math.round((validWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0) / Math.max(validWorkouts.length, 1)) * 10) / 10,
      monthlyDistance: Math.round(monthlyDistance * 10) / 10,
      paceImprovement: 0,
      weeklyData,
      monthlyTotalTime: Math.round(monthlyTotalTime),
      monthlyAveragePace,
      longestRun,
      bestPace,
      distanceVariation,
      paceVariation,
      previousMonthDistance,
      previousMonthAveragePace
    };

    console.log('Hook: NUEVAS ESTADÍSTICAS FINALES:', {
      weeklyDistance: newStats.weeklyDistance,
      weeklyData: newStats.weeklyData,
      updateCounter
    });
    
    setStats(newStats);
    setIsLoading(false);
  };

  const resetStats = () => {
    console.log('Hook: Reseteando estadísticas a valores por defecto');
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

  // Efecto principal que se ejecuta cuando cambia updateCounter
  useEffect(() => {
    console.log(`🔥 Hook: useEffect disparado por updateCounter: ${updateCounter}`);
    console.log(`🔥 Hook: Ejecutando calculateStats por cambio en updateCounter`);
    calculateStats();
  }, [updateCounter]);

  // Efecto inicial
  useEffect(() => {
    console.log('Hook: useEffect inicial');
    calculateStats();
  }, []);

  // Escuchar eventos de reset desde UserContext
  useEffect(() => {
    const handleResetStats = () => {
      console.log('🔄 Hook: Evento resetStats recibido desde UserContext');
      resetStats();
    };

    window.addEventListener('resetStats', handleResetStats);
    
    return () => {
      window.removeEventListener('resetStats', handleResetStats);
    };
  }, []);

  const refreshStats = () => {
    console.log('🔥 Hook: refreshStats llamado - ejecutando calculateStats');
    calculateStats();
  };

  return {
    stats,
    isLoading,
    refreshStats,
    resetStats
  };
};
