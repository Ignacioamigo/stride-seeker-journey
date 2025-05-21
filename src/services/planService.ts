
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, WorkoutPlan, Workout, TrainingPlanRequest, PreviousWeekResults } from '@/types';

// Variable to control connection errors
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
  } catch (error: any) {
    console.error("Error uploading document:", error);
    connectionError = `Unexpected error: ${error.message}`;
    return false;
  }
};

/**
 * Creates or updates a user profile in the database
 */
export const saveUserProfile = async (userProfile: UserProfile): Promise<UserProfile | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      console.error("No authenticated user found");
      // Just save to localStorage if not authenticated
      localStorage.setItem('runAdaptiveUser', JSON.stringify(userProfile));
      return userProfile;
    }
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_auth_id', user.user.id)
      .single();
    
    let profile;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          name: userProfile.name,
          age: userProfile.age,
          gender: userProfile.gender,
          height: userProfile.height,
          weight: userProfile.weight,
          max_distance: userProfile.maxDistance,
          pace: userProfile.pace,
          goal: userProfile.goal,
          weekly_workouts: userProfile.weeklyWorkouts,
          experience_level: userProfile.experienceLevel,
          injuries: userProfile.injuries,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      if (error) throw error;
      profile = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_auth_id: user.user.id,
          name: userProfile.name,
          age: userProfile.age,
          gender: userProfile.gender,
          height: userProfile.height,
          weight: userProfile.weight,
          max_distance: userProfile.maxDistance,
          pace: userProfile.pace,
          goal: userProfile.goal,
          weekly_workouts: userProfile.weeklyWorkouts,
          experience_level: userProfile.experienceLevel,
          injuries: userProfile.injuries
        })
        .select()
        .single();
      
      if (error) throw error;
      profile = data;
    }
    
    // Save to localStorage too for offline access
    localStorage.setItem('runAdaptiveUser', JSON.stringify(userProfile));
    
    return {
      ...userProfile,
      id: profile.id
    };
  } catch (error: any) {
    console.error("Error saving user profile:", error);
    // If DB saving fails, at least save to localStorage
    localStorage.setItem('runAdaptiveUser', JSON.stringify(userProfile));
    return userProfile;
  }
};

/**
 * Saves the training plan in the database and local storage
 */
export const savePlan = async (plan: WorkoutPlan): Promise<void> => {
  try {
    // Save to localStorage first for offline access
    localStorage.setItem('savedPlan', JSON.stringify(plan));
    
    if (isOfflineMode()) {
      console.log("In offline mode, plan saved to localStorage only");
      return;
    }
    
    // Try to save to the database
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      console.log("No authenticated user found, using localStorage only");
      return;
    }
    
    // Get user profile ID
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_auth_id', user.user.id)
      .single();
    
    if (!userProfile) {
      console.log("No user profile found in database");
      return;
    }
    
    // Save plan to database
    const { data: trainingPlan, error } = await supabase
      .from('training_plans')
      .insert({
        user_id: userProfile.id,
        name: plan.name,
        description: plan.description,
        duration: plan.duration,
        intensity: plan.intensity,
        week_number: plan.weekNumber || 1,
        start_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error saving training plan to database:", error);
      return;
    }
    
    // Save each workout session
    const sessionsToInsert = plan.workouts.map((workout, index) => {
      // Ensure we have a valid date from the workout or calculate it
      let workoutDate = workout.date ? new Date(workout.date) : new Date();
      if (!workout.date) {
        workoutDate.setDate(new Date().getDate() + index);
      }
      
      return {
        plan_id: trainingPlan.id,
        day_number: index + 1,
        day_date: workoutDate.toISOString().split('T')[0],
        title: workout.title,
        description: workout.description,
        type: workout.type,
        planned_distance: workout.distance,
        planned_duration: workout.duration,
        target_pace: workout.targetPace,
        completed: workout.completed || false,
        actual_distance: workout.actualDistance,
        actual_duration: workout.actualDuration,
        completion_date: workout.completed ? new Date().toISOString() : null
      };
    });
    
    const { error: sessionsError } = await supabase
      .from('training_sessions')
      .insert(sessionsToInsert);
    
    if (sessionsError) {
      console.error("Error saving workout sessions to database:", sessionsError);
    }
    
    console.log("Training plan and sessions saved to database");
    
    // Update the plan id in localStorage to point to the database record
    const updatedPlan = {
      ...plan,
      id: trainingPlan.id
    };
    localStorage.setItem('savedPlan', JSON.stringify(updatedPlan));
    
  } catch (error: any) {
    console.error("Error saving plan:", error);
    // Ensure we at least save to localStorage
    localStorage.setItem('savedPlan', JSON.stringify(plan));
  }
};

