
import { useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import { generateTrainingPlan } from "@/services/planService";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import TrainingPlanDisplay from "@/components/plan/TrainingPlanDisplay";
import { WorkoutPlan } from "@/types";

const Plan: React.FC = () => {
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);

  const handleGeneratePlan = async () => {
    if (!user.completedOnboarding) {
      toast({
        title: "Completa tu perfil",
        description: "Para generar un plan personalizado, primero completa tu perfil.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const plan = await generateTrainingPlan({ userProfile: user });
      setCurrentPlan(plan);
      toast({
        title: "Plan generado",
        description: "Se ha creado tu plan de entrenamiento personalizado.",
      });
    } catch (error) {
      console.error("Error al generar plan:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el plan. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold mb-1">Hola, {user.name} 👋</h1>
        <p className="text-sm opacity-90">Tu plan personalizado de entrenamiento</p>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        {!currentPlan ? (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-6">
            <h2 className="text-xl font-semibold text-runapp-navy mb-3">No tienes un plan de entrenamiento</h2>
            <p className="text-runapp-gray mb-4">
              Genera un plan personalizado basado en tu perfil y objetivos.
            </p>
            <RunButton 
              onClick={handleGeneratePlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                "Generar nuevo plan de entrenamiento"
              )}
            </RunButton>
          </div>
        ) : (
          <TrainingPlanDisplay plan={currentPlan} />
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Plan;
