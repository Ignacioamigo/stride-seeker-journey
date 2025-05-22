
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
    
    console.log("Updating workout results:", { 
      planId, 
      workoutId, 
      actualDistance, 
      actualDuration 
    });
    
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
        console.log("Updating workout in database, workoutId:", workoutId);
        
        // First, try to find the session in the database by its UUID
        const { data: sessionData, error: findError } = await supabase
          .from('training_sessions')
          .select('*')
          .eq('id', workoutId)
          .single();
        
        if (findError || !sessionData) {
          console.log("Could not find session by UUID, trying to find by plan_id and other criteria...");
          
          // If not found by UUID, try to find by plan ID and workout details
          const workout = updatedWorkouts.find(w => w.id === workoutId);
          if (workout && plan.id) {
            const { data: planData } = await supabase
              .from('training_plans')
              .select('id')
              .eq('id', plan.id)
              .single();
            
            if (planData) {
              console.log("Found plan in database, searching for session by plan ID and day date");
              
              // Try to find by plan_id and day_date
              const { data: sessions, error: sessionsError } = await supabase
                .from('training_sessions')
                .select('*')
                .eq('plan_id', planData.id)
                .eq('day_date', workout.date)
                .eq('title', workout.title);
              
              if (!sessionsError && sessions && sessions.length > 0) {
                const sessionId = sessions[0].id;
                console.log("Found session by criteria:", sessionId);
                
                const { data, error } = await supabase
                  .from('training_sessions')
                  .update({
                    completed: true,
                    actual_distance: actualDistance,
                    actual_duration: actualDuration,
                    completion_date: new Date().toISOString()
                  })
                  .eq('id', sessionId)
                  .select();
                
                if (error) {
                  throw error;
                }
                
                console.log("Database update response:", data);
              } else {
                console.error("Could not find session in database", sessionsError);
              }
            }
          }
        } else {
          // Update directly if found by UUID
          const { data, error } = await supabase
            .from('training_sessions')
            .update({
              completed: true,
              actual_distance: actualDistance,
              actual_duration: actualDuration,
              completion_date: new Date().toISOString()
            })
            .eq('id', workoutId)
            .select();
          
          if (error) {
            throw error;
          }
          
          console.log("Database update response:", data);
        }
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
