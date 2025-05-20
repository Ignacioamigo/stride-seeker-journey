
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
  const [connectionError, setConnectionError] = useState(false);

  // Check for Supabase environment variables on component mount
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Variables de entorno de Supabase no encontradas:", { 
        url: supabaseUrl ? "✓" : "✗", 
        key: supabaseAnonKey ? "✓" : "✗" 
      });
      setConnectionError(true);
    } else {
      console.log("Variables de entorno de Supabase configuradas correctamente");
      setConnectionError(false);
    }
  }, []);

  // Load existing plan on component mount
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        console.log("Intentando cargar el plan existente...");
        const plan = await loadLatestPlan();
        if (plan) {
          console.log("Plan cargado exitosamente:", plan.name);
          setCurrentPlan(plan);
        } else {
          console.log("No se encontró ningún plan existente");
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
      console.log("Iniciando generación de plan con los siguientes datos:", {
        name: user.name,
        age: user.age,
        experienceLevel: user.experienceLevel,
        goal: user.goal
      });
      
      // Verifica nuevamente las variables de entorno antes de proceder
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error("Variables de entorno no encontradas:", {
          VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
        });
        throw new Error("Faltan variables de entorno para Supabase");
      }
      
      const plan = await generateTrainingPlan({ userProfile: user });
      console.log("Plan generado exitosamente:", plan);
      setCurrentPlan(plan);
      toast({
        title: "Plan generado",
        description: "Se ha creado tu plan de entrenamiento personalizado basado en tu perfil y en nuestra base de conocimientos.",
      });
    } catch (error) {
      console.error("Error al generar plan:", error);
      toast({
        title: "Error",
        description: connectionError 
          ? "Variables de entorno de Supabase no configuradas. Contacta al administrador." 
          : "No se pudo generar el plan. Verifica la conexión a Supabase.",
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
        {connectionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-red-600 font-medium">Error de conexión</h3>
            <p className="text-sm text-red-500">
              No se detectaron las variables de entorno de Supabase. 
              Este error debe ser resuelto por el administrador del sistema.
            </p>
          </div>
        )}
      
        {!currentPlan ? (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-6">
            <h2 className="text-xl font-semibold text-runapp-navy mb-3">No tienes un plan de entrenamiento</h2>
            <p className="text-runapp-gray mb-4">
              Genera un plan personalizado basado en tu perfil, objetivos y nuestra base de conocimientos en entrenamientos de running.
            </p>
            <RunButton 
              onClick={handleGeneratePlan}
              disabled={isGenerating || connectionError}
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
