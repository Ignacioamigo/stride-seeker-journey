
import { useState, useEffect } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import { 
  generateTrainingPlan, 
  loadLatestPlan,
  isOfflineMode,
  getConnectionError
} from "@/services/planService";
import { toast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, WifiOff, RefreshCw } from "lucide-react";
import TrainingPlanDisplay from "@/components/plan/TrainingPlanDisplay";
import { WorkoutPlan } from "@/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const Plan: React.FC = () => {
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<'init' | 'rag' | 'api' | 'complete'>('init');
  const [offline, setOffline] = useState(false);

  // Cargar plan existente al montar componente
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        console.log("Intentando cargar el plan existente...");
        
        // Verificar si estamos en modo offline
        try {
          const plan = await loadLatestPlan();
          
          if (plan) {
            console.log("Plan cargado exitosamente:", plan.name);
            setCurrentPlan(plan);
          } else {
            console.log("No se encontró ningún plan existente");
          }
          setError(null);
        } catch (error) {
          console.error("Error loading plan:", error);
          
          // Si el error es por falta de conexión, activar modo offline
          if (isOfflineMode()) {
            console.log("Activando modo offline");
            setOffline(true);
            setError(getConnectionError() || "No hay conexión a Supabase. La aplicación funcionará en modo offline.");
          } else {
            setError(error.message || "Error al cargar el plan de entrenamiento");
          }
        }
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
    setError(null);
    
    try {
      console.log("Iniciando generación de plan con los siguientes datos:", {
        name: user.name,
        age: user.age,
        experienceLevel: user.experienceLevel,
        goal: user.goal
      });
      
      // Verificar si estamos en modo offline
      if (isOfflineMode()) {
        console.log("Generando plan en modo offline");
        setOffline(true);
        // En modo offline saltamos RAG y vamos directo a API
        setGenerationStage('api');
      } else {
        // Fase RAG - recuperación de documentos relevantes
        setGenerationStage('rag');
      }
      
      // Fase API - generación del plan
      setGenerationStage('api');
      
      const plan = await generateTrainingPlan({ userProfile: user });
      
      // Fase completada
      setGenerationStage('complete');
      console.log("Plan generado exitosamente:", plan);
      setCurrentPlan(plan);
      
      toast({
        title: offline ? "Plan offline generado" : "Plan generado",
        description: offline 
          ? "Se ha creado un plan básico en modo offline. Conecta a Supabase para planes personalizados avanzados."
          : "Se ha creado tu plan de entrenamiento personalizado basado en tu perfil.",
      });
    } catch (error) {
      console.error("Error al generar plan:", error);
      setError(error.message || "Error al generar el plan de entrenamiento");
      
      toast({
        title: "Error",
        description: offline 
          ? "No se pudo generar el plan en modo offline. Inténtalo de nuevo."
          : "No se pudo generar el plan. Verifica la configuración de Supabase.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePlanUpdate = (updatedPlan: WorkoutPlan) => {
    setCurrentPlan(updatedPlan);
  };

  const handleRetryConnection = () => {
    window.location.reload();
  };

  // Base layout that always renders to prevent blank screen
  const renderLayout = () => {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold mb-1">Hola, {user.name} 👋</h1>
          <p className="text-sm opacity-90">
            Tu plan personalizado de entrenamiento
            {offline && <span className="ml-2 inline-flex items-center text-xs bg-yellow-500/20 px-2 py-1 rounded-full">
              <WifiOff size={12} className="mr-1" /> Modo offline
            </span>}
          </p>
        </div>
        
        <div className="container max-w-md mx-auto p-4">
          {error && (
            <Alert variant={offline ? "default" : "destructive"} className="mb-4">
              {offline ? <WifiOff className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
              <AlertTitle>{offline ? "Modo Offline Activo" : "Error de conexión"}</AlertTitle>
              <AlertDescription>
                {error}
                {offline && (
                  <div className="mt-2">
                    <p className="text-sm mb-2">Puedes seguir usando la app con funcionalidad limitada o intentar conectar de nuevo.</p>
                    <Button
                      size="sm"
                      className="mt-1"
                      onClick={handleRetryConnection}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Reintentar conexión
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {renderContent()}
          
          {error && !offline && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mx-auto"
              >
                Reintentar
              </Button>
            </div>
          )}
        </div>
        
        <BottomNav />
      </div>
    );
  };

  // Content to render based on state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-runapp-purple mb-4" />
            <p className="text-runapp-gray">Cargando tu plan de entrenamiento...</p>
          </div>
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div className="flex justify-center items-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-runapp-purple mb-4" />
            {generationStage === 'init' && (
              <p className="text-runapp-gray">Iniciando proceso de generación del plan...</p>
            )}
            {generationStage === 'rag' && (
              <p className="text-runapp-gray">Analizando tu perfil y buscando entrenamientos adecuados...</p>
            )}
            {generationStage === 'api' && (
              <p className="text-runapp-gray">
                {offline ? "Generando plan básico sin conexión..." : "Generando tu plan personalizado con IA..."}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (!currentPlan) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-6">
          <h2 className="text-xl font-semibold text-runapp-navy mb-3">No tienes un plan de entrenamiento</h2>
          <p className="text-runapp-gray mb-4">
            {offline 
              ? "Puedes generar un plan básico en modo offline o intentar conectarte a Supabase para planes avanzados."
              : "Genera un plan personalizado basado en tu perfil, objetivos y nuestra base de conocimientos en entrenamientos de running."}
          </p>
          <RunButton 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {offline ? "Generando plan básico..." : "Generando plan con IA..."}
              </>
            ) : (
              offline ? "Generar plan básico (offline)" : "Generar nuevo plan de entrenamiento"
            )}
          </RunButton>
          {offline && (
            <p className="mt-4 text-xs text-amber-600">
              Nota: Los planes offline son más básicos que los generados con IA.
            </p>
          )}
        </div>
      );
    }

    return (
      <TrainingPlanDisplay 
        plan={currentPlan} 
        onPlanUpdate={handlePlanUpdate} 
        isOffline={offline}
      />
    );
  };

  // Always return the base layout to prevent blank screen
  return renderLayout();
};

export default Plan;
