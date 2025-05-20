
import { useState, useEffect } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import { generateTrainingPlan, loadLatestPlan } from "@/services/planService";
import { toast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import TrainingPlanDisplay from "@/components/plan/TrainingPlanDisplay";
import { WorkoutPlan } from "@/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Plan: React.FC = () => {
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
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
      setSupabaseError("No se detectaron las variables de entorno de Supabase. Verifica que el archivo .env esté configurado correctamente.");
    } else {
      console.log("Variables de entorno de Supabase configuradas correctamente");
      setSupabaseError(null);
    }
  }, []);

  // Load existing plan on component mount
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        console.log("Intentando cargar el plan existente...");
        // Check if there's a plan in localStorage first
        const localPlan = localStorage.getItem('last-training-plan');
        if (localPlan) {
          console.log("Plan encontrado en localStorage");
          setCurrentPlan(JSON.parse(localPlan));
          setIsLoading(false);
          return;
        }
        
        // Try to load from Supabase
        const plan = await loadLatestPlan();
        if (plan) {
          console.log("Plan cargado exitosamente:", plan.name);
          setCurrentPlan(plan);
        } else {
          console.log("No se encontró ningún plan existente");
        }
      } catch (error) {
        console.error("Error loading plan:", error);
        setSupabaseError("No se pudo cargar el plan. Verifica la configuración de Supabase.");
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
    setGenerationStage('init');
    setSupabaseError(null);
    
    try {
      console.log("Iniciando generación de plan con los siguientes datos:", {
        name: user.name,
        age: user.age,
        experienceLevel: user.experienceLevel,
        goal: user.goal
      });
      
      // Fase RAG - recuperación de documentos relevantes
      setGenerationStage('rag');
      
      // Fase API - generación del plan con Gemini
      setGenerationStage('api');
      const plan = await generateTrainingPlan({ userProfile: user });
      
      // Fase completada
      setGenerationStage('complete');
      console.log("Plan generado exitosamente:", plan);
      setCurrentPlan(plan);
      
      toast({
        title: "Plan generado",
        description: "Se ha creado tu plan de entrenamiento personalizado basado en tu perfil y en nuestra base de conocimientos.",
      });
    } catch (error) {
      console.error("Error al generar plan:", error);
      setSupabaseError(error.message || "No se pudo generar el plan. Verifica la configuración de Supabase.");
      toast({
        title: "Error",
        description: "No se pudo generar el plan. Verifica la configuración de Supabase y los logs para más detalles.",
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

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold mb-1">Hola, {user.name} 👋</h1>
          <p className="text-sm opacity-90">Tu plan personalizado de entrenamiento</p>
        </div>
        
        <div className="container max-w-md mx-auto p-4 flex justify-center items-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-runapp-purple mb-4" />
            {generationStage === 'init' && (
              <p className="text-runapp-gray">Iniciando proceso de generación del plan...</p>
            )}
            {generationStage === 'rag' && (
              <p className="text-runapp-gray">Analizando tu perfil y buscando entrenamientos adecuados...</p>
            )}
            {generationStage === 'api' && (
              <p className="text-runapp-gray">Generando tu plan personalizado con IA...</p>
            )}
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
        {supabaseError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>
              {supabaseError}
            </AlertDescription>
          </Alert>
        )}
      
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
