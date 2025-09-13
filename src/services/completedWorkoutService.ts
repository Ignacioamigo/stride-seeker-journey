import { saveWorkoutSimple, getSimpleWorkouts, getSimpleWorkoutsForPlan } from './simpleWorkoutService';
import { autoAdaptWorkouts } from './statsAdapter';

/**
 * WRAPPER PARA MANTENER COMPATIBILIDAD
 * AHORA USA LA TABLA workouts_simple + ADAPTADOR AUTOMÁTICO
 */
export const saveCompletedWorkout = async (
  workoutTitle: string,
  workoutType: string,
  distanciaRecorrida: number | null,
  duracion: string | null,
  planId?: string | null,
  weekNumber?: number | null
): Promise<boolean> => {
  console.log("🚀 [WRAPPER] Redirigiendo a saveWorkoutSimple...");
  
  // Simplemente llamar al servicio simple
  return await saveWorkoutSimple(
      workoutTitle,
      workoutType,
      distanciaRecorrida,
      duracion,
      planId,
      weekNumber
  );
};

// Redirigir a las funciones simples CON ADAPTACIÓN AUTOMÁTICA
export const getCompletedWorkouts = async () => {
  console.log("🚀 [WRAPPER] Obteniendo datos simples y adaptando...");
  const simpleWorkouts = await getSimpleWorkouts();
  const adaptedWorkouts = autoAdaptWorkouts(simpleWorkouts);
  console.log("✅ [WRAPPER] Datos adaptados para estadísticas:", adaptedWorkouts.length);
  return adaptedWorkouts;
};

export const getCompletedWorkoutsForPlan = async (planId: string) => {
  console.log("🚀 [WRAPPER] Obteniendo datos simples por plan y adaptando...");
  const simpleWorkouts = await getSimpleWorkoutsForPlan(planId);
  const adaptedWorkouts = autoAdaptWorkouts(simpleWorkouts);
  console.log("✅ [WRAPPER] Datos de plan adaptados:", adaptedWorkouts.length);
  return adaptedWorkouts;
};
