
import RunButton from "../ui/RunButton";
import { useNavigate } from "react-router-dom";

const WeeklyPlan: React.FC = () => {
  const navigate = useNavigate();
  const hasActivePlan = false;
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-runapp-navy mb-3">Tu plan semanal</h2>
      
      {!hasActivePlan ? (
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <p className="text-runapp-gray mb-4">No tienes un plan de entrenamiento activo</p>
          <RunButton 
            onClick={() => navigate('/plan')}
            className="bg-runapp-purple"
          >
            Generar nuevo plan de entrenamiento
          </RunButton>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          {/* Plan content would go here */}
          <p className="text-runapp-gray">Weekly plan details...</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlan;
