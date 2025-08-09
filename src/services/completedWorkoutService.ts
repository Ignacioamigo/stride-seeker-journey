import { supabase, ensureSession } from './authService';

/**
 * Convierte duración de texto a formato PostgreSQL interval
 */
const convertDurationToInterval = (duration: string): string => {
  if (!duration || !duration.trim()) return '0 minutes';
  
  console.log(`[convertDurationToInterval] Input: "${duration}"`);
  
  // Si viene en formato HH:MM:SS
  if (/^\d{2}:\d{2}:\d{2}$/.test(duration)) {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    return `${hours} hours ${minutes} minutes ${seconds} seconds`;
  }
  
  // Si viene como "X min"
  const minutesMatch = duration.match(/(\d+(?:\.\d+)?)\s*min/i);
  if (minutesMatch) {
    return `${minutesMatch[1]} minutes`;
  }
  
  // Fallback: asumir que son minutos
  const numericValue = parseFloat(duration);
  if (!isNaN(numericValue)) {
    return `${numericValue} minutes`;
  }
  
  console.warn(`[convertDurationToInterval] Formato no reconocido: ${duration}`);
  return '0 minutes';
};

/**
 * Guarda un entrenamiento completado usando autenticación anónima automática
 */
export const saveCompletedWorkout = async (
  workoutTitle: string,
  workoutType: string,
  distanciaRecorrida: number | null,
  duracion: string | null,
  planId?: string,
  weekNumber?: number,
  workoutDate?: string // Nueva: fecha específica del workout (YYYY-MM-DD)
): Promise<boolean> => {
  try {
    console.log("[saveCompletedWorkout] === INICIANDO GUARDADO ===");
    console.log("[saveCompletedWorkout] Parámetros recibidos:", {
      workoutTitle,
      workoutType,
      distanciaRecorrida,
      duracion,
      planId,
      weekNumber,
      workoutDate
    });
    
    // Asegurar que tenemos una sesión activa
    await ensureSession();
    
    // Convertir duración a formato PostgreSQL interval
    let duracionInterval = null;
    if (duracion && duracion.trim()) {
      duracionInterval = convertDurationToInterval(duracion);
      console.log(`[saveCompletedWorkout] Duración convertida: "${duracion}" -> "${duracionInterval}"`);
    }

    // Usar la fecha específica del workout si se proporciona, sino usar hoy
    const completedDate = workoutDate || new Date().toISOString().split('T')[0];
    console.log(`[saveCompletedWorkout] Fecha a guardar: ${completedDate} (workout: ${workoutDate}, hoy: ${new Date().toISOString().split('T')[0]})`);

    const workoutData = {
      workout_title: workoutTitle,
      workout_type: workoutType,
      distancia_recorrida: distanciaRecorrida,
      duracion: duracionInterval,
      fecha_completado: completedDate,
      plan_id: planId || null,
      week_number: weekNumber || null
      // user_id se establece automáticamente con auth.uid() por defecto
    };

    console.log("[saveCompletedWorkout] Datos para Supabase:", workoutData);

    const { data, error } = await supabase
      .from('entrenamientos_completados')
      .insert(workoutData)
      .select();

    if (error) {
      console.error("[saveCompletedWorkout] Error en Supabase:", error);
      // Intentar autocorregir cuando falta el plan en Supabase (violación de FK)
      if (error.code === '23503' && planId) {
        console.warn('[saveCompletedWorkout] Detectada violación FK plan_id. Intentando migrar plan local a Supabase con el mismo ID...');
        const migrated = await tryMigrateLocalPlanToSupabase(planId);
        if (migrated) {
          console.log('[saveCompletedWorkout] ✅ Plan migrado. Reintentando guardar entrenamiento...');
          const retry = await supabase
            .from('entrenamientos_completados')
            .insert(workoutData)
            .select();
          if (!retry.error) {
            console.log('[saveCompletedWorkout] ✅ Guardado exitoso tras migración:', retry.data);
            return true;
          } else {
            console.error('[saveCompletedWorkout] ❌ Falló reintento tras migración:', retry.error);
          }
        } else {
          console.warn('[saveCompletedWorkout] ❌ No se pudo migrar el plan automáticamente');
        }
      }
      
      // Fallback a localStorage con FORMATO CORRECTO
      const localWorkout = {
        id: Date.now().toString(),
        workout_title: workoutTitle,  // ✅ FORMATO CORRECTO
        workout_type: workoutType,    // ✅ FORMATO CORRECTO  
        distancia_recorrida: distanciaRecorrida, // ✅ FORMATO CORRECTO
        duracion: duracion,           // ✅ FORMATO CORRECTO
        fecha_completado: new Date().toISOString().split('T')[0], // ✅ FORMATO CORRECTO
        plan_id: planId || null,      // ✅ NUEVO CAMPO
        week_number: weekNumber || null, // ✅ NUEVO CAMPO
        created_at: new Date().toISOString()
      };
      
      const existingWorkouts = localStorage.getItem('completedWorkouts');
      const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
      workouts.push(localWorkout);
      localStorage.setItem('completedWorkouts', JSON.stringify(workouts));
      
      console.log("[saveCompletedWorkout] ✅ Guardado en localStorage como fallback con formato correcto");
      return true;
    }

    console.log("[saveCompletedWorkout] ✅ Guardado exitoso en Supabase:", data);
    return true;
    
  } catch (error: any) {
    console.error("[saveCompletedWorkout] ❌ Error inesperado:", error);
    
    // Fallback a localStorage en caso de error
    try {
      const fallbackDate = workoutDate || new Date().toISOString().split('T')[0];
      const localWorkout = {
        id: Date.now().toString(),
        workoutTitle,
        workoutType,
        distanciaRecorrida,
        duracion,
        fechaCompletado: fallbackDate, // Usar la fecha correcta
        createdAt: new Date().toISOString()
      };
      
      const existingWorkouts = localStorage.getItem('completedWorkouts');
      const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
      workouts.push(localWorkout);
      localStorage.setItem('completedWorkouts', JSON.stringify(workouts));
      
      console.log("[saveCompletedWorkout] Guardado en localStorage como último recurso");
      return true;
    } catch (localError) {
      console.error("[saveCompletedWorkout] Error también en localStorage:", localError);
      return false;
    }
  }
};

