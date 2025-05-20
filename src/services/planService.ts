
import { createClient } from "@supabase/supabase-js";
import { TrainingPlanRequest, UserProfile, WorkoutPlan, Workout } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

// Variables para controlar el estado de Supabase
let offlineMode = false;
let connectionError: string | null = null;

/**
 * Comprueba si la aplicación está en modo offline
 */
export const isOfflineMode = () => {
  return offlineMode;
};

/**
 * Devuelve el mensaje de error de conexión
 */
export const getConnectionError = () => {
  return connectionError;
};

/**
 * Genera un plan de entrenamiento mock para modo offline
 */
const generateMockPlan = (userProfile: UserProfile): WorkoutPlan => {
  console.log("Generando plan de entrenamiento en modo offline para:", userProfile.name);
  
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const workoutTypes = ['carrera', 'fuerza', 'descanso', 'flexibilidad'] as const;
  
  // Crear workouts basados en perfil del usuario
  const workouts: Workout[] = daysOfWeek.map((day, index) => {
    const isRestDay = index === 3 || index === 6; // Miércoles y domingo de descanso
    const type = isRestDay ? 'descanso' : 
                (index === 1 || index === 4) ? 'fuerza' : 
                (index === 5) ? 'flexibilidad' : 'carrera';
    
    let distance = null;
    if (type === 'carrera') {
      // Basado en nivel de experiencia y distancia máxima
      const maxDistance = userProfile.maxDistance || 5;
      const expFactor = userProfile.experienceLevel === 'principiante' ? 0.4 :
                        userProfile.experienceLevel === 'intermedio' ? 0.7 : 0.9;
      distance = Math.round((maxDistance * expFactor) * 10) / 10;
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
                  `Carrera a ritmo moderado`,
      distance,
      duration: type === 'carrera' ? `${Math.round(distance ? distance * 7 : 30)} min` :
                type === 'fuerza' ? '30 min' :
                type === 'flexibilidad' ? '20 min' : null,
      type,
      completed: false,
      actualDistance: null,
      actualDuration: null
    };
  });
  
  return {
    id: uuidv4(),
    name: `Plan de entrenamiento para ${userProfile.name} (Offline)`,
    description: `Plan generado en modo offline adaptado a tu nivel ${userProfile.experienceLevel || 'actual'} y tu objetivo: ${userProfile.goal || 'mejorar rendimiento'}`,
    duration: "7 días",
    intensity: userProfile.experienceLevel === 'principiante' ? "Baja" : 
               userProfile.experienceLevel === 'intermedio' ? "Media" : "Alta",
    workouts,
    createdAt: new Date(),
    weekNumber: 1
  };
};

/**
 * Creates a profile summary for the LLM
 */
const createUserProfileSummary = (profile: UserProfile): string => {
  return `
  Perfil del corredor:
  - Nombre: ${profile.name}
  - Edad: ${profile.age || 'No especificado'}
  - Género: ${profile.gender || 'No especificado'}
  - Altura: ${profile.height ? `${profile.height} cm` : 'No especificado'}
  - Peso: ${profile.weight ? `${profile.weight} kg` : 'No especificado'}
  - Nivel de experiencia: ${profile.experienceLevel || 'No especificado'}
  - Distancia máxima recorrida: ${profile.maxDistance ? `${profile.maxDistance} km` : 'No especificado'}
  - Ritmo actual: ${profile.pace || 'No especificado'} 
  - Objetivo: ${profile.goal}
  - Entrenamientos semanales: ${profile.weeklyWorkouts || 'No especificado'}
  - Lesiones o limitaciones: ${profile.injuries || 'Ninguna'}
  `;
};

/**
 * Generates a vector embedding for the query
 * This is a safe implementation that handles errors and returns an empty array if needed
 */
const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    console.log("Generando embedding para el texto:", text.substring(0, 50) + "...");
    
    try {
      // Type-safe function invocation with proper error handling
      const { data, error } = await supabase.functions.invoke('generate-embedding', {
        body: { text }
      });
      
      if (error) {
        console.error("Error en edge function generate-embedding:", error);
        throw new Error(`Error en generate-embedding: ${error.message}`);
      }
      
      // Safe type checking
      if (!data || !Array.isArray((data as any).embedding)) {
        throw new Error("No se recibió un embedding válido de la edge function");
      }
      
      console.log("Embedding generado correctamente");
      return (data as any).embedding as number[];
    } catch (e: any) {
      console.error("Error al invocar edge function:", e);
      throw new Error(`Error al invocar generate-embedding: ${e.message}`);
    }
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    // Return empty array as a fallback
    return [];
  }
};

/**
 * Retrieves relevant training documents using direct query
 * This is a type-safe implementation
 */
