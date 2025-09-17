
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";

const GoalQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [goal, setGoal] = useState(user.goal || "");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ goal });
    navigate("/onboarding/race-preparation");
  };

  const isValid = goal.trim().length > 0;
  
  const commonGoals = [
    "5K en menos de 30 minutos",
    "10K en menos de 1 hora",
    "Correr mi primera media maratón",
    "Mejorar mi condición física",
    "Perder peso"
  ];

  const handleSelectGoal = (selectedGoal: string) => {
    setGoal(selectedGoal);
  };

  return (
    <div className="min-h-screen pt-16 pb-20 flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white">
      <ProgressHeader currentStep={8} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿Cuál es tu objetivo personal?
          </h2>
          <p className="text-runapp-gray mb-6">Por ejemplo: "5K en menos de 30 minutos"</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Escribe tu objetivo aquí"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-runapp-gray">Objetivos comunes:</p>
              <div className="flex flex-wrap gap-2">
                {commonGoals.map((commonGoal, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectGoal(commonGoal)}
                    className="px-3 py-1.5 bg-runapp-light-purple/50 text-runapp-navy rounded-full text-sm hover:bg-runapp-light-purple transition-colors"
                  >
                    {commonGoal}
                  </button>
                ))}
              </div>
            </div>
            
            <RunButton type="submit" disabled={!isValid}>
              Continuar
            </RunButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalQuestion;
