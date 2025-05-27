
import { supabase, ensureSession } from './authService';

export const saveWorkout = async (
  workoutTitle: string,
  workoutType: string,
  distanciaRecorrida: number | null,
  duracion: string | null
): Promise<boolean> => {
  try {
    console.log("[saveWorkout] === INICIANDO GUARDADO ===");
    console.log("[saveWorkout] Parámetros:", {
      workoutTitle,
      workoutType,
      distanciaRecorrida,
      duracion
    });
    
    await ensureSession();
    
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

    console.log("[saveWorkout] Datos para Supabase:", workoutData);

    const { data, error } = await supabase
      .from('entrenamientos_completados')
      .insert(workoutData)
      .select();

    if (error) {
      console.error("[saveWorkout] Error en Supabase:", error);
      
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
      
      console.log("[saveWorkout] Guardado en localStorage como fallback");
      return true;
    }

    console.log("[saveWorkout] ✅ Guardado exitoso en Supabase:", data);
    return true;
    
  } catch (error: any) {
    console.error("[saveWorkout] ❌ Error inesperado:", error);
    
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
      
      console.log("[saveWorkout] Guardado en localStorage como último recurso");
      return true;
    } catch (localError) {
      console.error("[saveWorkout] Error también en localStorage:", localError);
      return false;
    }
  }
};