const retrieveRelevantFragments = async (embedding: number[], limit = 8): Promise<string[]> => {
  try {
    if (!embedding || embedding.length === 0) {
      throw new Error("No se proporcionó un embedding válido para la búsqueda");
    }
    
    console.log("Buscando fragmentos relevantes con el embedding...");
    
    try {
      // Direct vector similarity search using correct syntax for Supabase vector operations
      const { data, error } = await supabase
        .from('fragments')
        .select('content')
        .order('embedding <-> $1', { 
          ascending: true,
          foreignTable: embedding  // Changed from referencedTable to foreignTable
        })
        .limit(limit);
      
      if (error) {
        console.error('Error en consulta de fragmentos:', error);
        throw new Error(`Error en consulta de fragmentos: ${error.message}`);
      }
      
      // Type-safe handling of results
      if (!data) {
        return [];
      }
      
      console.log(`Recuperados ${data.length} fragmentos relevantes`);
      return data.map(doc => doc.content || '').filter(Boolean);
      
    } catch (e: any) {
      console.error("Error en la consulta a la base de datos:", e);
      throw new Error(`Error en la consulta a la base de datos: ${e.message}`);
    }
  } catch (error: any) {
    console.error('Error retrieving fragments:', error);
    return [];
  }
};

/**
 * Uploads a training document and creates an embedding
 */
export const uploadTrainingDocument = async (title: string, content: string): Promise<void> => {
  try {
    // First, generate an embedding for the document
    const embedding = await generateEmbedding(content);
    
    if (!embedding || embedding.length === 0) {
      throw new Error("No se pudo generar el embedding para el documento");
    }
    
    // Create a unique ID for the document
    const id = uuidv4();
    
    // Insert the document into the fragments table
    const { error } = await supabase.from('fragments').insert([{
      id,
      title,
      content,
      embedding
    }]);
    
    if (error) throw new Error(`Error saving document: ${error.message}`);
    
    console.log(`Document "${title}" uploaded successfully with ID: ${id}`);
  } catch (error: any) {
    console.error('Error uploading training document:', error);
    throw error;
  }
};

/**
 * Generates a training plan using RAG and Gemini
 * with proper error handling and offline mode
 */
export const generateTrainingPlan = async ({ userProfile, previousWeekResults }: TrainingPlanRequest): Promise<WorkoutPlan> => {
  try {
    // Verificar conexión a Supabase
    try {
      await supabase.auth.getSession();
      console.log("Conexión con Supabase verificada correctamente");
      offlineMode = false;
      connectionError = null;
    } catch (error: any) {
      console.error("Error al verificar sesión con Supabase:", error);
      offlineMode = true;
      connectionError = `Error de conexión con Supabase: ${error.message}`;
      
      // En caso de error de conexión, generar un plan mock
      return generateMockPlan(userProfile);
    }
    
    // 1. Create a query from the user profile
    const query = createUserProfileSummary(userProfile);
    console.log("Creado resumen de perfil de usuario para consulta:", query);
    
    // 2. Generate embedding for the query
    console.log("Generando embedding para la consulta...");
    const embedding = await generateEmbedding(query);
    console.log("Embedding generado correctamente, longitud:", embedding.length);
    
    // 3. Retrieve relevant fragments
    const relevantFragments = await retrieveRelevantFragments(embedding);
    console.log("Fragmentos relevantes recuperados:", relevantFragments.length);
    
    // 4. Call edge function to generate a plan
    console.log("Llamando a edge function para generar plan...");
    const { data, error } = await supabase.functions.invoke('generate-training-plan', {
      body: { 
        userProfile, 
        context: relevantFragments.join('\n\n'),
        previousWeekResults
      }
    });
    
    if (error) {
      console.error("Error al llamar a edge function generate-training-plan:", error);
      throw new Error(`Error en edge function generate-training-plan: ${error.message}`);
    }
    
    console.log("Respuesta de edge function recibida:", data);
    
    if (!data || !(data as any).plan) {
      console.error("La edge function devolvió una respuesta sin plan:", data);
      throw new Error("La edge function devolvió una respuesta incorrecta sin plan");
    }
    
    // 5. Process and return the plan
    const planData = (data as any).plan;
    console.log("Plan recibido:", planData);
    
    if (!planData.workouts || !Array.isArray(planData.workouts)) {
      console.error("El plan recibido no contiene workouts válidos:", planData);
      throw new Error("El formato del plan generado es incorrecto");
    }
    
    // Create workouts based on the plan
    const workouts: Workout[] = planData.workouts.map((workout: any) => ({
      id: uuidv4(),
      day: workout.day || "Día sin especificar",
      title: workout.title || "Entrenamiento sin título",
      description: workout.description || "Sin descripción",
      distance: workout.distance || null,
      duration: workout.duration || null,
      type: (workout.type || 'carrera') as 'carrera' | 'descanso' | 'fuerza' | 'flexibilidad' | 'otro',
      completed: false,
      actualDistance: null,
      actualDuration: null
    }));
    
    // Create the plan object
    const plan: WorkoutPlan = {
      id: uuidv4(),
      name: planData.name || "Plan de entrenamiento personalizado",
      description: planData.description || `Plan generado para ${userProfile.name}`,
      duration: planData.duration || "7 días",
      intensity: planData.intensity || "Adaptado a tu nivel",
      workouts: workouts,
      createdAt: new Date(),
      weekNumber: previousWeekResults ? (previousWeekResults.weekNumber + 1) : 1
    };
    
    // Try to save the plan - but don't fail if storage fails
    try {
      console.log("Intentando guardar plan en almacenamiento local...");
      // Store plan in local storage as fallback
      localStorage.setItem('current_training_plan', JSON.stringify(plan));
      console.log("Plan guardado correctamente en almacenamiento local");
    } catch (storageError) {
      console.warn("No se pudo guardar plan en almacenamiento local:", storageError);
    }
    
    return plan;
  } catch (error: any) {
    console.error('Error al generar el plan de entrenamiento:', error);
    throw error;
  }
};

