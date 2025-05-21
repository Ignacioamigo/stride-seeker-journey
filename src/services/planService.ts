
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, WorkoutPlan, Workout, TrainingPlanRequest, PreviousWeekResults } from '@/types';

// Variable to control offline mode
let offlineMode = false;
let connectionError: string | null = null;

/**
 * Generates a mock training plan for offline mode
 */
const generateMockPlan = (userProfile: UserProfile): WorkoutPlan => {
  console.log("Generating offline training plan for:", userProfile.name);
  
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const workoutTypes = ['carrera', 'fuerza', 'descanso', 'flexibilidad'] as const;
  
  // Determine how many training days the user needs
  const requestedWorkoutDays = userProfile.weeklyWorkouts || 3;
  
  // Create workouts based on user profile
  const workouts: Workout[] = [];
  
  // Distribute workout days evenly throughout the week
  let activeWorkoutCount = 0;
  
  for (let i = 0; i < daysOfWeek.length; i++) {
    const day = daysOfWeek[i];
    
    // Determine if this should be a workout day
    // We want exactly requestedWorkoutDays active days
    const shouldWorkout = activeWorkoutCount < requestedWorkoutDays && 
                          i % Math.ceil(7 / requestedWorkoutDays) === 0;
    
    if (shouldWorkout) {
      activeWorkoutCount++;
      
      // Alternate workout types for active days
      const workoutIndex = activeWorkoutCount % 3;
      const type = workoutIndex === 1 ? 'carrera' : 
                   workoutIndex === 2 ? 'fuerza' : 'flexibilidad';
      
      let distance = null;
      let duration = null;
      let targetPace = userProfile.pace || null;
      
      if (type === 'carrera') {
        // Based on experience level and max distance
        const maxDistance = userProfile.maxDistance || 5;
        const expFactor = userProfile.experienceLevel === 'principiante' ? 0.5 :
                          userProfile.experienceLevel === 'intermedio' ? 0.7 : 0.85;
        
        // Adapt distance based on goal
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
        
        // Calculate distance with factors and round to 1 decimal
        distance = Math.round((maxDistance * expFactor * goalFactor) * 10) / 10;
        
        // For marathon plans, ensure distance increases gradually
        if (goalLower.includes('maratón') && maxDistance > 15) {
          // Program a long run every 2 weeks
          const isLongRun = i === 5; // Long run on Saturday
          if (isLongRun) {
            distance = Math.round((maxDistance * 0.95) * 10) / 10;
          }
        }
        
        // Calculate duration based on user's pace
        if (userProfile.pace) {
          const [minutesPart, secondsPart] = userProfile.pace.split(':').map(Number);
          const paceInMinutes = minutesPart + (secondsPart || 0) / 60;
          duration = `${Math.round(distance * paceInMinutes)} min`;
        } else {
          // If no pace, basic estimation
          duration = `${Math.round(distance ? distance * 7 : 30)} min`;
        }
      } else if (type === 'fuerza') {
        duration = '30 min';
      } else if (type === 'flexibilidad') {
        duration = '20 min';
      }
      
      workouts.push({
        id: uuidv4(),
        day,
        title: type === 'carrera' ? `Carrera de ${distance} km` :
               type === 'fuerza' ? 'Entrenamiento de fuerza' :
               'Flexibilidad y movilidad',
        description: type === 'carrera' ? `Carrera a ritmo moderado (${userProfile.pace || 'tu ritmo cómodo'} min/km)` :
                     type === 'fuerza' ? 'Ejercicios de fuerza para mejorar tu rendimiento' :
                     'Sesión de estiramientos y movilidad',
        distance,
        duration,
        type,
        completed: false,
        actualDistance: null,
        actualDuration: null,
        targetPace
      });
    } else {
      // Rest day
      workouts.push({
        id: uuidv4(),
        day,
        title: 'Día de descanso',
        description: 'Descansa para recuperarte adecuadamente',
        distance: null,
        duration: null,
        type: 'descanso',
        completed: false,
        actualDistance: null,
        actualDuration: null,
        targetPace: null
      });
    }
  }
  
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
 * Function to check if we're in offline mode
 */
export const isOfflineMode = (): boolean => {
  return offlineMode || !navigator.onLine;
};

/**
 * Get the current connection error
 */
export const getConnectionError = (): string | null => {
  return connectionError;
};

/**
 * Function to upload a training document for RAG
 */
export const uploadTrainingDocument = async (file: File): Promise<boolean> => {
  try {
    console.log("Uploading document to enrich the RAG system:", file.name);
    
    if (!navigator.onLine) {
      console.error("No internet connection");
      offlineMode = true;
      connectionError = "No internet connection. The document cannot be uploaded in offline mode.";
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
    // Check if we're in offline mode
    if (isOfflineMode()) {
      offlineMode = true;
      
      // Create a summary of the previous week for context
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
      
      // Load user profile
      const savedUser = localStorage.getItem('runAdaptiveUser');
      if (!savedUser) {
        connectionError = "User profile not found";
        return null;
      }
      
      const userProfile = JSON.parse(savedUser);
      
      // Generate new plan
      const nextWeekPlan = generateMockPlan(userProfile);
      nextWeekPlan.weekNumber = (currentPlan.weekNumber || 1) + 1;
      
      // Adjust plan based on previous results
      // For example, if they completed all workouts, increase intensity
      const completedWorkouts = currentPlan.workouts.filter(w => w.completed && w.type !== 'descanso').length;
      const totalWorkouts = currentPlan.workouts.filter(w => w.type !== 'descanso').length;
      
      if (completedWorkouts / totalWorkouts > 0.8) {
        // Increase distance by 10%
        nextWeekPlan.workouts = nextWeekPlan.workouts.map(workout => {
          if (workout.distance) {
            const newDistance = Math.round((workout.distance * 1.1) * 10) / 10;
            return {
              ...workout,
              distance: newDistance,
              title: workout.type === 'carrera' ? `Carrera de ${newDistance} km` : workout.title
            };
          }
          return workout;
        });
      }
      
      await savePlan(nextWeekPlan);
      return nextWeekPlan;
    }
    
    // If we're online, use the API to generate the plan
    // Get the user profile
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
      console.log("No internet connection. Generating offline plan...");
      offlineMode = true;
      const mockPlan = generateMockPlan(request.userProfile);
      await savePlan(mockPlan);
      return mockPlan;
    }
    
    offlineMode = false;
    connectionError = null;
    
    // Try to get relevant fragments for RAG
    let relevantFragments: string[] = [];
    
    try {
      // RAG search based on user profile and goal
      const searchQuery = `${request.userProfile.goal} ${request.userProfile.experienceLevel} running training plan ${request.userProfile.maxDistance}km pace ${request.userProfile.pace}`;
      
      console.log("Looking for relevant fragments for RAG:", searchQuery);
      
      // First, convert the text query to an embedding
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
        body: { text: searchQuery }
      });
      
      if (embeddingError) {
        console.error("Error generating search embedding:", embeddingError);
      } else if (embeddingData && embeddingData.embedding) {
        // Now use the embedding for the search with the updated function parameters
        const { data, error } = await supabase.rpc('match_fragments', {
          query_embedding: embeddingData.embedding,
          match_threshold: 0.6,
          match_count: 5
        });
        
        if (error) {
          console.error("Error fetching relevant fragments:", error);
        } else if (data && data.length > 0) {
          relevantFragments = data.map((item: any) => item.content);
          console.log(`Found ${relevantFragments.length} relevant fragments for RAG`);
        }
      }
    } catch (ragError) {
      console.error("Error in RAG process:", ragError);
      // Continue without RAG if there's an error
    }
    
    // Call the Edge function to generate the plan
    console.log("Sending request to Edge function to generate plan...");
    
    // Include previous week's results if available
    const requestBody: any = {
      userProfile: {
        ...request.userProfile,
        // The embedding is needed for the fragments search inside the edge function
        embedding: request.userProfile.embedding || []
      },
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
      console.error("Error calling Edge function:", response.error);
      throw new Error(`Edge function error: ${response.error.message}`);
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
    connectionError = error.message || "Unknown error generating plan";
    
    // In case of error, generate an offline plan
    console.log("Generating offline plan due to error:", error.message);
    offlineMode = true;
    const mockPlan = generateMockPlan(request.userProfile);
    await savePlan(mockPlan);
    return mockPlan;
  }
};
