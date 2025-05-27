
import { supabase } from '@/integrations/supabase/client';

/**
 * Obtiene el ID del usuario desde localStorage y busca el perfil correspondiente
 */
const getCurrentUserProfileId = async (): Promise<string | null> => {
  try {
    console.log("[getCurrentUserProfileId] Iniciando proceso...");
    
    // Obtener el usuario desde localStorage
    const savedUser = localStorage.getItem('runAdaptiveUser');
    if (!savedUser) {
      console.error("[getCurrentUserProfileId] No hay usuario en localStorage");
      return null;
    }

    const userProfile = JSON.parse(savedUser);
    console.log("[getCurrentUserProfileId] Usuario desde localStorage:", userProfile);

    // Si ya tenemos un ID de perfil en localStorage, usarlo directamente
    if (userProfile.id) {
      console.log("[getCurrentUserProfileId] Usando ID existente:", userProfile.id);
      return userProfile.id;
    }

    console.log("[getCurrentUserProfileId] No hay ID, buscando o creando perfil...");

    // Si no tenemos ID de perfil, buscar el perfil en user_profiles
    const { data: existingProfile, error: searchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('name', userProfile.name)
      .eq('goal', userProfile.goal)
      .maybeSingle(); // Cambiar a maybeSingle para evitar errores si no existe

    if (searchError) {
      console.error("[getCurrentUserProfileId] Error buscando perfil:", searchError);
    }

    if (existingProfile) {
      console.log("[getCurrentUserProfileId] Perfil encontrado:", existingProfile.id);
      
      // Actualizar localStorage con el ID del perfil
      const updatedUser = { ...userProfile, id: existingProfile.id };
      localStorage.setItem('runAdaptiveUser', JSON.stringify(updatedUser));
      
      return existingProfile.id;
    }

    console.log("[getCurrentUserProfileId] Perfil no encontrado, creando nuevo...");

    // Si no existe, crear un nuevo perfil
    const profileData = {
      name: userProfile.name,
      age: userProfile.age || null,
      gender: userProfile.gender || null,
      height: userProfile.height || null,
      weight: userProfile.weight || null,
      experience_level: userProfile.experienceLevel || null,
      goal: userProfile.goal,
      max_distance: userProfile.maxDistance || null,
      pace: userProfile.pace || null,
      weekly_workouts: userProfile.weeklyWorkouts || null,
      injuries: userProfile.injuries || null
    };

    console.log("[getCurrentUserProfileId] Datos para crear perfil:", profileData);

    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert(profileData)
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
    console.log("[saveCompletedWorkout] === INICIANDO GUARDADO ===");
    console.log("[saveCompletedWorkout] Parámetros recibidos:", {
      workoutTitle,
      workoutType,
      distanciaRecorrida,
      duracion
    });
    
    const userProfileId = await getCurrentUserProfileId();
    console.log("[saveCompletedWorkout] User Profile ID obtenido:", userProfileId);
    
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

    console.log("[saveCompletedWorkout] Datos finales a insertar:", workoutData);
    console.log("[saveCompletedWorkout] Realizando inserción en Supabase...");

    const { data, error } = await supabase
      .from('entre_completado')
      .insert(workoutData)
      .select();

    console.log("[saveCompletedWorkout] Respuesta de Supabase:");
    console.log("- Data:", data);
    console.log("- Error:", error);

    if (error) {
      console.error("[saveCompletedWorkout] ❌ Error insertando en entre_completado:", error);
      console.error("[saveCompletedWorkout] Error code:", error.code);
      console.error("[saveCompletedWorkout] Error message:", error.message);
      console.error("[saveCompletedWorkout] Error details:", error.details);
      console.error("[saveCompletedWorkout] Error hint:", error.hint);
      return false;
    }

    console.log("[saveCompletedWorkout] ✅ Entrenamiento guardado exitosamente:", data);
    return true;
  } catch (error: any) {
    console.error("[saveCompletedWorkout] ❌ Error inesperado completo:", error);
    console.error("[saveCompletedWorkout] Error name:", error.name);
    console.error("[saveCompletedWorkout] Error message:", error.message);
    console.error("[saveCompletedWorkout] Error stack:", error.stack);
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
