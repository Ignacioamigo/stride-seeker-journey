
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";

const Plan: React.FC = () => {
  const { user } = useUser();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold mb-1">Hola, {user.name} 👋</h1>
        <p className="text-sm opacity-90">Tu plan personalizado de entrenamiento</p>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-6">
          <h2 className="text-xl font-semibold text-runapp-navy mb-3">No tienes un plan de entrenamiento</h2>
          <p className="text-runapp-gray mb-4">
            Genera un plan personalizado basado en tu perfil y objetivos.
          </p>
          <RunButton>
            Generar nuevo plan de entrenamiento
          </RunButton>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Plan;