/**
 * Removes the saved plan
 */
export const removeSavedPlan = async (): Promise<void> => {
  try {
    // Remove from localStorage
    localStorage.removeItem('savedPlan');
    
    // Try to remove from database if user is authenticated
    const { data: user } = await supabase.auth.getUser();
    
    if (user && user.user) {
      const { data: planData } = await supabase
        .from('training_plans')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (planData) {
        await supabase
          .from('training_plans')
          .delete()
          .eq('id', planData.id);
      }
    }
  } catch (error: any) {
    console.error("Error removing saved plan:", error);
  }
};

/**
 * Loads the latest saved plan from database or localStorage
 */
export const loadLatestPlan = async (): Promise<WorkoutPlan | null> => {
  try {
    // Try to load from database first
    if (!isOfflineMode()) {
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (user && user.user) {
          // Get user profile
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_auth_id', user.user.id)
            .single();
          
          if (userProfile) {
            // Get latest plan
            const { data: planData } = await supabase
              .from('training_plans')
              .select('*')
              .eq('user_id', userProfile.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (planData) {
              // Get associated sessions
              const { data: sessions } = await supabase
                .from('training_sessions')
                .select('*')
                .eq('plan_id', planData.id)
                .order('day_number', { ascending: true });
              
              if (sessions && sessions.length > 0) {
                // Convert to our WorkoutPlan format
                const workouts = sessions.map(session => ({
                  id: session.id,
                  day: session.day_date ? new Date(session.day_date).toLocaleDateString('es-ES', { weekday: 'long' }) : '',
                  date: session.day_date,
                  title: session.title,
                  description: session.description,
                  distance: session.planned_distance,
                  duration: session.planned_duration,
                  type: session.type as 'carrera' | 'descanso' | 'fuerza' | 'flexibilidad' | 'otro',
                  completed: session.completed || false,
                  actualDistance: session.actual_distance,
                  actualDuration: session.actual_duration,
                  targetPace: session.target_pace
                }));
                
                const plan: WorkoutPlan = {
                  id: planData.id,
                  name: planData.name,
                  description: planData.description || '',
                  duration: planData.duration || '7 días',
                  intensity: planData.intensity || 'Moderada',
                  workouts,
                  createdAt: new Date(planData.created_at),
                  weekNumber: planData.week_number || 1
                };
                
                // Update localStorage with the database version
                localStorage.setItem('savedPlan', JSON.stringify(plan));
                return plan;
              }
            }
          }
        }
      } catch (dbError) {
        console.error("Error loading plan from database:", dbError);
        // Fall back to localStorage
      }
    }
    
    // Fall back to localStorage
    const savedPlan = localStorage.getItem('savedPlan');
    if (savedPlan) {
      return JSON.parse(savedPlan);
    }
    return null;
  } catch (error: any) {
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
    // Update in memory first
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
    
    // Try to update in database if online
    if (!isOfflineMode()) {
      try {
        // Update the training session
        await supabase
          .from('training_sessions')
          .update({
            completed: true,
            actual_distance: actualDistance,
            actual_duration: actualDuration,
            completion_date: new Date().toISOString()
          })
          .eq('id', workoutId);
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
    
    const userProfile: UserProfile = JSON.parse(savedUser);
    
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
    } catch (error: any) {
      console.error("Error generating next week's plan:", error);
      connectionError = `Error de conexión: ${error.message}. Por favor, verifica tu conexión a Internet e inténtalo de nuevo.`;
      return null;
    }
  } catch (error: any) {
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
        date: workout.date, // Include the date from the API
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
    
    // Update user profile in database if possible
    try {
      await saveUserProfile(request.userProfile);
    } catch (profileError) {
      console.error("Error saving user profile during plan generation:", profileError);
    }
    
    return plan;
  } catch (error: any) {
    console.error("Error generating training plan:", error);
    connectionError = error.message || "Error desconocido generando el plan";
    throw error;
  }
};
