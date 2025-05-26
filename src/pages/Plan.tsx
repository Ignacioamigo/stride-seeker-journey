
import { useEffect, useState } from 'react';
import BottomNav from "@/components/layout/BottomNav";
import TrainingPlanDisplay from '@/components/plan/TrainingPlanDisplay';
import { loadLatestPlan } from '@/services/planService';
import { WorkoutPlan } from '@/types';
import { StatsProvider } from '@/context/StatsContext';

const Plan: React.FC = () => {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      console.log("Attempting to load existing plan...");
      try {
        const savedPlan = await loadLatestPlan();
        if (savedPlan) {
          console.log("Plan loaded successfully:", savedPlan.name);
          setPlan(savedPlan);
        } else {
          console.log("No saved plan found");
        }
      } catch (error) {
        console.error("Error loading plan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, []);

  const handlePlanUpdate = (updatedPlan: WorkoutPlan) => {
    console.log("Plan updated, refreshing display");
    setPlan(updatedPlan);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold">Mi Plan</h1>
        </div>
        <div className="container max-w-md mx-auto p-4">
          <div className="flex justify-center items-center h-40">
            <p className="text-runapp-gray">Cargando plan...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold">Mi Plan</h1>
        </div>
        <div className="container max-w-md mx-auto p-4">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <h2 className="text-lg font-medium text-runapp-navy mb-2">No tienes un plan activo</h2>
            <p className="text-runapp-gray mb-4">Crea tu primer plan de entrenamiento personalizado</p>
            <a 
              href="/train" 
              className="inline-block bg-runapp-purple text-white px-6 py-2 rounded-lg hover:bg-runapp-purple/90 transition-colors"
            >
              Crear Plan
            </a>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <StatsProvider>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold">Mi Plan</h1>
        </div>
        
        <div className="container max-w-md mx-auto p-4">
          <TrainingPlanDisplay 
            plan={plan} 
            onPlanUpdate={handlePlanUpdate}
          />
        </div>
        
        <BottomNav />
      </div>
    </StatsProvider>
  );
};

export default Plan;
