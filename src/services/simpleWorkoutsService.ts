import { supabase } from '@/integrations/supabase/client';

/**
 * 🏃‍♂️ SERVICIO SIMPLE PARA LA NUEVA TABLA simple_workouts
 * Diseñado para ser simple, funcional y sin complicaciones
 */

export interface SimpleWorkout {
  id?: string;
  user_id?: string;
  workout_title: string;
  workout_type: string;
  distance_km: number;
  duration_minutes: number;
  workout_date: string; // YYYY-MM-DD format
  plan_id?: string | null;
  week_number?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Guarda un nuevo entrenamiento en la tabla simple_workouts
 */
export const saveSimpleWorkout = async (
  workoutTitle: string,
  workoutType: string,
  distanceKm: number,
  durationMinutes: number,
  planId?: string | null,
  weekNumber?: number | null
): Promise<boolean> => {
  try {
    console.log('🚀 [SimpleWorkouts] Guardando entrenamiento:', {
      workoutTitle,
      workoutType,
      distanceKm,
      durationMinutes,
      planId,
      weekNumber
    });

    // Verificar usuario autenticado - si no hay, crear sesión
    let { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('ℹ️ [SimpleWorkouts] Usuario no autenticado, creando sesión anónima...');
      
      try {
        // Crear sesión anónima automáticamente
        const { data: authData, error: signInError } = await supabase.auth.signInAnonymously();
        
        if (signInError || !authData.user) {
          console.error('❌ [SimpleWorkouts] Error creando sesión anónima:', signInError);
          return false;
        }
        
        user = authData.user;
        console.log('✅ [SimpleWorkouts] Sesión anónima creada:', user.id);
      } catch (sessionError) {
        console.error('❌ [SimpleWorkouts] Error en creación de sesión:', sessionError);
        return false;
      }
    }

    // Preparar datos del entrenamiento
    const workoutData: Omit<SimpleWorkout, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      workout_title: workoutTitle || 'Entrenamiento',
      workout_type: workoutType || 'carrera',
      distance_km: Math.max(0, distanceKm || 0), // Asegurar que no sea negativo
      duration_minutes: Math.max(0, Math.round(durationMinutes || 0)), // Asegurar entero positivo
      workout_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      plan_id: planId || null,
      week_number: weekNumber || null
    };

    console.log('📤 [SimpleWorkouts] Datos preparados:', workoutData);

    // Insertar en la base de datos
    const { data, error } = await supabase
      .from('simple_workouts')
      .insert(workoutData)
      .select()
      .single();

    if (error) {
      console.error('❌ [SimpleWorkouts] Error insertando:', error);
      return false;
    }

    console.log('✅ [SimpleWorkouts] Entrenamiento guardado exitosamente:', data);
    
    // Disparar evento para actualizar estadísticas
    window.dispatchEvent(new CustomEvent('workout-saved', { detail: data }));
    
    return true;

  } catch (error) {
    console.error('💥 [SimpleWorkouts] Error general:', error);
    return false;
  }
};

/**
 * Obtiene todos los entrenamientos del usuario actual
 */
export const getUserWorkouts = async (): Promise<SimpleWorkout[]> => {
  try {
    console.log('📊 [SimpleWorkouts] Obteniendo entrenamientos del usuario...');

    // Verificar usuario autenticado - si no hay, crear sesión
    let { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('ℹ️ [SimpleWorkouts] Usuario no autenticado, creando sesión anónima...');
      
      try {
        // Crear sesión anónima automáticamente
        const { data: authData, error: signInError } = await supabase.auth.signInAnonymously();
        
        if (signInError || !authData.user) {
          console.error('❌ [SimpleWorkouts] Error creando sesión anónima:', signInError);
          return [];
        }
        
        user = authData.user;
        console.log('✅ [SimpleWorkouts] Sesión anónima creada para lectura:', user.id);
      } catch (sessionError) {
        console.error('❌ [SimpleWorkouts] Error en creación de sesión:', sessionError);
        return [];
      }
    }

    // Obtener entrenamientos del usuario ordenados por fecha descendente
    const { data, error } = await supabase
      .from('simple_workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [SimpleWorkouts] Error obteniendo entrenamientos:', error);
      return [];
    }

    console.log(`✅ [SimpleWorkouts] Obtenidos ${data?.length || 0} entrenamientos`);
    return data || [];

  } catch (error) {
    console.error('💥 [SimpleWorkouts] Error general obteniendo entrenamientos:', error);
    return [];
  }
};

/**
 * Obtiene entrenamientos filtrados por rango de fechas
 */
