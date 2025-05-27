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
    
    const fileContent = await file.text();
    
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
 * Gets the user profile ID from localStorage
 */
export const getUserProfileId = async (): Promise<string | null> => {
  try {
    console.log("[getUserProfileId] Obteniendo user profile ID...");
    
    const savedUser = localStorage.getItem('runAdaptiveUser');
    if (savedUser) {
      const userProfile: UserProfile = JSON.parse(savedUser);
      console.log("[getUserProfileId] Perfil encontrado:", userProfile);
      
      if (userProfile.id) {
        return userProfile.id;
      }
    }
    
    console.log("[getUserProfileId] No se encontró perfil válido");
    return null;
  } catch (error) {
    console.error("[getUserProfileId] Error:", error);
    return null;
  }
};

/**
 * Creates or ensures a user profile exists in Supabase
 */
const ensureUserProfileInSupabase = async (userProfile: UserProfile): Promise<string | null> => {
  try {
    console.log("[ensureUserProfileInSupabase] Verificando perfil en Supabase");

    if (!userProfile.id) {
      console.error("[ensureUserProfileInSupabase] No se encontró ID en el perfil");
      return null;
    }

    const { data: existingProfile, error: selectError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userProfile.id)
      .maybeSingle();

    if (selectError) {
      console.error("[ensureUserProfileInSupabase] Error verificando perfil:", selectError);
    }

    if (existingProfile) {
      console.log("[ensureUserProfileInSupabase] Perfil ya existe:", existingProfile.id);
      return existingProfile.id;
    }

    console.log("[ensureUserProfileInSupabase] Creando perfil en Supabase...");
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userProfile.id,
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
        injuries: userProfile.injuries || ''
      })
      .select()
      .single();

    if (error) {
      console.error("[ensureUserProfileInSupabase] Error creando perfil:", error);
      return null;
    }

    console.log("[ensureUserProfileInSupabase] ✅ Perfil creado:", data.id);
    return data.id;
  } catch (error: any) {
    console.error("[ensureUserProfileInSupabase] Error:", error);
    return null;
  }
};

/**
 * Creates or updates a user profile in the database
 */
export const saveUserProfile = async (userProfile: UserProfile): Promise<UserProfile | null> => {
  try {
    console.log("[saveUserProfile] Guardando perfil:", userProfile.name);
    
    const profileWithId = userProfile.id ? userProfile : { ...userProfile, id: uuidv4() };
    localStorage.setItem('runAdaptiveUser', JSON.stringify(profileWithId));
    
    try {
      await ensureUserProfileInSupabase(profileWithId);
    } catch (error) {
      console.log("[saveUserProfile] No se pudo guardar en Supabase:", error);
    }
    
    return profileWithId;
  } catch (error: any) {
    console.error("[saveUserProfile] Error:", error);
    const profileWithId = userProfile.id ? userProfile : { ...userProfile, id: uuidv4() };
    localStorage.setItem('runAdaptiveUser', JSON.stringify(profileWithId));
    return profileWithId;
  }
};

/**
 * Saves the training plan in Supabase and local storage
 */
