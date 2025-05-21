
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, WorkoutPlan, Workout, TrainingPlanRequest, PreviousWeekResults } from '@/types';

// Variable para controlar el modo offline
let offlineMode = false;
let connectionError: string | null = null;

/**
 * Genera un plan de entrenamiento mock para modo offline
 */
const generateMockPlan = (userProfile: UserProfile): WorkoutPlan => {
  console.log("Generando plan de entrenamiento en modo offline para:", userProfile.name);
  
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const workoutTypes = ['carrera', 'fuerza', 'descanso', 'flexibilidad'] as const;
  
  // Determinar cuántos días de entrenamiento necesita el usuario
  const requestedWorkoutDays = userProfile.weeklyWorkouts || 3;
  
  // Crear workouts basados en perfil del usuario
  const workouts: Workout[] = daysOfWeek.map((day, index) => {
    // Si el usuario quiere entrenar menos de 7 días, poner el resto como descanso
    // Distribuir los entrenamientos uniformemente a lo largo de la semana
    const shouldWorkout = index % Math.ceil(7 / requestedWorkoutDays) === 0 && 
                          workouts?.filter(w => w?.type !== 'descanso')?.length < requestedWorkoutDays;

    const isRestDay = !shouldWorkout;
    
    // Alternar tipos de entrenamiento para los días activos
    const activeWorkouts = workouts?.filter(w => w?.type !== 'descanso')?.length || 0;
    const type = isRestDay ? 'descanso' : 
                (activeWorkouts % 3 === 0) ? 'carrera' :
                (activeWorkouts % 3 === 1) ? 'fuerza' : 'flexibilidad';
    
    let distance = null;
    let duration = null;
    let targetPace = userProfile.pace || null;
    
    if (type === 'carrera') {
      // Basado en nivel de experiencia y distancia máxima
      const maxDistance = userProfile.maxDistance || 5;
      const expFactor = userProfile.experienceLevel === 'principiante' ? 0.5 :
                        userProfile.experienceLevel === 'intermedio' ? 0.7 : 0.85;
      
      // Adaptar la distancia según el objetivo
      let goalFactor = 1.0;
      const goalLower = userProfile.goal.toLowerCase();
      
      if (goalLower.includes('maratón') || goalLower.includes('42k')) {
        goalFactor = 1.2;
      } else if (goalLower.includes('media') || goalLower.includes('21k')) {
        goalFactor = 1.1;
      } else if (goalLower.includes('10k')) {
        goalFactor = 0.9;
      } else if (goalLower.includes('5k')) {
        goalFactor = 0.7;
      }
      
      // Calcular distancia con factores y redondear a 1 decimal
      distance = Math.round((maxDistance * expFactor * goalFactor) * 10) / 10;
      
      // Si es un plan para maratón, asegurar que la distancia aumenta gradualmente
      if (goalLower.includes('maratón') && maxDistance > 15) {
        // Programar un entrenamiento largo cada 2 semanas
        const isLongRun = index === 5; // Largo en sábado
        if (isLongRun) {
          distance = Math.round((maxDistance * 0.95) * 10) / 10;
        }
      }
      
      // Calcular duración basada en el ritmo del usuario
      if (userProfile.pace) {
        const [minutesPart, secondsPart] = userProfile.pace.split(':');
        const paceInMinutes = parseInt(minutesPart) + parseInt(secondsPart) / 60;
        duration = `${Math.round(distance * paceInMinutes)} min`;
      } else {
        // Si no hay ritmo, estimación básica
        duration = `${Math.round(distance ? distance * 7 : 30)} min`;
      }
    } else if (type === 'fuerza') {
      duration = '30 min';
    } else if (type === 'flexibilidad') {
      duration = '20 min';
    }
    
    return {
      id: uuidv4(),
      day,
      title: isRestDay ? 'Día de descanso' : 
             type === 'fuerza' ? 'Entrenamiento de fuerza' :
             type === 'flexibilidad' ? 'Flexibilidad y movilidad' :
             `Carrera de ${distance} km`,
      description: isRestDay ? 'Descansa para recuperarte adecuadamente' : 
                  type === 'fuerza' ? 'Ejercicios de fuerza para mejorar tu rendimiento' :
                  type === 'flexibilidad' ? 'Sesión de estiramientos y movilidad' :
                  `Carrera a ritmo moderado (${userProfile.pace || 'tu ritmo cómodo'} min/km)`,
      distance,
      duration,
      type,
      completed: false,
      actualDistance: null,
      actualDuration: null,
      targetPace
    };
  });
  
  return {
    id: uuidv4(),
    name: `Plan de entrenamiento para ${userProfile.name} (Offline)`,
    description: `Plan generado en modo offline adaptado a tu nivel ${userProfile.experienceLevel || 'actual'} y tu objetivo: ${userProfile.goal || 'mejorar rendimiento'}. Incluye ${userProfile.weeklyWorkouts || 3} entrenamientos semanales.`,
    duration: "7 días",
    intensity: userProfile.experienceLevel === 'principiante' ? "Baja" : 
               userProfile.experienceLevel === 'intermedio' ? "Media" : "Alta",
    workouts,
    createdAt: new Date(),
    weekNumber: 1
  };
};