/**
 * Loads the user's latest training plan
 * with fallback to local storage
 */
export const loadLatestPlan = async (): Promise<WorkoutPlan | null> => {
  try {
    // Verificar conexión a Supabase
    try {
      await supabase.auth.getSession();
      console.log("Conexión con Supabase verificada correctamente");
      offlineMode = false;
      connectionError = null;
    } catch (error: any) {
      console.error("Error al verificar sesión con Supabase:", error);
      offlineMode = true;
      connectionError = `Error de conexión con Supabase: ${error.message}`;
      
      // Try loading from localStorage as fallback
      try {
        const savedPlan = localStorage.getItem('current_training_plan');
        if (savedPlan) {
          console.log("Cargando plan desde almacenamiento local");
          return JSON.parse(savedPlan) as WorkoutPlan;
        }
      } catch (storageError) {
        console.warn("No se pudo cargar plan desde almacenamiento local:", storageError);
      }
      
      throw error;
    }
    
    // Try loading from localStorage first (faster)
    try {
      const savedPlan = localStorage.getItem('current_training_plan');
      if (savedPlan) {
        console.log("Cargando plan desde almacenamiento local");
        return JSON.parse(savedPlan) as WorkoutPlan;
      }
    } catch (storageError) {
      console.warn("No se pudo cargar plan desde almacenamiento local:", storageError);
    }
    
    return null;
  } catch (error: any) {
    console.error('Error al cargar el último plan:', error);
    throw error;
  }
};

/**
 * Updates a workout with actual results
 */
export const updateWorkoutResults = async (
  planId: string,
  workoutId: string,
  actualDistance: number | null,
  actualDuration: string | null
): Promise<WorkoutPlan | null> => {
  try {
    // Try loading the current plan from localStorage
    let plan: WorkoutPlan | null = null;
    try {
      const savedPlan = localStorage.getItem('current_training_plan');
      if (savedPlan) {
        plan = JSON.parse(savedPlan) as WorkoutPlan;
      }
    } catch (e) {
      console.warn("No se pudo cargar el plan desde almacenamiento local:", e);
    }
    
    if (!plan) return null;
    
    // Update the specific workout
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
    
    const updatedPlan: WorkoutPlan = {
      ...plan,
      workouts: updatedWorkouts
    };
    
    // Store updated plan in local storage
    try {
      localStorage.setItem('current_training_plan', JSON.stringify(updatedPlan));
    } catch (e) {
      console.warn("No se pudo guardar el plan actualizado en almacenamiento local:", e);
    }
    
    return updatedPlan;
  } catch (error: any) {
    console.error('Error updating workout results:', error);
    throw error;
  }
};

/**
 * Generate the next week's plan based on current results
 */
export const generateNextWeekPlan = async (currentPlan: WorkoutPlan): Promise<WorkoutPlan | null> => {
  try {
    // Get user profile from localStorage if available
    let userProfile: UserProfile | null = null;
    try {
      const savedProfile = localStorage.getItem('user_profile');
      if (savedProfile) {
        userProfile = JSON.parse(savedProfile) as UserProfile;
      }
    } catch (e) {
      console.warn("No se pudo cargar el perfil desde almacenamiento local:", e);
    }
    
    if (!userProfile) {
      // Create minimal user profile
      userProfile = {
        name: "Usuario",
        age: null,
        gender: null,
        height: null,
        weight: null,
        maxDistance: null,
        pace: null,
        goal: "Mejorar condición física",
        weeklyWorkouts: null,
        experienceLevel: null,
        injuries: "",
        completedOnboarding: true
      };
    }
    
    // Prepare the previous week results
    const previousWeekResults = {
      weekNumber: currentPlan.weekNumber || 1,
      workouts: currentPlan.workouts.map(w => ({
        day: w.day,
        title: w.title,
        completed: w.completed || false,
        plannedDistance: w.distance,
        actualDistance: w.actualDistance,
        plannedDuration: w.duration,
        actualDuration: w.actualDuration
      }))
    };
    
    // Generate new plan with the previous week results
    return generateTrainingPlan({ 
      userProfile,
      previousWeekResults
    });
  } catch (error: any) {
    console.error('Error generating next week plan:', error);
    throw error;
  }
};
