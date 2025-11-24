import { useState, useEffect } from 'react';
import { getUserWorkouts, getUserWorkoutsByDateRange, SimpleWorkout } from '@/services/simpleWorkoutsService';
import { supabase } from '@/integrations/supabase/client';

export interface SimpleStats {
  // Estadísticas generales
  totalWorkouts: number;
  totalDistance: number;
  totalTime: number;
  averagePace: string;
  longestRun: number;
  
  // Estadísticas por período
  weeklyDistance: number;
  monthlyDistance: number;
  quarterlyDistance: number; // 3 meses
  
  // Datos para gráficos
  weeklyData: Array<{ day: string; distance: number; duration: number }>;
  monthlyData: Array<{ week: string; distance: number; workouts: number }>;
}

const defaultStats: SimpleStats = {
  totalWorkouts: 0,
  totalDistance: 0,
  totalTime: 0,
  averagePace: '0:00',
  longestRun: 0,
  weeklyDistance: 0,
  monthlyDistance: 0,
  quarterlyDistance: 0,
  weeklyData: [
    { day: 'Lun', distance: 0, duration: 0 },
    { day: 'Mar', distance: 0, duration: 0 },
    { day: 'Mié', distance: 0, duration: 0 },
    { day: 'Jue', distance: 0, duration: 0 },
    { day: 'Vie', distance: 0, duration: 0 },
    { day: 'Sáb', distance: 0, duration: 0 },
    { day: 'Dom', distance: 0, duration: 0 }
  ],
  monthlyData: []
};

/**
 * Hook para obtener estadísticas simples y actualizadas
 */
