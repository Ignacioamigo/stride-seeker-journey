
import { useState, useEffect } from "react";
import { Loader2, Calendar, MapPin, Clock, ChevronDown, ChevronUp, WifiOff } from "lucide-react";
import { WorkoutPlan, Workout } from "@/types";
import { saveCompletedWorkout } from "@/services/completedWorkoutService";
import { generateNextWeekPlan } from "@/services/planService";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RunButton from "@/components/ui/RunButton";
import WorkoutCompletionForm from "./WorkoutCompletionForm";
import WeeklyFeedback from "@/components/feedback/WeeklyFeedback";

interface TrainingPlanDisplayProps {
  plan: WorkoutPlan;
  onPlanUpdate: (newPlan: WorkoutPlan) => void;
  offlineMode?: boolean;
}

const WorkoutCard: React.FC<{ 
  workout: Workout;
  planId: string;
  onComplete: (workoutId: string, actualDistance: number | null, actualDuration: string | null) => Promise<void>;
  expanded: boolean;
  onToggleExpand: () => void;
}> = ({ workout, planId, onComplete, expanded, onToggleExpand }) => {
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
      
      <div className="flex justify-end">
        <button 
          onClick={onToggleExpand}
          className="text-xs text-runapp-purple hover:underline"
        >
          {expanded ? 'Ocultar formulario' : 'Meter datos entrenamiento'}
        </button>
      </div>
      
      {expanded && (
        <WorkoutCompletionForm 
          workout={workout} 
          planId={planId}
          onComplete={onComplete}
        />
      )}
    </div>
  );
};

const TrainingPlanDisplay: React.FC<TrainingPlanDisplayProps> = ({ plan, onPlanUpdate, offlineMode }) => {
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan>(plan);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [isGeneratingNextWeek, setIsGeneratingNextWeek] = useState(false);
  const [showWeeklyFeedback, setShowWeeklyFeedback] = useState(false);

  // Update local plan when prop changes
  useEffect(() => {
    setCurrentPlan(plan);
  }, [plan]);

  // Sort workouts by date if dates are available
  const sortedWorkouts = [...currentPlan.workouts].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const handleCompleteWorkout = async (workoutId: string, actualDistance: number | null, actualDuration: string | null) => {
    try {
      console.log('🔄 INICIANDO handleCompleteWorkout', { workoutId, actualDistance, actualDuration });
      
      // Find the workout to get its title and type
      const workout = currentPlan.workouts.find(w => w.id === workoutId);
      if (!workout) {
        throw new Error("Workout no encontrado");
      }

      const savedToNewTable = await saveCompletedWorkout(
        workout.title,
        workout.type,
        actualDistance,
        actualDuration
      );

      if (savedToNewTable) {
        console.log("✅ Entrenamiento guardado en BD");

        const updatedWorkouts = currentPlan.workouts.map(workout => {
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
          ...currentPlan,
          workouts: updatedWorkouts
        };

        console.log('📊 Plan actualizado:', updatedPlan);
        setCurrentPlan(updatedPlan);
        onPlanUpdate(updatedPlan);

        setTimeout(() => {
          console.log("🔄 Actualizando estadísticas");
          
          // Check if week is completed
          const workoutsExcludingRest = updatedWorkouts.filter(w => w.type !== 'descanso');
          const completedWorkouts = workoutsExcludingRest.filter(w => w.completed);
          const isWeekCompleted = completedWorkouts.length === workoutsExcludingRest.length && workoutsExcludingRest.length > 0;
          
          if (isWeekCompleted) {
            console.log("🎉 ¡Semana completada! Mostrando feedback semanal");
            // Delay to let the current toast show first
            setTimeout(() => {
              setShowWeeklyFeedback(true);
            }, 2000);
          }
          
          window.dispatchEvent(new CustomEvent('statsUpdated'));
          window.dispatchEvent(new CustomEvent('workoutCompleted'));
        }, 500);

        console.log("✅ Proceso completado exitosamente");
      } else {
        throw new Error("No se pudo guardar en la base de datos");
      }
    } catch (error) {
      console.error("❌ Error en handleCompleteWorkout:", error);
      throw error;
    }
  };

  const handleGenerateNextWeek = async () => {
    setIsGeneratingNextWeek(true);
    try {
      const nextWeekPlan = await generateNextWeekPlan(currentPlan);
      
      if (nextWeekPlan) {
        toast({
          title: `¡Plan de Semana ${nextWeekPlan.weekNumber} generado!`,
          description: "Se ha creado el plan de entrenamiento para la siguiente semana basado en tus resultados.",
        });
        setCurrentPlan(nextWeekPlan);
        onPlanUpdate(nextWeekPlan);
      }
    } catch (error) {
      console.error("Error generando el plan de la siguiente semana:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el plan de la siguiente semana. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingNextWeek(false);
    }
  };

  const allWorkoutsCompleted = sortedWorkouts
    .filter(workout => workout.type !== 'descanso')
    .every(workout => workout.completed);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      {/* Weekly Feedback Modal */}
      <WeeklyFeedback
        isOpen={showWeeklyFeedback}
        onClose={() => setShowWeeklyFeedback(false)}
        plan={currentPlan}
        onGenerateNextWeek={handleGenerateNextWeek}
      />
      
      {!navigator.onLine && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <WifiOff className="h-4 w-4 mr-2 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Sin conexión. Los datos se sincronizarán cuando vuelvas a tener internet.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-runapp-navy">Tu semana de entrenamiento</h3>
        
        {allWorkoutsCompleted && !offlineMode && (
          <div className="flex gap-2">
            <RunButton 
              onClick={() => setShowWeeklyFeedback(true)}
              variant="outline" 
              className="text-xs h-8 py-0"
            >
              Ver Resumen
            </RunButton>
            <RunButton 
              onClick={handleGenerateNextWeek}
              variant="outline" 
              disabled={isGeneratingNextWeek}
              className="text-xs h-8 py-0"
            >
              {isGeneratingNextWeek ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Generando...
                </>
              ) : (
                "Semana siguiente"
              )}
            </RunButton>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        {sortedWorkouts.map((workout) => (
          <div key={workout.id} id={`workout-${workout.id}`}>
            <WorkoutCard 
              workout={workout} 
              planId={currentPlan.id}
              onComplete={handleCompleteWorkout}
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
