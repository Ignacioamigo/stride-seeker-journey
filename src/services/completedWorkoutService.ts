import { saveSimpleWorkout, getUserWorkouts, getUserWorkoutsByPlan, SimpleWorkout } from './simpleWorkoutsService';

/**
 * 🏃‍♂️ NUEVO SERVICIO SIMPLE - USA LA TABLA simple_workouts DIRECTAMENTE
 * Sin adaptadores, sin complicaciones, solo funcionalidad pura
 */

/**
 * Guarda un entrenamiento completado
 */
export const saveCompletedWorkout = async (
  workoutTitle: string,
  workoutType: string,
  distanciaRecorrida: number | null,
  duracion: string | null,
  planId?: string | null,
  weekNumber?: number | null
): Promise<boolean> => {
  console.log("🚀 [NEW SERVICE] Guardando entrenamiento en tabla simple...");
  
  // Convertir duración de string a minutos
  let durationMinutes = 0;
  if (duracion && duracion.trim()) {
    // Extraer números de la duración (ej: "30 min" -> 30, "1h 15min" -> 75)
    const timeStr = duracion.toLowerCase().replace(/\s+/g, '');
    
    // Buscar horas y minutos
    const hoursMatch = timeStr.match(/(\d+)h/);
    const minutesMatch = timeStr.match(/(\d+)min/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    durationMinutes = hours * 60 + minutes;
    
    // Si no se encontró formato específico, intentar parsear como número puro
    if (durationMinutes === 0) {
      const numberMatch = timeStr.match(/(\d+)/);
      if (numberMatch) {
        durationMinutes = parseInt(numberMatch[1]);
      }
    }
  }
  
  console.log(`🚀 [NEW SERVICE] Duración convertida: "${duracion}" -> ${durationMinutes} minutos`);
  
  // Usar el nuevo servicio simple
  return await saveSimpleWorkout(
    workoutTitle,
    workoutType,
    distanciaRecorrida || 0,
    durationMinutes,
    planId,
    weekNumber
  );
};

/**
 * Adaptador para mantener compatibilidad con el formato legacy
 */
const adaptToLegacyFormat = (simpleWorkouts: SimpleWorkout[]) => {
  return simpleWorkouts.map(workout => ({
    id: workout.id,
    workout_title: workout.workout_title,
    workout_type: workout.workout_type,
    distancia_recorrida: workout.distance_km,
    duracion: `${workout.duration_minutes} min`,
    fecha_completado: workout.workout_date,
    plan_id: workout.plan_id,
    week_number: workout.week_number,
    created_at: workout.created_at
  }));
};

/**
 * Obtiene todos los entrenamientos del usuario
 */
export const getCompletedWorkouts = async () => {
  console.log("🚀 [NEW SERVICE] Obteniendo entrenamientos de tabla simple...");
  const simpleWorkouts = await getUserWorkouts();
  const adaptedWorkouts = adaptToLegacyFormat(simpleWorkouts);
  console.log("✅ [NEW SERVICE] Entrenamientos adaptados:", adaptedWorkouts.length);
  return adaptedWorkouts;
};

/**
 * Obtiene entrenamientos de un plan específico
 */
export const getCompletedWorkoutsForPlan = async (planId: string) => {
  console.log("🚀 [NEW SERVICE] Obteniendo entrenamientos de plan en tabla simple...");
  const simpleWorkouts = await getUserWorkoutsByPlan(planId);
  const adaptedWorkouts = adaptToLegacyFormat(simpleWorkouts);
  console.log("✅ [NEW SERVICE] Entrenamientos de plan adaptados:", adaptedWorkouts.length);
  return adaptedWorkouts;
};
