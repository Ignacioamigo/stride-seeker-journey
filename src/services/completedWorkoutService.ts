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
  duracion: string | null
): Promise<boolean> => {
  try {
    console.log("[saveCompletedWorkout] === INICIANDO GUARDADO ===");
    console.log("[saveCompletedWorkout] Parámetros recibidos:", {
      workoutTitle,
      workoutType,
      distanciaRecorrida,
      duracion
    });
    
    // Asegurar que tenemos una sesión activa
    await ensureSession();
    
    // Convertir duración a formato PostgreSQL interval
    let duracionInterval = null;
    if (duracion && duracion.trim()) {
      duracionInterval = convertDurationToInterval(duracion);
      console.log(`[saveCompletedWorkout] Duración convertida: "${duracion}" -> "${duracionInterval}"`);
    }

    const workoutData = {
      workout_title: workoutTitle,
      workout_type: workoutType,
      distancia_recorrida: distanciaRecorrida,
      duracion: duracionInterval,
      fecha_completado: new Date().toISOString().split('T')[0]
      // user_id se establece automáticamente con auth.uid() por defecto
    };

    console.log("[saveCompletedWorkout] Datos para Supabase:", workoutData);

    const { data, error } = await supabase
      .from('entrenamientos_completados')
      .insert(workoutData)
      .select();

    if (error) {
      console.error("[saveCompletedWorkout] Error en Supabase:", error);
      
      // Fallback a localStorage
      const localWorkout = {
        id: Date.now().toString(),
        workoutTitle,
        workoutType,
        distanciaRecorrida,
        duracion,
        fechaCompletado: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      const existingWorkouts = localStorage.getItem('completedWorkouts');
      const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
      workouts.push(localWorkout);
      localStorage.setItem('completedWorkouts', JSON.stringify(workouts));
      
      console.log("[saveCompletedWorkout] Guardado en localStorage como fallback");
      return true;
    }

    console.log("[saveCompletedWorkout] ✅ Guardado exitoso en Supabase:", data);
    return true;
    
  } catch (error: any) {
    console.error("[saveCompletedWorkout] ❌ Error inesperado:", error);
    
    // Fallback a localStorage en caso de error
    try {
      const localWorkout = {
        id: Date.now().toString(),
        workoutTitle,
        workoutType,
        distanciaRecorrida,
        duracion,
        fechaCompletado: new Date().toISOString().split('T')[0],
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
 * Obtiene todos los entrenamientos completados del usuario actual
 */
export const getCompletedWorkouts = async () => {
  try {
    // Asegurar que tenemos una sesión activa
    await ensureSession();

    // Cargar desde Supabase
    const { data, error } = await supabase
      .from('entrenamientos_completados')
      .select('*')
      .order('fecha_completado', { ascending: false });

    if (!error && data) {
      console.log("[getCompletedWorkouts] Datos cargados desde Supabase:", data.length);
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
