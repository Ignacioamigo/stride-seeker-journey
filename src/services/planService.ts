
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, WorkoutPlan, Workout, TrainingPlanRequest, PreviousWeekResults } from '@/types';

// Variable para controlar errores de conexión
let connectionError: string | null = null;

/**
 * Function to get the current connection error
 */
export const getConnectionError = (): string | null => {
  return connectionError;
};

/**
 * Function to check if we're in offline mode
 */
export const isOfflineMode = (): boolean => {
  return !navigator.onLine;
};

/**
 * Function to upload a training document for RAG
 */
export const uploadTrainingDocument = async (file: File): Promise<boolean> => {
  try {
    console.log("Uploading document to enrich the RAG system:", file.name);
    
    if (!navigator.onLine) {
      console.error("No internet connection");
      connectionError = "No internet connection. The document cannot be uploaded without conexión a internet.";
      return false;
    }
    
    // Read the file content
    const fileContent = await file.text();
    
    // Upload the document to Supabase for RAG processing
    const { data, error } = await supabase.functions.invoke('generate-embedding', {
      body: { text: fileContent, metadata: { filename: file.name } }
    });
    
    if (error) {
      console.error("Error generating embedding for RAG:", error);
      connectionError = `Error processing document: ${error.message}`;
      return false;
    }
    
    console.log("Document processed and stored successfully for RAG");
    return true;
  } catch (error) {
    console.error("Error uploading document:", error);
    connectionError = `Unexpected error: ${error.message}`;
    return false;
  }
};

/**
 * Saves the training plan in local storage
 */
export const savePlan = async (plan: WorkoutPlan): Promise<void> => {
  try {
    localStorage.setItem('savedPlan', JSON.stringify(plan));
  } catch (error) {
    console.error("Error saving plan:", error);
  }
};

/**
 * Removes the saved plan
 */
export const removeSavedPlan = (): void => {
  try {
    localStorage.removeItem('savedPlan');
  } catch (error) {
    console.error("Error removing saved plan:", error);
  }
};

/**
 * Loads the latest saved plan
 */
export const loadLatestPlan = async (): Promise<WorkoutPlan | null> => {
  try {
    const savedPlan = localStorage.getItem('savedPlan');
    if (savedPlan) {
      return JSON.parse(savedPlan);
    }
    return null;
  } catch (error) {
    console.error("Error loading plan:", error);
    return null;
  }
};

/**
 * Updates the results of a specific workout
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
    console.error("Error updating workout results:", error);
    return null;
  }
};

/**
 * Generates a plan for the next week
 */
export const generateNextWeekPlan = async (currentPlan: WorkoutPlan): Promise<WorkoutPlan | null> => {
  try {
    // Load user profile
    const savedUser = localStorage.getItem('runAdaptiveUser');
    if (!savedUser) {
      connectionError = "User profile not found";
      return null;
    }
    
    const userProfile = JSON.parse(savedUser);
    
    // Create a summary of the previous week
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
    
    // Call the API with previous results
    try {
      const nextWeekPlan = await generateTrainingPlan({
        userProfile,
        previousWeekResults
      });
      
      // Update week number
      nextWeekPlan.weekNumber = (currentPlan.weekNumber || 1) + 1;
      
      await savePlan(nextWeekPlan);
      return nextWeekPlan;
    } catch (error) {
      console.error("Error generating next week's plan:", error);
      connectionError = `Error de conexión: ${error.message}. Por favor, verifica tu conexión a Internet e inténtalo de nuevo.`;
      return null;
    }
  } catch (error) {
    console.error("Error generating next week's plan:", error);
    connectionError = `Error: ${error.message}`;
    return null;
  }
};

/**
 * Generates a personalized training plan
 */
export const generateTrainingPlan = async (request: TrainingPlanRequest): Promise<WorkoutPlan> => {
  try {
    console.log("Starting training plan generation...");
    
    if (!navigator.onLine) {
      connectionError = "No hay conexión a Internet. Por favor, conéctate a Internet para generar un plan de entrenamiento.";
      throw new Error("No hay conexión a Internet. Por favor, conéctate para generar un plan de entrenamiento.");
    }
    
    connectionError = null;
    
    // Instead of searching for fragments in the database (which is causing errors),
    // we'll directly call the edge function
    
    // Call the Edge function to generate the plan
    console.log("Sending request to Edge function to generate plan...");
    
    // Include previous week's results if available
    const requestBody: any = {
      userProfile: request.userProfile,
    };
    
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
      console.error("Error calling Edge function:", response.error);
      throw new Error(`Error de conexión con el servidor: ${response.error.message}`);
    }
    
    console.log("Training plan received from Edge function");
    
    // Create the plan with UUID
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
    
    // Ensure only the requested training days are included
    // And that user parameters are respected
    const weeklyWorkouts = request.userProfile.weeklyWorkouts || 3;
    
    // Adjust training days to the number specified by the user
    const activeWorkouts = plan.workouts.filter(w => w.type !== 'descanso');
    
    // If there are more active workouts than requested, convert some to rest
    if (activeWorkouts.length > weeklyWorkouts) {
      // Ordenar por prioridad: Mantener carreras largas, luego fuerza, luego flexibilidad
      activeWorkouts.sort((a, b) => {
        // Priorizar mantener carreras con mayor distancia
        if (a.type === 'carrera' && b.type === 'carrera') {
          return (b.distance || 0) - (a.distance || 0);
        }
        // Priority: carrera > fuerza > flexibilidad
        const typePriority = { 'carrera': 3, 'fuerza': 2, 'flexibilidad': 1 };
        return typePriority[b.type as keyof typeof typePriority] - typePriority[a.type as keyof typeof typePriority];
      });
      
      // Mantener solo los entrenamientos prioritarios
      const workoutsToKeep = activeWorkouts.slice(0, weeklyWorkouts).map(w => w.id);
      
      // Update workouts by converting non-priority ones to rest
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
    
    // Save the generated plan
    await savePlan(plan);
    
    return plan;
  } catch (error) {
    console.error("Error generating training plan:", error);
    connectionError = error.message || "Error desconocido generando el plan";
    throw error;
  }
};
