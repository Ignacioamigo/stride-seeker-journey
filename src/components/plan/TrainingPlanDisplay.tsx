
import { useState } from 'react';
import { WorkoutPlan, Workout } from "@/types";
import RunButton from "@/components/ui/RunButton";
import { Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WorkoutCompletionForm from './WorkoutCompletionForm';
import { updateWorkoutResults, generateNextWeekPlan } from '@/services/planService';
import { toast } from '@/components/ui/use-toast';

interface TrainingPlanDisplayProps {
  plan: WorkoutPlan;
  onPlanUpdate: (newPlan: WorkoutPlan) => void;
}

const WorkoutCard: React.FC<{ 
  workout: Workout;
  planId: string;
  onComplete: (workoutId: string, actualDistance: number | null, actualDuration: string | null) => Promise<void>;
  expanded: boolean;
  onToggleExpand: () => void;
}> = ({ workout, planId, onComplete, expanded, onToggleExpand }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-runapp-navy">{workout.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          workout.completed ? 'bg-green-100 text-green-700' : 'bg-runapp-light-purple text-runapp-purple'
        }`}>
          {workout.day}
        </span>
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
        <span className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-runapp-light-purple flex items-center justify-center mr-1">
            🏃
          </span>
          {workout.type === 'carrera' ? 'Carrera' : 
           workout.type === 'descanso' ? 'Descanso' : 
           workout.type === 'fuerza' ? 'Fuerza' : 
           workout.type === 'flexibilidad' ? 'Flexibilidad' : 'Otro'}
        </span>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={onToggleExpand}
          className="text-xs text-runapp-purple hover:underline"
        >
          {expanded ? 'Ocultar detalles' : 'Ver detalles'}
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

const TrainingPlanDisplay: React.FC<TrainingPlanDisplayProps> = ({ plan, onPlanUpdate }) => {
  const navigate = useNavigate();
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [isGeneratingNextWeek, setIsGeneratingNextWeek] = useState(false);
  
  const allWorkoutsCompleted = plan.workouts.every(workout => workout.completed);
  
  const handleCompleteWorkout = async (
    workoutId: string, 
    actualDistance: number | null, 
    actualDuration: string | null
  ) => {
    const updatedPlan = await updateWorkoutResults(
      plan.id,
      workoutId,
      actualDistance,
      actualDuration
    );
    
    if (updatedPlan) {
      onPlanUpdate(updatedPlan);
    }
  };
  
  const handleGenerateNextWeek = async () => {
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
    <div className="mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-runapp-navy">{plan.name}</h2>
            <p className="text-sm text-runapp-gray">
              {plan.duration} • {plan.intensity} {plan.weekNumber ? `• Semana ${plan.weekNumber}` : ''}
            </p>
          </div>
          <div className="p-2 bg-runapp-light-purple rounded-full">
            <Calendar className="text-runapp-purple" size={20} />
          </div>
        </div>
        <p className="text-runapp-gray mb-4 text-sm">{plan.description}</p>
        <RunButton 
          onClick={() => navigate('/train')}
          className="w-full"
        >
          Comenzar entrenamiento de hoy
        </RunButton>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-runapp-navy">Tu semana de entrenamiento</h3>
        
        {allWorkoutsCompleted && (
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
              "Generar semana siguiente"
            )}
          </RunButton>
        )}
      </div>
      
      <div className="space-y-1">
        {plan.workouts.map((workout) => (
          <WorkoutCard 
            key={workout.id} 
            workout={workout} 
            planId={plan.id}
            onComplete={handleCompleteWorkout}
            expanded={expandedWorkoutId === workout.id}
            onToggleExpand={() => setExpandedWorkoutId(
              expandedWorkoutId === workout.id ? null : workout.id
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default TrainingPlanDisplay;
