
import BottomNav from "@/components/layout/BottomNav";
import TrainingPlanDisplay from "@/components/plan/TrainingPlanDisplay";
import { useState, useEffect } from "react";
import { WorkoutPlan } from "@/types";
import { Loader2 } from "lucide-react";
import { StatsProvider } from "@/context/StatsContext";

const Plan: React.FC = () => {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      console.log("Attempting to load existing plan...");
      
      const savedPlan = localStorage.getItem('currentTrainingPlan');
      
      if (savedPlan) {
        try {
          const parsedPlan = JSON.parse(savedPlan);
          console.log("Plan loaded successfully:", parsedPlan.name);
          setPlan(parsedPlan);
        } catch (error) {
          console.error("Error parsing saved plan:", error);
        }
      } else {
        console.log("No existing plan found");
      }
      
      setIsLoading(false);
    };

    loadPlan();
  }, []);

  const handlePlanUpdate = (updatedPlan: WorkoutPlan) => {
    setPlan(updatedPlan);
    localStorage.setItem('currentTrainingPlan', JSON.stringify(updatedPlan));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-runapp-purple" />
      </div>
    );
  }

  return (
    <StatsProvider>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold">Mi Plan de Entrenamiento</h1>
        </div>
        
        <div className="container max-w-md mx-auto p-4">
          {plan ? (
            <TrainingPlanDisplay 
              plan={plan} 
              onPlanUpdate={handlePlanUpdate}
            />
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <h2 className="text-lg font-medium text-runapp-navy mb-2">No tienes un plan activo</h2>
              <p className="text-runapp-gray mb-4">
                Ve a la sección "Entrenar" para generar tu plan personalizado.
              </p>
            </div>
          )}
        </div>
        
        <BottomNav />
      </div>
    </StatsProvider>
  );
};

export default Plan;
