
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import { removeSavedPlan } from "@/services/planService";

const WelcomePage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario ya completó el onboarding, redirigir al plan principal
    if (user.completedOnboarding) {
      navigate("/plan");
    } else {
      // Si el usuario está comenzando de nuevo, asegurarse de que no haya plan guardado
      removeSavedPlan();
    }
  }, [user.completedOnboarding, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-runapp-light-purple/30 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-2">
          <img 
            src="/BeRun_full_1024_blue1463FF.png" 
            alt="BeRun Logo" 
            className="h-20 object-contain"
          />
        </div>
        <p className="text-xl text-runapp-gray">Tu entrenador personal para correr</p>
      </div>
      
      <div className="max-w-md w-full bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-center text-runapp-navy mb-6">
          Empecemos por tu nombre
        </h2>
        
        <RunButton onClick={() => navigate("/onboarding/name")}>
          Comenzar
        </RunButton>
      </div>
    </div>
  );
};

export default WelcomePage;
