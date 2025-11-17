import { supabase } from '@/integrations/supabase/client';
import { WorkoutPublishData } from '@/types';
import { saveWorkoutSimple } from './simpleWorkoutService';

/**
 * SERVICIO SIMPLE PARA GUARDAR ACTIVIDADES EN AMBAS TABLAS
 * - workouts_simple (para estadísticas)
 * - published_activities (para la galería/Activities)
 */

export const publishActivitySimple = async (data: WorkoutPublishData): Promise<string> => {
  console.log('🚀 [SIMPLE ACTIVITY] Guardando actividad:', data.title);
  
  const fallbackId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // 1. GUARDAR EN workouts_simple PRIMERO (para estadísticas)
    console.log('📊 [SIMPLE ACTIVITY] Guardando en workouts_simple...');
    
    const distanceKm = Math.round(data.runSession.distance / 1000 * 100) / 100;
    
    // ✅ FIX: Convertir duration de STRING (HH:MM:SS) a minutos
    let durationMinutes = 0;
    const durationString = data.runSession.duration;
    
    if (typeof durationString === 'string' && durationString.includes(':')) {
      const parts = durationString.split(':');
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      durationMinutes = Math.round(totalSeconds / 60);
    } else if (typeof durationString === 'number') {
      // Si por alguna razón ya es número en segundos, convertir a minutos
      durationMinutes = Math.round(durationString / 60);
    }
    
    const workoutSaved = await saveWorkoutSimple(
      data.title,
      'carrera',
      distanceKm,
      `${durationMinutes} min`,
      null, // Sin plan específico
      null  // Sin semana específica
    );
    
    if (workoutSaved) {
      console.log('✅ [SIMPLE ACTIVITY] Guardado en workouts_simple exitosamente');
    } else {
      console.warn('⚠️ [SIMPLE ACTIVITY] Error guardando en workouts_simple');
    }

    // 2. GUARDAR EN published_activities (para Activities)
    console.log('📸 [SIMPLE ACTIVITY] Guardando en published_activities...');
    
    let userEmail = 'anonimo@app.com';
    let userId = null;
    
    // Intentar obtener usuario autenticado
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        userEmail = user.email;
        userId = user.id;
        console.log('👤 [SIMPLE ACTIVITY] Usuario autenticado:', userEmail);
      }
    } catch (authError) {
      console.log('👤 [SIMPLE ACTIVITY] Usuario anónimo');
    }

    // Datos ultra simples para published_activities
    const activityData = {
      user_id: userId, // Puede ser null para anónimos
      title: data.title.trim(),
      description: data.description?.trim() || `Carrera de ${distanceKm} km en ${durationMinutes} minutos`,
      distance: distanceKm,
      duration: data.runSession.duration,
      activity_date: new Date().toISOString(),
      is_public: data.isPublic !== false, // Por defecto público
      likes: 0,
      gps_points: data.runSession.gpsPoints?.slice(0, 100) || [], // Limitar puntos GPS
      image_url: null, // Sin imagen por ahora
      imported_from_strava: false
    };

    console.log('💾 [SIMPLE ACTIVITY] Datos para published_activities:', activityData);

    // Intentar guardar en published_activities
    const { data: savedActivity, error: publishError } = await supabase
      .from('published_activities')
      .insert(activityData)
      .select()
      .single();

    if (!publishError && savedActivity) {
      console.log('✅ [SIMPLE ACTIVITY] Actividad guardada en published_activities:', savedActivity.id);
      
      // Guardar también en localStorage como backup
      const localActivity = {
        id: savedActivity.id,
        ...activityData,
        user_email: userEmail,
        saved_at: new Date().toISOString(),
        source: 'train_section'
      };
      
      try {
        const existing = localStorage.getItem('userActivities') || '[]';
        const activities = JSON.parse(existing);
        activities.unshift(localActivity);
        localStorage.setItem('userActivities', JSON.stringify(activities.slice(0, 50))); // Mantener solo 50
        console.log('💾 [SIMPLE ACTIVITY] También guardado en localStorage');
      } catch (localError) {
        console.warn('⚠️ [SIMPLE ACTIVITY] Error guardando en localStorage:', localError);
      }
      
      return savedActivity.id;
    } else {
      console.error('❌ [SIMPLE ACTIVITY] Error guardando en published_activities:', publishError);
      
      // Fallback: solo localStorage
      const localActivity = {
        id: fallbackId,
        ...activityData,
        user_email: userEmail,
        saved_at: new Date().toISOString(),
        source: 'train_section_fallback'
      };
      
      try {
        const existing = localStorage.getItem('userActivities') || '[]';
        const activities = JSON.parse(existing);
        activities.unshift(localActivity);
        localStorage.setItem('userActivities', JSON.stringify(activities.slice(0, 50)));
        console.log('💾 [SIMPLE ACTIVITY] Guardado solo en localStorage como fallback');
        return fallbackId;
      } catch (localError) {
        console.error('💥 [SIMPLE ACTIVITY] Error crítico en fallback:', localError);
        throw new Error('No se pudo guardar la actividad');
      }
    }

  } catch (error) {
    console.error('💥 [SIMPLE ACTIVITY] Error general:', error);
    
    // Último recurso: localStorage básico
    const emergencyActivity = {
      id: fallbackId,
      title: data.title,
      description: data.description || 'Entrenamiento guardado',
      distance: Math.round(data.runSession.distance / 1000 * 100) / 100,
      duration: data.runSession.duration,
      user_email: 'error@app.com',
      activity_date: new Date().toISOString(),
      source: 'emergency_fallback'
    };
    
    try {
      localStorage.setItem('emergencyActivity_' + Date.now(), JSON.stringify(emergencyActivity));
      console.log('🆘 [SIMPLE ACTIVITY] Guardado de emergencia exitoso');
      return fallbackId;
    } catch (emergencyError) {
      console.error('☠️ [SIMPLE ACTIVITY] Error crítico total:', emergencyError);
      throw new Error('Error crítico guardando actividad');
    }
  }
};

/**
 * Obtener actividades guardadas (combinando Supabase + localStorage)
 */
export const getPublishedActivitiesSimple = async () => {
  try {
    console.log('📊 [SIMPLE ACTIVITY] Obteniendo actividades...');
    
    // Intentar desde Supabase primero
    const { data, error } = await supabase
      .from('published_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      console.log('✅ [SIMPLE ACTIVITY] Actividades desde Supabase:', data.length);
      return data;
    } else {
      console.log('⚠️ [SIMPLE ACTIVITY] Sin datos en Supabase, usando localStorage');
    }
  } catch (error) {
    console.error('❌ [SIMPLE ACTIVITY] Error obteniendo desde Supabase:', error);
  }

  // Fallback a localStorage
  try {
    const stored = localStorage.getItem('userActivities');
    const activities = stored ? JSON.parse(stored) : [];
    console.log('📱 [SIMPLE ACTIVITY] Actividades desde localStorage:', activities.length);
    return activities;
  } catch (error) {
    console.error('💥 [SIMPLE ACTIVITY] Error obteniendo desde localStorage:', error);
    return [];
  }
};