export const savePlan = async (plan: WorkoutPlan): Promise<WorkoutPlan> => {
  try {
    console.log("[savePlan] Guardando plan en Supabase:", plan.name);
    
    // Guardar en localStorage primero
    localStorage.setItem('savedPlan', JSON.stringify(plan));
    
    if (isOfflineMode()) {
      console.log("[savePlan] Modo offline, solo guardado en localStorage");
      return plan;
    }
    
    // Obtener user_id
    const userId = await getUserProfileId();
    if (!userId) {
      console.log("[savePlan] No se pudo obtener user ID");
      return plan;
    }
    
    // Asegurar que el perfil existe en Supabase
    const savedUser = localStorage.getItem('runAdaptiveUser');
    if (savedUser) {
      const userProfile = JSON.parse(savedUser);
      await ensureUserProfileInSupabase(userProfile);
    }
    
    // Guardar plan en training_plans
    console.log("[savePlan] Insertando en training_plans...");
    const { data: trainingPlan, error: planError } = await supabase
      .from('training_plans')
      .insert({
        id: plan.id, // Usar el ID del plan generado
        user_id: userId,
        name: plan.name,
        description: plan.description,
        duration: plan.duration,
        intensity: plan.intensity,
        week_number: plan.weekNumber || 1,
        start_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();
    
    if (planError) {
      console.error("[savePlan] Error guardando plan:", planError);
      return plan; // Retornar plan original si falla
    }
    
    console.log("[savePlan] ✅ Plan guardado:", trainingPlan.id);
    
    // Guardar workouts en training_sessions
    const sessionsToInsert = plan.workouts.map((workout, index) => {
      let workoutDate = workout.date ? new Date(workout.date) : new Date();
      if (!workout.date) {
        workoutDate.setDate(new Date().getDate() + index);
      }
      
      return {
        id: workout.id, // Usar el ID del workout generado
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
      console.error("[savePlan] Error guardando sesiones:", sessionsError);
    } else {
      console.log("[savePlan] ✅ Sesiones guardadas");
    }
    
    // Actualizar plan con el ID de Supabase
    const updatedPlan = {
      ...plan,
      id: trainingPlan.id
    };
    localStorage.setItem('savedPlan', JSON.stringify(updatedPlan));
    
    return updatedPlan;
  } catch (error: any) {
    console.error("[savePlan] Error:", error);
    return plan;
  }
};

/**
 * Removes the saved plan
 */
export const removeSavedPlan = async (): Promise<void> => {
  try {
    localStorage.removeItem('savedPlan');
    
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
    console.log("[loadLatestPlan] Cargando plan...");
    
    // Intentar cargar desde Supabase primero
    if (!isOfflineMode()) {
      try {
        const userId = await getUserProfileId();
        
        if (userId) {
          console.log("[loadLatestPlan] Buscando plan en Supabase para user:", userId);
          
          const { data: planData } = await supabase
            .from('training_plans')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (planData) {
            console.log("[loadLatestPlan] Plan encontrado en Supabase:", planData.id);
            
            const { data: sessions } = await supabase
              .from('training_sessions')
              .select('*')
              .eq('plan_id', planData.id)
              .order('day_number', { ascending: true });
            
            if (sessions && sessions.length > 0) {
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
                weekNumber: planData.week_number || 1,
                ragActive: true
              };
              
              localStorage.setItem('savedPlan', JSON.stringify(plan));
              console.log("[loadLatestPlan] ✅ Plan cargado desde Supabase");
              return plan;
            }
          }
        }
      } catch (dbError) {
        console.error("[loadLatestPlan] Error cargando desde Supabase:", dbError);
      }
    }
    
    // Fallback a localStorage
    const savedPlan = localStorage.getItem('savedPlan');
    if (savedPlan) {
      console.log("[loadLatestPlan] Plan cargado desde localStorage");
      return JSON.parse(savedPlan);
    }
    
    console.log("[loadLatestPlan] No se encontró plan");
    return null;
  } catch (error: any) {
    console.error("[loadLatestPlan] Error:", error);
    return null;
  }
};

/**
 * Saves completed workout data to the entrenamientos_realizados table
 */
export const saveCompletedWorkout = async (
  workoutId: string,
  planId: string,
  actualDistance: number | null,
  actualDuration: string | null
): Promise<boolean> => {
  try {
    console.log("[saveCompletedWorkout] Guardando entrenamiento completado:", {
      workoutId,
      planId,
      actualDistance,
      actualDuration
    });

    // Verificar que el plan existe en training_plans
    const { data: planExists } = await supabase
      .from('training_plans')
      .select('id')
      .eq('id', planId)
      .single();

    if (!planExists) {
      console.error("[saveCompletedWorkout] Plan no existe en training_plans:", planId);
      return false;
    }

    // Verificar que el workout existe en training_sessions
    const { data: workoutExists } = await supabase
      .from('training_sessions')
      .select('id')
      .eq('id', workoutId)
      .eq('plan_id', planId)
      .single();

    if (!workoutExists) {
      console.error("[saveCompletedWorkout] Workout no existe en training_sessions:", workoutId);
      return false;
    }

    // Guardar en entrenamientos_realizados
    const { data, error } = await supabase
      .from('entrenamientos_realizados')
      .insert({
        workout_id: workoutId,
        plan_id: planId,
        actual_distance: actualDistance,
        actual_duration: actualDuration
      })
      .select();

    if (error) {
      console.error("[saveCompletedWorkout] Error guardando:", error);
      return false;
    }

    console.log("[saveCompletedWorkout] ✅ Entrenamiento guardado:", data);
    return true;
  } catch (error: any) {
    console.error("[saveCompletedWorkout] Error:", error);
    return false;
  }
};

/**
 * Updates the results of a specific workout in Supabase and saves to completed_workouts table
 */
export const updateWorkoutResults = async (
  planId: string,
  workoutId: string,
  actualDistance: number | null,
  actualDuration: string | null
): Promise<WorkoutPlan | null> => {
  try {
    console.log("[updateWorkoutResults] Actualizando workout:", { 
      planId, 
      workoutId, 
      actualDistance, 
      actualDuration 
    });

    // PASO 1: Guardar en entrenamientos_realizados
    const savedToCompletedWorkouts = await saveCompletedWorkout(workoutId, planId, actualDistance, actualDuration);
    
    if (!savedToCompletedWorkouts) {
      console.error("[updateWorkoutResults] No se pudo guardar en entrenamientos_realizados");
      throw new Error("No se pudo guardar el entrenamiento completado");
    }

    // PASO 2: Actualizar training_sessions
    if (!isOfflineMode()) {
      const updateData: any = {
        completed: true,
        completion_date: new Date().toISOString()
      };
      
      if (actualDistance !== null && actualDistance !== undefined) {
        updateData.actual_distance = actualDistance;
      }
      
      if (actualDuration !== null && actualDuration !== undefined && actualDuration.trim() !== '') {
        updateData.actual_duration = actualDuration.trim();
      }
      
      const { data, error } = await supabase
        .from('training_sessions')
        .update(updateData)
        .eq('id', workoutId)
        .eq('plan_id', planId)
        .select();
      
      if (error) {
        console.error("[updateWorkoutResults] Error actualizando training_sessions:", error);
        throw new Error("Error actualizando sesión de entrenamiento");
      }
      
      console.log("[updateWorkoutResults] ✅ Training_sessions actualizado:", data);
    }

    // PASO 3: Recargar plan actualizado desde Supabase
    const updatedPlan = await loadLatestPlan();
    if (!updatedPlan) {
      console.error("[updateWorkoutResults] No se pudo recargar el plan");
      throw new Error("No se pudo recargar el plan actualizado");
    }

    console.log("[updateWorkoutResults] ✅ Plan actualizado correctamente");
    return updatedPlan;
  } catch (error: any) {
    console.error("[updateWorkoutResults] Error:", error);
    throw error;
  }
};

/**
 * Generates a plan for the next week
 */
export const generateNextWeekPlan = async (currentPlan: WorkoutPlan): Promise<WorkoutPlan | null> => {
  try {
    const savedUser = localStorage.getItem('runAdaptiveUser');
    if (!savedUser) {
      connectionError = "User profile not found";
      return null;
    }
    
    const userProfile: UserProfile = JSON.parse(savedUser);
    
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
    
    try {
      const nextWeekPlan = await generateTrainingPlan({
        userProfile,
        previousWeekResults
      });
      
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

export const generateTrainingPlan = async (request: TrainingPlanRequest): Promise<WorkoutPlan> => {
  try {
    console.log("[generateTrainingPlan] Generando plan...");
    
    if (!navigator.onLine) {
      connectionError = "No hay conexión a Internet. Por favor, conéctate a Internet para generar un plan de entrenamiento.";
      throw new Error("No hay conexión a Internet. Por favor, conéctate para generar un plan de entrenamiento.");
    }
    
    connectionError = null;
    
    const requestBody: any = {
      userProfile: request.userProfile,
    };
    
    if (request.previousWeekResults) {
      requestBody.previousWeekResults = request.previousWeekResults;
    }
    
    if (request.customPrompt) {
      requestBody.customPrompt = request.customPrompt;
    }
    
    const { data, error } = await supabase.functions.invoke('generate-training-plan', {
      body: requestBody
    });
    
    if (error) {
      console.error("[generateTrainingPlan] Error:", error);
      throw new Error(`Error de conexión con el servidor: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("No se recibió respuesta del servidor");
    }
    
    console.log("[generateTrainingPlan] Plan recibido:", data);
    
    const ragActive = data.ragActive || false;
    const edgePlanData = data;
    
    const plan: WorkoutPlan = {
      id: uuidv4(),
      name: edgePlanData.name,
      description: edgePlanData.description,
      duration: edgePlanData.duration,
      intensity: edgePlanData.intensity,
      ragActive: ragActive,
      workouts: edgePlanData.workouts.map((workout: any) => ({
        id: uuidv4(),
        day: workout.day,
        date: workout.date,
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
    
    // Ajustar número de entrenamientos según preferencias del usuario
    const weeklyWorkouts = request.userProfile.weeklyWorkouts || 3;
    const activeWorkouts = plan.workouts.filter(w => w.type !== 'descanso');
    
    if (activeWorkouts.length > weeklyWorkouts) {
      activeWorkouts.sort((a, b) => {
        if (a.type === 'carrera' && b.type === 'carrera') {
          return (b.distance || 0) - (a.distance || 0);
        }
        const typePriority = { 'carrera': 3, 'fuerza': 2, 'flexibilidad': 1 };
        return typePriority[b.type as keyof typeof typePriority] - typePriority[a.type as keyof typeof typePriority];
      });
      
      const workoutsToKeep = activeWorkouts.slice(0, weeklyWorkouts).map(w => w.id);
      
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
    
    // Guardar el plan generado en Supabase
    const savedPlan = await savePlan(plan);
    
    // Actualizar perfil de usuario
    try {
      await saveUserProfile(request.userProfile);
    } catch (profileError) {
      console.error("[generateTrainingPlan] Error guardando perfil:", profileError);
    }
    
    return savedPlan;
  } catch (error: any) {
    console.error("[generateTrainingPlan] Error:", error);
    connectionError = error.message || "Error desconocido generando el plan";
    throw error;
  }
};
