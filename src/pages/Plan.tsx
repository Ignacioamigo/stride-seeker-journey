
import { useState, useEffect } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import { generateTrainingPlan, loadLatestPlan, isOfflineMode, getConnectionError } from "@/services/planService";
import { toast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Sparkles, WifiOff, Database } from "lucide-react";
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
  const [offlineMode, setOfflineMode] = useState(false);
  const [ragActive, setRagActive] = useState(false);

  // Cargar plan existente al montar componente
  useEffect(() => {
    const loadPlan = async () => {
      try {
        console.log("Intentando cargar el plan existente...");
        
        try {
          const plan = await loadLatestPlan();
          
          if (plan) {
            console.log("Plan cargado exitosamente:", plan.name);
            setCurrentPlan(plan);
          } else {
            console.log("No se encontró ningún plan existente");
          }
          setError(null);
          setOfflineMode(isOfflineMode());
        } catch (error) {
          console.error("Error loading plan:", error);
          setError(getConnectionError() || error.message || "Error al cargar el plan de entrenamiento.");
          setOfflineMode(isOfflineMode());
        }
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
    setError(null);
    setRagActive(false);
    
    try {
      console.log("Iniciando generación de plan con los siguientes datos:", {
        name: user.name,
        age: user.age,
        experienceLevel: user.experienceLevel,
        goal: user.goal
      });
      
      // Fase RAG - recuperación de documentos relevantes
      setGenerationStage('rag');
      
      // Fase API - generación del plan
      setGenerationStage('api');
      
      const plan = await generateTrainingPlan({ userProfile: user });
      
      // Fase completada
      setGenerationStage('complete');
      console.log("Plan generado exitosamente:", plan);
      setCurrentPlan(plan);
      setOfflineMode(isOfflineMode());
      setRagActive(navigator.onLine); // Si estamos online, asumimos que RAG está activo
      
      toast({
        title: "Plan generado",
        description: offlineMode ? 
          "Plan generado en modo offline." :
          "Se ha creado tu plan de entrenamiento personalizado basado en tu perfil y conocimientos de entrenamiento.",
      });
    } catch (error) {
      console.error("Error al generar plan:", error);
      setError(getConnectionError() || error.message || "Error al generar el plan de entrenamiento.");
      setOfflineMode(isOfflineMode());
      
      toast({
        title: "Error",
        description: offlineMode ? 
          "Generando plan en modo offline. La funcionalidad puede ser limitada." : 
          "No se pudo generar el plan. Intenta de nuevo más tarde.",
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
    setError(null);
    setIsLoading(true);
    
    // Use setTimeout to give UI time to update before attempting reconnection
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const renderLoadingState = () => {
    const getLoadingMessage = () => {
      switch (generationStage) {
        case 'init':
          return "Preparando tu plan personalizado...";
        case 'rag':
          return "Analizando tu perfil y conocimientos de entrenamiento...";
        case 'api':
          return "Generando tu plan de entrenamiento...";
        case 'complete':
          return "Finalizando tu plan...";
        default:
          return "Cargando...";
      }
    };

    return (
      <div className="flex justify-center items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <div className="relative mb-6">
            <Sparkles className="h-12 w-12 text-runapp-purple animate-pulse" />
            <Loader2 className="h-8 w-8 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
          </div>
          <p className="text-runapp-gray font-medium">{getLoadingMessage()}</p>
          <p className="text-runapp-gray text-sm mt-2">Esto puede tomar unos momentos...</p>
        </div>
      </div>
    );
  };

  // Renderizar el indicador de RAG
  const renderRagIndicator = () => {
    if (!currentPlan || offlineMode) return null;
    
    return (
      <div className="mb-4 flex items-center justify-center">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${ragActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          <Database size={14} />
          <span className="text-xs font-medium">
            {ragActive 
              ? "Plan generado con conocimiento aumentado (RAG)" 
              : "Plan generado sin RAG"}
          </span>
        </div>
      </div>
    );
  };

  // Base layout that always renders to prevent blank screen
  const renderLayout = () => {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold mb-1">Hola, {user.name} 👋</h1>
          <p className="text-sm opacity-90">
            Tu plan personalizado de entrenamiento
          </p>
        </div>
        
        <div className="container max-w-md mx-auto p-4">
          {/* Offline mode indicator */}
          {offlineMode && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <WifiOff className="h-4 w-4 mr-2 text-amber-600" />
              <AlertTitle className="text-amber-800">Modo sin conexión</AlertTitle>
              <AlertDescription className="text-amber-700">
                Estás utilizando la aplicación en modo sin conexión. Algunas funciones pueden estar limitadas.
                <div className="mt-2">
                  <Button
                    size="sm"
                    onClick={handleRetryConnection}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Intentar reconectar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {error && !offlineMode && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Error de conexión</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-2">
                  <Button
                    size="sm"
                    className="mt-1"
                    onClick={handleRetryConnection}
                  >
                    Reintentar conexión
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {renderRagIndicator()}
          
          {renderContent()}
        </div>
        
        <BottomNav />
      </div>
    );
  };

  // Content to render based on state
  const renderContent = () => {
    if (isLoading || isGenerating) {
      return renderLoadingState();
    }

    if (currentPlan) {
      return (
        <TrainingPlanDisplay 
          plan={currentPlan} 
          onPlanUpdate={handlePlanUpdate}
          offlineMode={offlineMode}
        />
      );
    }

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <h2 className="text-xl font-bold text-runapp-navy mb-2">¡Comienza tu viaje!</h2>
        <p className="text-runapp-gray mb-6">
          Genera tu plan de entrenamiento personalizado basado en tu perfil y objetivos.
        </p>
        <RunButton 
          onClick={handleGeneratePlan}
          className="w-full"
        >
          Generar mi plan
        </RunButton>
      </div>
    );
  };

  return renderLayout();
};

export default Plan;
