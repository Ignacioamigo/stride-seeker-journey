/**
 * SYNC PLAN SERVICE
 * 
 * Este servicio sincroniza el plan local con Supabase,
 * creando training_sessions si no existen.
 */

import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan } from '@/types';

export const syncPlanWithDatabase = async (plan: WorkoutPlan): Promise<WorkoutPlan | null> => {
  try {
    console.log('🔄 [SYNC] Sincronizando plan con Supabase...');
    console.log('📋 [SYNC] Plan ID:', plan.id);
    console.log('📋 [SYNC] Workouts a sincronizar:', plan.workouts.length);
    
    // ESTRATEGIA SIMPLIFICADA:
    // En lugar de intentar crear el plan (que causa errores de columnas),
    // vamos a crear SOLO las training_sessions directamente
    // Las training_sessions NO requieren que exista el plan en training_plans
    // porque las vamos a crear con plan_id NULL
    
    console.log('🔧 [SYNC] Creando training_sessions directamente...');
    
    // Verificar si las training_sessions ya existen (por ID directo)
    const workoutIds = plan.workouts.map(w => w.id);
    const { data: existingSessions } = await supabase
      .from('training_sessions')
      .select('id')
      .in('id', workoutIds);
    
    console.log(`📊 [SYNC] Training sessions existentes: ${existingSessions?.length || 0}`);
    console.log(`📊 [SYNC] Workouts en el plan: ${plan.workouts.length}`);
    
    // Identificar cuáles faltan
    const existingIds = new Set(existingSessions?.map(s => s.id) || []);
    const missingWorkouts = plan.workouts.filter(w => !existingIds.has(w.id));
    
    console.log(`📊 [SYNC] Training sessions faltantes: ${missingWorkouts.length}`);
    
    if (missingWorkouts.length > 0) {
      console.log('🔧 [SYNC] Creando training_sessions faltantes...');
      
      // Create training_sessions SIN plan_id (para evitar FK constraint)
      const sessionsToInsert = missingWorkouts.map((workout, index) => {
        const workoutDate = workout.date ? new Date(workout.date) : new Date();
        if (!workout.date) {
          workoutDate.setDate(new Date().getDate() + index);
        }
        
        return {
          id: workout.id, // ✅ Usar el ID exacto del workout
          plan_id: null, // ⚠️ NULL para evitar FK constraint
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
        };
      });
      
      console.log('📊 [SYNC] Sesiones a insertar:', sessionsToInsert.length);
      console.log('📋 [SYNC] Ejemplo de sesión:', sessionsToInsert[0]);
      
      const { data: insertedSessions, error: insertError } = await supabase
        .from('training_sessions')
        .insert(sessionsToInsert)
        .select();
      
      if (insertError) {
        console.error('❌ [SYNC] Error insertando training_sessions:', insertError);
        console.error('❌ [SYNC] Detalles del error:', JSON.stringify(insertError, null, 2));
        
        // Intentar insertar una por una para identificar cuál falla
        console.log('🔧 [SYNC] Intentando insertar una por una...');
        for (const session of sessionsToInsert) {
          const { error: singleError } = await supabase
            .from('training_sessions')
            .insert(session);
          
          if (singleError) {
            console.error(`❌ [SYNC] Error en sesión ${session.title}:`, singleError);
          } else {
            console.log(`✅ [SYNC] Sesión ${session.title} creada`);
          }
        }
        
        return null;
      }
      
      console.log(`✅ [SYNC] ${insertedSessions?.length || 0} training_sessions creadas`);
      insertedSessions?.forEach(s => console.log(`  📌 ${s.title} (ID: ${s.id})`));
    } else {
      console.log('✅ [SYNC] Todas las training sessions ya existen');
    }
    
    // Recargar todas las sesiones con IDs de los workouts
    const { data: allSessions } = await supabase
      .from('training_sessions')
      .select('*')
      .in('id', workoutIds)
      .order('day_number', { ascending: true });
    
    if (!allSessions || allSessions.length === 0) {
      console.error('❌ [SYNC] No se encontraron training_sessions después de crear');
      return null;
    }
    
    console.log(`✅ [SYNC] ${allSessions.length} training_sessions verificadas en Supabase`);
    
    // Construir plan sincronizado con los IDs correctos
    const syncedPlan: WorkoutPlan = {
      ...plan,
      workouts: plan.workouts.map(workout => {
        // Buscar la sesión correspondiente en Supabase
        const session = allSessions.find(s => s.id === workout.id);
        
        if (session) {
          // Actualizar con datos de Supabase
          return {
            ...workout,
            completed: session.completed || false,
            actualDistance: session.actual_distance,
            actualDuration: session.actual_duration,
          };
        }
        
        // Si no se encontró, usar el workout original
        return workout;
      })
    };
    
    // Actualizar localStorage
    localStorage.setItem('savedPlan', JSON.stringify(syncedPlan));
    console.log('✅ [SYNC] Plan sincronizado correctamente');
    console.log('✅ [SYNC] Workout IDs verificados:', syncedPlan.workouts.map(w => w.id));
    
    return syncedPlan;
    
  } catch (error) {
    console.error('❌ [SYNC] Error sincronizando plan:', error);
    return null;
  }
};

