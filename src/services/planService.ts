
import { createClient } from "@supabase/supabase-js";
import { TrainingPlanRequest, UserProfile, WorkoutPlan, Workout } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client if both variables are available
let supabase = null;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Variables de entorno faltantes:", {
      VITE_SUPABASE_URL: Boolean(supabaseUrl),
      VITE_SUPABASE_ANON_KEY: Boolean(supabaseAnonKey)
    });
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Cliente Supabase inicializado correctamente");
  }
} catch (error) {
  console.error("Error al inicializar el cliente de Supabase:", error);
}

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
    if (!supabase) {
      console.error("Cliente Supabase no inicializado. Verifica las variables de entorno.");
      return [];
    }
    
    console.log("Generando embedding para el texto:", text.substring(0, 50) + "...");
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-embedding', {
        body: { text }
      });
      
      if (error) {
        console.error("Error en edge function generate-embedding:", error);
        return [];
      }
      
      console.log("Embedding generado correctamente");
      return data.embedding;
    } catch (e) {
      console.error("Error al invocar edge function:", e);
      return [];
    }
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
};

/**
 * Retrieves relevant training documents from the fragments table
 */
const retrieveRelevantFragments = async (embedding: number[], limit = 8): Promise<string[]> => {
  try {
    if (!supabase) {
      console.error("Cliente Supabase no inicializado. Verifica las variables de entorno.");
      return [];
    }
    
    if (!embedding || embedding.length === 0) {
      console.warn("No se proporcionó un embedding válido para la búsqueda");
      return [];
    }
    
    console.log("Buscando fragmentos relevantes con el embedding...");
    
    // Query the fragments table with vector similarity search
    try {
      const { data, error } = await supabase.rpc('match_fragments', {
        query_embedding: embedding,
        match_count: limit,
        match_threshold: 0.6
      });
      
      if (error) {
        console.error('Error al recuperar fragmentos con RPC:', error);
        console.log('Intentando consulta alternativa sin RPC...');
        
        // Try alternative query if RPC doesn't exist
        const altQuery = await supabase
          .from('fragments')
          .select('content')
          .order('embedding <-> $1', { ascending: true })
          .limit(limit);
        
        if (altQuery.error) {
          console.error('Error en consulta alternativa:', altQuery.error);
          return [];
        }
        
        console.log(`Recuperados ${altQuery.data?.length || 0} fragmentos con consulta alternativa`);
        return altQuery.data?.map((doc: any) => doc.content) || [];
      }
      
      console.log(`Recuperados ${data?.length || 0} fragmentos relevantes`);
      return data?.map((doc: any) => doc.content) || [];
    } catch (e) {
      console.error("Error en la consulta a la base de datos:", e);
      return [];
    }
  } catch (error) {
    console.error('Error retrieving fragments:', error);
    return [];
  }
};

/**
 * Uploads a training document and creates an embedding
 */
