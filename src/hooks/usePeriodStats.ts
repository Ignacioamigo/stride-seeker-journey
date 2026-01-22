import { useState, useEffect } from 'react';
import { getCompletedWorkouts } from '@/services/completedWorkoutService';
import { loadLatestPlan } from '@/services/planService';
import { TimePeriod } from '@/components/stats/PeriodSelector';
import { WorkoutPlan } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface PeriodStats {
  totalDistance: number;
  totalCalories: number;
  totalWorkouts: number;
  averagePace: string;
  weeklyData: Array<{ day: string; distance: number; calories: number }>;
  caloriesData: Array<{ 
    day: string; 
    calories: number; 
    protein: number; 
    carbs: number; 
    fats: number; 
  }>;
}

const getDateRangeForPeriod = (period: TimePeriod, currentPlan?: WorkoutPlan | null): { start: Date; end: Date } => {
  const today = new Date();
  // Resetear tiempo para comparaciones más limpias
  today.setHours(23, 59, 59, 999);
  
  console.log(`[usePeriodStats] === CALCULANDO RANGO DE FECHAS PARA: ${period} ===`);
  console.log(`[usePeriodStats] Fecha actual: ${today.toLocaleString()}`);
  console.log(`[usePeriodStats] Plan actual:`, currentPlan ? `Semana ${currentPlan.weekNumber}` : 'No plan');
  
  switch (period) {
    case 'current_week': {
      // Si hay un plan activo, usar las fechas del plan en lugar de fechas calendáricas
      if (currentPlan && currentPlan.createdAt) {
        const planStartDate = new Date(currentPlan.createdAt);
        planStartDate.setHours(0, 0, 0, 0);
        
        const planEndDate = new Date(today);
        planEndDate.setHours(23, 59, 59, 999);
        
        console.log(`[usePeriodStats] Esta semana del plan ${currentPlan.weekNumber}: ${planStartDate.toLocaleString()} → ${planEndDate.toLocaleString()}`);
        return { start: planStartDate, end: planEndDate };
      } else {
        // Fallback a semana calendárica si no hay plan
        const currentDayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, etc.
        const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
        
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() - daysToMonday);
        thisMonday.setHours(0, 0, 0, 0);
        
        const thisWeekEnd = new Date(today);
        thisWeekEnd.setHours(23, 59, 59, 999);
        
        console.log(`[usePeriodStats] Esta semana calendárica: ${thisMonday.toLocaleString()} → ${thisWeekEnd.toLocaleString()}`);
        return { start: thisMonday, end: thisWeekEnd };
      }
    }
      
    case 'current_month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(today);
      monthEnd.setHours(23, 59, 59, 999);
      
      console.log(`[usePeriodStats] Este mes: ${monthStart.toLocaleString()} → ${monthEnd.toLocaleString()}`);
      return { start: monthStart, end: monthEnd };
    }
      
    case '3_months': {
      const threeMonthsStart = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      threeMonthsStart.setHours(0, 0, 0, 0);
      
      const threeMonthsEnd = new Date(today);
      threeMonthsEnd.setHours(23, 59, 59, 999);
      
      console.log(`[usePeriodStats] 3 meses: ${threeMonthsStart.toLocaleString()} → ${threeMonthsEnd.toLocaleString()}`);
      return { start: threeMonthsStart, end: threeMonthsEnd };
    }
      
    case 'all_time': {
      const allTimeStart = new Date(2020, 0, 1); // 1 enero 2020
      allTimeStart.setHours(0, 0, 0, 0);
      
      const allTimeEnd = new Date(today);
      allTimeEnd.setHours(23, 59, 59, 999);
      
      console.log(`[usePeriodStats] Todo el tiempo: ${allTimeStart.toLocaleString()} → ${allTimeEnd.toLocaleString()}`);
      return { start: allTimeStart, end: allTimeEnd };
    }
      
    default: {
      console.error(`[usePeriodStats] Período desconocido: ${period}`);
      return { start: new Date(), end: new Date() };
    }
  }
};

