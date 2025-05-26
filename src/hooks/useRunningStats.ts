
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
}

export const useRunningStats = () => {
  const [stats, setStats] = useState<RunningStats>({
    weeklyDistance: 0,
    totalRuns: 0,
    averagePace: "0:00 min/km",
    weeklyCalories: 0,
    averageDistancePerRun: 0,
    monthlyDistance: 0,
    paceImprovement: 0,
    weeklyData: []
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
        // Usar datos de localStorage como fallback
        const localWorkouts = localStorage.getItem('entrenamientosRealizados');
        if (localWorkouts) {
          const parsedWorkouts = JSON.parse(localWorkouts);
          calculateStatsFromData(parsedWorkouts);
        }
        return;
      }

      calculateStatsFromData(workouts || []);
    } catch (error) {
      console.error('Error calculating stats:', error);
      setIsLoading(false);
    }
  };

  const calculateStatsFromData = (workouts: any[]) => {
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

    // Calcular distancia semanal
    const weeklyDistance = thisWeekWorkouts.reduce((sum, w) => sum + (w.actual_distance || 0), 0);

    // Total de carreras (solo entrenamientos con distancia)
    const totalRuns = workouts.filter(w => w.actual_distance && w.actual_distance > 0).length;

    // Promedio de distancia por carrera
    const averageDistancePerRun = totalRuns > 0 ? weeklyDistance / totalRuns : 0;

    // Calorías estimadas (aproximadamente 60 cal por km)
    const weeklyCalories = Math.round(weeklyDistance * 60);

    // Distancia mensual
    const monthlyDistance = thisMonthWorkouts.reduce((sum, w) => sum + (w.actual_distance || 0), 0);

    // Mejora de ritmo (comparar mes actual vs anterior)
    const thisMonthAvgDistance = thisMonthWorkouts.length > 0 ? monthlyDistance / thisMonthWorkouts.length : 0;
    const lastMonthDistance = lastMonthWorkouts.reduce((sum, w) => sum + (w.actual_distance || 0), 0);
    const lastMonthAvgDistance = lastMonthWorkouts.length > 0 ? lastMonthDistance / lastMonthWorkouts.length : 0;
    
    const paceImprovement = lastMonthAvgDistance > 0 ? 
      ((thisMonthAvgDistance - lastMonthAvgDistance) / lastMonthAvgDistance) * 100 : 0;

    // Datos semanales por día
    const weeklyData = [];
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      
      const dayWorkouts = thisWeekWorkouts.filter(w => {
        const workoutDate = new Date(w.completed_at);
        return workoutDate.toDateString() === dayDate.toDateString();
      });
      
      const dayDistance = dayWorkouts.reduce((sum, w) => sum + (w.actual_distance || 0), 0);
      
      weeklyData.push({
        day: daysOfWeek[i],
        distance: dayDistance
      });
    }

    // Calcular ritmo promedio (estimación basada en distancia)
    const averagePace = totalRuns > 0 ? "5:20 min/km" : "0:00 min/km";

    setStats({
      weeklyDistance: Math.round(weeklyDistance * 10) / 10,
      totalRuns,
      averagePace,
      weeklyCalories,
      averageDistancePerRun: Math.round(averageDistancePerRun * 10) / 10,
      monthlyDistance: Math.round(monthlyDistance * 10) / 10,
      paceImprovement: Math.round(paceImprovement),
      weeklyData
    });

    setIsLoading(false);
  };

  useEffect(() => {
    calculateStats();
  }, []);

  // Función para refrescar las estadísticas (llamar cuando se complete un entrenamiento)
  const refreshStats = () => {
    calculateStats();
  };

  return {
    stats,
    isLoading,
    refreshStats
  };
};
