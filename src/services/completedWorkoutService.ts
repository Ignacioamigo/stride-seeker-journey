
import { supabase } from '@/integrations/supabase/client';

/**
 * Obtiene el ID del usuario desde localStorage y busca el perfil correspondiente
 */
const getCurrentUserProfileId = async (): Promise<string | null> => {
  try {
    // Obtener el usuario desde localStorage
    const savedUser = localStorage.getItem('runAdaptiveUser');
    if (!savedUser) {
      console.error("[getCurrentUserProfileId] No hay usuario en localStorage");
      return null;
    }

    const userProfile = JSON.parse(savedUser);
    console.log("[getCurrentUserProfileId] Usuario desde localStorage:", userProfile);

    // Si ya tenemos un ID de perfil en localStorage, usarlo
    if (userProfile.id) {
      return userProfile.id;
    }

    // Si no tenemos ID de perfil, buscar o crear el perfil en user_profiles
    const { data: existingProfile, error: searchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('name', userProfile.name)
      .eq('goal', userProfile.goal)
      .single();

    if (existingProfile && !searchError) {
      console.log("[getCurrentUserProfileId] Perfil encontrado:", existingProfile.id);
      
      // Actualizar localStorage con el ID del perfil
      const updatedUser = { ...userProfile, id: existingProfile.id };
      localStorage.setItem('runAdaptiveUser', JSON.stringify(updatedUser));
      
      return existingProfile.id;
    }

    // Si no existe, crear un nuevo perfil
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        name: userProfile.name,
        age: userProfile.age,
        gender: userProfile.gender,
        height: userProfile.height,
        weight: userProfile.weight,
        experience_level: userProfile.experienceLevel,
        goal: userProfile.goal,
        max_distance: userProfile.maxDistance,
        pace: userProfile.pace,
        weekly_workouts: userProfile.weeklyWorkouts,
        injuries: userProfile.injuries
      })
      .select('id')
      .single();

    if (createError) {
      console.error("[getCurrentUserProfileId] Error creando perfil:", createError);
      return null;
    }

    console.log("[getCurrentUserProfileId] Nuevo perfil creado:", newProfile.id);
    
    // Actualizar localStorage con el ID del nuevo perfil
    const updatedUser = { ...userProfile, id: newProfile.id };
    localStorage.setItem('runAdaptiveUser', JSON.stringify(updatedUser));
    
    return newProfile.id;
  } catch (error) {
    console.error("[getCurrentUserProfileId] Error inesperado:", error);
    return null;
  }
};

/**
 * Guarda un entrenamiento completado en la nueva tabla entre_completado
 */
export const saveCompletedWorkout = async (
  workoutTitle: string,
  workoutType: string,
  distanciaRecorrida: number | null,
  duracion: string | null
): Promise<boolean> => {
  try {
    console.log("[saveCompletedWorkout] Guardando entrenamiento completado en entre_completado");
    
    const userProfileId = await getCurrentUserProfileId();
    if (!userProfileId) {
      console.error("[saveCompletedWorkout] No se encontró ID de perfil de usuario");
      return false;
    }

    const workoutData = {
      user_id: userProfileId,
      workout_title: workoutTitle,
      workout_type: workoutType,
      distancia_recorrida: distanciaRecorrida,
      duracion: duracion,
      fecha_completado: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
    };

    console.log("[saveCompletedWorkout] Datos a insertar:", workoutData);

    const { data, error } = await supabase
      .from('entre_completado')
      .insert(workoutData)
      .select();

    if (error) {
      console.error("[saveCompletedWorkout] Error insertando en entre_completado:", error);
      return false;
    }

    console.log("[saveCompletedWorkout] ✅ Entrenamiento guardado exitosamente:", data);
    return true;
  } catch (error: any) {
    console.error("[saveCompletedWorkout] Error inesperado:", error);
    return false;
  }
};

/**
 * Obtiene todos los entrenamientos completados del usuario actual
 */
export const getCompletedWorkouts = async () => {
  try {
    const userProfileId = await getCurrentUserProfileId();
    if (!userProfileId) {
      console.error("[getCompletedWorkouts] No se encontró ID de perfil de usuario");
      return [];
    }

    const { data, error } = await supabase
      .from('entre_completado')
      .select('*')
      .eq('user_id', userProfileId)
      .order('fecha_completado', { ascending: false });

    if (error) {
      console.error("[getCompletedWorkouts] Error obteniendo entrenamientos:", error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error("[getCompletedWorkouts] Error inesperado:", error);
    return [];
  }
};