/**
 * Función para comprobar si estamos en modo offline
 */
export const isOfflineMode = (): boolean => {
  return offlineMode || !navigator.onLine;
};

/**
 * Obtiene el error de conexión actual
 */
export const getConnectionError = (): string | null => {
  return connectionError;
};

/**
 * Función para subir un documento de entrenamiento para RAG
 */
export const uploadTrainingDocument = async (file: File): Promise<boolean> => {
  try {
    console.log("Subiendo documento para enriquecer el sistema RAG:", file.name);
    
    if (!navigator.onLine) {
      console.error("No hay conexión a internet");
      offlineMode = true;
      connectionError = "No hay conexión a internet. El documento no se puede subir en modo offline.";
      return false;
    }
    
    // Leer el contenido del archivo
    const fileContent = await file.text();
    
    // Subir el documento a Supabase para procesamiento RAG
    const { data, error } = await supabase.functions.invoke('generate-embedding', {
      body: { text: fileContent, metadata: { filename: file.name } }
    });
    
    if (error) {
      console.error("Error al generar el embedding para RAG:", error);
      connectionError = `Error al procesar el documento: ${error.message}`;
      return false;
    }
    
    console.log("Documento procesado y almacenado correctamente para RAG");
    return true;
  } catch (error) {
    console.error("Error al subir el documento:", error);
    connectionError = `Error inesperado: ${error.message}`;
    return false;
  }
};

/**
 * Guarda el plan de entrenamiento en el almacenamiento local
 */
export const savePlan = async (plan: WorkoutPlan): Promise<void> => {
  try {
    localStorage.setItem('savedPlan', JSON.stringify(plan));
  } catch (error) {
    console.error("Error al guardar el plan:", error);
  }
};

/**
 * Elimina el plan guardado
 */
export const removeSavedPlan = (): void => {
  try {
    localStorage.removeItem('savedPlan');
  } catch (error) {
    console.error("Error al eliminar el plan guardado:", error);
  }
};

/**
 * Carga el último plan guardado
 */
export const loadLatestPlan = async (): Promise<WorkoutPlan | null> => {
  try {
    const savedPlan = localStorage.getItem('savedPlan');
    if (savedPlan) {
      return JSON.parse(savedPlan);
    }
    return null;
  } catch (error) {
    console.error("Error al cargar el plan:", error);
    return null;
  }
};

/**
 * Actualiza los resultados de un entrenamiento específico
 */
export const updateWorkoutResults = async (
  planId: string,
  workoutId: string,
  actualDistance: number | null,
  actualDuration: string | null
): Promise<WorkoutPlan | null> => {
  try {
    const plan = await loadLatestPlan();
    if (!plan || plan.id !== planId) return null;
    
    const updatedWorkouts = plan.workouts.map(workout => {
      if (workout.id === workoutId) {
        return {
          ...workout,
          completed: true,
          actualDistance,
          actualDuration
        };
      }
      return workout;
    });
    
    const updatedPlan = {
      ...plan,
      workouts: updatedWorkouts
    };
    
    await savePlan(updatedPlan);
    return updatedPlan;
  } catch (error) {
    console.error("Error al actualizar resultados del entrenamiento:", error);
    return null;
  }
};

/**
 * Genera un plan para la siguiente semana
 */
