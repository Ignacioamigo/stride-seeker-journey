
import { WorkoutPlan, Workout, TrainingPlanRequest, UserProfile, PreviousWeekResults } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const PLAN_STORAGE_KEY = "runapp_current_plan";
const OFFLINE_MODE_KEY = "runapp_offline_mode";
const CONNECTION_ERROR_KEY = "runapp_connection_error";

/**
 * Checks if the app is in offline mode
 */
export const isOfflineMode = (): boolean => {
  const offlineMode = localStorage.getItem(OFFLINE_MODE_KEY);
  return offlineMode === "true";
};

/**
 * Gets the last connection error
 */
export const getConnectionError = (): string | null => {
  return localStorage.getItem(CONNECTION_ERROR_KEY);
};

/**
 * Sets the connection error message
 */
const setConnectionError = (error: string | null): void => {
  if (error) {
    localStorage.setItem(CONNECTION_ERROR_KEY, error);
  } else {
    localStorage.removeItem(CONNECTION_ERROR_KEY);
  }
};

/**
 * Sets offline mode
 */
const setOfflineMode = (offline: boolean): void => {
  localStorage.setItem(OFFLINE_MODE_KEY, offline.toString());
};

/**
 * Saves the current training plan to local storage
 */
export const savePlan = async (plan: WorkoutPlan): Promise<WorkoutPlan> => {
  localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
  return plan;
};

/**
 * Removes the saved plan from local storage
 */
export const removeSavedPlan = (): void => {
  localStorage.removeItem(PLAN_STORAGE_KEY);
};

/**
 * Loads the most recent training plan
 */