export const uploadTrainingDocument = async (title: string, content: string): Promise<void> => {
  try {
    if (!supabase) {
      throw new Error("Supabase client is not initialized. Please check your environment variables.");
    }
    
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
    if (!supabase) {
      console.error("Cliente Supabase no inicializado. Verifica las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
      throw new Error("Supabase client is not initialized");
    }
    
    // 1. Create a query from the user profile
    const query = createUserProfileSummary(userProfile);
    console.log("Creado resumen de perfil de usuario para consulta:", query);
    
    // 2. Generate embedding for the query
    console.log("Generando embedding para la consulta...");
    let embedding = [];
    try {
      embedding = await generateEmbedding(query);
      console.log("Embedding generado correctamente, longitud:", embedding.length);
    } catch (embeddingError) {
      console.error("Error al generar embedding, continuando sin contexto RAG:", embeddingError);
    }
    
    // 3. Retrieve relevant fragments (if embedding was successful)
    let relevantFragments: string[] = [];
    if (embedding && embedding.length > 0) {
      try {
        relevantFragments = await retrieveRelevantFragments(embedding);
        console.log("Fragmentos relevantes recuperados:", relevantFragments.length);
      } catch (fragmentError) {
        console.error("Error al recuperar fragmentos, continuando sin contexto RAG:", fragmentError);
      }
    }
    
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
      throw new Error(`Error en edge function: ${error.message || JSON.stringify(error)}`);
    }
    
    console.log("Respuesta de edge function recibida:", data);
    
    if (!data || !data.plan) {
      console.error("La edge function devolvió una respuesta sin plan:", data);
      throw new Error("La respuesta del servidor no contiene un plan");
    }
    
    // 5. Process and return the plan
    const planData = data.plan;
    console.log("Plan recibido:", planData);
    
    if (!planData.workouts || !Array.isArray(planData.workouts)) {
      console.error("El plan recibido no contiene workouts válidos:", planData);
      throw new Error("El plan recibido tiene un formato inválido");
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
        const userResponse = await supabase.auth.getUser();
        userId = userResponse.data.user?.id || 'anonymous';
      } catch (authError) {
        console.warn("No se pudo obtener el usuario autenticado, usando ID anónimo:", authError);
      }
      
      await supabase.from('training_plans').insert([{
        id: plan.id,
        user_id: userId,
        plan_data: plan,
        week_number: plan.weekNumber
      }]);
      
      console.log("Plan guardado correctamente");
    } catch (saveError) {
      console.error("Error al guardar plan en la base de datos:", saveError);
      // Continue anyway as we have the plan data already
    }
    
    // Save to localStorage as backup
    try {
      localStorage.setItem('last-training-plan', JSON.stringify(plan));
      console.log("Plan guardado en localStorage como respaldo");
    } catch (localStorageError) {
      console.warn("No se pudo guardar el plan en localStorage:", localStorageError);
    }
    
    return plan;
  } catch (error) {
    console.error('Error al generar el plan de entrenamiento:', error);
    throw error;
  }
};

/**
 * Loads the user's latest training plan
 */
export const loadLatestPlan = async (): Promise<WorkoutPlan | null> => {
  try {
    // Try to get plan from localStorage first
    const localPlan = localStorage.getItem('last-training-plan');
    if (localPlan) {
      console.log("Plan encontrado en localStorage");
      return JSON.parse(localPlan);
    }
    
    if (!supabase) {
      console.error("Cliente Supabase no inicializado. Verifica las variables de entorno.");
      return null;
    }
    
    console.log("Intentando cargar el último plan de entrenamiento desde Supabase...");
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        console.log("No hay usuario autenticado, no se puede cargar plan desde Supabase");
        return null;
      }
      
      const { data, error } = await supabase
        .from('training_plans')
        .select('plan_data')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error al consultar la base de datos:", error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.log("No se encontró ningún plan guardado en Supabase");
        return null;
      }
      
      console.log("Plan cargado correctamente desde Supabase");
      
      // Save to localStorage as backup
      try {
        localStorage.setItem('last-training-plan', JSON.stringify(data[0].plan_data));
      } catch (e) {
        console.warn("No se pudo guardar el plan en localStorage:", e);
      }
      
      return data[0].plan_data as WorkoutPlan;
    } catch (e) {
      console.error("Error al cargar el plan desde Supabase:", e);
      return null;
    }
  } catch (error) {
    console.error('Error al cargar el último plan:', error);
    return null;
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
    if (!supabase) {
      console.error("Supabase client is not initialized. Check your environment variables.");
      return null;
    }
    
    // Get the current plan
    const { data: planData, error: planError } = await supabase
      .from('training_plans')
      .select('plan_data')
      .eq('id', planId)
      .single();
    
    if (planError) throw planError;
    
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
    const { error: updateError } = await supabase
      .from('training_plans')
      .update({ plan_data: updatedPlan })
      .eq('id', planId);
    
    if (updateError) throw updateError;
    
    return updatedPlan;
  } catch (error) {
    console.error('Error updating workout results:', error);
    return null;
  }
};

/**
 * Generate the next week's plan based on current results
 */
export const generateNextWeekPlan = async (currentPlan: WorkoutPlan): Promise<WorkoutPlan | null> => {
  try {
    if (!supabase) {
      console.error("Supabase client is not initialized. Check your environment variables.");
      return null;
    }
    
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;
    
    // Get the user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();
    
    if (!profileData) return null;
    
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
    return null;
  }
};
