import { useState, useEffect } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import { generateTrainingPlan, loadLatestPlan, generateOfflinePlan } from "@/services/planService";
import { toast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import TrainingPlanDisplay from "@/components/plan/TrainingPlanDisplay";
import { WorkoutPlan } from "@/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Plan: React.FC = () => {
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [generationStage, setGenerationStage] = useState<'init' | 'rag' | 'api' | 'complete'>('init');

  // Check for Supabase environment variables on component mount
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log("Verificando variables de entorno de Supabase:", { 
      url: Boolean(supabaseUrl), 
      key: Boolean(supabaseAnonKey)
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Variables de entorno de Supabase no encontradas");
      setConnectionError(true);
    } else {
      console.log("Variables de entorno de Supabase configuradas correctamente");
      setConnectionError(false);
    }
  }, []);

  // Load latest plan on mount
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const plan = await loadLatestPlan();
        if (plan) {
          setCurrentPlan(plan);
        }
      } catch (error) {
        console.error("Error loading latest plan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
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
    setGenerationStage('init');
    
    try {
      console.log("Iniciando generación de plan con los siguientes datos:", {
        name: user.name,
        age: user.age,
        experienceLevel: user.experienceLevel,
        goal: user.goal
      });
      
      let plan;
      
      // Check if Supabase is configured
      if (connectionError) {
        console.log("Generando plan en modo offline debido a la falta de configuración de Supabase");
        // Generate plan without Supabase
        setGenerationStage('api');
        plan = await generateOfflinePlan({ userProfile: user });
      } else {
        // Regular flow with Supabase
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error("Variables de entorno no encontradas:", {
            VITE_SUPABASE_URL: Boolean(supabaseUrl),
            VITE_SUPABASE_ANON_KEY: Boolean(supabaseAnonKey)
          });
          throw new Error("Faltan variables de entorno para Supabase");
        }
        
        // Fase RAG
        setGenerationStage('rag');
        
        // Fase API
        setGenerationStage('api');
        plan = await generateTrainingPlan({ userProfile: user });
      }
      
      // Fase completada
      setGenerationStage('complete');
      console.log("Plan generado exitosamente:", plan);
      setCurrentPlan(plan);
      
      // Save to localStorage as backup
      try {
        localStorage.setItem('last-training-plan', JSON.stringify(plan));
        console.log("Plan guardado en localStorage");
      } catch (e) {
        console.warn("No se pudo guardar en localStorage:", e);
      }
      
      toast({
        title: "Plan generado",
        description: "Se ha creado tu plan de entrenamiento personalizado basado en tu perfil y en nuestra base de conocimientos.",
      });
    } catch (error) {
      console.error("Error al generar plan:", error);
      toast({
        title: "Error",
        description: connectionError 
          ? "No se pudo generar el plan en modo offline. Intenta de nuevo más tarde." 
          : "No se pudo generar el plan. Verifica la configuración de Supabase.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePlanUpdate = (updatedPlan: WorkoutPlan) => {
    setCurrentPlan(updatedPlan);
    // Update localStorage
    try {
      localStorage.setItem('last-training-plan', JSON.stringify(updatedPlan));
    } catch (e) {
      console.warn("No se pudo actualizar el plan en localStorage:", e);
    }
  };

  const renderLoadingState = () => {
    const getLoadingMessage = () => {
      switch (generationStage) {
        case 'init':
          return "Preparando tu plan personalizado...";
        case 'rag':
          return "Analizando tu perfil y objetivos...";
        case 'api':
          return "Generando tu plan de entrenamiento...";
        case 'complete':
          return "Finalizando tu plan...";
        default:
          return "Cargando...";
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold mb-1">Hola, {user.name} 👋</h1>
          <p className="text-sm opacity-90">Tu plan personalizado de entrenamiento</p>
        </div>
        
        <div className="container max-w-md mx-auto p-4 flex justify-center items-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <div className="relative mb-6">
              <Sparkles className="h-12 w-12 text-runapp-purple animate-pulse" />
              <Loader2 className="h-8 w-8 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
            </div>
            <p className="text-runapp-gray font-medium">{getLoadingMessage()}</p>
            <p className="text-runapp-gray text-sm mt-2">Esto puede tomar unos momentos...</p>
          </div>
        </div>
        
        <BottomNav />
      </div>
    );
  };

  if (isLoading || isGenerating) {
    return renderLoadingState();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold mb-1">Hola, {user.name} 👋</h1>
        <p className="text-sm opacity-90">Tu plan personalizado de entrenamiento</p>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        {connectionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>
              No se pudo conectar con el servidor. El plan se generará en modo offline.
            </AlertDescription>
          </Alert>
        )}
        
        {currentPlan ? (
          <TrainingPlanDisplay 
            plan={currentPlan} 
            onPlanUpdate={handlePlanUpdate} 
          />
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <h2 className="text-xl font-bold text-runapp-navy mb-2">¡Comienza tu viaje!</h2>
            <p className="text-runapp-gray mb-6">
              Genera tu primer plan de entrenamiento personalizado basado en tu perfil y objetivos.
            </p>
            <RunButton 
              onClick={handleGeneratePlan}
              className="w-full"
            >
              Generar mi plan
            </RunButton>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Plan;
