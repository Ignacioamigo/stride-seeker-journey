import { supabase } from '@/integrations/supabase/client';

export const debugWorkoutCompletion = async (workoutId: string, planId: string) => {
  console.log('🔍 === DEBUGGING WORKOUT COMPLETION ===');
  
  try {
    // 1. Verificar autenticación
    console.log('🔍 1. Verificando autenticación...');
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    console.log('Auth user:', authUser?.user?.id || 'NO USER');
    console.log('Auth error:', authError);
    
    // 2. Verificar si el workout existe en training_sessions
    console.log('🔍 2. Verificando si workout existe en training_sessions...');
    const { data: existingWorkout, error: workoutError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', workoutId)
      .single();
    
    console.log('Existing workout:', existingWorkout);
    console.log('Workout error:', workoutError);
    
    // 3. Verificar si el plan existe
    console.log('🔍 3. Verificando si plan existe...');
    const { data: existingPlan, error: planError } = await supabase
      .from('training_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    console.log('Existing plan:', existingPlan);
    console.log('Plan error:', planError);
    
    // 4. Verificar todas las training_sessions del plan
    console.log('🔍 4. Verificando todas las training_sessions del plan...');
    const { data: allSessions, error: sessionsError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('plan_id', planId);
    
    console.log('All sessions for plan:', allSessions);
    console.log('Sessions error:', sessionsError);
    
    // 5. Verificar user_profiles
    console.log('🔍 5. Verificando user_profiles...');
    if (authUser?.user?.id) {
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_auth_id', authUser.user.id)
        .single();
      
      console.log('User profile:', userProfile);
      console.log('Profile error:', profileError);
    }
    
    // 6. Verificar datos de localStorage
    console.log('🔍 6. Verificando datos de localStorage...');
    const savedPlan = localStorage.getItem('savedPlan');
    if (savedPlan) {
      const planData = JSON.parse(savedPlan);
      console.log('LocalStorage plan ID:', planData.id);
      console.log('LocalStorage plan workouts:', planData.workouts.map((w: any) => ({
        id: w.id,
        title: w.title,
        completed: w.completed
      })));
    } else {
      console.log('No saved plan in localStorage');
    }
    
    return {
      authUser: authUser?.user?.id || null,
      workoutExists: !!existingWorkout,
      planExists: !!existingPlan,
      totalSessions: allSessions?.length || 0,
      errors: {
        auth: authError?.message,
        workout: workoutError?.message,
        plan: planError?.message,
        sessions: sessionsError?.message
      }
    };
    
  } catch (error) {
    console.error('🔍 Error en debugging:', error);
    return { error: error.message };
  }
};

export const attemptWorkoutUpdate = async (workoutId: string, actualDistance: number | null, actualDuration: string | null) => {
  console.log('🔄 === INTENTANDO ACTUALIZAR WORKOUT ===');
  console.log('🔄 Datos:', { workoutId, actualDistance, actualDuration });
  
  try {
    const updateData: any = {
      completed: true,
      completion_date: new Date().toISOString()
    };
    
    if (actualDistance !== null) {
      updateData.actual_distance = actualDistance;
    }
    
    if (actualDuration !== null && actualDuration.trim() !== '') {
      updateData.actual_duration = actualDuration.trim();
    }
    
    console.log('🔄 Update data:', updateData);
    
    const { data, error } = await supabase
      .from('training_sessions')
      .update(updateData)
      .eq('id', workoutId)
      .select();
    
    console.log('🔄 Update result:', { data, error });
    
    if (error) {
      console.error('🔄 Update failed:', error.message, error.details, error.hint);
      
      // Intentar update más simple
      console.log('🔄 Intentando update más simple...');
      const { data: simpleData, error: simpleError } = await supabase
        .from('training_sessions')
        .update({ completed: true })
        .eq('id', workoutId)
        .select();
        
      console.log('🔄 Simple update result:', { simpleData, simpleError });
    }
    
    return { data, error };
    
  } catch (error) {
    console.error('🔄 Exception en update:', error);
    return { error };
  }
}; 