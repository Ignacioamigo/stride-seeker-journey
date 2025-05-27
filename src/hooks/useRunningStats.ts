
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

// Función para convertir duración interval a minutos
const convertIntervalToMinutes = (interval: string): number => {
  if (!interval) return 0;
  
  // Si ya es un número, devolverlo
  if (!isNaN(Number(interval))) {
    return Number(interval);
  }
  
  // Manejar formato PostgreSQL interval (HH:MM:SS)
  const timeMatch = interval.match(/(\d+):(\d+):(\d+)/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const seconds = parseInt(timeMatch[3]);
    return hours * 60 + minutes + seconds / 60;
  }
  
  // Manejar formato texto como "30min", "1h30min"
  const cleanDuration = interval.toLowerCase().replace(/\s+/g, '');
  
  if (/^\d+$/.test(cleanDuration)) {
    return parseInt(cleanDuration);
  }
  
  let totalMinutes = 0;
  
  const hoursMatch = cleanDuration.match(/(\d+)h/);
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }
  
  const minutesMatch = cleanDuration.match(/(\d+)min/);
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
  }
  
  const timeMatch2 = cleanDuration.match(/(\d+):(\d+)(?::(\d+))?/);
  if (timeMatch2 && !hoursMatch && !minutesMatch) {
    if (timeMatch2[3]) {
      totalMinutes += parseInt(timeMatch2[1]) * 60 + parseInt(timeMatch2[2]);
    } else {
      totalMinutes += parseInt(timeMatch2[1]);
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
      
      console.log('Calculando estadísticas desde entrenamientos_completados...');
      
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
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Filtrar entrenamientos por períodos usando fecha_completado
    const thisWeekWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.fecha_completado);
      return workoutDate >= startOfWeek;
    });

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

    // Calcular tiempo total y ritmo promedio global
    let totalTimeMinutes = 0;
    let totalDistance = 0;

    validWorkouts.forEach(w => {
      if (w.duracion && w.distancia_recorrida) {
        const timeInMinutes = convertIntervalToMinutes(w.duracion);
        totalTimeMinutes += timeInMinutes;
        totalDistance += w.distancia_recorrida;
      }
    });

    const averagePace = totalDistance > 0 && totalTimeMinutes > 0 ? 
      convertMinutesToPace(totalTimeMinutes, totalDistance) : "0:00 min/km";

    // Calorías estimadas
    const weeklyCalories = Math.round(weeklyDistance * 60);

    // Distancia mensual
    const monthlyDistance = validThisMonthWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0);

    // Tiempo total mensual
    let monthlyTotalTime = 0;
    let monthlyTotalDistance = 0;

    validThisMonthWorkouts.forEach(w => {
      if (w.duracion && w.distancia_recorrida) {
        const timeInMinutes = convertIntervalToMinutes(w.duracion);
        monthlyTotalTime += timeInMinutes;
        monthlyTotalDistance += w.distancia_recorrida;
      }
    });

    const monthlyAveragePace = monthlyTotalDistance > 0 && monthlyTotalTime > 0 ? 
      convertMinutesToPace(monthlyTotalTime, monthlyTotalDistance) : "0:00 min/km";

    // Carrera más larga del mes
    const longestRun = validThisMonthWorkouts.length > 0 ? 
      Math.max(...validThisMonthWorkouts.map(w => w.distancia_recorrida)) : 0;

    // Mejor ritmo del mes
    let bestPaceValue = Infinity;
    validThisMonthWorkouts.forEach(w => {
      if (w.duracion && w.distancia_recorrida) {
        const timeInMinutes = convertIntervalToMinutes(w.duracion);
        const pace = timeInMinutes / w.distancia_recorrida;
        if (pace < bestPaceValue && pace > 0) {
          bestPaceValue = pace;
        }
      }
    });

    const bestPace = bestPaceValue === Infinity ? "0:00 min/km" : convertMinutesToPace(bestPaceValue, 1);

    // Calcular variaciones del mes anterior
    const previousMonthDistance = validLastMonthWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0);
    
    let previousMonthTotalTime = 0;
    let previousMonthTotalDistance = 0;

    validLastMonthWorkouts.forEach(w => {
      if (w.duracion && w.distancia_recorrida) {
        const timeInMinutes = convertIntervalToMinutes(w.duracion);
        previousMonthTotalTime += timeInMinutes;
        previousMonthTotalDistance += w.distancia_recorrida;
      }
    });

    const previousMonthAveragePace = previousMonthTotalDistance > 0 && previousMonthTotalTime > 0 ? 
      convertMinutesToPace(previousMonthTotalTime, previousMonthTotalDistance) : "0:00 min/km";

    // Variación de distancia
    const distanceVariation = previousMonthDistance > 0 ? 
      Math.round(((monthlyDistance - previousMonthDistance) / previousMonthDistance) * 100) : 0;

    // Variación de ritmo
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
        const workoutDate = new Date(w.fecha_completado);
        return workoutDate.toDateString() === dayDate.toDateString();
      });
      
      const dayDistance = dayWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0);
      
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
    console.log('useRunningStats: refreshStats llamado');
    calculateStats();
  };

  return {
    stats,
    isLoading,
    refreshStats,
    resetStats
  };
};