/**
 * Intenta migrar el plan guardado en localStorage a Supabase con el mismo ID,
 * incluyendo sus sesiones, para resolver violaciones de FK al insertar entrenamientos.
 */
const tryMigrateLocalPlanToSupabase = async (planId: string): Promise<boolean> => {
  try {
    // Verificar si ya existe el plan en Supabase
    const { data: existing } = await supabase
      .from('training_plans')
      .select('id')
      .eq('id', planId)
      .maybeSingle();
    if (existing?.id) {
      return true;
    }

    const savedPlan = localStorage.getItem('savedPlan');
    if (!savedPlan) return false;

    const plan = JSON.parse(savedPlan);
    if (plan.id !== planId) {
      // No coincide: no migrar
      return false;
    }

    // Obtener perfil de usuario
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return false;
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_auth_id', user.user.id)
      .single();
    if (!userProfile?.id) return false;

    // Insertar training_plans usando el mismo ID
    const { error: planErr } = await supabase
      .from('training_plans')
      .insert({
        id: plan.id,
        user_id: userProfile.id,
        name: plan.name,
        description: plan.description || '',
        duration: plan.duration || '7 días',
        intensity: plan.intensity || 'Moderada',
        week_number: plan.weekNumber || 1,
        start_date: (plan.createdAt ? new Date(plan.createdAt) : new Date()).toISOString().split('T')[0]
      });
    if (planErr) {
      console.error('[tryMigrateLocalPlanToSupabase] Error insertando training_plans:', planErr);
      return false;
    }

    // Insertar training_sessions
    const sessions = (plan.workouts || []).map((w: any, idx: number) => ({
      plan_id: plan.id,
      day_number: idx + 1,
      day_date: (w.date ? new Date(w.date) : new Date()).toISOString().split('T')[0],
      title: w.title,
      description: w.description || null,
      type: w.type || 'carrera',
      planned_distance: w.distance ?? null,
      planned_duration: w.duration ?? null,
      target_pace: w.targetPace || null,
      completed: !!w.completed,
      actual_distance: w.actualDistance ?? null,
      actual_duration: w.actualDuration ?? null,
      completion_date: w.completed ? new Date().toISOString() : null
    }));

    const { error: sessErr } = await supabase
      .from('training_sessions')
      .insert(sessions);
    if (sessErr) {
      console.error('[tryMigrateLocalPlanToSupabase] Error insertando training_sessions:', sessErr);
      return false;
    }

    console.log('[tryMigrateLocalPlanToSupabase] ✅ Plan y sesiones migrados con éxito');
    return true;
  } catch (e) {
    console.error('[tryMigrateLocalPlanToSupabase] Error inesperado:', e);
    return false;
  }
};

/**
 * Obtiene todos los entrenamientos completados del usuario actual
 */
