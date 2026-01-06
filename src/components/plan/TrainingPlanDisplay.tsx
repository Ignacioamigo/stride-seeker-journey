
import { useState, useEffect } from 'react';
import { WorkoutPlan, Workout } from "@/types";
import RunButton from "@/components/ui/RunButton";
import { Calendar, Loader2, WifiOff, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WorkoutCompletionForm from './WorkoutCompletionForm';
import { generateNextWeekPlan } from '@/services/planService';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeeklyFeedback } from '@/context/WeeklyFeedbackContext';
import { supabase } from '@/integrations/supabase/client';
import { debugWorkoutCompletion, attemptWorkoutUpdate } from '@/utils/debugWorkoutCompletion';

interface TrainingPlanDisplayProps {
  plan: WorkoutPlan;
  onPlanUpdate: (newPlan: WorkoutPlan) => void;
  offlineMode?: boolean;
}

const WorkoutCard: React.FC<{ 
  workout: Workout;
  planId: string;
  weekNumber?: number;
  onComplete: (workoutId: string, actualDistance: number | null, actualDuration: string | null) => Promise<void>;
  onStartWorkout: (workoutId: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}> = ({ workout, planId, weekNumber, onComplete, onStartWorkout, expanded, onToggleExpand }) => {
  // No mostrar los entrenamientos de tipo "descanso"
  if (workout.type === 'descanso') {
    return null;
  }
  
  // Format the date if available
  const formattedDate = workout.date 
    ? new Date(workout.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) 
    : '';
  
  // Check if this workout is today
  const isToday = workout.date 
    ? new Date(workout.date).toDateString() === new Date().toDateString() 
    : false;
  
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm mb-3 ${isToday ? 'border-2 border-runapp-purple' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-runapp-navy">{workout.title}</h3>
        <div className="flex flex-col items-end">
          <span className={`text-xs px-2 py-1 rounded-full ${
            workout.completed ? 'bg-green-100 text-green-700' : 'bg-runapp-light-purple text-runapp-purple'
          }`}>
            {workout.day}
          </span>
          {formattedDate && (
            <span className="text-xs text-runapp-gray mt-1">{formattedDate}</span>
          )}
          {isToday && (
            <span className="text-xs bg-runapp-purple text-white px-2 py-0.5 rounded-full mt-1">Hoy</span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-runapp-gray mb-2">{workout.description}</p>
      
      <div className="flex gap-3 text-xs text-runapp-gray mb-3">
        {workout.distance && (
          <span className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-runapp-light-purple flex items-center justify-center mr-1">
              📏
            </span>
            {workout.distance} km
          </span>
        )}
        {workout.duration && (
          <span className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-runapp-light-purple flex items-center justify-center mr-1">
              ⏱️
            </span>
            {workout.duration}
          </span>
        )}
        {workout.targetPace && (
          <span className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-runapp-light-purple flex items-center justify-center mr-1">
              🏃
            </span>
            {workout.targetPace}/km
          </span>
        )}
        <span className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-runapp-light-purple flex items-center justify-center mr-1">
            🔄
          </span>
          {workout.type === 'carrera' ? 'Carrera' : 
           workout.type === 'fuerza' ? 'Fuerza' : 
           workout.type === 'flexibilidad' ? 'Flexibilidad' : 'Otro'}
        </span>
      </div>
      
      <div className="flex justify-between items-center gap-2">
        {/* Botón Iniciar Entrenamiento - A la izquierda */}
        {!workout.completed && (
          <button 
            onClick={() => onStartWorkout(workout.id)}
            className="flex items-center gap-2 px-4 py-2 bg-runapp-purple text-white rounded-lg text-sm font-semibold hover:bg-runapp-deep-purple transition-colors"
          >
            <Play className="w-4 h-4" />
            Iniciar entrenamiento
          </button>
        )}
        
        {/* Botón Meter datos - A la derecha */}
        <button 
          onClick={() => {
            onToggleExpand();
            // Si se está expandiendo, hacer scroll después de un pequeño delay para que el contenido se renderice
            if (!expanded) {
              setTimeout(() => {
                const element = document.getElementById(`workout-${workout.id}`);
                if (element) {
                  element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' // Centrar el elemento en la vista
                  });
                }
              }, 100);
            }
          }}
          className="text-xs text-runapp-purple hover:underline ml-auto"
        >
          {expanded ? 'Ocultar formulario' : 'Meter datos entrenamiento'}
        </button>
      </div>
      
      {expanded && (
        <WorkoutCompletionForm 
          workout={workout} 
          planId={planId}
          weekNumber={weekNumber}
          onComplete={onComplete}
        />
      )}
    </div>
  );
};

const TrainingPlanDisplay: React.FC<TrainingPlanDisplayProps> = ({ plan, onPlanUpdate, offlineMode = false }) => {
  const navigate = useNavigate();
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [isGeneratingNextWeek, setIsGeneratingNextWeek] = useState(false);
  const { showWeeklyFeedback, isGeneratingFeedback } = useWeeklyFeedback();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Listener para actualizar el plan cuando se complete un entrenamiento GPS
  useEffect(() => {
    const handleWorkoutCompleted = () => {
      console.log('🎉 [TRAINING PLAN] Entrenamiento completado, actualizando plan...');
      setRefreshKey(prev => prev + 1);
      
      // Recargar el plan desde Supabase para ver los cambios
      setTimeout(() => {
        window.location.reload(); // Temporal: recargar página para ver cambios
      }, 1000);
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
    };
  }, []);
  
  // Función para iniciar entrenamiento con GPS
  const handleStartWorkout = (workoutId: string) => {
    console.log('🚀 Iniciando entrenamiento con GPS para workout:', workoutId);
    console.log('📋 Workout ID que se guardará:', workoutId);
    
    // Guardar el training_session_id en localStorage para que el GPS tracker lo use
    localStorage.setItem('active_training_session_id', workoutId);
    
    toast({
      title: "Iniciando GPS",
      description: "Te llevaremos al tracker para que inicies tu entrenamiento.",
    });
    
    // Navegar al GPS tracker (ruta correcta: /train)
    navigate('/train');
  };
  
  // Sort workouts by date if dates are available
  const sortedWorkouts = [...plan.workouts].sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return 0; // Keep original order if no dates
    }
  });
  
  // Filtrar los entrenamientos para excluir los días de descanso
  const activeWorkouts = sortedWorkouts.filter(workout => workout.type !== 'descanso');
  
  const allWorkoutsCompleted = activeWorkouts.every(workout => workout.completed);
  
  // Find today's workout
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysWorkout = sortedWorkouts.find(w => {
    if (w.date) {
      const workoutDate = new Date(w.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === today.getTime();
    }
    return false;
  });
  
  const handleCompleteWorkout = async (
    workoutId: string, 
    actualDistance: number | null, 
    actualDuration: string | null
  ) => {
    try {
      console.log("🚀 === INICIANDO COMPLETION DE WORKOUT ===");
      console.log("🚀 Datos:", { workoutId, actualDistance, actualDuration, planId: plan.id });
      
      // PASO 0: DEBUGGING EXHAUSTIVO
      console.log("🔍 === EJECUTANDO DEBUGGING COMPLETO ===");
      const debugResult = await debugWorkoutCompletion(workoutId, plan.id);
      console.log("🔍 Debug result:", debugResult);
      
      // PASO 1: Intentar actualizar en Supabase con debugging
      console.log("🔄 === INTENTANDO ACTUALIZAR SUPABASE ===");
      const updateResult = await attemptWorkoutUpdate(workoutId, actualDistance, actualDuration);
      console.log("🔄 Update result:", updateResult);
      
      // PASO 2: Actualizar localStorage SIEMPRE
      console.log("💾 === ACTUALIZANDO LOCALSTORAGE ===");
      
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

      const updatedPlan: WorkoutPlan = {
        ...plan,
        workouts: updatedWorkouts
      };

      // Guardar en localStorage
      localStorage.setItem('savedPlan', JSON.stringify(updatedPlan));
      
      // Actualizar el estado
      onPlanUpdate(updatedPlan);
      
      // Colapsar el formulario
      setExpandedWorkoutId(null);
      
      console.log("💾 ✅ LocalStorage actualizado exitosamente");
      
      // PASO 3: Verificar el resultado final
      console.log("🔍 === VERIFICACIÓN FINAL ===");
      const finalDebug = await debugWorkoutCompletion(workoutId, plan.id);
      console.log("🔍 Estado final:", finalDebug);
      
      // PASO 4: Verificar getCompletedWorkoutsForPlan
      try {
        const { getCompletedWorkoutsForPlan } = await import('@/services/completedWorkoutService');
        const completedWorkouts = await getCompletedWorkoutsForPlan(plan.id);
        console.log("🔍 getCompletedWorkoutsForPlan result:", completedWorkouts);
      } catch (importError) {
        console.error("🔍 Error importing getCompletedWorkoutsForPlan:", importError);
      }
      
      toast({
        title: "Entrenamiento completado",
        description: `Distancia: ${actualDistance || 0} km. Revisa la consola para debug info.`,
      });
      
    } catch (error) {
      console.error("🚀 Error general en handleCompleteWorkout:", error);
      
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el plan. Revisa la consola.",
        variant: "destructive",
      });
    }
  };
  
  const handleGenerateNextWeek = async () => {
    const currentWeekNumber = plan.weekNumber || 1;
    
    // 🔍 DEBUG: Logs detallados
    console.log('========================================');
    console.log('🔍 DEBUG handleGenerateNextWeek');
    console.log('📊 plan.weekNumber:', plan.weekNumber);
    console.log('📊 currentWeekNumber (con fallback):', currentWeekNumber);
    
    // 🔒 Verificar estado premium desde la BASE DE DATOS (no localStorage)
    let isPremium = false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('📊 user:', user?.id);
      
      if (user) {
        const { data: userProfile, error } = await supabase
          .from('user_profiles')
          .select('is_premium')
          .eq('user_auth_id', user.id)
          .single();
        
        console.log('📊 userProfile from DB:', userProfile);
        console.log('📊 DB error:', error);
        
        isPremium = userProfile?.is_premium === true;
        
        // Sincronizar localStorage con el valor real de la DB
        localStorage.setItem('isPremium', isPremium.toString());
      }
    } catch (error) {
      console.error('❌ Error verificando premium:', error);
      // En caso de error, usar localStorage como fallback
      isPremium = localStorage.getItem('isPremium') === 'true';
    }
    
    console.log('📊 isPremium (desde DB):', isPremium);
    console.log('📊 Condición (currentWeekNumber === 1):', currentWeekNumber === 1);
    console.log('📊 Condición (!isPremium):', !isPremium);
    console.log('📊 Debería ir al paywall:', currentWeekNumber === 1 && !isPremium);
    console.log('========================================');
    
    // 🔒 Si es Semana 1 y NO es premium → Mostrar paywall para desbloquear Semana 2
    if (currentWeekNumber === 1 && !isPremium) {
      console.log('🔒 ✅ ENTRANDO AL PAYWALL - Semana 1 + no premium');
      navigate('/paywall-week2');
      return;
    }
    
    // ✅ Si es Semana 2+ o es premium → Mostrar feedback normal y generar siguiente semana
    console.log('🎯 NO entró al paywall - mostrando feedback normal');
    console.log('   Razón: currentWeekNumber !== 1 OR isPremium === true');
    
    await showWeeklyFeedback(plan, () => {
      console.log('✅ Feedback cerrado - procediendo a generar siguiente semana');
      performPlanGeneration();
    });
  };

  const performPlanGeneration = async () => {
    setIsGeneratingNextWeek(true);
    try {
      const nextWeekPlan = await generateNextWeekPlan(plan);
      
      if (nextWeekPlan) {
        toast({
          title: `¡Plan de Semana ${nextWeekPlan.weekNumber} generado!`,
          description: "Se ha creado el plan de entrenamiento para la siguiente semana basado en tus resultados.",
        });
        onPlanUpdate(nextWeekPlan);
      }
    } catch (error) {
      console.error("Error generando el plan de la siguiente semana:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el plan de la siguiente semana.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingNextWeek(false);
    }
  };
  
  return (
    <div className="mb-4">
      {offlineMode && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <WifiOff className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 text-sm">
            Este plan se generó en modo offline y puede tener funcionalidad limitada.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-runapp-navy">{plan.name}</h2>
            <p className="text-sm text-runapp-gray">
              {plan.duration} • {plan.intensity} {plan.weekNumber ? `• Semana ${plan.weekNumber}` : ''}
            </p>
            {plan.createdAt && (
              <p className="text-xs text-runapp-gray mt-1">
                Generado el: {new Date(plan.createdAt).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
          <div className="p-2 bg-runapp-light-purple rounded-full">
            <Calendar className="text-runapp-purple" size={20} />
          </div>
        </div>
        <p className="text-runapp-gray mb-4 text-sm">{plan.description}</p>
        
        {/* Mostrar carrera objetivo actual si existe */}
        {window.localStorage.getItem('runAdaptiveUser') && (() => {
          try {
            const userData = JSON.parse(window.localStorage.getItem('runAdaptiveUser') || '{}');
            return userData.targetRace ? (
              <div className="bg-runapp-light-purple/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-runapp-purple font-medium mb-1">🎯 Carrera objetivo:</p>
                <p className="text-sm text-runapp-navy font-semibold">{userData.targetRace.name}</p>
              </div>
            ) : null;
          } catch {
            return null;
          }
        })()}
        
        {todaysWorkout && todaysWorkout.type !== 'descanso' && (
          <RunButton 
            onClick={() => {
              setExpandedWorkoutId(todaysWorkout.id);
              const element = document.getElementById(`workout-${todaysWorkout.id}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full"
          >
            Comenzar entrenamiento de hoy
          </RunButton>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-runapp-navy">Tu semana de entrenamiento</h3>
        
        {allWorkoutsCompleted && !offlineMode && (
          <RunButton 
            onClick={handleGenerateNextWeek}
            variant="outline" 
            disabled={isGeneratingNextWeek || isGeneratingFeedback}
            className="text-xs h-8 py-0"
          >
            {isGeneratingFeedback ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Analizando semana...
              </>
            ) : isGeneratingNextWeek ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Generando...
              </>
            ) : (
              "Ver resumen y generar siguiente"
            )}
          </RunButton>
        )}
      </div>
      
      <div className="space-y-1 pb-4">
        {sortedWorkouts.map((workout) => (
          <div key={workout.id} id={`workout-${workout.id}`}>
            <WorkoutCard 
              workout={workout} 
              planId={plan.id}
              weekNumber={plan.weekNumber}
              onComplete={handleCompleteWorkout}
              onStartWorkout={handleStartWorkout}
              expanded={expandedWorkoutId === workout.id}
              onToggleExpand={() => setExpandedWorkoutId(
                expandedWorkoutId === workout.id ? null : workout.id
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingPlanDisplay;
