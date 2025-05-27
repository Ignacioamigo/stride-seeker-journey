
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
 * Guarda un entrenamiento completado - solo en localStorage para usuarios no autenticados
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

    // Verificar si hay usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Usuario autenticado - intentar guardar en Supabase
      console.log("[saveCompletedWorkout] Usuario autenticado, guardando en Supabase...");
      
      // Convertir duración a formato interval de PostgreSQL si existe
      let duracionInterval = null;
      if (duracion && duracion.trim()) {
        const cleanDuration = duracion.toLowerCase().replace(/\s+/g, '');
        
        if (/^\d+min$/.test(cleanDuration)) {
          const minutes = parseInt(cleanDuration.replace('min', ''));
          duracionInterval = `00:${minutes.toString().padStart(2, '0')}:00`;
        } else if (/^\d+h\d*min$/.test(cleanDuration)) {
          const hoursMatch = cleanDuration.match(/(\d+)h/);
          const minutesMatch = cleanDuration.match(/(\d+)min/);
          const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
          const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
          duracionInterval = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        } else if (/^\d+:\d+$/.test(cleanDuration)) {
          duracionInterval = `00:${cleanDuration}`;
        } else {
          duracionInterval = duracion;
        }
      }

      const workoutData = {
        workout_title: workoutTitle,
        workout_type: workoutType,
        distancia_recorrida: distanciaRecorrida,
        duracion: duracionInterval,
        fecha_completado: new Date().toISOString().split('T')[0]
      };

      console.log("[saveCompletedWorkout] Datos para Supabase:", workoutData);

      const { data, error } = await supabase
        .from('entrenamientos_completados')
        .insert(workoutData)
        .select();

      if (error) {
        console.error("[saveCompletedWorkout] Error en Supabase:", error);
        // Fallback a localStorage si falla Supabase
      } else {
        console.log("[saveCompletedWorkout] ✅ Guardado exitoso en Supabase:", data);
        
        // También guardar en localStorage para sincronización
        const localWorkout = {
          id: data[0]?.id || Date.now().toString(),
          userId,
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
        
        return true;
      }
    }

    // Usuario no autenticado o error en Supabase - guardar en localStorage
    console.log("[saveCompletedWorkout] Guardando en localStorage...");
    
    const localWorkout = {
      id: Date.now().toString(),
      userId,
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
    
    console.log("[saveCompletedWorkout] ✅ Guardado exitoso en localStorage");
    return true;
    
  } catch (error: any) {
    console.error("[saveCompletedWorkout] ❌ Error inesperado:", error);
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

    // Verificar si hay usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Usuario autenticado - intentar cargar desde Supabase
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
    }

    // Fallback a localStorage
    const existingWorkouts = localStorage.getItem('completedWorkouts');
    const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
    const userWorkouts = workouts.filter((w: any) => w.userId === userId);
    
    console.log("[getCompletedWorkouts] Datos cargados desde localStorage:", userWorkouts.length);
    return userWorkouts;
    
  } catch (error: any) {
    console.error("[getCompletedWorkouts] Error inesperado:", error);
    return [];
  }
};