export const useSimpleStats = () => {
  const [stats, setStats] = useState<SimpleStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  // Función para calcular todas las estadísticas
  const calculateStats = async () => {
    try {
      console.log('🔥 [useSimpleStats] Calculando estadísticas...');
      setIsLoading(true);

      // Verificar usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ [useSimpleStats] Usuario no autenticado, reseteando stats');
        setStats(defaultStats);
        setIsLoading(false);
        return;
      }

      // Obtener fechas para los diferentes períodos
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Esta semana (lunes a domingo)
      const currentDay = now.getDay();
      const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
      const thisMonday = new Date(now);
      thisMonday.setDate(now.getDate() - daysToMonday);
      const weekStart = thisMonday.toISOString().split('T')[0];
      
      // Este mes
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      
      // Últimos 3 meses
      const quarterStart = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];

      console.log('📅 [useSimpleStats] Rangos de fechas:', {
        weekStart,
        monthStart,
        quarterStart,
        today
      });

      // Obtener datos por períodos
      const [
        allWorkouts,
        weekWorkouts,
        monthWorkouts,
        quarterWorkouts
      ] = await Promise.all([
        getUserWorkouts(),
        getUserWorkoutsByDateRange(weekStart, today),
        getUserWorkoutsByDateRange(monthStart, today),
        getUserWorkoutsByDateRange(quarterStart, today)
      ]);

      console.log('📊 [useSimpleStats] Entrenamientos obtenidos:', {
        total: allWorkouts.length,
        semana: weekWorkouts.length,
        mes: monthWorkouts.length,
        trimestre: quarterWorkouts.length
      });

      // Calcular estadísticas generales
      const totalWorkouts = allWorkouts.length;
      const totalDistance = allWorkouts.reduce((sum, w) => sum + w.distance_km, 0);
      const totalTime = allWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0);
      const longestRun = allWorkouts.length > 0 ? Math.max(...allWorkouts.map(w => w.distance_km)) : 0;

      // Calcular ritmo promedio
      const averagePaceMinutes = totalDistance > 0 ? totalTime / totalDistance : 0;
      const paceMin = Math.floor(averagePaceMinutes);
      const paceSec = Math.round((averagePaceMinutes - paceMin) * 60);
      const averagePace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;

      // Calcular distancias por período
      const weeklyDistance = weekWorkouts.reduce((sum, w) => sum + w.distance_km, 0);
      const monthlyDistance = monthWorkouts.reduce((sum, w) => sum + w.distance_km, 0);
      const quarterlyDistance = quarterWorkouts.reduce((sum, w) => sum + w.distance_km, 0);

      // Crear datos semanales para gráfico
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const weeklyData = dayNames.map((day, index) => {
        const dayWorkouts = weekWorkouts.filter(w => {
          const workoutDate = new Date(w.workout_date + 'T12:00:00');
          return workoutDate.getDay() === index;
        });
        
        const dayDistance = dayWorkouts.reduce((sum, w) => sum + w.distance_km, 0);
        const dayDuration = dayWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0);
        
        return {
          day: day === 'Dom' ? 'Dom' : day,
          distance: Math.round(dayDistance * 10) / 10,
          duration: dayDuration
        };
      });

      // Reordenar para que empiece en Lunes
      const reorderedWeeklyData = [
        ...weeklyData.slice(1), // Lun-Sáb
        weeklyData[0] // Dom
      ];

      // Crear datos mensuales (por semanas)
      const monthlyData: Array<{ week: string; distance: number; workouts: number }> = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), 1 + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekWorkoutsInMonth = monthWorkouts.filter(w => {
          const workoutDate = new Date(w.workout_date);
          return workoutDate >= weekStart && workoutDate <= weekEnd;
        });
        
        monthlyData.push({
          week: `S${i + 1}`,
          distance: Math.round(weekWorkoutsInMonth.reduce((sum, w) => sum + w.distance_km, 0) * 10) / 10,
          workouts: weekWorkoutsInMonth.length
        });
      }

      const newStats: SimpleStats = {
        totalWorkouts,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalTime,
        averagePace,
        longestRun: Math.round(longestRun * 10) / 10,
        weeklyDistance: Math.round(weeklyDistance * 10) / 10,
        monthlyDistance: Math.round(monthlyDistance * 10) / 10,
        quarterlyDistance: Math.round(quarterlyDistance * 10) / 10,
        weeklyData: reorderedWeeklyData,
        monthlyData
      };

      console.log('✅ [useSimpleStats] Estadísticas calculadas:', newStats);
      setStats(newStats);

    } catch (error) {
      console.error('❌ [useSimpleStats] Error calculando estadísticas:', error);
      setStats(defaultStats);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para resetear estadísticas
  const resetStats = () => {
    console.log('🔄 [useSimpleStats] Reseteando estadísticas');
    setStats(defaultStats);
  };

  // Efecto inicial
  useEffect(() => {
    calculateStats();
  }, []);

  // Escuchar cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useSimpleStats] Auth cambió:', event);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        resetStats();
        setTimeout(() => calculateStats(), 500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Escuchar eventos de entrenamiento guardado/eliminado + Auto-refresh
  useEffect(() => {
    const handleWorkoutSaved = () => {
      console.log('[useSimpleStats] Entrenamiento guardado - recalculando');
      setTimeout(() => calculateStats(), 300);
    };

    const handleWorkoutDeleted = () => {
      console.log('[useSimpleStats] Entrenamiento eliminado - recalculando');
      setTimeout(() => calculateStats(), 300);
    };

    const handleResetStats = () => {
      console.log('[useSimpleStats] Reset solicitado');
      resetStats();
      setTimeout(() => calculateStats(), 100);
    };

    const handleOnboardingComplete = () => {
      console.log('[useSimpleStats] Onboarding completado - reseteando');
      resetStats();
      setTimeout(() => calculateStats(), 200);
    };

    // ✅ NUEVO: Auto-refresh cada 30 segundos para detectar actividades de Strava
    const refreshInterval = setInterval(() => {
      console.log('[useSimpleStats] 🔄 Auto-refresh activado (cada 30s) - verificando nuevos datos');
      calculateStats();
    }, 30000);

    window.addEventListener('workout-saved', handleWorkoutSaved);
    window.addEventListener('workout-deleted', handleWorkoutDeleted);
    window.addEventListener('resetStats', handleResetStats);
    window.addEventListener('onboarding-completed', handleOnboardingComplete);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('workout-saved', handleWorkoutSaved);
      window.removeEventListener('workout-deleted', handleWorkoutDeleted);
      window.removeEventListener('resetStats', handleResetStats);
      window.removeEventListener('onboarding-completed', handleOnboardingComplete);
    };
  }, []);

  return {
    stats,
    isLoading,
    refreshStats: calculateStats,
    resetStats
  };
};
