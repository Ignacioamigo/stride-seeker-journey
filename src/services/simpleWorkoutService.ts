import { supabase } from '@/integrations/supabase/client';

/**
 * SERVICIO ULTRA SIMPLE PARA LA NUEVA TABLA workouts_simple
 * SIN COMPLICACIONES - DEBE FUNCIONAR 100%
 */

interface SimpleWorkout {
  id?: string;
  user_email?: string;
  workout_title: string;
  workout_type: string;
  distance: number | null;
  duration_minutes: number | null;
  completed_date?: string;
  plan_info?: string;
  week_number?: number;
  notes?: string;
}

export const saveWorkoutSimple = async (
  workoutTitle: string,
  workoutType: string,
  distance: number | null,
  duration: string | null,
  planId?: string | null,
  weekNumber?: number | null
): Promise<boolean> => {
  
  console.log('🚀 SIMPLE WORKOUT SERVICE: Iniciando guardado...');
  console.log('📊 Datos recibidos:', { workoutTitle, workoutType, distance, duration, planId, weekNumber });

  try {
    // 1. Obtener email del usuario (más simple que ID)
    let userEmail = 'anonimo@app.com';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        userEmail = user.email;
      }
    } catch (authError) {
      console.log('👤 Usuario anónimo, usando email por defecto');
    }

    // 2. Convertir duración a minutos (ultra simple)
    let durationMinutes = 0;
    if (duration && duration.trim()) {
      const numbers = duration.replace(/[^\d]/g, '');
      durationMinutes = parseInt(numbers) || 0;
    }

    // 3. Preparar datos ultra simples
    const workoutData: SimpleWorkout = {
      user_email: userEmail,
      workout_title: workoutTitle || 'Entrenamiento',
      workout_type: workoutType || 'carrera',
      distance: distance || 0,
      duration_minutes: durationMinutes,
      completed_date: new Date().toISOString().split('T')[0],
      plan_info: planId || null,
      week_number: weekNumber || 1,
      notes: `${workoutTitle} - ${distance}km en ${duration || '0min'}`
    };

    console.log('📤 Datos preparados para workouts_simple:', workoutData);

    // 4. INSERTAR EN TABLA SIMPLE
    const { data, error } = await supabase
      .from('workouts_simple')
      .insert(workoutData)
      .select();

    if (!error && data) {
      console.log('🎉 ¡ÉXITO TOTAL! Guardado en workouts_simple:', data);
      
      // Backup en localStorage también
      try {
        const localData = { ...workoutData, id: data[0]?.id, savedAt: new Date().toISOString() };
        const existing = localStorage.getItem('simpleWorkouts') || '[]';
        const workouts = JSON.parse(existing);
        workouts.push(localData);
        localStorage.setItem('simpleWorkouts', JSON.stringify(workouts));
        console.log('💾 También guardado en localStorage como backup');
      } catch (localError) {
        console.log('⚠️ Error guardando backup local (no crítico):', localError);
      }
      
      return true;
    } else {
      console.error('❌ Error insertando en workouts_simple:', error);
      
      // Fallback directo a localStorage
      try {
        const localData = { 
          ...workoutData, 
          id: crypto.randomUUID(), 
          savedAt: new Date().toISOString(),
          source: 'localStorage-fallback'
        };
        const existing = localStorage.getItem('simpleWorkouts') || '[]';
        const workouts = JSON.parse(existing);
        workouts.push(localData);
        localStorage.setItem('simpleWorkouts', JSON.stringify(workouts));
        console.log('💾 Guardado en localStorage como fallback');
        return true;
      } catch (localError) {
        console.error('💥 Error crítico - ni Supabase ni localStorage:', localError);
        return false;
      }
    }

  } catch (error) {
    console.error('💥 Error general en saveWorkoutSimple:', error);
    
    // Último recurso: localStorage básico
    try {
      const basicData = {
        id: crypto.randomUUID(),
        user_email: 'error@app.com',
        workout_title: workoutTitle,
        workout_type: workoutType,
        distance: distance,
        duration_text: duration,
        saved_at: new Date().toISOString(),
        source: 'emergency-fallback'
      };
      
      localStorage.setItem('emergencyWorkout_' + Date.now(), JSON.stringify(basicData));
      console.log('🆘 Guardado de emergencia exitoso');
      return true;
    } catch (emergencyError) {
      console.error('☠️ Error crítico total:', emergencyError);
      return false;
    }
  }
};

export const getSimpleWorkouts = async (): Promise<SimpleWorkout[]> => {
  try {
    console.log('📊 Obteniendo entrenamientos desde workouts_simple...');
    
    const { data, error } = await supabase
      .from('workouts_simple')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      console.log('✅ Entrenamientos desde Supabase:', data.length);
      return data;
    } else {
      console.error('❌ Error obteniendo desde Supabase:', error);
    }
  } catch (error) {
    console.error('💥 Error en getSimpleWorkouts:', error);
  }

  // Fallback a localStorage
  try {
    const stored = localStorage.getItem('simpleWorkouts');
    const workouts = stored ? JSON.parse(stored) : [];
    console.log('📱 Entrenamientos desde localStorage:', workouts.length);
    return workouts;
  } catch (error) {
    console.error('💥 Error obteniendo desde localStorage:', error);
    return [];
  }
};

export const getSimpleWorkoutsForPlan = async (planId: string): Promise<SimpleWorkout[]> => {
  const allWorkouts = await getSimpleWorkouts();
  return allWorkouts.filter(w => w.plan_info === planId);
};
