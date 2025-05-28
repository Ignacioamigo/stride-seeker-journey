
import { supabase, ensureSession } from './authService';

/**
 * Convierte duración de texto a minutos numéricos
 */
const convertDurationToMinutes = (duration: string): number => {
  if (!duration || !duration.trim()) return 0;
  
  const cleanDuration = duration.toLowerCase().replace(/\s+/g, '');
  
  console.log(`[convertDurationToMinutes] Input: "${duration}", Clean: "${cleanDuration}"`);
  
  // Si ya es un número, asumimos que son minutos
  if (/^\d+(\.\d+)?$/.test(cleanDuration)) {
    const minutes = parseFloat(cleanDuration);
    console.log(`[convertDurationToMinutes] Número directo: ${minutes} minutos`);
    return minutes;
  }
  
  let totalMinutes = 0;
  
  // Formato "45min", "30min"
  const minutesMatch = cleanDuration.match(/(\d+(?:\.\d+)?)min/);
  if (minutesMatch) {
    totalMinutes += parseFloat(minutesMatch[1]);
    console.log(`[convertDurationToMinutes] Minutos encontrados: ${minutesMatch[1]}`);
  }
  
  // Formato "1h30min", "2h"
  const hoursMatch = cleanDuration.match(/(\d+(?:\.\d+)?)h/);
  if (hoursMatch) {
    totalMinutes += parseFloat(hoursMatch[1]) * 60;
    console.log(`[convertDurationToMinutes] Horas encontradas: ${hoursMatch[1]} = ${parseFloat(hoursMatch[1]) * 60} minutos`);
  }
  
  // Formato "MM:SS" o "HH:MM"
  const timeMatch = cleanDuration.match(/^(\d+):(\d+)$/);
  if (timeMatch && !hoursMatch && !minutesMatch) {
    const first = parseInt(timeMatch[1]);
    const second = parseInt(timeMatch[2]);
    
    // Si el primer número es mayor a 59, asumimos HH:MM
    if (first > 59) {
      totalMinutes = first * 60 + second;
      console.log(`[convertDurationToMinutes] Formato HH:MM: ${first}h ${second}min = ${totalMinutes} minutos`);
    } else {
      // Si es menor o igual a 59, asumimos MM:SS
      totalMinutes = first + (second / 60);
      console.log(`[convertDurationToMinutes] Formato MM:SS: ${first}min ${second}s = ${totalMinutes} minutos`);
    }
  }
  
  console.log(`[convertDurationToMinutes] Total calculado: ${totalMinutes} minutos`);
  return totalMinutes;
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
    
    // Convertir duración a formato que guarde minutos de manera clara
    let duracionFormateada = null;
    if (duracion && duracion.trim()) {
      const minutosCalculados = convertDurationToMinutes(duracion);
      
      if (minutosCalculados > 0) {
        // Guardar como "X min" para que sea claro que son minutos
        duracionFormateada = `${minutosCalculados} min`;
        console.log(`[saveCompletedWorkout] Duración convertida: "${duracion}" -> "${duracionFormateada}" (${minutosCalculados} minutos)`);
      }
    }

    const workoutData = {
      workout_title: workoutTitle,
      workout_type: workoutType,
      distancia_recorrida: distanciaRecorrida,
      duracion: duracionFormateada,
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
        duracion: duracionFormateada,
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
