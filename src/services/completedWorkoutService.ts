
import { supabase } from '@/integrations/supabase/client';

/**
 * Obtiene el ID del perfil de usuario desde la tabla user_profiles
 */
const getCurrentUserProfileId = async (): Promise<string | null> => {
  try {
    // Primero verificar si hay un usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("[getCurrentUserProfileId] No hay usuario autenticado");
      return null;
    }

    // Buscar el perfil del usuario en la tabla user_profiles
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_auth_id', user.id)
      .single();

    if (error) {
      console.error("[getCurrentUserProfileId] Error obteniendo perfil:", error);
      return null;
    }

    return profile?.id || null;
  } catch (error) {
    console.error("[getCurrentUserProfileId] Error inesperado:", error);
    return null;
  }
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
    
    const userProfileId = await getCurrentUserProfileId();
    if (!userProfileId) {
      console.error("[saveCompletedWorkout] No se encontró ID de perfil de usuario");
      return false;
    }

    const workoutData = {
      user_id: userProfileId,
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
    const userProfileId = await getCurrentUserProfileId();
    if (!userProfileId) {
      console.error("[getCompletedWorkouts] No se encontró ID de perfil de usuario");
      return [];
    }

    const { data, error } = await supabase
      .from('entre_completado')
      .select('*')
      .eq('user_id', userProfileId)
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
