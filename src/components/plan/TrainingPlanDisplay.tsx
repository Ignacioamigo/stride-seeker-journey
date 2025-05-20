
import { WorkoutPlan, Workout } from "@/types";
import RunButton from "@/components/ui/RunButton";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrainingPlanDisplayProps {
  plan: WorkoutPlan;
}

const WorkoutCard: React.FC<{ workout: Workout }> = ({ workout }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-runapp-navy">{workout.title}</h3>
        <span className="text-xs bg-runapp-light-purple text-runapp-purple px-2 py-1 rounded-full">
          {workout.day}
        </span>
      </div>
      <p className="text-sm text-runapp-gray mb-2">{workout.description}</p>
      <div className="flex gap-3 text-xs text-runapp-gray">
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
    </div>
  );
};

const TrainingPlanDisplay: React.FC<TrainingPlanDisplayProps> = ({ plan }) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-runapp-navy">{plan.name}</h2>
            <p className="text-sm text-runapp-gray">{plan.duration} • {plan.intensity}</p>
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
      
      <h3 className="font-semibold text-runapp-navy mb-3">Tu semana de entrenamiento</h3>
      
      <div className="space-y-1">
        {plan.workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>
    </div>
  );
};

export default TrainingPlanDisplay;
