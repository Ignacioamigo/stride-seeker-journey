
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

// Función para convertir duración en texto a minutos
const convertDurationToMinutes = (duration: string): number => {
  if (!duration) return 0;
  
  const cleanDuration = duration.toLowerCase().replace(/\s+/g, '');
  
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
  
  const timeMatch = cleanDuration.match(/(\d+):(\d+)(?::(\d+))?/);
  if (timeMatch && !hoursMatch && !minutesMatch) {
    if (timeMatch[3]) {
      totalMinutes += parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
    } else {
      totalMinutes += parseInt(timeMatch[1]);
    }
  }
  
  return totalMinutes;
};

const convertMinutesToPace = (totalMinutes: number, totalDistance: number): string => {
  if (totalDistance === 0) return "0:00 min/km";
  
  const paceMinutes = totalMinutes / totalDistance;
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - minutes) * 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
};

const getCurrentUserId = (): string | null => {
  const savedUser = localStorage.getItem('runAdaptiveUser');
  if (savedUser) {
    const userProfile = JSON.parse(savedUser);
    return userProfile.id || null;
  }
  return null;
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
      
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        console.log('No se encontró ID de usuario, mostrando estadísticas vacías');
        resetStats();
        return;
      }

      console.log('Calculando estadísticas para usuario:', currentUserId);
      
      // Obtener entrenamientos del usuario desde la tabla entrenamientos_realizados
      const { data: workouts, error } = await supabase
        .from('entrenamientos_realizados')
        .select(`
          *,
          training_plans!inner(user_id)
        `)
        .eq('training_plans.user_id', currentUserId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching workouts:', error);
        
        // Fallback a localStorage
        const localWorkouts = getLocalWorkouts();
        calculateStatsFromData(localWorkouts);
        return;
      }

      console.log('Entrenamientos encontrados:', workouts?.length || 0);
      calculateStatsFromData(workouts || []);
    } catch (error) {
      console.error('Error calculating stats:', error);
      
      // Fallback a localStorage
      const localWorkouts = getLocalWorkouts();
      calculateStatsFromData(localWorkouts);
    }
  };

  const getLocalWorkouts = () => {
    try {
      const localData = localStorage.getItem('entrenamientosRealizados');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error('Error reading local workouts:', error);
      return [];
    }
  };

  const calculateStatsFromData = (workouts: any[]) => {
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

    const validWorkouts = workouts.filter(w => w.actual_distance && w.actual_distance > 0);
    const validThisWeekWorkouts = thisWeekWorkouts.filter(w => w.actual_distance && w.actual_distance > 0);
    const validThisMonthWorkouts = thisMonthWorkouts.filter(w => w.actual_distance && w.actual_distance > 0);
    const validLastMonthWorkouts = lastMonthWorkouts.filter(w => w.actual_distance && w.actual_distance > 0);

    const weeklyDistance = validThisWeekWorkouts.reduce((sum, w) => sum + w.actual_distance, 0);
    const totalRuns = validWorkouts.length;
    const totalDistanceAllRuns = validWorkouts.reduce((sum, w) => sum + w.actual_distance, 0);
    const averageDistancePerRun = totalRuns > 0 ? totalDistanceAllRuns / totalRuns : 0;

    let totalTimeMinutes = 0;
    let totalDistance = 0;

    validWorkouts.forEach(w => {
      if (w.actual_duration && w.actual_distance) {
        const timeInMinutes = convertDurationToMinutes(w.actual_duration);
        totalTimeMinutes += timeInMinutes;
        totalDistance += w.actual_distance;
      }
    });

    const averagePace = totalDistance > 0 && totalTimeMinutes > 0 ? 
      convertMinutesToPace(totalTimeMinutes, totalDistance) : "0:00 min/km";

    const weeklyCalories = Math.round(weeklyDistance * 60);
    const monthlyDistance = validThisMonthWorkouts.reduce((sum, w) => sum + w.actual_distance, 0);

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

    const longestRun = validThisMonthWorkouts.length > 0 ? 
      Math.max(...validThisMonthWorkouts.map(w => w.actual_distance)) : 0;

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

    const distanceVariation = previousMonthDistance > 0 ? 
      Math.round(((monthlyDistance - previousMonthDistance) / previousMonthDistance) * 100) : 0;

    const currentPaceMinutes = monthlyTotalTime / monthlyTotalDistance;
    const previousPaceMinutes = previousMonthTotalTime / previousMonthTotalDistance;
    const paceVariation = previousPaceMinutes > 0 && currentPaceMinutes > 0 ? 
      Math.round(((previousPaceMinutes - currentPaceMinutes) / previousPaceMinutes) * 100) : 0;

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