export const loadLatestPlan = async (): Promise<WorkoutPlan | null> => {
  try {
    // First try to load from local storage
    const storedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
    if (storedPlan) {
      return JSON.parse(storedPlan);
    }

    if (!navigator.onLine) {
      setOfflineMode(true);
      setConnectionError("No internet connection. Using offline mode.");
      return null;
    }

    setOfflineMode(false);

    // If not in local storage and online, try to get from database
    const { data, error } = await supabase
      .from('training_plans')
      .select(`
        *,
        training_sessions:training_sessions(*)
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching plan from database:", error);
      throw error;
    }

    if (!data) return null;

    // Transform data to match our WorkoutPlan type
    const workoutPlan: WorkoutPlan = {
      id: data.id,
      name: data.name,
      description: data.description || "",
      duration: data.duration || "",
      intensity: data.intensity || "",
      createdAt: new Date(data.created_at),
      weekNumber: data.week_number || 1,
      // Fixed: Use a boolean value for ragActive instead of trying to access rag_active
      // which might not exist in the database response
      ragActive: false, // Default to false since this field doesn't exist in the database
      workouts: data.training_sessions.map((session: any) => ({
        id: session.id,
        day: getDayName(session.day_number),
        date: session.day_date,
        title: session.title,
        description: session.description || "",
        distance: session.planned_distance,
        duration: session.planned_duration,
        type: session.type,
        completed: session.completed || false,
        actualDistance: session.actual_distance,
        actualDuration: session.actual_duration,
        targetPace: session.target_pace
      }))
    };

    // Cache the plan in local storage
    await savePlan(workoutPlan);
    return workoutPlan;
  } catch (error) {
    console.error("Error loading plan:", error);
    setOfflineMode(true);
    setConnectionError(error.message || "Error connecting to server");
    return null;
  }
};

/**
 * Generates a training plan based on user profile
 */
export const generateTrainingPlan = async (
  request: TrainingPlanRequest
): Promise<WorkoutPlan> => {
  try {
    // Create a plan locally first
    const localPlan: WorkoutPlan = {
      id: uuidv4(),
      name: `Plan de entrenamiento de ${request.userProfile.name}`,
      description: `Plan personalizado basado en tu nivel (${request.userProfile.experienceLevel || "intermedio"}) y objetivo: ${request.userProfile.goal}`,
      duration: "4 semanas",
      intensity: request.userProfile.experienceLevel === "principiante" ? "Baja" : request.userProfile.experienceLevel === "intermedio" ? "Media" : "Alta",
      workouts: [],
      createdAt: new Date(),
      weekNumber: 1,
      ragActive: false
    };

    if (!navigator.onLine) {
      setOfflineMode(true);
      setConnectionError("No internet connection. Using offline mode.");
      
      // Create a basic offline plan
      const offlinePlan = createOfflinePlan(request.userProfile);
      await savePlan(offlinePlan);
      return offlinePlan;
    }

    setOfflineMode(false);
    setConnectionError(null);

    // Call the API to generate a training plan
    const response = await fetch("/api/generate-training-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error generating training plan:", errorText);
      throw new Error(`Error generating training plan: ${response.status} ${errorText}`);
    }

    const apiPlan = await response.json();
    await savePlan(apiPlan);
    return apiPlan;
  } catch (error) {
    console.error("Error generating plan:", error);
    setOfflineMode(true);
    setConnectionError(error.message || "Error connecting to server");
    
    // Create a basic offline plan
    const offlinePlan = createOfflinePlan(request.userProfile);
    await savePlan(offlinePlan);
    return offlinePlan;
  }
};

/**
 * Creates a basic offline training plan
 */
const createOfflinePlan = (userProfile: UserProfile): WorkoutPlan => {
  // Generate dates for the week, starting from today
  const today = new Date();
  const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  
  const workouts: Workout[] = [];
  
  // Create a basic plan with 3-5 workouts per week
  const workoutsPerWeek = userProfile.weeklyWorkouts || 3;
  
  // Calculate rest days
  const restDays = 7 - workoutsPerWeek;
  const restDayIndices = new Set();
  
  // Distribute rest days relatively evenly
  while (restDayIndices.size < restDays) {
    const index = Math.floor(Math.random() * 7);
    restDayIndices.add(index);
  }
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + ((i - today.getDay() + 7) % 7));
    
    const isRestDay = restDayIndices.has(i);
    
    workouts.push({
      id: uuidv4(),
      day: weekDays[i],
      date: date.toISOString().split('T')[0],
      title: isRestDay ? "Día de descanso" : `Entrenamiento de ${userProfile.experienceLevel === "principiante" ? "base" : "resistencia"}`,
      description: isRestDay 
        ? "Descansa y recupera energías. Puedes hacer estiramientos suaves."
        : `Continúa con tu plan de entrenamiento para lograr tu objetivo: ${userProfile.goal}`,
      distance: isRestDay ? null : userProfile.maxDistance ? Math.min(userProfile.maxDistance * 0.7, 5) : 3,
      duration: isRestDay ? null : "30min",
      type: isRestDay ? "descanso" : "carrera",
      completed: false
    });
  }
  
  return {
    id: uuidv4(),
    name: `Plan de entrenamiento de ${userProfile.name} (offline)`,
    description: `Plan básico generado en modo offline. Sincroniza tu app para obtener un plan personalizado completo.`,
    duration: "1 semana",
    intensity: userProfile.experienceLevel || "intermedia",
    workouts,
    createdAt: new Date(),
    weekNumber: 1,
    ragActive: false
  };
};

/**
 * Generates the next week's training plan
 */
export const generateNextWeekPlan = async (currentPlan: WorkoutPlan): Promise<WorkoutPlan | null> => {
  try {
    if (!navigator.onLine) {
      setOfflineMode(true);
      setConnectionError("No internet connection. Cannot generate next week plan in offline mode.");
      return null;
    }

    setOfflineMode(false);
    setConnectionError(null);

    // Calculate previous week results
    const previousWeekResults: PreviousWeekResults = {
      weekNumber: currentPlan.weekNumber || 1,
      workouts: currentPlan.workouts.map(w => ({
        day: w.day,
        title: w.title,
        completed: w.completed || false,
        plannedDistance: w.distance,
        actualDistance: w.actualDistance || null,
        plannedDuration: w.duration || null,
        actualDuration: w.actualDuration || null,
      }))
    };

    // Call the API to generate the next week's plan
    const response = await fetch("/api/generate-training-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userProfile: {}, // Will be filled from user context on the server
        previousWeekResults
      }),
    });

    if (!response.ok) {
      throw new Error(`Error generating next week plan: ${response.status}`);
    }

    const nextWeekPlan = await response.json();
    
    // Update week number
    if (nextWeekPlan.weekNumber === undefined) {
      nextWeekPlan.weekNumber = (currentPlan.weekNumber || 1) + 1;
    }
    
    // Save to local storage
    await savePlan(nextWeekPlan);
    return nextWeekPlan;
  } catch (error) {
    console.error("Error generating next week plan:", error);
    setConnectionError(error.message || "Error connecting to server");
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
    // Update in memory first
    const plan = await loadLatestPlan();
    if (!plan || plan.id !== planId) return null;
    
    console.log("Updating workout results:", { 
      planId, 
      workoutId, 
      actualDistance, 
      actualDuration 
    });
    
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
    
    // Try to update in database if online
    if (!isOfflineMode() && navigator.onLine) {
      try {
        console.log("Updating workout in database, workoutId:", workoutId);
        
        // First, try to find the session in the database by its UUID
        const { data: sessionData, error: findError } = await supabase
          .from('training_sessions')
          .select('*')
          .eq('id', workoutId)
          .single();
        
        if (findError || !sessionData) {
          console.log("Could not find session by UUID, trying to find by plan_id and other criteria...");
          
          // If not found by UUID, try to find by plan ID and workout details
          const workout = updatedWorkouts.find(w => w.id === workoutId);
          if (workout && plan.id) {
            const { data: planData } = await supabase
              .from('training_plans')
              .select('id')
              .eq('id', plan.id)
              .single();
            
            if (planData) {
              console.log("Found plan in database, searching for session by plan ID and day date");
              
              // Try to find by plan_id and day_date
              const { data: sessions, error: sessionsError } = await supabase
                .from('training_sessions')
                .select('*')
                .eq('plan_id', planData.id)
                .eq('day_date', workout.date)
                .eq('title', workout.title);
              
              if (!sessionsError && sessions && sessions.length > 0) {
                const sessionId = sessions[0].id;
                console.log("Found session by criteria:", sessionId);
                
                const { data, error } = await supabase
                  .from('training_sessions')
                  .update({
                    completed: true,
                    actual_distance: actualDistance,
                    actual_duration: actualDuration,
                    completion_date: new Date().toISOString()
                  })
                  .eq('id', sessionId)
                  .select();
                
                if (error) {
                  throw error;
                }
                
                console.log("Database update response:", data);
              } else {
                console.error("Could not find session in database", sessionsError);
              }
            }
          }
        } else {
          // Update directly if found by UUID
          const { data, error } = await supabase
            .from('training_sessions')
            .update({
              completed: true,
              actual_distance: actualDistance,
              actual_duration: actualDuration,
              completion_date: new Date().toISOString()
            })
            .eq('id', workoutId)
            .select();
          
          if (error) {
            throw error;
          }
          
          console.log("Database update response:", data);
        }
      } catch (dbError) {
        console.error("Error updating workout in database:", dbError);
        // Continue anyway as we'll update localStorage
      }
    }
    
    // Always update localStorage
    await savePlan(updatedPlan);
    return updatedPlan;
  } catch (error: any) {
    console.error("Error updating workout results:", error);
    return null;
  }
};

/**
 * Upload a training document for RAG processing
 */
export const uploadTrainingDocument = async (file: File): Promise<boolean> => {
  try {
    if (!navigator.onLine) {
      setOfflineMode(true);
      setConnectionError("No internet connection. Cannot upload documents in offline mode.");
      return false;
    }

    setOfflineMode(false);
    setConnectionError(null);

    // Create form data to send the file
    const formData = new FormData();
    formData.append('file', file);

    // Send to server endpoint
    const response = await fetch('/api/upload-training-document', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error uploading document: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error uploading document:", error);
    setConnectionError(error.message || "Error connecting to server");
    return false;
  }
};

/**
 * Helper function to get a day name from a day number
 */
const getDayName = (dayNumber: number): string => {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  return days[(dayNumber - 1) % 7];
};
