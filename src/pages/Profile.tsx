import { User, Award, Send, RefreshCw } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Profile: React.FC = () => {
  const { user, resetUser } = useUser();
  const navigate = useNavigate();

  const handleResetOnboarding = () => {
    if (window.confirm("¿Estás seguro que deseas reiniciar el proceso de onboarding? Se borrarán todos tus datos de perfil.")) {
      resetUser();
      toast({
        title: "Perfil reiniciado",
        description: "Serás redirigido al inicio del onboarding.",
      });
      // Redireccionar al inicio del onboarding
      setTimeout(() => navigate("/"), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold">Perfil</h1>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-runapp-light-purple rounded-full flex items-center justify-center">
              <User size={32} className="text-runapp-purple" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-runapp-navy">{user.name}</h2>
              <p className="text-runapp-gray">{user.experienceLevel || "Principiante"}</p>
            </div>
            <button 
              className="ml-auto text-sm text-runapp-purple"
              onClick={() => navigate('/edit-profile')}
            >
              Editar
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm text-runapp-gray">Género</p>
              <p className="font-medium text-runapp-navy">{user.gender || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-runapp-gray">Edad</p>
              <p className="font-medium text-runapp-navy">{user.age || "--"} años</p>
            </div>
            <div>
              <p className="text-sm text-runapp-gray">Peso</p>
              <p className="font-medium text-runapp-navy">{user.weight || "--"} kg</p>
            </div>
            <div>
              <p className="text-sm text-runapp-gray">Altura</p>
              <p className="font-medium text-runapp-navy">{user.height || "--"} cm</p>
            </div>
            <div>
              <p className="text-sm text-runapp-gray">Frecuencia</p>
              <p className="font-medium text-runapp-navy">{user.weeklyWorkouts || "--"}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center text-red-500 border-red-200 hover:bg-red-50"
              onClick={handleResetOnboarding}
            >
              <RefreshCw size={16} className="mr-2" />
              Reiniciar Onboarding
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex items-center mb-4">
            <Award size={18} className="text-runapp-purple mr-2" />
            <h2 className="text-lg font-medium text-runapp-navy">Logros</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-runapp-navy">Primera carrera</h3>
                <p className="text-xs text-runapp-gray">Completaste tu primer entreno</p>
              </div>
              <span className="text-xs bg-runapp-purple text-white px-3 py-1 rounded-full">Conseguido</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-runapp-navy">Carrera de 5K</h3>
                <p className="text-xs text-runapp-gray">Completa una carrera de 5km</p>
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">Pendiente</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-runapp-navy">Constancia</h3>
                <p className="text-xs text-runapp-gray">Entrena 5 semanas seguidas</p>
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">Pendiente</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <Send size={18} className="text-runapp-purple mr-2" />
            <h2 className="text-lg font-medium text-runapp-navy">Planes futuros</h2>
          </div>
          
          <div>
            <h3 className="font-medium text-runapp-navy">Próximo objetivo</h3>
            <p className="text-runapp-gray mb-2">Preparación para carrera de 10K</p>
            
            <p className="text-sm text-runapp-gray">
              Tu plan actual está enfocado en mejorar tu resistencia y ritmo para prepararte para una carrera de 10K en los próximos 2 meses.
            </p>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Profile;
