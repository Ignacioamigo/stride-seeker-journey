
import { createClient } from "@supabase/supabase-js";
import { TrainingPlanRequest, UserProfile, WorkoutPlan, Workout } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Supabase client setup with environment variables or fallbacks to localStorage
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('SUPABASE_URL') || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Offline detection and connection tracking
let _isOffline = false;
let _connectionError: string | null = null;

// Cache for in-memory storage when offline
const memoryCache = {
  plans: new Map<string, WorkoutPlan>(),
  latestPlanId: null as string | null,
};

export const isOfflineMode = () => _isOffline;
export const getConnectionError = () => _connectionError;

/**
 * Loads the latest training plan for the user
 */
export const loadLatestPlan = async (): Promise<WorkoutPlan | null> => {
  try {
    // Try to load from the database
    if (supabaseUrl && supabaseKey) {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw new Error(error.message);
      
      if (data && data.length > 0) {
        _isOffline = false;
        _connectionError = null;
        return data[0] as WorkoutPlan;
      }
    }
    
    // If no database plan, check memory cache
    if (memoryCache.latestPlanId) {
      const cachedPlan = memoryCache.plans.get(memoryCache.latestPlanId);
      if (cachedPlan) return cachedPlan;
    }
    
    // No plan found
    return null;
  } catch (error) {
    console.error("Error loading plan:", error);
    _isOffline = true;
    _connectionError = error.message;
    
    // Fallback to cached plan in memory if available
    if (memoryCache.latestPlanId) {
      const cachedPlan = memoryCache.plans.get(memoryCache.latestPlanId);
      if (cachedPlan) return cachedPlan;
    }
    
    return null;
  }
};

/**
 * Generates a new training plan based on user profile
 */
export const generateTrainingPlan = async ({ 
  userProfile 
}: TrainingPlanRequest): Promise<WorkoutPlan> => {
  try {
    console.log("Generating training plan for user:", userProfile.name);
    
    // Try with real API first
    if (supabaseUrl && supabaseKey && navigator.onLine) {
      try {
        // Call RAG-enabled function
        const { data, error } = await supabase.functions.invoke('generate-training-plan', {
          body: { 
            userProfile,
            useRAG: true // Ensuring RAG is always used
          }
        });
        
        if (error) throw new Error(error.message);
        
        if (data && data.plan) {
          // Store the plan in database
          const { error: saveError } = await supabase
            .from('training_plans')
            .insert([data.plan]);
          
          if (saveError) throw new Error(saveError.message);
          
          // Also cache locally
          const plan = data.plan as WorkoutPlan;
          memoryCache.plans.set(plan.id, plan);
          memoryCache.latestPlanId = plan.id;
          
          _isOffline = false;
          _connectionError = null;
          
          return plan;
        }
      } catch (apiError) {
        console.error("API error, falling back to offline mode:", apiError);
        _connectionError = apiError.message;
        throw apiError; // Re-throw to use fallback
      }
    }
    
    // Fallback to offline generation
    _isOffline = true;
    
    // Generate a simple offline plan
    const offlinePlan = generateOfflinePlan(userProfile);
    
    // Cache the plan
    memoryCache.plans.set(offlinePlan.id, offlinePlan);
    memoryCache.latestPlanId = offlinePlan.id;
    
    return offlinePlan;
  } catch (error) {
    console.error("Error generating plan:", error);
    _isOffline = true;
    _connectionError = error.message;
    
    // Generate a fallback plan
    const fallbackPlan = generateOfflinePlan(userProfile);
    
    // Cache the fallback plan
    memoryCache.plans.set(fallbackPlan.id, fallbackPlan);
    memoryCache.latestPlanId = fallbackPlan.id;
    
    return fallbackPlan;
  }
};

/**
 * Update workout with actual results
 */