export const generateNextWeekPlan = async (currentPlan: WorkoutPlan): Promise<WorkoutPlan | null> => {
  try {
    // Verificar si estamos en modo offline
    if (isOfflineMode()) {
      offlineMode = true;
      
      // Crear un resumen de la semana anterior para el contexto
      const previousWeekResults: PreviousWeekResults = {
        weekNumber: currentPlan.weekNumber || 1,
        workouts: currentPlan.workouts.map(w => ({
          day: w.day,
          title: w.title,
          completed: !!w.completed,
          plannedDistance: w.distance,
          actualDistance: w.actualDistance,
          plannedDuration: w.duration,
          actualDuration: w.actualDuration
        }))
      };
      
      // Cargar el perfil de usuario
      const savedUser = localStorage.getItem('runAdaptiveUser');
      if (!savedUser) {
        connectionError = "No se encontró el perfil de usuario";
        return null;
      }
      
      const userProfile = JSON.parse(savedUser);
      
      // Generar nuevo plan
      const nextWeekPlan = generateMockPlan(userProfile);
      nextWeekPlan.weekNumber = (currentPlan.weekNumber || 1) + 1;
      
      // Ajustar el plan en base a resultados anteriores
      // Por ejemplo, si completaron todos los entrenamientos, aumentar intensidad
      const completedWorkouts = currentPlan.workouts.filter(w => w.completed && w.type !== 'descanso').length;
      const totalWorkouts = currentPlan.workouts.filter(w => w.type !== 'descanso').length;
      
      if (completedWorkouts / totalWorkouts > 0.8) {
        // Aumentar distancia en 10%
        nextWeekPlan.workouts = nextWeekPlan.workouts.map(workout => {
          if (workout.distance) {
            return {
              ...workout,
              distance: Math.round((workout.distance * 1.1) * 10) / 10,
              title: workout.type === 'carrera' ? `Carrera de ${Math.round((workout.distance * 1.1) * 10) / 10} km` : workout.title
            };
          }
          return workout;
        });
      }
      
      await savePlan(nextWeekPlan);
      return nextWeekPlan;
    }
    
    // Si estamos online, usar la API para generar el plan
    // Obtener el perfil de usuario
    const savedUser = localStorage.getItem('runAdaptiveUser');
    if (!savedUser) {
      connectionError = "No se encontró el perfil de usuario";
      return null;
    }
    
    const userProfile = JSON.parse(savedUser);
    
    // Crear un resumen de la semana anterior
    const previousWeekResults: PreviousWeekResults = {
      weekNumber: currentPlan.weekNumber || 1,
      workouts: currentPlan.workouts.map(w => ({
        day: w.day,
        title: w.title,
        completed: !!w.completed,
        plannedDistance: w.distance,
        actualDistance: w.actualDistance,
        plannedDuration: w.duration,
        actualDuration: w.actualDuration
      }))
    };
    
    // Llamar a la API con los resultados anteriores
    const nextWeekPlan = await generateTrainingPlan({
      userProfile,
      previousWeekResults
    });
    
    // Actualizar el número de semana
    nextWeekPlan.weekNumber = (currentPlan.weekNumber || 1) + 1;
    
    await savePlan(nextWeekPlan);
    return nextWeekPlan;
  } catch (error) {
    console.error("Error al generar el plan de la siguiente semana:", error);
    connectionError = `Error: ${error.message}`;
    return null;
  }
};

/**
 * Genera un plan de entrenamiento personalizado
 */