const convertDurationToMinutes = (duration: string): number => {
  if (!duration) return 0;
  
  const cleanDuration = duration.toLowerCase().replace(/\s+/g, '');
  
  if (/^\d+(\.\d+)?$/.test(cleanDuration)) {
    return parseFloat(cleanDuration);
  }
  
  const minMatch = cleanDuration.match(/(\d+(?:\.\d+)?)min/);
  if (minMatch) {
    return parseFloat(minMatch[1]);
  }
  
  let totalMinutes = 0;
  const hoursMatch = cleanDuration.match(/(\d+(?:\.\d+)?)h/);
  if (hoursMatch) {
    totalMinutes += parseFloat(hoursMatch[1]) * 60;
  }
  
  const minutesMatch = cleanDuration.match(/(\d+(?:\.\d+)?)min/);
  if (minutesMatch) {
    totalMinutes += parseFloat(minutesMatch[1]);
  }
  
  const intervalMatch = cleanDuration.match(/(\d+):(\d+):(\d+)/);
  if (intervalMatch) {
    const hours = parseInt(intervalMatch[1]);
    const minutes = parseInt(intervalMatch[2]);
    const seconds = parseInt(intervalMatch[3]);
    return hours * 60 + minutes + seconds / 60;
  }
  
  const timeMatch = cleanDuration.match(/^(\d+):(\d+)$/);
  if (timeMatch) {
    const first = parseInt(timeMatch[1]);
    const second = parseInt(timeMatch[2]);
    
    if (first > 59) {
      return first * 60 + second;
    } else {
      return first + (second / 60);
    }
  }
  
  return totalMinutes;
};