export const updateWorkoutResults = async (
  planId: string,
  workoutId: string,
  actualDistance: number | null,
  actualDuration: string | null
): Promise<WorkoutPlan | null> => {
  // Find plan in cache
  const plan = memoryCache.plans.get(planId);
  
  if (!plan) return null;
  
  // Update the workout
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
  
  // Create updated plan
  const updatedPlan = {
    ...plan,
    workouts: updatedWorkouts
  };
  
  try {
    // Try to update in database if online
    if (supabaseUrl && supabaseKey && navigator.onLine) {
      const { error } = await supabase
        .from('training_plans')
        .update(updatedPlan)
        .eq('id', planId);
      
      if (error) throw new Error(error.message);
      
      _isOffline = false;
      _connectionError = null;
    } else {
      _isOffline = true;
    }
  } catch (error) {
    console.error("Error updating workout results:", error);
    _isOffline = true;
    _connectionError = error.message;
  }
  
  // Update the cache regardless of online status
  memoryCache.plans.set(planId, updatedPlan);
  
  return updatedPlan;
};

/**
 * Generates the next week's plan based on current plan
 */
export const generateNextWeekPlan = async (currentPlan: WorkoutPlan): Promise<WorkoutPlan | null> => {
  try {
    // Prepare next week data
    const nextWeekNumber = (currentPlan.weekNumber || 1) + 1;
    
    if (supabaseUrl && supabaseKey && navigator.onLine) {
      // Call the edge function to generate next week
      const { data, error } = await supabase.functions.invoke('generate-training-plan', {
        body: { 
          previousPlan: currentPlan,
          nextWeekNumber,
          useRAG: true // Ensuring RAG is always used
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (data && data.plan) {
        // Store the plan in database
        const { error: saveError } = await supabase
          .from('training_plans')
          .insert([data.plan]);
        
        if (saveError) throw new Error(saveError.message);
        
        // Also cache locally
        const plan = data.plan as WorkoutPlan;
        memoryCache.plans.set(plan.id, plan);
        memoryCache.latestPlanId = plan.id;
        
        _isOffline = false;
        _connectionError = null;
        
        return plan;
      }
    } else {
      throw new Error("No se puede generar el plan sin conexión");
    }
  } catch (error) {
    console.error("Error generating next week plan:", error);
    _isOffline = true || !navigator.onLine;
    _connectionError = error.message;
    return null;
  }
  
  return null;
};

/**
 * Saves embedding data to the database
 */
export const saveEmbedding = async (title: string, content: string, embedding: number[]) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not available');
    }
    
    // Create a unique ID for the document
    const id = uuidv4();
    
    // Insert the document into the fragments table - FIX: Converting embedding to string for storage
    const { error } = await supabase.from('fragments').insert([{
      id,
      content,
      metadata: { title },
      embedding: JSON.stringify(embedding) // Convert embedding array to string
    }]);
    
    if (error) throw new Error(`Error saving document: ${error.message}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error saving embedding:", error);
    return { success: false, error: error.message };
  }
};

// Offline fallback plan generator
const generateOfflinePlan = (userProfile: UserProfile): WorkoutPlan => {
  const planId = uuidv4();
  const workouts: Workout[] = [];
  
  // Create a simple plan based on user's experience level
  const workoutCount = userProfile.weeklyWorkouts || 3;
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  for (let i = 0; i < 7; i++) {
    if (i < workoutCount) {
      // Active workout days
      workouts.push({
        id: uuidv4(),
        day: days[i],
        title: i === 0 ? 'Carrera larga' : i === workoutCount - 1 ? 'Carrera de recuperación' : 'Entrenamiento de ritmo',
        description: `Día ${i + 1} de tu plan de entrenamiento semanal`,
        type: 'carrera',
        duration: i === 0 ? '45-60 min' : '30-40 min',
        distance: i === 0 ? 5 : 3,
        targetPace: userProfile.pace || '6:00',
        completed: false
      });
    } else {
      // Rest days
      workouts.push({
        id: uuidv4(),
        day: days[i],
        title: 'Descanso',
        description: 'Día de recuperación',
        type: 'descanso',
        completed: false
      });
    }
  }
  
  return {
    id: planId,
    name: `Plan de ${userProfile.experienceLevel === 'beginner' ? 'Principiante' : 
           userProfile.experienceLevel === 'intermediate' ? 'Intermedio' : 'Avanzado'}`,
    description: `Plan generado en modo offline para ${userProfile.goal || 'mejorar tu resistencia'}`,
    workouts,
    duration: '7 días',
    intensity: userProfile.experienceLevel === 'beginner' ? 'Baja' : 
               userProfile.experienceLevel === 'intermediate' ? 'Media' : 'Alta',
    weekNumber: 1
  };
};
