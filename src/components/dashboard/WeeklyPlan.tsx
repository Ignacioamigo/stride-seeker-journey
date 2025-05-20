
import { useEffect, useState } from "react";
import RunButton from "../ui/RunButton";
import { useNavigate } from "react-router-dom";
import { loadLatestPlan } from "@/services/planService";
import { WorkoutPlan } from "@/types";

const WeeklyPlan: React.FC = () => {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLatestPlan = async () => {
      try {
        const plan = await loadLatestPlan();
        setActivePlan(plan);
      } catch (error) {
        console.error("Error loading plan:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestPlan();
  }, []);
  
  // Find today's workout if there's an active plan
  const todaysWorkout = activePlan?.workouts.find(w => {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    return w.day.toLowerCase().includes(today);
  });
  
  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-runapp-navy mb-3">Tu plan semanal</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <p className="text-runapp-gray">Cargando tu plan...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-runapp-navy mb-3">Tu plan semanal</h2>
      
      {!activePlan ? (
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
          <h3 className="font-semibold text-runapp-navy mb-2">{activePlan.name}</h3>
          <p className="text-sm text-runapp-gray mb-3">{activePlan.description}</p>
          
          {todaysWorkout ? (
            <div className="bg-runapp-light-purple/30 p-3 rounded-lg mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs bg-runapp-purple text-white px-2 py-1 rounded-full">Hoy</span>
                  <h4 className="font-medium text-runapp-navy mt-2">{todaysWorkout.title}</h4>
                  <p className="text-xs text-runapp-gray">{todaysWorkout.description}</p>
                </div>
                <RunButton 
                  onClick={() => navigate('/train')}
                  className="text-xs h-8 bg-runapp-purple"
                >
                  Comenzar
                </RunButton>
              </div>
            </div>
          ) : (
            <p className="text-sm text-runapp-gray italic mb-3">No hay entrenamiento programado para hoy</p>
          )}
          
          <RunButton 
            onClick={() => navigate('/plan')}
            className="w-full text-sm h-9"
            variant="outline"
          >
            Ver plan completo
          </RunButton>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlan;