export const usePeriodStats = (period: TimePeriod) => {
  const [stats, setStats] = useState<PeriodStats>({
    totalDistance: 0,
    totalCalories: 0,
    totalWorkouts: 0,
    averagePace: "0:00 min/km",
    weeklyData: [
      { day: 'Sun', distance: 0, calories: 0 },
      { day: 'Mon', distance: 0, calories: 0 },
      { day: 'Tue', distance: 0, calories: 0 },
      { day: 'Wed', distance: 0, calories: 0 },
      { day: 'Thu', distance: 0, calories: 0 },
      { day: 'Fri', distance: 0, calories: 0 },
      { day: 'Sat', distance: 0, calories: 0 }
    ],
    caloriesData: [
      { day: 'Sun', calories: 0, protein: 0, carbs: 0, fats: 0 },
      { day: 'Mon', calories: 0, protein: 0, carbs: 0, fats: 0 },
      { day: 'Tue', calories: 0, protein: 0, carbs: 0, fats: 0 },
      { day: 'Wed', calories: 0, protein: 0, carbs: 0, fats: 0 },
      { day: 'Thu', calories: 0, protein: 0, carbs: 0, fats: 0 },
      { day: 'Fri', calories: 0, protein: 0, carbs: 0, fats: 0 },
      { day: 'Sat', calories: 0, protein: 0, carbs: 0, fats: 0 }
    ]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);

  const calculatePeriodStats = async () => {
    try {
      console.log(`[usePeriodStats] === INICIANDO CÁLCULO PARA PERÍODO: ${period} ===`);
      setIsLoading(true);
      
      // 🔍 VERIFICAR USUARIO AUTENTICADO PRIMERO
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserEmail = user?.email || 'anonimo@app.com';
      console.log(`[usePeriodStats] Usuario actual: ${currentUserEmail}`);
      
      // Cargar el plan actual para "Esta semana"
      const plan = await loadLatestPlan();
      setCurrentPlan(plan);
      
      // SIEMPRE OBTENER TODOS LOS DATOS PRIMERO (con filtrado por usuario)
      let allWorkouts = await getCompletedWorkouts();
      console.log(`[usePeriodStats] Total entrenamientos obtenidos del usuario ${currentUserEmail}: ${allWorkouts?.length || 0}`);
      
      // FALLBACK CRÍTICO: Si Supabase está vacío, usar localStorage filtrado por usuario
      if (!allWorkouts || allWorkouts.length === 0) {
        console.log('[usePeriodStats] 🔄 Supabase vacío, usando fallback a localStorage filtrado...');
        const localWorkouts = localStorage.getItem('completedWorkouts');
        if (localWorkouts) {
          const parsedWorkouts = JSON.parse(localWorkouts);
          // Filtrar solo entrenamientos del usuario actual
          const userWorkouts = parsedWorkouts.filter(w => 
            !w.user_email || w.user_email === currentUserEmail
          );
          console.log(`[usePeriodStats] 🔄 Encontrados ${userWorkouts.length} entrenamientos del usuario actual en localStorage`);
          allWorkouts = userWorkouts;
        }
      }
      
      // FILTRAR EN MEMORIA para "Esta semana" - por week_number O por fecha
      let workouts;
      if (period === 'current_week') {
        // Calcular fechas de la semana actual (lunes a domingo)
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const currentDayOfWeek = today.getDay();
        const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
        
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() - daysToMonday);
        thisMonday.setHours(0, 0, 0, 0);
        
        const currentWeekNumber = plan?.weekNumber || 1;
        console.log(`[usePeriodStats] Filtrando por week_number: ${currentWeekNumber} O por fecha: ${thisMonday.toLocaleDateString()} - ${today.toLocaleDateString()}`);
        
        workouts = allWorkouts?.filter(w => {
          // Opción 1: tiene week_number del plan actual
          if (plan && w.week_number !== undefined && w.week_number !== null && w.week_number === currentWeekNumber) {
            console.log(`[usePeriodStats] ✅ ${w.workout_title}: week ${w.week_number} (plan)`);
            return true;
          }
          
          // Opción 2: NO tiene week_number pero está en la fecha de esta semana (ej: Garmin)
          if (w.week_number === null || w.week_number === undefined) {
            if (w.fecha_completado) {
              const workoutDate = new Date(w.fecha_completado + 'T12:00:00.000Z');
              const isInWeek = workoutDate >= thisMonday && workoutDate <= today;
              if (isInWeek) {
                console.log(`[usePeriodStats] ✅ ${w.workout_title}: fecha ${w.fecha_completado} (externo)`);
                return true;
              }
            }
          }
          
          return false;
        }) || [];
        
        console.log(`[usePeriodStats] ✅ Total entrenamientos de esta semana: ${workouts.length}`);
      } else {
        workouts = allWorkouts;
      }
      console.log(`[usePeriodStats] Total entrenamientos finales: ${workouts?.length || 0}`);
      
      if (!workouts || workouts.length === 0) {
        console.log('[usePeriodStats] No hay entrenamientos, reseteando estadísticas');
        setStats(prev => ({ 
          ...prev, 
          totalDistance: 0, 
          totalCalories: 0, 
          totalWorkouts: 0,
          averagePace: "0:00 min/km"
        }));
        setIsLoading(false);
        return;
      }

      // Log de todos los entrenamientos para debugging
      console.log('[usePeriodStats] Entrenamientos disponibles:');
      workouts.forEach((w, index) => {
        console.log(`  ${index + 1}. ${w.workout_title} - Fecha: ${w.fecha_completado} - Distancia: ${w.distancia_recorrida}km`);
      });

      // Para "Esta semana" ya vienen filtrados, para otros períodos filtrar por fechas
      let periodWorkouts;
      if (period === 'current_week') {
        // Ya están filtrados por week_number O fecha
        periodWorkouts = workouts.filter(w => {
          // ✅ Permitir distancia 0 (útil para pruebas y entrenamientos muy cortos)
          if (w.distancia_recorrida === null || w.distancia_recorrida === undefined || w.distancia_recorrida < 0) {
            console.log(`[usePeriodStats] ❌ Entrenamiento inválido: ${w.workout_title} (sin distancia)`);
            return false;
          }
          console.log(`[usePeriodStats] ✅ Contando: ${w.workout_title} - ${w.distancia_recorrida}km`);
          return true;
        });
        console.log(`[usePeriodStats] Total entrenamientos válidos de esta semana:`, periodWorkouts.length);
      } else {
        // Filtrar por fechas para otros períodos
        const { start, end } = getDateRangeForPeriod(period, plan);
        
        console.log('[usePeriodStats] Filtrando entrenamientos por rango de fechas...');
        periodWorkouts = workouts.filter(w => {
        // Asegurar que el entrenamiento tiene datos válidos
        if (!w.fecha_completado || !w.distancia_recorrida || w.distancia_recorrida <= 0) {
          console.log(`[usePeriodStats] ❌ Entrenamiento inválido: ${w.workout_title} (sin fecha o distancia)`);
          return false;
        }

        // Crear fecha del entrenamiento (asegurar parsing correcto)
        const workoutDate = new Date(w.fecha_completado + 'T12:00:00.000Z'); // Forzar mediodía UTC
        
        // Verificar si la fecha está en el rango
        const isInRange = workoutDate >= start && workoutDate <= end;
        
        console.log(`[usePeriodStats] ${isInRange ? '✅' : '❌'} ${w.workout_title}: ${workoutDate.toLocaleDateString()} ${isInRange ? 'INCLUIDO' : 'EXCLUIDO'}`);
        
        return isInRange;
        });
      }

      console.log(`[usePeriodStats] Entrenamientos filtrados para el período: ${periodWorkouts.length}`);

      // Calculate totals
      const totalDistance = periodWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0);
      const totalCalories = Math.round(totalDistance * 60); // 60 cal per km estimate
      const totalWorkouts = periodWorkouts.length;

      console.log(`[usePeriodStats] Totales calculados:`, {
        totalDistance: `${totalDistance} km`,
        totalWorkouts,
        totalCalories: `${totalCalories} cal`
      });

      // Calculate average pace
      let totalTime = 0;
      periodWorkouts.forEach(w => {
        if (w.duracion) {
          const minutes = convertDurationToMinutes(w.duracion);
          totalTime += minutes;
          console.log(`[usePeriodStats] Entrenamiento ${w.workout_title}: ${w.duracion} = ${minutes} minutos`);
        }
      });

      const averagePaceMinutes = totalDistance > 0 ? totalTime / totalDistance : 0;
      const paceMin = Math.floor(averagePaceMinutes);
      const paceSec = Math.round((averagePaceMinutes - paceMin) * 60);
      const averagePace = `${paceMin}:${paceSec.toString().padStart(2, '0')} min/km`;

      console.log(`[usePeriodStats] Ritmo promedio calculado: ${averagePace} (${totalTime} min total / ${totalDistance} km)`);

      // Create weekly data para el período específico
      const weeklyData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
        const dayWorkouts = periodWorkouts.filter(w => {
          const workoutDate = new Date(w.fecha_completado + 'T12:00:00.000Z');
          return workoutDate.getDay() === index;
        });
        
        const dayDistance = dayWorkouts.reduce((sum, w) => sum + w.distancia_recorrida, 0);
        const dayCalories = Math.round(dayDistance * 60);
        
        return { day, distance: dayDistance, calories: dayCalories };
      });

      // Create calories data with macros (simulated for now)
      const caloriesData = weeklyData.map(d => ({
        day: d.day,
        calories: d.calories,
        protein: Math.round(d.calories * 0.3), // 30% protein
        carbs: Math.round(d.calories * 0.45),  // 45% carbs
        fats: Math.round(d.calories * 0.25)    // 25% fats
      }));

      const finalStats = {
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalCalories,
        totalWorkouts,
        averagePace,
        weeklyData,
        caloriesData
      };

      console.log(`[usePeriodStats] ✅ ESTADÍSTICAS FINALES PARA ${period}:`, finalStats);
      setStats(finalStats);
      
    } catch (error) {
      console.error('[usePeriodStats] ❌ Error calculating period stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculatePeriodStats();
  }, [period]);

  // Escuchar eventos de actualización de plan
  useEffect(() => {
    const handlePlanUpdated = () => {
      console.log('[usePeriodStats] Plan actualizado - recalculando estadísticas');
      calculatePeriodStats();
    };

    window.addEventListener('plan-updated', handlePlanUpdated);
    
    return () => {
      window.removeEventListener('plan-updated', handlePlanUpdated);
    };
  }, []);

  // Escuchar cambios en la autenticación para actualizar estadísticas
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[usePeriodStats] Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log('[usePeriodStats] Recalculando estadísticas por cambio de autenticación');
        // Reset inmediato al cambiar de usuario
        setStats(prev => ({ 
          ...prev, 
          totalDistance: 0, 
          totalCalories: 0, 
          totalWorkouts: 0,
          averagePace: "0:00 min/km"
        }));
        // Pequeño delay para asegurar que el contexto se actualice
        setTimeout(() => {
          calculatePeriodStats();
        }, 500);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Escuchar evento de reset de estadísticas
  useEffect(() => {
    const handleResetStats = () => {
      console.log('[usePeriodStats] 🔄 Evento resetStats recibido - reseteando estadísticas del período');
      setStats(prev => ({ 
        ...prev, 
        totalDistance: 0, 
        totalCalories: 0, 
        totalWorkouts: 0,
        averagePace: "0:00 min/km"
      }));
      // Recalcular después de un pequeño delay
      setTimeout(() => {
        calculatePeriodStats();
      }, 100);
    };

    window.addEventListener('resetStats', handleResetStats);
    
    return () => {
      window.removeEventListener('resetStats', handleResetStats);
    };
  }, []);

  // Escuchar cuando se completa el onboarding
  useEffect(() => {
    const handleOnboardingComplete = () => {
      console.log('[usePeriodStats] 🎯 Onboarding completado - reseteando estadísticas del período');
      setStats(prev => ({ 
        ...prev, 
        totalDistance: 0, 
        totalCalories: 0, 
        totalWorkouts: 0,
        averagePace: "0:00 min/km"
      }));
      // Recalcular estadísticas limpias
      setTimeout(() => {
        calculatePeriodStats();
      }, 200);
    };

    window.addEventListener('onboarding-completed', handleOnboardingComplete);
    
    return () => {
      window.removeEventListener('onboarding-completed', handleOnboardingComplete);
    };
  }, []);

  return { stats, isLoading, currentPlan, refreshStats: calculatePeriodStats };
};

