
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
  const [connectionStatus, setConnectionStatus] = useState<boolean>(navigator.onLine);
  const [ragActive, setRagActive] = useState(false);

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
            // Check if ragActive was included in the response
            setRagActive(!!plan.ragActive);
          } else {
            console.log("No existing plan found");
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
      
      // RAG phase - retrieving relevant documents
      setGenerationStage('rag');
      
      // API phase - generating the plan
      setGenerationStage('api');
      
      const plan = await generateTrainingPlan({ userProfile: user });
      
      // Completed phase
      setGenerationStage('complete');
      console.log("Plan generated successfully:", plan);
      setCurrentPlan(plan);
      
      // Set RAG status from the response
      setRagActive(!!plan.ragActive);
      
      toast({
        title: "Plan generated",
        description: "Your personalized training plan has been created based on your profile and training knowledge.",
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
        case 'rag':
          return "Analyzing your profile and training knowledge...";
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

  // Render RAG indicator
  const renderRagIndicator = () => {
    if (!currentPlan) return null;
    
    return (
      <div className="mb-4 flex items-center justify-center">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${ragActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          <Database size={14} />
          <span className="text-xs font-medium">
            {ragActive 
              ? "Plan generated with augmented knowledge (RAG)" 
              : "Plan generated without RAG"}
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
          <h1 className="text-xl font-bold mb-1">Hello, {user.name} 👋</h1>
          <p className="text-sm opacity-90">
            Your personalized training plan
          </p>
        </div>
        
        <div className="container max-w-md mx-auto p-4">
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
          offlineMode={!connectionStatus}
        />
      );
    }

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <h2 className="text-xl font-bold text-runapp-navy mb-2">Start your journey!</h2>
        <p className="text-runapp-gray mb-6">
          Generate your personalized training plan based on your profile and goals.
        </p>
        <RunButton 
          onClick={handleGeneratePlan}
          className="w-full"
          disabled={!connectionStatus}
        >
          {connectionStatus ? "Generate my plan" : "No connection"}
        </RunButton>
        {!connectionStatus && (
          <p className="text-xs text-runapp-gray mt-3">
            You need an internet connection to generate a training plan.
          </p>
        )}
      </div>
    );
  };

  return renderLayout();
};

export default Plan;
