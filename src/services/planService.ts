import { createClient } from "@supabase/supabase-js";
import { TrainingPlanRequest, UserProfile, WorkoutPlan, Workout } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Variables para controlar el estado de Supabase
let supabase = null;
let offlineMode = false;
let connectionError = null;

/**
 * Intenta inicializar el cliente de Supabase
 * Si falla, activa el modo offline
 */
const initSupabaseClient = () => {
  // Si ya tenemos una instancia o estamos en modo offline, devolver el estado actual
  if (supabase) return supabase;
  if (offlineMode) throw new Error(connectionError);
  
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Verificar variables de entorno
    if (!supabaseUrl || !supabaseAnonKey) {
      connectionError = "No se detectaron las variables de entorno de Supabase. La aplicación funcionará en modo offline.";
      console.warn(connectionError);
      offlineMode = true;
      throw new Error(connectionError);
    }
    
    // Inicializar cliente
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Cliente Supabase inicializado correctamente");
    return supabase;
  } catch (error) {
    if (!connectionError) {
      connectionError = `No se pudo inicializar el cliente de Supabase: ${error.message}`;
    }
    console.error(connectionError);
    offlineMode = true;
    throw new Error(connectionError);
  }
};

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
  const workoutTypes = ['carrera', 'fuerza', 'descanso', 'flexibilidad'];
  
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
      duration: type === 'carrera' ? `${Math.round(distance * 7)} min` :
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
 */
const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    // Inicializar el cliente de Supabase
    const client = initSupabaseClient();
    
    console.log("Generando embedding para el texto:", text.substring(0, 50) + "...");
    
    try {
      const { data, error } = await client.functions.invoke('generate-embedding', {
        body: { text }
      });
      
      if (error) {
        console.error("Error en edge function generate-embedding:", error);
        throw new Error(`Error en generate-embedding: ${error.message}`);
      }
      
      if (!data || !data.embedding) {
        throw new Error("No se recibió un embedding válido de la edge function");
      }
      
      console.log("Embedding generado correctamente");
      return data.embedding;
    } catch (e) {
      console.error("Error al invocar edge function:", e);
      throw new Error(`Error al invocar generate-embedding: ${e.message}`);
    }
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

/**
 * Retrieves relevant training documents from the fragments table
 */
const retrieveRelevantFragments = async (embedding: number[], limit = 8): Promise<string[]> => {
  try {
    // Inicializar el cliente de Supabase
    const client = initSupabaseClient();
    
    if (!embedding || embedding.length === 0) {
      throw new Error("No se proporcionó un embedding válido para la búsqueda");
    }
    
    console.log("Buscando fragmentos relevantes con el embedding...");
    
    // Query the fragments table with vector similarity search
    try {
      const { data, error } = await client.rpc('match_fragments', {
        query_embedding: embedding,
        match_count: limit,
        match_threshold: 0.6
      });
      
      if (error) {
        console.error('Error al recuperar fragmentos con RPC:', error);
        console.log('Intentando consulta alternativa sin RPC...');
        
        // Try alternative query if RPC doesn't exist
        const altQuery = await client
          .from('fragments')
          .select('content')
          .order('embedding <-> $1', { ascending: true })
          .limit(limit);
        
        if (altQuery.error) {
          console.error('Error en consulta alternativa:', altQuery.error);
          throw new Error(`Error en consulta de fragmentos: ${altQuery.error.message}`);
        }
        
        console.log(`Recuperados ${altQuery.data?.length || 0} fragmentos con consulta alternativa`);
        return altQuery.data?.map((doc: any) => doc.content) || [];
      }
      
      console.log(`Recuperados ${data?.length || 0} fragmentos relevantes`);
      return data?.map((doc: any) => doc.content) || [];
    } catch (e) {
      console.error("Error en la consulta a la base de datos:", e);
      throw new Error(`Error en la consulta a la base de datos: ${e.message}`);
    }
  } catch (error) {
    console.error('Error retrieving fragments:', error);
    throw error;
  }
};

/**
 * Uploads a training document and creates an embedding
 */
export const uploadTrainingDocument = async (title: string, content: string): Promise<void> => {
  try {
    // Inicializar el cliente de Supabase
    const client = initSupabaseClient();
    
    // First, generate an embedding for the document
    const embedding = await generateEmbedding(content);
    
    if (!embedding || embedding.length === 0) {
      throw new Error("No se pudo generar el embedding para el documento");
    }
    
    // Create a unique ID for the document
    const id = uuidv4();
    
    // Insert the document into the fragments table
    const { error } = await client.from('fragments').insert([{
      id,
      title,
      content,
      embedding
    }]);
    
    if (error) throw new Error(`Error saving document: ${error.message}`);
    
    console.log(`Document "${title}" uploaded successfully with ID: ${id}`);
  } catch (error) {
    console.error('Error uploading training document:', error);
    throw error;
  }
};

/**
 * Generates a training plan using RAG and Gemini
 */