export const generateTrainingPlan = async (request: TrainingPlanRequest): Promise<WorkoutPlan> => {
  try {
    console.log("Iniciando generación de plan de entrenamiento...");
    
    if (!navigator.onLine) {
      console.log("Sin conexión a internet. Generando plan offline...");
      offlineMode = true;
      const mockPlan = generateMockPlan(request.userProfile);
      await savePlan(mockPlan);
      return mockPlan;
    }
    
    offlineMode = false;
    connectionError = null;
    
    // Intentar obtener fragmentos relevantes para RAG
    let relevantFragments: string[] = [];
    
    try {
      // Búsqueda de fragmentos relevantes basada en el perfil y objetivo del usuario
      const searchQuery = `${request.userProfile.goal} ${request.userProfile.experienceLevel} running training plan ${request.userProfile.maxDistance}km`;
      
      console.log("Buscando fragmentos relevantes para RAG:", searchQuery);
      
      // FIXED: Changed query_text to query_embedding and added embedding conversion
      // We need to convert the text query to an embedding first
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
        body: { text: searchQuery }
      });
      
      if (embeddingError) {
        console.error("Error al generar el embedding para la búsqueda:", embeddingError);
      } else if (embeddingData && embeddingData.embedding) {
        // Now use the embedding for the search
        const { data, error } = await supabase.rpc('match_fragments', {
          query_embedding: embeddingData.embedding,
          match_count: 3
        });
        
        if (error) {
          console.error("Error al obtener fragmentos relevantes:", error);
        } else if (data && data.length > 0) {
          relevantFragments = data.map((item: any) => item.content);
          console.log(`Se encontraron ${relevantFragments.length} fragmentos relevantes para RAG`);
        }
      }
    } catch (ragError) {
      console.error("Error en el proceso RAG:", ragError);
      // Continuar sin RAG si hay error
    }
    
    // Llamar a la función Edge para generar el plan
    console.log("Enviando solicitud a la función Edge para generar el plan...");
    
    // Si hay resultados de la semana anterior, incluirlos
    const requestBody: any = {
      userProfile: request.userProfile,
    };
    
    if (relevantFragments.length > 0) {
      requestBody.relevantFragments = relevantFragments;
    }
    
    if (request.previousWeekResults) {
      requestBody.previousWeekResults = request.previousWeekResults;
    }
    
    if (request.customPrompt) {
      requestBody.customPrompt = request.customPrompt;
    }
    
    const response = await supabase.functions.invoke('generate-training-plan', {
      body: requestBody
    });
    
    if (response.error) {
      console.error("Error llamando a la función Edge:", response.error);
      throw new Error(`Error en la función Edge: ${response.error.message}`);
    }
    
    console.log("Plan de entrenamiento recibido de la función Edge");
    
    // Crear el plan con UUID
    const edgePlanData = response.data;
    
    const plan: WorkoutPlan = {
      id: uuidv4(),
      name: edgePlanData.name,
      description: edgePlanData.description,
      duration: edgePlanData.duration,
      intensity: edgePlanData.intensity,
      workouts: edgePlanData.workouts.map((workout: any) => ({
        id: uuidv4(),
        day: workout.day,
        title: workout.title,
        description: workout.description,
        distance: workout.distance,
        duration: workout.duration,
        type: workout.type,
        completed: false,
        actualDistance: null,
        actualDuration: null,
        targetPace: request.userProfile.pace || null
      })),
      createdAt: new Date(),
      weekNumber: 1
    };
    
    // Asegurarse de que solo se incluyan los días de entrenamiento solicitados
    // Y que se respeten los parámetros del usuario
    const weeklyWorkouts = request.userProfile.weeklyWorkouts || 3;
    
    // Ajustar los días de entrenamiento al número especificado por el usuario
    let activeWorkouts = plan.workouts.filter(w => w.type !== 'descanso');
    
    // Si hay más entrenamientos activos que los solicitados, convertir algunos en descanso
    if (activeWorkouts.length > weeklyWorkouts) {
      // Ordenar por prioridad: Mantener carreras largas, luego fuerza, luego flexibilidad
      activeWorkouts.sort((a, b) => {
        // Priorizar mantener carreras con mayor distancia
        if (a.type === 'carrera' && b.type === 'carrera') {
          return (b.distance || 0) - (a.distance || 0);
        }
        // Prioridad: carrera > fuerza > flexibilidad
        const typePriority = { 'carrera': 3, 'fuerza': 2, 'flexibilidad': 1 };
        return typePriority[b.type as keyof typeof typePriority] - typePriority[a.type as keyof typeof typePriority];
      });
      
      // Mantener solo los entrenamientos prioritarios
      const workoutsToKeep = activeWorkouts.slice(0, weeklyWorkouts).map(w => w.id);
      
      // Actualizar los workouts convirtiendo los no prioritarios en descanso
      plan.workouts = plan.workouts.map(workout => {
        if (workout.type !== 'descanso' && !workoutsToKeep.includes(workout.id)) {
          return {
            ...workout,
            type: 'descanso',
            title: 'Día de descanso',
            description: 'Descansa para recuperarte adecuadamente',
            distance: null,
            duration: null
          };
        }
        return workout;
      });
    }
    
    // Guardar el plan generado
    await savePlan(plan);
    
    return plan;
  } catch (error) {
    console.error("Error al generar plan de entrenamiento:", error);
    connectionError = error.message || "Error desconocido al generar el plan";
    
    // En caso de error, generar un plan offline
    console.log("Generando plan offline por error:", error.message);
    offlineMode = true;
    const mockPlan = generateMockPlan(request.userProfile);
    await savePlan(mockPlan);
    return mockPlan;
  }
};
