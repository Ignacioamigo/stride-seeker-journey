import { createClient } from "@supabase/supabase-js";
import { TrainingPlanRequest, UserProfile, WorkoutPlan, Workout } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Initialize Supabase client with error checking
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
let supabase;
try {
  if (!supabaseUrl) {
    console.error("Supabase URL is not defined in environment variables");
  }
  if (!supabaseAnonKey) {
    console.error("Supabase Anon Key is not defined in environment variables");
  }
  
  // Only create client if both variables are available
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
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
      throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    
    const { data, error } = await supabase.functions.invoke('generate-embedding', {
      body: { text }
    });
    
    if (error) throw new Error(error.message);
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

/**
 * Retrieves relevant training documents
 */
const retrieveRelevantDocuments = async (embedding: number[], limit = 5): Promise<string[]> => {
  try {
    if (!supabase) {
      throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_count: limit,
      match_threshold: 0.5
    });
    
    if (error) throw error;
    return data.map((doc: any) => doc.content);
  } catch (error) {
    console.error('Error retrieving documents:', error);
    // Return empty array if no matches (this can happen during initial setup)
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
    
    // Create a unique ID for the document
    const id = uuidv4();
    
    // Insert the document into the training_documents table
    const { error } = await supabase.from('training_documents').insert([{
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
export const generateTrainingPlan = async ({ userProfile }: TrainingPlanRequest): Promise<WorkoutPlan> => {
  try {
    if (!supabase) {
      throw new Error("Supabase client is not initialized. Please check your environment variables.");
    }
    
    // 1. Create a query from the user profile
    const query = createUserProfileSummary(userProfile);
    
    // 2. Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    // 3. Retrieve relevant documents
    const relevantDocs = await retrieveRelevantDocuments(embedding);
    
    // 4. Call Gemini with the context to generate a plan
    const { data, error } = await supabase.functions.invoke('generate-training-plan', {
      body: { 
        userProfile, 
        context: relevantDocs.join('\n\n'),
      }
    });
    
    if (error) throw new Error(error.message);
    
    // 5. Process and return the plan
    const planData = data.plan;
    
    // Create workouts based on the plan
    const workouts: Workout[] = planData.workouts.map((workout: any) => ({
      id: uuidv4(),
      day: workout.day,
      title: workout.title,
      description: workout.description,
      distance: workout.distance,
      duration: workout.duration,
      type: workout.type || 'carrera'
    }));
    
    // Create the plan object
    const plan: WorkoutPlan = {
      id: uuidv4(),
      name: planData.name || "Plan de entrenamiento personalizado",
      description: planData.description || `Plan generado para ${userProfile.name}`,
      duration: planData.duration || "7 días",
      intensity: planData.intensity || "Adaptado a tu nivel",
      workouts: workouts,
      createdAt: new Date()
    };
    
    // Save the plan to Supabase for future reference
    await supabase.from('training_plans').insert([{
      id: plan.id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      plan_data: plan
    }]);
    
    return plan;
  } catch (error) {
    console.error('Error generating training plan:', error);
    throw error;
  }
};

/**
 * Loads the user's latest training plan
 */
export const loadLatestPlan = async (): Promise<WorkoutPlan | null> => {
  try {
    if (!supabase) {
      console.error("Supabase client is not initialized. Check your environment variables.");
      return null;
    }
    
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) return null;
    
    const { data, error } = await supabase
      .from('training_plans')
      .select('plan_data')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    if (!data || data.length === 0) return null;
    
    return data[0].plan_data as WorkoutPlan;
  } catch (error) {
    console.error('Error loading latest plan:', error);
    return null;
  }
};