export const generateTrainingPlan = async ({ userProfile, previousWeekResults }: TrainingPlanRequest): Promise<WorkoutPlan> => {
  try {
    // Intentar inicializar Supabase
    try {
      initSupabaseClient();
    } catch (error) {
      // Si estamos en modo offline, generar plan mock
      if (offlineMode) {
        console.log("Generando plan en modo offline debido a:", error.message);
        return generateMockPlan(userProfile);
      }
      throw error; // Si no es por modo offline, propagar el error
    }
    
    // Si llegamos aquí, tenemos conexión a Supabase - continuar con el código original
    try {
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
      const { data, error } = await client.functions.invoke('generate-training-plan', {
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
      
      if (!data || !data.plan) {
        console.error("La edge function devolvió una respuesta sin plan:", data);
        throw new Error("La edge function devolvió una respuesta incorrecta sin plan");
      }
      
      // 5. Process and return the plan
      const planData = data.plan;
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
        type: workout.type || 'carrera',
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
      
      // Save the plan to Supabase for future reference
      try {
        console.log("Guardando plan en Supabase...");
        
        // Use anonymous ID if not authenticated
        let userId = 'anonymous';
        try {
          const userResponse = await client.auth.getUser();
          userId = userResponse.data.user?.id || 'anonymous';
        } catch (authError) {
          console.warn("No se pudo obtener el usuario autenticado, usando ID anónimo:", authError);
        }
        
        await client.from('training_plans').insert([{
          id: plan.id,
          user_id: userId,
          plan_data: plan,
          week_number: plan.weekNumber
        }]);
        
        console.log("Plan guardado correctamente");
      } catch (saveError) {
        console.error("Error al guardar plan en la base de datos:", saveError);
        throw new Error(`Error al guardar el plan: ${saveError.message}`);
      }
      
      return plan;
    } catch (error) {
      console.error('Error al generar el plan de entrenamiento:', error);
      throw error; // Re-throw for proper handling in Plan.tsx
    }
  } catch (error) {
    console.error('Error al generar el plan de entrenamiento:', error);
    throw error; // Re-throw for proper handling in Plan.tsx
  }
};

/**
 * Loads the user's latest training plan
 */
export const loadLatestPlan = async (): Promise<WorkoutPlan | null> => {
  try {
    // Intentar inicializar Supabase
    try {
      initSupabaseClient();
    } catch (error) {
      // Si estamos en modo offline, devolver null (no hay planes guardados)
      if (offlineMode) {
        console.log("No se pueden cargar planes en modo offline");
        return null;
      }
      throw error;
    }
    
    // Si llegamos aquí, tenemos conexión a Supabase - continuar con el código original
    try {
      const { data: user } = await client.auth.getUser();
      
      if (!user.user) {
        console.log("No hay usuario autenticado, no se puede cargar plan desde Supabase");
        return null;
      }
      
      const { data, error } = await client
        .from('training_plans')
        .select('plan_data')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error al consultar la base de datos:", error);
        throw new Error(`Error al consultar training_plans: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        console.log("No se encontró ningún plan guardado en Supabase");
        return null;
      }
      
      console.log("Plan cargado correctamente desde Supabase");
      return data[0].plan_data as WorkoutPlan;
    } catch (e) {
      console.error("Error al cargar el plan desde Supabase:", e);
      throw new Error(`Error al cargar plan desde Supabase: ${e.message}`);
    }
  } catch (error) {
    console.error('Error al cargar el último plan:', error);
    throw error; // Re-throw for proper handling in Plan.tsx
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
    // En modo offline, simular actualización localmente
    if (offlineMode) {
      // Aquí podríamos implementar almacenamiento local con localStorage
      console.log("Actualizando workout en modo offline:", { planId, workoutId, actualDistance, actualDuration });
      throw new Error("La actualización de workouts no está disponible en modo offline");
    }
    
    // Intentar inicializar Supabase
    initSupabaseClient();
    
    // Si llegamos aquí, tenemos conexión a Supabase - continuar con el código original
    try {
      // Get the current plan
      const { data: planData, error: planError } = await client
        .from('training_plans')
        .select('plan_data')
        .eq('id', planId)
        .single();
      
      if (planError) throw new Error(`Error al obtener plan: ${planError.message}`);
      
      if (!planData) return null;
      
      const plan = planData.plan_data as WorkoutPlan;
      
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
      
      // Save the updated plan
      const { error: updateError } = await client
        .from('training_plans')
        .update({ plan_data: updatedPlan })
        .eq('id', planId);
      
      if (updateError) throw new Error(`Error al actualizar plan: ${updateError.message}`);
      
      return updatedPlan;
    } catch (error) {
      console.error('Error updating workout results:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating workout results:', error);
    throw error;
  }
};

/**
 * Generate the next week's plan based on current results
 */
export const generateNextWeekPlan = async (currentPlan: WorkoutPlan): Promise<WorkoutPlan | null> => {
  try {
    // En modo offline, generar siguiente semana localmente
    if (offlineMode) {
      const mockUserProfile: UserProfile = {
        name: currentPlan.name.split(' ')[3] || "Usuario",
        experienceLevel: currentPlan.intensity === "Alta" ? "avanzado" : 
                        currentPlan.intensity === "Media" ? "intermedio" : "principiante",
        goal: "Mejorar rendimiento",
        completedOnboarding: true
      };
      
      const nextWeekPlan = generateMockPlan(mockUserProfile);
      nextWeekPlan.weekNumber = (currentPlan.weekNumber || 1) + 1;
      nextWeekPlan.name = `Plan de entrenamiento para ${mockUserProfile.name} (Offline - Semana ${nextWeekPlan.weekNumber})`;
      
      return nextWeekPlan;
    }
    
    // Intentar inicializar Supabase
    initSupabaseClient();
    
    // Si llegamos aquí, tenemos conexión a Supabase - continuar con el código original
    try {
      // Get current user
      const { data: userData } = await client.auth.getUser();
      if (!userData.user) {
        throw new Error("Usuario no autenticado");
      }
      
      // Get the user profile
      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();
      
      if (profileError) {
        throw new Error(`Error al obtener perfil: ${profileError.message}`);
      }
      
      if (!profileData) {
        throw new Error("Perfil de usuario no encontrado");
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
        userProfile: profileData as UserProfile,
        previousWeekResults
      });
    } catch (error) {
      console.error('Error generating next week plan:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error generating next week plan:', error);
    throw error;
  }
};
