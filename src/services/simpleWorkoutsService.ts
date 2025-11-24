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
 * COMBINA datos de:
 * 1. simple_workouts (entrada manual)
 * 2. training_sessions (sesiones del plan completadas)
 * 3. published_activities_simple (GPS/Strava vinculados por training_session_id)
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

    const workouts: SimpleWorkout[] = [];

    // 1. Obtener entrenamientos MANUALES de simple_workouts
    const { data: manualWorkouts, error: manualError } = await supabase
      .from('simple_workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_id', planId)
      .order('week_number', { ascending: true })
      .order('workout_date', { ascending: false });

    if (manualError) {
      console.error('❌ [SimpleWorkouts] Error obteniendo entrenamientos manuales:', manualError);
    } else if (manualWorkouts && manualWorkouts.length > 0) {
      console.log(`✅ [SimpleWorkouts] ${manualWorkouts.length} entrenamientos manuales encontrados`);
      workouts.push(...manualWorkouts);
    }

    // 2. Obtener sesiones COMPLETADAS del plan desde training_sessions
    const { data: completedSessions, error: sessionsError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('plan_id', planId)
      .eq('completed', true)
      .order('day_date', { ascending: true });

    if (sessionsError) {
      console.error('❌ [SimpleWorkouts] Error obteniendo training_sessions:', sessionsError);
    } else if (completedSessions && completedSessions.length > 0) {
      console.log(`✅ [SimpleWorkouts] ${completedSessions.length} sesiones completadas encontradas`);
      
      // 3. Obtener TODAS las actividades GPS vinculadas de una sola vez (más eficiente)
      const sessionIds = completedSessions.map(s => s.id);
      const { data: gpsActivities, error: gpsError } = await supabase
        .from('published_activities_simple')
        .select('training_session_id, distance, duration, activity_date')
        .in('training_session_id', sessionIds);

      if (gpsError) {
        console.warn('⚠️ [SimpleWorkouts] Error obteniendo actividades GPS (no crítico):', gpsError);
      }

      // Crear un mapa para búsqueda rápida
      const gpsActivityMap = new Map();
      if (gpsActivities) {
        gpsActivities.forEach(activity => {
          if (activity.training_session_id) {
            gpsActivityMap.set(activity.training_session_id, activity);
          }
        });
      }
      
      // Convertir training_sessions a formato SimpleWorkout
      for (const session of completedSessions) {
        // Buscar si tiene actividad GPS vinculada
        const gpsActivity = gpsActivityMap.get(session.id);

        // Si tiene actividad GPS, usar esos datos; si no, usar los de la sesión
        const distance = gpsActivity?.distance || session.actual_distance || 0;
        const durationStr = gpsActivity?.duration || session.actual_duration || '0';
        
        // Convertir duración a minutos
        let durationMinutes = 0;
        if (typeof durationStr === 'string') {
          const parts = durationStr.split(':');
          if (parts.length === 3) {
            // Formato HH:MM:SS
            durationMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
          } else if (durationStr.includes('min')) {
            // Formato "30 min"
            durationMinutes = parseInt(durationStr.replace(/\D/g, '')) || 0;
          } else {
            // Solo número
            durationMinutes = parseInt(durationStr) || 0;
          }
        }

        const workoutDate = gpsActivity?.activity_date 
          ? new Date(gpsActivity.activity_date).toISOString().split('T')[0]
          : session.day_date;

        workouts.push({
          id: session.id,
          user_id: user.id,
          workout_title: session.title,
          workout_type: session.type || 'carrera',
          distance_km: distance,
          duration_minutes: durationMinutes,
          workout_date: workoutDate,
          plan_id: planId,
          week_number: null, // Las sesiones no tienen week_number directo
          created_at: session.completion_date || undefined,
          updated_at: undefined
        });
      }
    }

    console.log(`✅ [SimpleWorkouts] TOTAL: ${workouts.length} entrenamientos del plan ${planId}`);
    console.log(`📊 [SimpleWorkouts] Desglose:`, workouts.map(w => ({
      titulo: w.workout_title,
      distancia: w.distance_km,
      duracion: w.duration_minutes,
      fecha: w.workout_date
    })));
    
    return workouts;

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