export const getCompletedWorkouts = async (planId?: string, weekNumber?: number) => {
  try {
    // Asegurar que tenemos una sesión activa
    await ensureSession();

    // Cargar desde Supabase - SIEMPRE cargar todos para compatibilidad
    const { data, error } = await supabase
      .from('entrenamientos_completados')
      .select('*')
      .order('fecha_completado', { ascending: false });

    if (!error && data) {
      console.log("[getCompletedWorkouts] Datos cargados desde Supabase:", data.length);
      
      // Filtrar en memoria si se especifican parámetros
      if (planId || weekNumber !== undefined) {
        const filtered = data.filter(w => {
          if (planId && w.plan_id !== planId) return false;
          if (weekNumber !== undefined && w.week_number !== weekNumber) return false;
          return true;
        });
        console.log(`[getCompletedWorkouts] Filtrados por plan ${planId}, semana ${weekNumber}:`, filtered.length);
        return filtered;
      }
      
      return data;
    } else {
      console.error("[getCompletedWorkouts] Error en Supabase:", error);
    }

    // Fallback a localStorage
    const existingWorkouts = localStorage.getItem('completedWorkouts');
    const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
    
    console.log("[getCompletedWorkouts] Datos cargados desde localStorage:", workouts.length);
    return workouts;
    
  } catch (error: any) {
    console.error("[getCompletedWorkouts] Error inesperado:", error);
    
    // Último recurso: localStorage
    const existingWorkouts = localStorage.getItem('completedWorkouts');
    const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
    return workouts;
  }
};

/**
 * Obtiene entrenamientos completados específicos de un plan desde training_sessions
 * Con fallback a localStorage si Supabase falla
 */
export const getCompletedWorkoutsForPlan = async (planId: string) => {
  try {
    console.log(`[getCompletedWorkoutsForPlan] 🔍 INICIANDO búsqueda para plan: ${planId}`);
    
    // MÉTODO 1: Intentar desde Supabase training_sessions
    try {
      console.log(`[getCompletedWorkoutsForPlan] 🔍 Método 1: Buscando en Supabase training_sessions...`);
      
      // Asegurar que tenemos una sesión activa
      await ensureSession();

      // Debug: Verificar autenticación
      const { data: authUser } = await supabase.auth.getUser();
      console.log(`[getCompletedWorkoutsForPlan] 🔍 Usuario autenticado:`, authUser?.user?.id || 'NO USER');

      // Obtener sesiones completadas del plan específico
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('plan_id', planId)
        .eq('completed', true)
        .order('day_date', { ascending: true });

      console.log(`[getCompletedWorkoutsForPlan] 🔍 Supabase response:`, { data, error });

      if (!error && data && data.length > 0) {
        console.log(`[getCompletedWorkoutsForPlan] ✅ Método 1 exitoso: ${data.length} sesiones desde Supabase`);
        
        // Transformar datos a formato compatible con weeklyAnalyzer
        const transformedData = data.map(session => ({
          id: session.id,
          workout_title: session.title,
          workout_type: session.type,
          distancia_recorrida: session.actual_distance,
          duracion: session.actual_duration,
          fecha_completado: session.completion_date || session.day_date,
          plan_id: session.plan_id,
          day_date: session.day_date,
          day_number: session.day_number
        }));

        console.log("[getCompletedWorkoutsForPlan] ✅ Datos transformados desde Supabase:", transformedData);
        return transformedData;
      } else {
        console.log(`[getCompletedWorkoutsForPlan] ⚠️ Método 1 sin resultados:`, { error: error?.message, dataLength: data?.length });
      }
      
    } catch (supabaseError) {
      console.error("[getCompletedWorkoutsForPlan] ❌ Error en Método 1 (Supabase):", supabaseError);
    }

    // MÉTODO 2: Fallback a localStorage
    console.log(`[getCompletedWorkoutsForPlan] 🔍 Método 2: Fallback a localStorage...`);
    
    const savedPlan = localStorage.getItem('savedPlan');
    if (!savedPlan) {
      console.log("[getCompletedWorkoutsForPlan] ❌ No hay plan guardado en localStorage");
      return [];
    }

    const planData = JSON.parse(savedPlan);
    console.log(`[getCompletedWorkoutsForPlan] 🔍 Plan localStorage ID: ${planData.id} vs buscado: ${planId}`);
    
    // Verificar que el plan ID coincida (o usar el plan actual si no hay coincidencia)
    if (planData.id !== planId) {
      console.log(`[getCompletedWorkoutsForPlan] ⚠️ Plan ID no coincide, usando plan actual de localStorage`);
    }

    // Extraer entrenamientos completados del localStorage
    const completedWorkouts = planData.workouts
      .filter((workout: any) => workout.completed)
      .map((workout: any, index: number) => ({
        id: workout.id,
        workout_title: workout.title,
        workout_type: workout.type || 'carrera',
        distancia_recorrida: workout.actualDistance,
        duracion: workout.actualDuration,
        fecha_completado: new Date().toISOString().split('T')[0], // Fecha de hoy como fallback
        plan_id: planData.id,
        day_date: workout.date || new Date().toISOString().split('T')[0],
        day_number: index + 1
      }));

    console.log(`[getCompletedWorkoutsForPlan] ✅ Método 2 exitoso: ${completedWorkouts.length} entrenamientos desde localStorage`);
    console.log("[getCompletedWorkoutsForPlan] ✅ Datos desde localStorage:", completedWorkouts);
    
    return completedWorkouts;
    
  } catch (error: any) {
    console.error("[getCompletedWorkoutsForPlan] ❌ Error general:", error);
    return [];
  }
};