export const getUserWorkoutsByDateRange = async (
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): Promise<SimpleWorkout[]> => {
  try {
    console.log(`📅 [SimpleWorkouts] Obteniendo entrenamientos desde ${startDate} hasta ${endDate}`);

    // Verificar usuario autenticado - si no hay, crear sesión
    let { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('ℹ️ [SimpleWorkouts] Usuario no autenticado, creando sesión anónima...');
      
      try {
        // Crear sesión anónima automáticamente
        const { data: authData, error: signInError } = await supabase.auth.signInAnonymously();
        
        if (signInError || !authData.user) {
          console.error('❌ [SimpleWorkouts] Error creando sesión anónima:', signInError);
          return [];
        }
        
        user = authData.user;
        console.log('✅ [SimpleWorkouts] Sesión anónima creada para filtrado por fechas:', user.id);
      } catch (sessionError) {
        console.error('❌ [SimpleWorkouts] Error en creación de sesión:', sessionError);
        return [];
      }
    }

    // Obtener entrenamientos en el rango de fechas
    const { data, error } = await supabase
      .from('simple_workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('workout_date', startDate)
      .lte('workout_date', endDate)
      .order('workout_date', { ascending: false });

    if (error) {
      console.error('❌ [SimpleWorkouts] Error obteniendo entrenamientos por fecha:', error);
      return [];
    }

    console.log(`✅ [SimpleWorkouts] Obtenidos ${data?.length || 0} entrenamientos en el rango`);
    return data || [];

  } catch (error) {
    console.error('💥 [SimpleWorkouts] Error general obteniendo por fecha:', error);
    return [];
  }
};

/**
 * Obtiene entrenamientos de un plan específico
 */
export const getUserWorkoutsByPlan = async (planId: string): Promise<SimpleWorkout[]> => {
  try {
    console.log(`📋 [SimpleWorkouts] Obteniendo entrenamientos del plan: ${planId}`);

    // Verificar usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ [SimpleWorkouts] Usuario no autenticado:', authError);
      return [];
    }

    // Obtener entrenamientos del plan
    const { data, error } = await supabase
      .from('simple_workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_id', planId)
      .order('week_number', { ascending: true })
      .order('workout_date', { ascending: false });

    if (error) {
      console.error('❌ [SimpleWorkouts] Error obteniendo entrenamientos del plan:', error);
      return [];
    }

    console.log(`✅ [SimpleWorkouts] Obtenidos ${data?.length || 0} entrenamientos del plan`);
    return data || [];

  } catch (error) {
    console.error('💥 [SimpleWorkouts] Error general obteniendo por plan:', error);
    return [];
  }
};

/**
 * Elimina un entrenamiento específico
 */
export const deleteWorkout = async (workoutId: string): Promise<boolean> => {
  try {
    console.log(`🗑️ [SimpleWorkouts] Eliminando entrenamiento: ${workoutId}`);

    const { error } = await supabase
      .from('simple_workouts')
      .delete()
      .eq('id', workoutId);

    if (error) {
      console.error('❌ [SimpleWorkouts] Error eliminando entrenamiento:', error);
      return false;
    }

    console.log('✅ [SimpleWorkouts] Entrenamiento eliminado exitosamente');
    
    // Disparar evento para actualizar estadísticas
    window.dispatchEvent(new CustomEvent('workout-deleted', { detail: { id: workoutId } }));
    
    return true;

  } catch (error) {
    console.error('💥 [SimpleWorkouts] Error general eliminando:', error);
    return false;
  }
};

/**
 * Obtiene estadísticas básicas del usuario
 */
export const getUserWorkoutStats = async () => {
  try {
    console.log('📈 [SimpleWorkouts] Calculando estadísticas básicas...');

    const workouts = await getUserWorkouts();
    
    if (workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalDistance: 0,
        totalTime: 0,
        averagePace: '0:00',
        longestRun: 0
      };
    }

    const totalWorkouts = workouts.length;
    const totalDistance = workouts.reduce((sum, w) => sum + w.distance_km, 0);
    const totalTime = workouts.reduce((sum, w) => sum + w.duration_minutes, 0);
    const longestRun = Math.max(...workouts.map(w => w.distance_km));
    
    // Calcular ritmo promedio (min/km)
    const averagePaceMinutes = totalDistance > 0 ? totalTime / totalDistance : 0;
    const paceMin = Math.floor(averagePaceMinutes);
    const paceSec = Math.round((averagePaceMinutes - paceMin) * 60);
    const averagePace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;

    const stats = {
      totalWorkouts,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalTime,
      averagePace,
      longestRun
    };

    console.log('✅ [SimpleWorkouts] Estadísticas calculadas:', stats);
    return stats;

  } catch (error) {
    console.error('💥 [SimpleWorkouts] Error calculando estadísticas:', error);
    return {
      totalWorkouts: 0,
      totalDistance: 0,
      totalTime: 0,
      averagePace: '0:00',
      longestRun: 0
    };
  }
};
