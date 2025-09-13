/**
 * ADAPTADOR PARA CONVERTIR DATOS DE workouts_simple AL FORMATO ESPERADO
 * Convierte automáticamente los nuevos campos a los campos que esperan los hooks
 */

interface WorkoutSimple {
  id?: string;
  user_email?: string;
  workout_title: string;
  workout_type: string;
  distance: number | null;
  duration_minutes: number | null;
  completed_date: string;
  plan_info?: string;
  week_number?: number;
  notes?: string;
  created_at?: string;
}

interface WorkoutLegacy {
  id?: string;
  workout_title: string;
  workout_type: string;
  distancia_recorrida: number;
  duracion: string;
  fecha_completado: string;
  plan_id?: string;
  week_number?: number;
  created_at?: string;
}

/**
 * Convierte datos de workouts_simple al formato legacy que esperan los hooks
 */
export const adaptWorkoutsForStats = (simpleWorkouts: WorkoutSimple[]): WorkoutLegacy[] => {
  console.log('🔄 [ADAPTER] Convertiendo workouts_simple a formato legacy...');
  console.log('🔄 [ADAPTER] Workouts recibidos:', simpleWorkouts.length);
  
  const adapted = simpleWorkouts.map(workout => {
    // Convertir duration_minutes a formato "XX min"
    let duracionStr = '0 min';
    if (workout.duration_minutes && workout.duration_minutes > 0) {
      duracionStr = `${workout.duration_minutes} min`;
    }
    
    const adaptedWorkout: WorkoutLegacy = {
      id: workout.id,
      workout_title: workout.workout_title,
      workout_type: workout.workout_type,
      distancia_recorrida: workout.distance || 0, // Mapear distance → distancia_recorrida
      duracion: duracionStr, // Mapear duration_minutes → duracion con formato
      fecha_completado: workout.completed_date, // Mapear completed_date → fecha_completado
      plan_id: workout.plan_info || undefined, // Mapear plan_info → plan_id
      week_number: workout.week_number,
      created_at: workout.created_at
    };
    
    console.log('🔄 [ADAPTER] Conversión:', {
      original: {
        title: workout.workout_title,
        distance: workout.distance,
        duration_minutes: workout.duration_minutes,
        completed_date: workout.completed_date
      },
      adapted: {
        title: adaptedWorkout.workout_title,
        distancia_recorrida: adaptedWorkout.distancia_recorrida,
        duracion: adaptedWorkout.duracion,
        fecha_completado: adaptedWorkout.fecha_completado
      }
    });
    
    return adaptedWorkout;
  });
  
  console.log('✅ [ADAPTER] Conversión completada:', adapted.length, 'workouts adaptados');
  return adapted;
};

/**
 * Convierte un solo workout de formato simple a legacy
 */
export const adaptSingleWorkout = (simpleWorkout: WorkoutSimple): WorkoutLegacy => {
  return adaptWorkoutsForStats([simpleWorkout])[0];
};

/**
 * Verifica si los datos están en formato simple o legacy
 */
export const isSimpleFormat = (workout: any): boolean => {
  return workout.hasOwnProperty('distance') && 
         workout.hasOwnProperty('duration_minutes') && 
         workout.hasOwnProperty('completed_date');
};

/**
 * Adapta automáticamente cualquier array de workouts al formato legacy
 */
export const autoAdaptWorkouts = (workouts: any[]): WorkoutLegacy[] => {
  if (!workouts || workouts.length === 0) {
    console.log('🔄 [AUTO-ADAPTER] Sin workouts para adaptar');
    return [];
  }
  
  // Verificar el formato del primer workout
  const firstWorkout = workouts[0];
  if (isSimpleFormat(firstWorkout)) {
    console.log('🔄 [AUTO-ADAPTER] Detectado formato simple, adaptando...');
    return adaptWorkoutsForStats(workouts as WorkoutSimple[]);
  } else {
    console.log('🔄 [AUTO-ADAPTER] Formato legacy detectado, no necesita adaptación');
    return workouts as WorkoutLegacy[];
  }
};
