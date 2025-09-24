import { supabase } from '@/integrations/supabase/client';
import { WorkoutPublishData } from '@/types';
import { saveWorkoutSimple } from './simpleWorkoutService';

/**
 * SERVICIO ULTRA SIMPLE PARA published_activities_simple
 * Guarda actividades en la nueva tabla SIN complicaciones
 */

export const publishActivityUltraSimple = async (data: WorkoutPublishData): Promise<string> => {
  console.log('🚀 [ULTRA SIMPLE] Guardando actividad:', data.title);
  
  const fallbackId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // 1. GUARDAR EN workouts_simple (para estadísticas)
    console.log('📊 [ULTRA SIMPLE] Guardando en workouts_simple...');
    
    const distanceKm = Math.round(data.runSession.distance / 1000 * 100) / 100;
    const durationSeconds = data.runSession.duration;
    const durationMinutes = Math.round(durationSeconds / 60);
    
    // Formatear duración como HH:MM:SS de manera SEGURA
    const safeDurationSeconds = Math.max(0, Math.floor(durationSeconds || 0));
    const hours = Math.floor(safeDurationSeconds / 3600);
    const minutes = Math.floor((safeDurationSeconds % 3600) / 60);
    const seconds = Math.floor(safeDurationSeconds % 60);
    const durationFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Calcular calorías (aprox 60 cal/km)
    const calories = Math.round(Math.max(0, distanceKm) * 60);
    
    console.log('🔧 [ULTRA SIMPLE] Datos calculados:', {
      distanceKm,
      durationSeconds: safeDurationSeconds,
      durationFormatted,
      calories
    });
    
    const workoutSaved = await saveWorkoutSimple(
      data.title,
      'carrera',
      distanceKm,
      `${durationMinutes} min`,
      null,
      null
    );
    
    console.log('📊 [ULTRA SIMPLE] Guardado en workouts_simple:', workoutSaved);

    // 2. OBTENER USUARIO
    let userEmail = 'anonimo@app.com';
    let userId = null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        userEmail = user.email;
        userId = user.id;
        console.log('👤 [ULTRA SIMPLE] Usuario autenticado:', userEmail);
      }
    } catch (authError) {
      console.log('👤 [ULTRA SIMPLE] Usuario anónimo');
    }

    // 3. DATOS ULTRA SIMPLES para published_activities_simple
    const activityData = {
      user_id: userId,
      title: data.title.trim(),
      description: data.description?.trim() || `Entrenamiento completado: ${distanceKm} km en ${durationFormatted}`,
      distance: distanceKm, // En km (como en la imagen)
      duration: durationFormatted, // En formato HH:MM:SS (como en la imagen)
      calories: calories, // Nueva columna
      user_email: userEmail,
      workout_type: 'carrera',
      activity_date: new Date().toISOString(),
      is_public: data.isPublic !== false,
      gps_points: data.runSession.gpsPoints?.slice(0, 50) || [] // Limitar puntos GPS
    };

    console.log('💾 [ULTRA SIMPLE] Datos para published_activities_simple:', activityData);

    // 4. INSERTAR EN SUPABASE
    const { data: savedActivity, error: insertError } = await supabase
      .from('published_activities_simple')
      .insert(activityData)
      .select()
      .single();

    if (!insertError && savedActivity) {
      console.log('✅ [ULTRA SIMPLE] ¡ACTIVIDAD GUARDADA EN SUPABASE!', savedActivity.id);
      
      // Backup en localStorage
      const localActivity = {
        ...activityData,
        id: savedActivity.id,
        created_at: savedActivity.created_at,
        source: 'supabase_success'
      };
      
      try {
        const existing = localStorage.getItem('publishedActivities') || '[]';
        const activities = JSON.parse(existing);
        activities.unshift(localActivity);
        localStorage.setItem('publishedActivities', JSON.stringify(activities.slice(0, 50)));
        console.log('💾 [ULTRA SIMPLE] También guardado en localStorage');
      } catch (localError) {
        console.warn('⚠️ Error en backup local:', localError);
      }
      
      return savedActivity.id;
    } else {
      console.error('❌ [ULTRA SIMPLE] Error insertando en Supabase:', insertError);
      throw new Error(insertError?.message || 'Error guardando en Supabase');
    }

  } catch (error) {
    console.error('💥 [ULTRA SIMPLE] Error general:', error);
    
    // Fallback LOCAL como último recurso
    const localActivity = {
      id: fallbackId,
      title: data.title,
      description: data.description || 'Entrenamiento guardado localmente',
      distance: Math.round(data.runSession.distance / 1000 * 100) / 100,
      duration: `00:${Math.floor(data.runSession.duration / 60).toString().padStart(2, '0')}:${Math.floor(data.runSession.duration % 60).toString().padStart(2, '0')}`,
      calories: Math.round(data.runSession.distance / 1000 * 60),
      user_email: 'local@fallback.com',
      created_at: new Date().toISOString(),
      source: 'local_fallback'
    };
    
    try {
      const existing = localStorage.getItem('publishedActivities') || '[]';
      const activities = JSON.parse(existing);
      activities.unshift(localActivity);
      localStorage.setItem('publishedActivities', JSON.stringify(activities.slice(0, 50)));
      console.log('💾 [ULTRA SIMPLE] Guardado solo en localStorage como fallback');
      return fallbackId;
    } catch (storageError) {
      console.error('☠️ [ULTRA SIMPLE] Error crítico total:', storageError);
      throw new Error('Error crítico guardando actividad');
    }
  }
};

