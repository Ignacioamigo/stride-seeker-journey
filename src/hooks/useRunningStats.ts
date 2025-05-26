import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

// Función para convertir duración en texto a minutos - CORREGIDA
const convertDurationToMinutes = (duration: string): number => {
  if (!duration) return 0;
  
  // Remover espacios y convertir a minúsculas
  const cleanDuration = duration.toLowerCase().replace(/\s+/g, '');
  
  // Si es solo un número (como "33", "55"), asumir que son minutos
  if (/^\d+$/.test(cleanDuration)) {
    return parseInt(cleanDuration);
  }
  
  // Buscar patrones como "45min", "1h30min", "1:30:00", etc.
  let totalMinutes = 0;
  
  // Patrón para horas: "1h", "2h"
  const hoursMatch = cleanDuration.match(/(\d+)h/);
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }
  
  // Patrón para minutos: "45min", "30min"
  const minutesMatch = cleanDuration.match(/(\d+)min/);
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
  }
  
  // Patrón para formato "HH:MM:SS" o "MM:SS"
  const timeMatch = cleanDuration.match(/(\d+):(\d+)(?::(\d+))?/);
  if (timeMatch && !hoursMatch && !minutesMatch) {
    if (timeMatch[3]) {
      // Formato HH:MM:SS
      totalMinutes += parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
    } else {
      // Formato MM:SS
      totalMinutes += parseInt(timeMatch[1]);
    }
  }
  
  return totalMinutes;
};

