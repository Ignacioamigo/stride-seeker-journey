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
 * Creates or ensures a user profile exists in Supabase
 */
const ensureUserProfileInSupabase = async (userProfile: UserProfile): Promise<string | null> => {
  try {
    console.log("[ensureUserProfileInSupabase] Iniciando creación/verificación de perfil en Supabase");
    console.log("[ensureUserProfileInSupabase] Perfil recibido:", userProfile);

    if (!userProfile.id) {
      console.error("[ensureUserProfileInSupabase] No se encontró ID en el perfil");
      return null;
    }

    // Verificar si el perfil ya existe en Supabase
    const { data: existingProfile, error: selectError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userProfile.id)
      .maybeSingle();

    if (selectError) {
      console.error("[ensureUserProfileInSupabase] Error verificando perfil existente:", selectError);
    }

    if (existingProfile) {
      console.log("[ensureUserProfileInSupabase] Perfil ya existe:", existingProfile.id);
      return existingProfile.id;
    }

    // Crear el perfil en Supabase
    console.log("[ensureUserProfileInSupabase] Creando nuevo perfil en Supabase...");
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

    console.log("[ensureUserProfileInSupabase] ✅ Perfil creado exitosamente:", data.id);
    return data.id;
  } catch (error: any) {
    console.error("[ensureUserProfileInSupabase] Error inesperado:", error);
    return null;
  }
};

/**
 * Gets the user profile ID from the database or creates one if it doesn't exist
 */
