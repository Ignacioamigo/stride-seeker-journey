
import { supabase } from '@/integrations/supabase/client';

/**
 * Obtiene el ID del usuario desde localStorage
 */
const getCurrentUserId = (): string | null => {
  const savedUser = localStorage.getItem('runAdaptiveUser');
  if (savedUser) {
    const userProfile = JSON.parse(savedUser);
    return userProfile.id || null;
  }
  return null;
};

/**
 * Guarda un entrenamiento completado en la nueva tabla entre_completado
 */
export const saveCompletedWorkout = async (
  workoutTitle: string,
  workoutType: string,
  distanciaRecorrida: number | null,
  duracion: string | null
): Promise<boolean> => {
  try {
    console.log("[saveCompletedWorkout] Guardando entrenamiento completado en entre_completado");
    
    const userId = getCurrentUserId();
    if (!userId) {
      console.error("[saveCompletedWorkout] No se encontró ID de usuario");
      return false;
    }

    const workoutData = {
      user_id: userId,
      workout_title: workoutTitle,
      workout_type: workoutType,
      distancia_recorrida: distanciaRecorrida,
      duracion: duracion,
      fecha_completado: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
    };

    console.log("[saveCompletedWorkout] Datos a insertar:", workoutData);

    const { data, error } = await supabase
      .from('entre_completado')
      .insert(workoutData)
      .select();

    if (error) {
      console.error("[saveCompletedWorkout] Error insertando en entre_completado:", error);
      return false;
    }

    console.log("[saveCompletedWorkout] ✅ Entrenamiento guardado exitosamente:", data);
    return true;
  } catch (error: any) {
    console.error("[saveCompletedWorkout] Error inesperado:", error);
    return false;
  }
};

/**
 * Obtiene todos los entrenamientos completados del usuario actual
 */
export const getCompletedWorkouts = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error("[getCompletedWorkouts] No se encontró ID de usuario");
      return [];
    }

    const { data, error } = await supabase
      .from('entre_completado')
      .select('*')
      .eq('user_id', userId)
      .order('fecha_completado', { ascending: false });

    if (error) {
      console.error("[getCompletedWorkouts] Error obteniendo entrenamientos:", error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error("[getCompletedWorkouts] Error inesperado:", error);
    return [];
  }
};
