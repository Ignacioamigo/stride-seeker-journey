import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import { generateTrainingPlan, loadLatestPlan, isOfflineMode, getConnectionError } from "@/services/planService";
import { toast } from "@/components/ui/use-toast";
import { subscriptionService, PremiumFeature, useSubscription } from "@/services/subscriptionService";
import PaywallModal from "@/components/paywall/PaywallModal";
import { usePaywall } from "@/hooks/usePaywall";
import { Loader2, AlertCircle, Sparkles, WifiOff } from "lucide-react";
import TrainingPlanDisplay from "@/components/plan/TrainingPlanDisplay";
import { WorkoutPlan } from "@/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/layout/AppHeader";
import Header from "@/components/layout/Header";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";
import { useLayoutStability } from "@/hooks/useLayoutStability";

const HEADER_HEIGHT = 44;

const Plan: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isPremium, showPaywall: showSubscriptionPaywall } = useSubscription();
  const { isOpen: isPaywallOpen, showPaywall, hidePaywall, handlePurchase, checkPremiumAccess } = usePaywall();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 🔥 HOOK ANTI-DESCUADRE
  useLayoutStability();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<'init' | 'api' | 'complete'>('init');
  const [connectionStatus, setConnectionStatus] = useState<boolean>(navigator.onLine);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + HEADER_HEIGHT;

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setConnectionStatus(true);
    const handleOffline = () => setConnectionStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load existing plan on component mount
  useEffect(() => {
    const loadPlan = async () => {
      try {
        console.log("Attempting to load existing plan...");
        
        try {
          const plan = await loadLatestPlan();
          
          if (plan) {
            console.log("Plan loaded successfully:", plan.name);
            setCurrentPlan(plan);
            // Log para depuración: mostrar el plan actualizado
            console.log('[Plan.tsx] Plan actualizado tras loadPlan:', plan);
          } else {
            console.log("No existing plan found");
            
            // If user just completed onboarding and has no plan, show helpful message
            if (user.completedOnboarding && user.name) {
              console.log("User completed onboarding but has no plan - ready to generate new plan");
            }
          }
          setError(null);
        } catch (error) {
          console.error("Error loading plan:", error);
          setError(getConnectionError() || error.message || "Error loading training plan.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlan();

    // Escuchar evento global para refrescar el plan
    const handlePlanUpdated = () => {
      console.log('[Plan.tsx] Evento plan-updated recibido, recargando plan...');
      loadPlan();
    };
    window.addEventListener('plan-updated', handlePlanUpdated);
    return () => {
      window.removeEventListener('plan-updated', handlePlanUpdated);
    };
  }, []);

  const handleGeneratePlan = async () => {
    if (!user.completedOnboarding) {
      toast({
        title: "Complete your profile",
        description: "To generate a personalized plan, first complete your profile.",
        variant: "destructive",
      });
      return;
    }

    // Check premium access for personalized training plan
    const isPremiumUser = localStorage.getItem('isPremium') === 'true';
    if (!isPremiumUser) {
      console.log("🔒 Premium access required for training plan generation");
      navigate('/setup-1');
      return;
    }

    if (!navigator.onLine) {
      toast({
        title: "No connection",
        description: "You need an internet connection to generate a plan. Please connect and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStage('init');
    setError(null);
    
    try {
      console.log("Starting plan generation with the following data:", {
        name: user.name,
        age: user.age,
        experienceLevel: user.experienceLevel,
        goal: user.goal,
        maxDistance: user.maxDistance,
        pace: user.pace,
        weeklyWorkouts: user.weeklyWorkouts
      });
      
      // API phase - generating the plan
      setGenerationStage('api');
      
      const plan = await generateTrainingPlan({ userProfile: user });
      
      // Completed phase
      setGenerationStage('complete');
      console.log("Plan generated successfully:", plan);
      setCurrentPlan(plan);
      
      
      toast({
        title: "Plan generated",
        description: "Your personalized training plan has been created.",
      });
    } catch (error) {
      console.error("Error generating plan:", error);
      setError(getConnectionError() || error.message || "Error generating training plan.");
      
      toast({
        title: "Error",
        description: "Could not generate plan. Check your internet connection and try again.",
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
          return "Preparing your personalized plan...";
        case 'api':
          return "Generating your training plan...";
        case 'complete':
          return "Finalizing your plan...";
        default:
          return "Loading...";
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
          <p className="text-runapp-gray text-sm mt-2">This may take a moment...</p>
        </div>
      </div>
    );
  };


  // Base layout that always renders to prevent blank screen
  const renderLayout = () => {
    const insets = useSafeAreaInsets();
    
    return (
      <div 
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9fafb'
        }}
      >
        {/* Header - let it handle its own fixed positioning */}
        <Header title="Plan de entrenamiento" subtitle="Tu semana personalizada" />
        
        {/* Scrollable Content */}
        <div 
          style={{
            flex: 1,
            overflow: 'auto',
            paddingTop: `calc(${HEADER_HEIGHT}px + max(${insets.top}px, env(safe-area-inset-top, 20px)) + 20px)`,
            paddingLeft: Math.max(insets.left, 16),
            paddingRight: Math.max(insets.right, 16),
            paddingBottom: Math.max(insets.bottom + 80, 96), // 64px min height + 16px padding + safe area
          }}
        >
          <div className="w-full max-w-md mx-auto px-4">
          
          {/* Debug: Paywall Test Button - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                Debug: Premium Status = {localStorage.getItem('isPremium') === 'true' ? '✅ Premium' : '❌ Free'}
              </p>
              <Button 
                onClick={() => navigate('/setup-1')}
                variant="outline"
                size="sm"
                className="mr-2"
              >
                🧪 Test Setup Flow
              </Button>
              <Button 
                onClick={() => {
                  console.log('Premium Access:', localStorage.getItem('isPremium'));
                  console.log('Subscription Type:', localStorage.getItem('subscriptionType'));
                }}
                variant="outline"
                size="sm"
              >
                🔍 Check Status
              </Button>
            </div>
          )}
          
          {/* Connection status indicator */}
          {!connectionStatus && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <WifiOff className="h-4 w-4 mr-2 text-amber-600" />
              <AlertTitle className="text-amber-800">No connection</AlertTitle>
              <AlertDescription className="text-amber-700">
                You have no internet connection. You need a connection to generate a training plan.
                <div className="mt-2">
                  <Button
                    size="sm"
                    onClick={handleRetryConnection}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Try to reconnect
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {error && connectionStatus && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Connection error</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-2">
                  <Button
                    size="sm"
                    className="mt-1"
                    onClick={handleRetryConnection}
                  >
                    Retry connection
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
            {renderContent()}
          </div>
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
          offlineMode={!connectionStatus}
        />
      );
    }

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <h2 className="text-xl font-bold text-runapp-navy mb-2">
          {user.completedOnboarding && user.name ? `¡Hola ${user.name}!` : "¡Comienza tu aventura!"}
        </h2>
        <p className="text-runapp-gray mb-6">
          {user.completedOnboarding && user.name 
            ? "Tu perfil está completo. Ahora vamos a generar tu plan de entrenamiento personalizado basado en tus objetivos y experiencia."
            : "Genera tu plan de entrenamiento personalizado basado en tu perfil y objetivos."
          }
        </p>
        <RunButton 
          onClick={handleGeneratePlan}
          className="w-full"
          disabled={!connectionStatus}
        >
          {connectionStatus ? "Generar mi plan" : "Sin conexión"}
        </RunButton>
        {!connectionStatus && (
          <p className="text-xs text-runapp-gray mt-3">
            Necesitas conexión a internet para generar un plan de entrenamiento.
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      {renderLayout()}
      
      {/* Paywall Modal */}
      <PaywallModal 
        isOpen={isPaywallOpen}
        onClose={hidePaywall}
        onPurchase={handlePurchase}
      />
    </>
  );
};

export default Plan;
