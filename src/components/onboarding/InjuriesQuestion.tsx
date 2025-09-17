
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { removeSavedPlan } from "@/services/planService";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const InjuriesQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [injuries, setInjuries] = useState(user.injuries || "");
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  // Calculate header height: safe area + padding + content
  const headerHeight = insets.top + 24 + 32; // safe area + py-3 (12px*2) + estimated content height

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any existing plans to ensure fresh start for new user
    console.log("Clearing any existing plans for new user...");
    removeSavedPlan();
    
    updateUser({ 
      injuries,
      completedOnboarding: true 
    });
    
    // 🎯 DISPARAR EVENTO DE ONBOARDING COMPLETADO PARA RESETEAR ESTADÍSTICAS
    console.log("🎯 Onboarding completado - disparando evento para resetear estadísticas");
    window.dispatchEvent(new CustomEvent('onboarding-completed'));
    
    navigate("/plan");
  };

  const commonInjuries = [
    "Rodilla del corredor",
    "Fascitis plantar",
    "Tendinitis de Aquiles",
    "Shin splints",
    "Dolor de cadera"
  ];

  const handleSelectInjury = (injury: string) => {
    if (injuries.includes(injury)) {
      setInjuries(injuries.replace(injury, "").trim().replace(/\s+/g, " "));
    } else {
      setInjuries(injuries ? `${injuries}, ${injury}` : injury);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white"
      style={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + 80, // safe area + space for content
        paddingLeft: Math.max(insets.left, 16),
        paddingRight: Math.max(insets.right, 16),
      }}
    >
      <ProgressHeader currentStep={10} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿Tienes alguna lesión o limitación?
          </h2>
          <p className="text-runapp-gray mb-6">Esta información nos ayudará a personalizar tu plan de entrenamiento</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                placeholder="Escribe aquí tus lesiones o limitaciones"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-runapp-gray">Lesiones comunes:</p>
              <div className="flex flex-wrap gap-2">
                {commonInjuries.map((injury, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectInjury(injury)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      injuries.includes(injury)
                        ? 'bg-runapp-purple text-white'
                        : 'bg-runapp-light-purple/50 text-runapp-navy hover:bg-runapp-light-purple'
                    }`}
                  >
                    {injury}
                  </button>
                ))}
              </div>
            </div>
            
            <RunButton type="submit">
              Finalizar
            </RunButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InjuriesQuestion;