// Función para convertir minutos a formato de ritmo (min/km)
const convertMinutesToPace = (totalMinutes: number, totalDistance: number): string => {
  if (totalDistance === 0) return "0:00 min/km";
  
  const paceMinutes = totalMinutes / totalDistance;
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - minutes) * 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
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
      
      // Obtener todos los entrenamientos realizados
      const { data: workouts, error } = await supabase
        .from('entrenamientos_realizados')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching workouts:', error);
        setIsLoading(false);
        return;
      }

      calculateStatsFromData(workouts || []);
    } catch (error) {
      console.error('Error calculating stats:', error);
      setIsLoading(false);
    }
  };

  const calculateStatsFromData = (workouts: any[]) => {
    // Si no hay entrenamientos, resetear todas las estadísticas
    if (!workouts || workouts.length === 0) {
      console.log('No hay entrenamientos, reseteando estadísticas');
      resetStats();
      return;
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Filtrar entrenamientos por períodos
    const thisWeekWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.completed_at);
      return workoutDate >= startOfWeek;
    });

    const thisMonthWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.completed_at);
      return workoutDate >= startOfMonth;
    });

    const lastMonthWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.completed_at);
      return workoutDate >= startOfLastMonth && workoutDate <= endOfLastMonth;
    });

    // Solo considerar entrenamientos con distancia real
    const validWorkouts = workouts.filter(w => w.actual_distance && w.actual_distance > 0);
    const validThisWeekWorkouts = thisWeekWorkouts.filter(w => w.actual_distance && w.actual_distance > 0);
    const validThisMonthWorkouts = thisMonthWorkouts.filter(w => w.actual_distance && w.actual_distance > 0);
    const validLastMonthWorkouts = lastMonthWorkouts.filter(w => w.actual_distance && w.actual_distance > 0);

    // Calcular distancia semanal
    const weeklyDistance = validThisWeekWorkouts.reduce((sum, w) => sum + w.actual_distance, 0);

    // Total de carreras
    const totalRuns = validWorkouts.length;

    // Promedio de distancia por carrera
    const totalDistanceAllRuns = validWorkouts.reduce((sum, w) => sum + w.actual_distance, 0);
    const averageDistancePerRun = totalRuns > 0 ? totalDistanceAllRuns / totalRuns : 0;

    // Calcular tiempo total y ritmo promedio global - CORREGIDA
    let totalTimeMinutes = 0;
    let totalDistance = 0;

    console.log('Calculando ritmo promedio para', validWorkouts.length, 'entrenamientos');

    validWorkouts.forEach(w => {
      if (w.actual_duration && w.actual_distance) {
        const timeInMinutes = convertDurationToMinutes(w.actual_duration);
        totalTimeMinutes += timeInMinutes;
        totalDistance += w.actual_distance;
        console.log(`Entrenamiento: ${w.actual_distance}km en ${timeInMinutes}min (duración original: "${w.actual_duration}")`);
      }
    });

    console.log(`Total: ${totalDistance}km en ${totalTimeMinutes}min`);

    const averagePace = totalDistance > 0 && totalTimeMinutes > 0 ? 
      convertMinutesToPace(totalTimeMinutes, totalDistance) : "0:00 min/km";
    console.log('Ritmo promedio calculado:', averagePace);

    // Calorías estimadas (aproximadamente 60 cal por km)
    const weeklyCalories = Math.round(weeklyDistance * 60);

    // Distancia mensual
    const monthlyDistance = validThisMonthWorkouts.reduce((sum, w) => sum + w.actual_distance, 0);

    // Tiempo total mensual
    let monthlyTotalTime = 0;
    let monthlyTotalDistance = 0;

    validThisMonthWorkouts.forEach(w => {
      if (w.actual_duration && w.actual_distance) {
        const timeInMinutes = convertDurationToMinutes(w.actual_duration);
        monthlyTotalTime += timeInMinutes;
        monthlyTotalDistance += w.actual_distance;
      }
    });

    const monthlyAveragePace = monthlyTotalDistance > 0 && monthlyTotalTime > 0 ? 
      convertMinutesToPace(monthlyTotalTime, monthlyTotalDistance) : "0:00 min/km";

    // Carrera más larga del mes
    const longestRun = validThisMonthWorkouts.length > 0 ? 
      Math.max(...validThisMonthWorkouts.map(w => w.actual_distance)) : 0;

    // Mejor ritmo del mes (menor tiempo por km)
    let bestPaceValue = Infinity;
    validThisMonthWorkouts.forEach(w => {
      if (w.actual_duration && w.actual_distance) {
        const timeInMinutes = convertDurationToMinutes(w.actual_duration);
        const pace = timeInMinutes / w.actual_distance;
        if (pace < bestPaceValue && pace > 0) {
          bestPaceValue = pace;
        }
      }
    });

    const bestPace = bestPaceValue === Infinity ? "0:00 min/km" : convertMinutesToPace(bestPaceValue, 1);

    // Calcular variaciones porcentuales
    const previousMonthDistance = validLastMonthWorkouts.reduce((sum, w) => sum + w.actual_distance, 0);
    
    let previousMonthTotalTime = 0;
    let previousMonthTotalDistance = 0;

    validLastMonthWorkouts.forEach(w => {
      if (w.actual_duration && w.actual_distance) {
        const timeInMinutes = convertDurationToMinutes(w.actual_duration);
        previousMonthTotalTime += timeInMinutes;
        previousMonthTotalDistance += w.actual_distance;
      }
    });

    const previousMonthAveragePace = previousMonthTotalDistance > 0 && previousMonthTotalTime > 0 ? 
      convertMinutesToPace(previousMonthTotalTime, previousMonthTotalDistance) : "0:00 min/km";

    // Variación de distancia
    const distanceVariation = previousMonthDistance > 0 ? 
      Math.round(((monthlyDistance - previousMonthDistance) / previousMonthDistance) * 100) : 0;

    // Variación de ritmo (positivo = más rápido)
    const currentPaceMinutes = monthlyTotalTime / monthlyTotalDistance;
    const previousPaceMinutes = previousMonthTotalTime / previousMonthTotalDistance;
    const paceVariation = previousPaceMinutes > 0 && currentPaceMinutes > 0 ? 
      Math.round(((previousPaceMinutes - currentPaceMinutes) / previousPaceMinutes) * 100) : 0;

    // Datos semanales por día
    const weeklyData = [];
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      
      const dayWorkouts = validThisWeekWorkouts.filter(w => {
        const workoutDate = new Date(w.completed_at);
        return workoutDate.toDateString() === dayDate.toDateString();
      });
      
      const dayDistance = dayWorkouts.reduce((sum, w) => sum + w.actual_distance, 0);
      
      weeklyData.push({
        day: daysOfWeek[i],
        distance: Math.round(dayDistance * 10) / 10
      });
    }

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

  // Función para resetear las estadísticas
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

  // Función para refrescar las estadísticas
  const refreshStats = () => {
    calculateStats();
  };

  useEffect(() => {
    const handleResetStats = () => {
      console.log('Evento resetStats recibido, recalculando estadísticas...');
      calculateStats();
    };

    window.addEventListener('resetStats', handleResetStats);
    
    return () => {
      window.removeEventListener('resetStats', handleResetStats);
    };
  }, []);

  return {
    stats,
    isLoading,
    refreshStats,
    resetStats
  };
};
