
import RunButton from "../ui/RunButton";
import { useNavigate } from "react-router-dom";

interface NextWorkoutProps {
  workout?: {
    title: string;
    duration: string;
    intensity: string;
  };
}

const NextWorkout: React.FC<NextWorkoutProps> = ({ 
  workout = {
    title: "Carrera de intervalos",
    duration: "30 minutos",
    intensity: "Moderada"
  }
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-runapp-light-purple rounded-xl p-4 mb-6">
      <h2 className="text-lg font-semibold text-runapp-navy mb-3">Tu próximo entrenamiento</h2>
      
      <div className="mb-4">
        <h3 className="text-xl font-bold text-runapp-navy">{workout.title}</h3>
        <p className="text-runapp-gray">
          {workout.duration} • {workout.intensity}
        </p>
      </div>
      
      <RunButton 
        onClick={() => navigate('/train')}
        variant="primary"
        className="bg-runapp-purple hover:bg-runapp-deep-purple"
      >
        Comenzar
      </RunButton>
    </div>
  );
};

export default NextWorkout;