/**
 * Obtener actividades desde published_activities_simple FILTRADAS POR USUARIO
 */
export const getPublishedActivitiesUltraSimple = async () => {
  console.log('📊 [ULTRA SIMPLE] === INICIANDO OBTENCIÓN DE ACTIVIDADES ===');
  
  // OBTENER USUARIO ACTUAL PRIMERO
  let currentUserId = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      currentUserId = user.id;
      console.log('👤 [ULTRA SIMPLE] Usuario autenticado encontrado:', user.email);
    } else {
      console.log('👤 [ULTRA SIMPLE] No hay usuario autenticado - modo anónimo');
    }
  } catch (authError) {
    console.log('👤 [ULTRA SIMPLE] Error obteniendo usuario:', authError);
  }
  
  // MÉTODO 1: Supabase con timeout Y FILTRO POR USUARIO
  try {
    console.log('☁️ [ULTRA SIMPLE] Intentando Supabase con filtro de usuario...');
    
    // Crear query con filtro por usuario
    let query = supabase
      .from('published_activities_simple')
      .select('*');
    
    // Filtrar por usuario autenticado o actividades anónimas
    if (currentUserId) {
      query = query.eq('user_id', currentUserId);
      console.log('🔍 [ULTRA SIMPLE] Filtrando por user_id:', currentUserId);
    } else {
      query = query.is('user_id', null);
      console.log('🔍 [ULTRA SIMPLE] Filtrando actividades anónimas (user_id IS NULL)');
    }
    
    const supabasePromise = query
      .order('created_at', { ascending: false })
      .limit(50);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase timeout')), 5000)
    );
    
    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (!error && data) {
      console.log(`✅ [ULTRA SIMPLE] Actividades desde Supabase (filtradas): ${data.length} actividades`);
      if (data.length > 0) {
        console.log('📊 [ULTRA SIMPLE] Primera actividad:', data[0]);
      }
      return data;
    } else {
      console.log('⚠️ [ULTRA SIMPLE] Sin datos en Supabase:', error?.message || 'Sin datos');
      throw new Error(error?.message || 'Sin datos en Supabase');
    }
  } catch (supabaseError) {
    console.error('❌ [ULTRA SIMPLE] Error con Supabase:', supabaseError);
  }

  // MÉTODO 2: localStorage CON FILTRO POR USUARIO
  try {
    console.log('📱 [ULTRA SIMPLE] Intentando localStorage...');
    const stored = localStorage.getItem('publishedActivities');
    let activities = stored ? JSON.parse(stored) : [];
    
    // Filtrar actividades por usuario en localStorage también
    if (currentUserId) {
      activities = activities.filter((activity: any) => activity.user_id === currentUserId);
      console.log(`📱 [ULTRA SIMPLE] Actividades desde localStorage (filtradas por user_id): ${activities.length}`);
    } else {
      activities = activities.filter((activity: any) => !activity.user_id);
      console.log(`📱 [ULTRA SIMPLE] Actividades desde localStorage (anónimas): ${activities.length}`);
    }
    
    if (activities.length > 0) {
      console.log('📊 [ULTRA SIMPLE] Primera actividad localStorage:', activities[0]);
      return activities;
    }
  } catch (localError) {
    console.error('💥 [ULTRA SIMPLE] Error localStorage:', localError);
  }

  // MÉTODO 3: Datos desde otras fuentes localStorage
  try {
    console.log('🔍 [ULTRA SIMPLE] Buscando en otros localStorage...');
    
    // Buscar en localStorage de actividades
    const userActivities = localStorage.getItem('userActivities');
    if (userActivities) {
      const parsed = JSON.parse(userActivities);
      console.log('📱 [ULTRA SIMPLE] Encontradas en userActivities:', parsed.length);
      if (parsed.length > 0) return parsed;
    }
    
    // Buscar entrenamientos completados
    const completedWorkouts = localStorage.getItem('completedWorkouts');
    if (completedWorkouts) {
      const parsed = JSON.parse(completedWorkouts);
      console.log('📱 [ULTRA SIMPLE] Encontradas en completedWorkouts:', parsed.length);
      if (parsed.length > 0) {
        // Convertir formato si es necesario
        return parsed.map((w: any) => ({
          id: w.id || `workout-${Date.now()}`,
          title: w.workout_title || w.workoutTitle || 'Entrenamiento',
          description: `Entrenamiento completado: ${w.distancia_recorrida || w.actualDistance || 0} km`,
          distance: w.distancia_recorrida || w.actualDistance || 0,
          duration: w.duracion || w.actualDuration || '00:30:00',
          calories: Math.round((w.distancia_recorrida || w.actualDistance || 0) * 60),
          user_email: 'local@workout.com',
          created_at: w.fecha_completado || w.completedAt || new Date().toISOString()
        }));
      }
    }
    
  } catch (otherError) {
    console.error('💥 [ULTRA SIMPLE] Error buscando otras fuentes:', otherError);
  }

  // MÉTODO 4: Datos de ejemplo como último recurso
  console.log('🔧 [ULTRA SIMPLE] Devolviendo datos de ejemplo');
  return [
    {
      id: 'example-fallback',
      title: 'Ejemplo - Carrera matutina',
      description: 'Datos de ejemplo. Completa un entrenamiento real para ver datos reales.',
      distance: 5.0,
      duration: '00:25:00',
      calories: 300,
      user_email: 'ejemplo@fallback.com',
      created_at: new Date().toISOString(),
      gps_points: []
    }
  ];
};
