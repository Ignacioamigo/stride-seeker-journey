
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";

const WelcomePage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.completedOnboarding) {
      navigate("/dashboard");
    }
  }, [user.completedOnboarding, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-runapp-light-purple/30 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-runapp-navy mb-2">RunAdaptive</h1>
        <p className="text-xl text-runapp-gray">Tu entrenador personal para correr</p>
      </div>
      
      <div className="max-w-md w-full bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-runapp-light-purple rounded-full flex items-center justify-center">
            <span className="text-3xl">🏃</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-center text-runapp-navy mb-4">
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
