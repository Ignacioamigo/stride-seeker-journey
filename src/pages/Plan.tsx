
import { useState, useEffect } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import { generateTrainingPlan, loadLatestPlan } from "@/services/planService";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import TrainingPlanDisplay from "@/components/plan/TrainingPlanDisplay";
import { WorkoutPlan } from "@/types";

const Plan: React.FC = () => {
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);

  // Load existing plan on component mount
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const plan = await loadLatestPlan();
        if (plan) {
          setCurrentPlan(plan);
        }
      } catch (error) {
        console.error("Error loading plan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlan();
  }, []);

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
        description: "Se ha creado tu plan de entrenamiento personalizado basado en tu perfil y en nuestra base de conocimientos.",
      });
    } catch (error) {
      console.error("Error al generar plan:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el plan. Verifica las variables de entorno en Supabase.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePlanUpdate = (updatedPlan: WorkoutPlan) => {
    setCurrentPlan(updatedPlan);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold mb-1">Hola, {user.name} 👋</h1>
          <p className="text-sm opacity-90">Tu plan personalizado de entrenamiento</p>
        </div>
        
        <div className="container max-w-md mx-auto p-4 flex justify-center items-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-runapp-purple mb-4" />
            <p className="text-runapp-gray">Cargando tu plan de entrenamiento...</p>
          </div>
        </div>
        
        <BottomNav />
      </div>
    );
  }

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
              Genera un plan personalizado basado en tu perfil, objetivos y nuestra base de conocimientos en entrenamientos de running.
            </p>
            <RunButton 
              onClick={handleGeneratePlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando plan con IA...
                </>
              ) : (
                "Generar nuevo plan de entrenamiento"
              )}
            </RunButton>
          </div>
        ) : (
          <TrainingPlanDisplay 
            plan={currentPlan} 
            onPlanUpdate={handlePlanUpdate} 
          />
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Plan;