export const getUserProfileId = async (): Promise<string | null> => {
  try {
    console.log("[getUserProfileId] Iniciando obtención de user profile ID...");
    
    const { data: user } = await supabase.auth.getUser();
    console.log("[getUserProfileId] Usuario autenticado:", !!user?.user);
    
    if (user && user.user) {
      // Usuario autenticado - buscar en la base de datos
      console.log("[getUserProfileId] Buscando perfil en BD para usuario autenticado:", user.user.id);
      
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_auth_id', user.user.id)
        .single();
      
      if (userProfile) {
        console.log("[getUserProfileId] Perfil encontrado en BD:", userProfile.id);
        return userProfile.id;
      } else {
        console.log("[getUserProfileId] No se encontró perfil en BD para usuario autenticado");
        return null;
      }
    } else {
      // Usuario no autenticado - usar localStorage
      console.log("[getUserProfileId] Usuario no autenticado, usando localStorage");
      
      const savedUser = localStorage.getItem('runAdaptiveUser');
      if (savedUser) {
        const userProfile: UserProfile = JSON.parse(savedUser);
        console.log("[getUserProfileId] Perfil encontrado en localStorage:", userProfile);
        
        if (userProfile.id) {
          console.log("[getUserProfileId] Retornando ID del localStorage:", userProfile.id);
          return userProfile.id;
        } else {
          // Crear un ID temporal para usuarios de localStorage
          const tempId = uuidv4();
          console.log("[getUserProfileId] Creando ID temporal:", tempId);
          
          const updatedProfile = { ...userProfile, id: tempId };
          localStorage.setItem('runAdaptiveUser', JSON.stringify(updatedProfile));
          return tempId;
        }
      }
      
      console.log("[getUserProfileId] No se encontró perfil en localStorage");
      return null;
    }
  } catch (error) {
    console.error("[getUserProfileId] Error:", error);
    
    // Fallback a localStorage en caso de error
    const savedUser = localStorage.getItem('runAdaptiveUser');
    if (savedUser) {
      const userProfile: UserProfile = JSON.parse(savedUser);
      if (userProfile.id) {
        console.log("[getUserProfileId] Fallback: usando ID de localStorage:", userProfile.id);
        return userProfile.id;
      } else {
        // Crear un ID temporal para usuarios de localStorage
        const tempId = uuidv4();
        console.log("[getUserProfileId] Fallback: creando ID temporal:", tempId);
        
        const updatedProfile = { ...userProfile, id: tempId };
        localStorage.setItem('runAdaptiveUser', JSON.stringify(updatedProfile));
        return tempId;
      }
    }
    return null;
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
      const profileWithId = userProfile.id ? userProfile : { ...userProfile, id: uuidv4() };
      localStorage.setItem('runAdaptiveUser', JSON.stringify(profileWithId));
      return profileWithId;
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
    const profileWithId = {
      ...userProfile,
      id: profile.id
    };
    localStorage.setItem('runAdaptiveUser', JSON.stringify(profileWithId));
    
    return profileWithId;
  } catch (error: any) {
    console.error("Error saving user profile:", error);
    // If DB saving fails, at least save to localStorage
    const profileWithId = userProfile.id ? userProfile : { ...userProfile, id: uuidv4() };
    localStorage.setItem('runAdaptiveUser', JSON.stringify(profileWithId));
    return profileWithId;
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
                  weekNumber: planData.week_number || 1,
                  ragActive: true // Assume saved plans used RAG
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
 * Devuelve todas las sesiones planificadas (training_sessions) del usuario autenticado,
 * ordenadas por fecha. Útil para cálculos que atraviesan múltiples semanas/planes (ej. racha).
 */
export const getAllPlannedSessions = async (): Promise<{ date: string; type: string }[]> => {
  try {
    console.log('[getAllPlannedSessions] INICIANDO...');
    
    const { data: user } = await supabase.auth.getUser();
    console.log('[getAllPlannedSessions] Usuario autenticado:', user?.user?.id || 'NO USER');
    if (!user?.user) return [];

    // Obtener id de perfil
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_auth_id', user.user.id)
      .single();
    console.log('[getAllPlannedSessions] Profile query result:', { userProfile, profileError });
    if (!userProfile?.id) {
      console.log('[getAllPlannedSessions] ❌ No se encontró perfil de usuario');
      return [];
    }

    // Obtener todos los planes del usuario
    const { data: plans, error: plansError } = await supabase
      .from('training_plans')
      .select('id')
      .eq('user_id', userProfile.id);
    console.log('[getAllPlannedSessions] Plans query result:', { plans, plansError, userId: userProfile.id });
    if (!plans || plans.length === 0) {
      console.log('[getAllPlannedSessions] ❌ No se encontraron planes');
      return [];
    }

    const planIds = plans.map(p => p.id);
    console.log('[getAllPlannedSessions] Plan IDs encontrados:', planIds);

    // Obtener todas las sesiones
    const { data: sessions, error: sessionsError } = await supabase
      .from('training_sessions')
      .select('day_date,type')
      .in('plan_id', planIds)
      .order('day_date', { ascending: true });
    console.log('[getAllPlannedSessions] Sessions query result:', { sessions, sessionsError });
    if (!sessions) {
      console.log('[getAllPlannedSessions] ❌ No se encontraron sesiones');
      return [];
    }

    const result = sessions
      .filter(s => s.day_date)
      .map(s => ({ date: s.day_date as string, type: String(s.type || '') }));
    console.log('[getAllPlannedSessions] ✅ Resultado final:', result);
    return result;
  } catch (e) {
    console.error('[getAllPlannedSessions] ❌ Error:', e);
    return [];
  }
};

/**
 * Saves completed workout data to the entrenamientos_completados table
 */
export const saveCompletedWorkout = async (
  workoutTitle: string,
  workoutType: string,
  actualDistance: number | null,
  actualDuration: string | null
): Promise<boolean> => {
  try {
    console.log("[saveCompletedWorkout] INICIANDO - Guardado de workout completado");
    console.log("[saveCompletedWorkout] Datos:", {
      workoutTitle,
      workoutType,
      actualDistance,
      actualDuration
    });

    // Intentar guardar en Supabase usando la tabla entrenamientos_completados
    console.log("[saveCompletedWorkout] Intentando guardar en entrenamientos_completados...");
    
    const workoutData = {
      workout_title: workoutTitle,
      workout_type: workoutType,
      distancia_recorrida: actualDistance,
      duracion: actualDuration,
      fecha_completado: new Date().toISOString().split('T')[0]
    };

    console.log("[saveCompletedWorkout] Datos finales para insertar:", workoutData);

    const { data, error } = await supabase
      .from('entrenamientos_completados')
      .insert(workoutData)
      .select();

    if (error) {
      console.error("[saveCompletedWorkout] Error en Supabase entrenamientos_completados:", error);
      
      // Fallback a localStorage
      const completedWorkoutRecord = {
        id: uuidv4(),
        workoutTitle,
        workoutType,
        actualDistance,
        actualDuration,
        completedAt: new Date().toISOString()
      };
      
      const existingCompletedWorkouts = localStorage.getItem('completedWorkouts');
      const completedWorkouts = existingCompletedWorkouts ? JSON.parse(existingCompletedWorkouts) : [];
      completedWorkouts.push(completedWorkoutRecord);
      localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
      
      console.log("[saveCompletedWorkout] Guardado en localStorage como fallback");
      return true;
    }

    console.log("[saveCompletedWorkout] ✅ ÉXITO! Datos guardados en entrenamientos_completados:", data);
    
    // También guardar en localStorage para referencia offline
    const completedWorkoutRecord = {
      id: data[0].id,
      workoutTitle,
      workoutType,
      actualDistance,
      actualDuration,
      completedAt: new Date().toISOString()
    };
    
    const existingCompletedWorkouts = localStorage.getItem('completedWorkouts');
    const completedWorkouts = existingCompletedWorkouts ? JSON.parse(existingCompletedWorkouts) : [];
    completedWorkouts.push(completedWorkoutRecord);
    localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
    
    return true;
  } catch (error: any) {
    console.error("[saveCompletedWorkout] Error inesperado:", error);
    
    // Último recurso: guardar en localStorage
    try {
      const completedWorkoutRecord = {
        id: uuidv4(),
        workoutTitle,
        workoutType,
        actualDistance,
        actualDuration,
        completedAt: new Date().toISOString()
      };
      
      const existingCompletedWorkouts = localStorage.getItem('completedWorkouts');
      const completedWorkouts = existingCompletedWorkouts ? JSON.parse(existingCompletedWorkouts) : [];
      completedWorkouts.push(completedWorkoutRecord);
      localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
      
      console.log("[saveCompletedWorkout] Guardado en localStorage como último recurso");
      return true;
    } catch (localError) {
      console.error("[saveCompletedWorkout] Error también en localStorage:", localError);
      return false;
    }
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
    console.log("[updateWorkoutResults] INICIANDO actualización:", { 
      planId, 
      workoutId, 
      actualDistance, 
      actualDuration 
    });

    // PASO 1: Guardar en la tabla entrenamientos_completados
    console.log("[updateWorkoutResults] PASO 1: Guardando en entrenamientos_completados...");
    
    const workoutData = {
      workout_title: `Entrenamiento ${workoutId}`,
      workout_type: 'carrera',
      distancia_recorrida: actualDistance,
      duracion: actualDuration,
      fecha_completado: new Date().toISOString().split('T')[0]
    };

    const { data: completedData, error: completedError } = await supabase
      .from('entrenamientos_completados')
      .insert(workoutData)
      .select();
    
    if (completedError) {
      console.error("[updateWorkoutResults] Error en entrenamientos_completados:", completedError);
    } else {
      console.log("[updateWorkoutResults] ✅ ÉXITO guardando en entrenamientos_completados:", completedData);
    }

    // PASO 2: Actualizar en training_sessions si hay usuario autenticado
    if (!isOfflineMode()) {
      const { data: user } = await supabase.auth.getUser();
      
      if (user && user.user) {
        console.log("[updateWorkoutResults] PASO 2: Actualizando training_sessions para usuario autenticado");
        
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
        
        console.log("[updateWorkoutResults] Datos para training_sessions:", updateData);
        
        const { data, error } = await supabase
          .from('training_sessions')
          .update(updateData)
          .eq('id', workoutId)
          .select();
        
        if (error) {
          console.error("[updateWorkoutResults] Error en training_sessions:", error);
        } else {
          console.log("[updateWorkoutResults] ✅ training_sessions actualizado:", data);
        }
      } else {
        console.log("[updateWorkoutResults] Usuario no autenticado - omitiendo training_sessions");
      }
    }

    // PASO 3: Actualizar localStorage
    console.log("[updateWorkoutResults] PASO 3: Actualizando localStorage...");
    const plan = await loadLatestPlan();
    if (!plan) {
      console.error("[updateWorkoutResults] No se pudo cargar el plan para actualizar localStorage");
      return null;
    }

    // Actualizar el workout en el plan
    const updatedWorkouts = plan.workouts.map(workout => {
      if (workout.id === workoutId) {
        console.log("[updateWorkoutResults] ✅ Actualizando workout en plan:", workout.id);
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

    // Guardar plan actualizado en localStorage
    localStorage.setItem('savedPlan', JSON.stringify(updatedPlan));
    console.log("[updateWorkoutResults] ✅ Plan actualizado en localStorage");

    return updatedPlan;
  } catch (error: any) {
    console.error("[updateWorkoutResults] ERROR GENERAL:", error);
    throw error;
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
    
    const { data, error } = await supabase.functions.invoke('generate-training-plan', {
      body: requestBody
    });
    
    if (error) {
      console.error("Error calling Edge function:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      console.error("Error name:", error.name);
      console.error("Error context:", error.context);
      console.error("Error message:", error.message);
      
      // Proporcionar mensaje de error más específico
      let errorMessage = "Error de conexión con el servidor";
      if (error.name === "FunctionsHttpError") {
        errorMessage = "Error en el servidor de generación de planes. Puede ser un problema de configuración o conectividad.";
        
        // Detectar errores específicos de cuota de API
        if (data && typeof data === 'object' && data.error && typeof data.error === 'string') {
          if (data.error.includes('429 Too Many Requests') || data.error.includes('exceeded your current quota')) {
            errorMessage = "Se ha alcanzado el límite de uso de la API de inteligencia artificial. Por favor, intenta de nuevo en unos minutos o contacta al administrador.";
          } else if (data.error.includes('API key not configured') || data.error.includes('GEMINI_API_KEY')) {
            errorMessage = "Servicio de inteligencia artificial no configurado. Contacta al administrador.";
          } else if (data.error.includes('Invalid response format')) {
            errorMessage = "Error procesando la respuesta del servicio. Intenta de nuevo.";
          }
        }
      }
      if (error.message && !errorMessage.includes("límite de uso")) {
        errorMessage += `: ${error.message}`;
      }
      
      throw new Error(errorMessage);
    }
    
    if (!data) {
      throw new Error("No se recibió respuesta del servidor");
    }
    
    console.log("Training plan received from Edge function:", data);
    
    // Extract RAG status if available
    const ragActive = data.ragActive || false;
    console.log("RAG status:", ragActive ? "Active" : "Inactive");
    
    // Create the plan with UUID
    const edgePlanData = data;
    
    const plan: WorkoutPlan = {
      id: uuidv4(),
      name: edgePlanData.name,
      description: edgePlanData.description,
      duration: edgePlanData.duration,
      intensity: edgePlanData.intensity,
      ragActive: ragActive, // Store RAG status
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

/**
 * Marca como completado el slot de training_sessions más cercano a la fecha dada,
 * o crea un slot adicional si todos están completos.
 */
export const markClosestSessionAsCompleted = async ({
  userId,
  planId,
  workoutTitle,
  workoutType = 'carrera',
  actualDistance,
  actualDuration,
  workoutDate
}: {
  userId: string,
  planId: string,
  workoutTitle: string,
  workoutType?: string,
  actualDistance: number | null,
  actualDuration: string | null,
  workoutDate: string // formato YYYY-MM-DD
}) => {
  console.log('[markClosestSessionAsCompleted] INICIO', { userId, planId, workoutTitle, workoutType, actualDistance, actualDuration, workoutDate });
  // 1. Buscar slots pendientes (completed false o null)
  const { data: sessions, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('plan_id', planId)
    .eq('type', workoutType)
    .or('completed.is.false,completed.is.null');

  if (error) {
    console.error('[markClosestSessionAsCompleted] Error al buscar sesiones:', error);
    return;
  }
  console.log('[markClosestSessionAsCompleted] Slots pendientes encontrados:', sessions?.length);

  // 2. Buscar el slot más cercano por fecha
  let closestSession = null;
  let minDiff = Infinity;
  const workoutDateObj = new Date(workoutDate);

  if (sessions && sessions.length > 0) {
    sessions.forEach(session => {
      const sessionDate = new Date(session.day_date);
      const diff = Math.abs(sessionDate.getTime() - workoutDateObj.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestSession = session;
      }
    });
  }

  if (closestSession) {
    // 3. Marcar el slot como completado y actualizar datos reales
    const updateData: any = {
      completed: true,
      completion_date: workoutDate,
      actual_distance: actualDistance,
      actual_duration: actualDuration
    };
    console.log('[markClosestSessionAsCompleted] Actualizando slot más cercano:', closestSession.id, updateData);
    const { error: updateError } = await supabase
      .from('training_sessions')
      .update(updateData)
      .eq('id', closestSession.id);
    if (updateError) {
      console.error('[markClosestSessionAsCompleted] Error al actualizar sesión:', updateError);
    } else {
      console.log('[markClosestSessionAsCompleted] Slot más cercano marcado como completado:', closestSession.id);
    }
    return closestSession.id;
  } else {
    // 4. Si no hay slot pendiente, crear uno adicional
    const newSession = {
      plan_id: planId,
      day_number: 99, // o el siguiente disponible
      day_date: workoutDate,
      title: workoutTitle + ' (Adicional)',
      description: 'Entrenamiento adicional realizado fuera de los días planeados',
      type: 'adicional',
      planned_distance: null,
      planned_duration: null,
      target_pace: null,
      completed: true,
      actual_distance: actualDistance,
      actual_duration: actualDuration,
      completion_date: workoutDate
    };
    console.log('[markClosestSessionAsCompleted] Creando sesión adicional:', newSession);
    const { data: inserted, error: insertError } = await supabase
      .from('training_sessions')
      .insert(newSession)
      .select();
    if (insertError) {
      console.error('[markClosestSessionAsCompleted] Error al crear sesión adicional:', insertError);
      return null;
    } else {
      console.log('[markClosestSessionAsCompleted] Sesión adicional creada:', inserted[0]?.id);
      return inserted[0]?.id;
    }
  }
};
