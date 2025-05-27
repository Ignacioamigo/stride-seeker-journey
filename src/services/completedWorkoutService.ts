
import { supabase } from '@/integrations/supabase/client';

/**
 * Obtiene el ID del usuario autenticado o desde localStorage
 */
const getCurrentUserId = async (): Promise<string | null> => {
  try {
    console.log("[getCurrentUserId] Iniciando proceso...");
    
    // Primero intentar obtener usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log("[getCurrentUserId] Usuario autenticado encontrado:", user.id);
      return user.id;
    }

    // Si no hay usuario autenticado, buscar en localStorage
    const savedUser = localStorage.getItem('runAdaptiveUser');
    if (!savedUser) {
      console.error("[getCurrentUserId] No hay usuario en localStorage");
      return null;
    }

    const userProfile = JSON.parse(savedUser);
    console.log("[getCurrentUserId] Usuario desde localStorage:", userProfile);

    if (userProfile.id) {
      console.log("[getCurrentUserId] Usando ID de localStorage:", userProfile.id);
      return userProfile.id;
    }

    console.error("[getCurrentUserId] No se encontró ID de usuario");
    return null;
  } catch (error) {
    console.error("[getCurrentUserId] Error inesperado:", error);
    return null;
  }
};

/**
 * Guarda un entrenamiento completado en la nueva tabla entrenamientos_completados
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
    
    const userId = await getCurrentUserId();
    console.log("[saveCompletedWorkout] User ID obtenido:", userId);
    
    if (!userId) {
      console.error("[saveCompletedWorkout] No se encontró ID de usuario");
      return false;
    }

    // Convertir duración a formato interval de PostgreSQL si existe
    let duracionInterval = null;
    if (duracion && duracion.trim()) {
      // Convertir formato "30min" o "1h30min" a "HH:MM:SS"
      const cleanDuration = duracion.toLowerCase().replace(/\s+/g, '');
      
      if (/^\d+min$/.test(cleanDuration)) {
        // Formato "30min"
        const minutes = parseInt(cleanDuration.replace('min', ''));
        duracionInterval = `00:${minutes.toString().padStart(2, '0')}:00`;
      } else if (/^\d+h\d*min$/.test(cleanDuration)) {
        // Formato "1h30min"
        const hoursMatch = cleanDuration.match(/(\d+)h/);
        const minutesMatch = cleanDuration.match(/(\d+)min/);
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
        duracionInterval = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      } else if (/^\d+:\d+$/.test(cleanDuration)) {
        // Formato "30:45" (minutos:segundos)
        duracionInterval = `00:${cleanDuration}`;
      } else {
        // Formato libre, intentar usar como está
        duracionInterval = duracion;
      }
    }

    const workoutData = {
      user_id: userId,
      workout_title: workoutTitle,
      workout_type: workoutType,
      distancia_recorrida: distanciaRecorrida,
      duracion: duracionInterval,
      fecha_completado: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
    };

    console.log("[saveCompletedWorkout] Datos finales a insertar:", workoutData);
    console.log("[saveCompletedWorkout] Realizando inserción en entrenamientos_completados...");

    const { data, error } = await supabase
      .from('entrenamientos_completados')
      .insert(workoutData)
      .select();

    console.log("[saveCompletedWorkout] Respuesta de Supabase:");
    console.log("- Data:", data);
    console.log("- Error:", error);

    if (error) {
      console.error("[saveCompletedWorkout] ❌ Error insertando en entrenamientos_completados:", error);
      console.error("[saveCompletedWorkout] Error code:", error.code);
      console.error("[saveCompletedWorkout] Error message:", error.message);
      console.error("[saveCompletedWorkout] Error details:", error.details);
      console.error("[saveCompletedWorkout] Error hint:", error.hint);
      return false;
    }

    console.log("[saveCompletedWorkout] ✅ Entrenamiento guardado exitosamente:", data);
    return true;
  } catch (error: any) {
    console.error("[saveCompletedWorkout] ❌ Error inesperado completo:", error);
    console.error("[saveCompletedWorkout] Error name:", error.name);
    console.error("[saveCompletedWorkout] Error message:", error.message);
    console.error("[saveCompletedWorkout] Error stack:", error.stack);
    return false;
  }
};

/**
 * Obtiene todos los entrenamientos completados del usuario actual
 */
export const getCompletedWorkouts = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error("[getCompletedWorkouts] No se encontró ID de usuario");
      return [];
    }

    const { data, error } = await supabase
      .from('entrenamientos_completados')
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
