
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const NameQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [name, setName] = useState(user.name || "");
  const navigate = useNavigate();
  const { top, bottom, left, right, isReady } = useSafeAreaInsets();

  // Calculate header height: safe area + padding + content
  const headerHeight = top + 24 + 32; // safe area + py-3 (12px*2) + estimated content height

  // Si los insets no están listos, mostrar loading simple
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-runapp-light-purple/30 to-white">
        <div className="text-center">
          <div className="w-12 h-12 mb-4 animate-pulse">
            <img 
              src="/BeRun_appicon_1024_blue1463FF.png" 
              alt="BeRun Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-runapp-gray">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name });
    navigate("/onboarding/age");
  };

  const isValid = name.trim().length > 0;

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white"
      style={{
        paddingTop: headerHeight,
        paddingBottom: bottom + 80, // safe area + space for content
        paddingLeft: Math.max(left, 16),
        paddingRight: Math.max(right, 16),
      }}
    >
      <ProgressHeader currentStep={1} totalSteps={10} />
      
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-2">
            <img 
              src="/BeRun_full_1024_blue1463FF.png" 
              alt="BeRun Logo" 
              className="h-16 object-contain"
            />
          </div>
          <p className="text-lg text-runapp-gray">Tu entrenador personal para correr</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-6">
            Empecemos por tu nombre
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-runapp-gray mb-1">
                ¿Cómo te llamas?
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent"
              />
            </div>
            
            <RunButton type="submit" disabled={!isValid}>
              Siguiente
            </RunButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NameQuestion;
