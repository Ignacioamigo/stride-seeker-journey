import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import GoalSliderInput from "@/components/ui/GoalSliderInput";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const TargetDistanceQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  // Calculate header height: safe area + padding + content
  const headerHeight = insets.top + 24 + 32;

  const [targetDistance, setTargetDistance] = useState<string>(
    user.targetDistance?.toString() || "5"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ targetDistance: Number(targetDistance) });
    navigate("/onboarding/target-pace");
  };

  const isValid = targetDistance && Number(targetDistance) > 0;

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white"
      style={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + 80,
        paddingLeft: Math.max(insets.left, 16),
        paddingRight: Math.max(insets.right, 16),
      }}
    >
      <ProgressHeader currentStep={8} totalSteps={12} showBackButton={true} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿Qué distancia quieres alcanzar?
          </h2>
          <p className="text-runapp-gray mb-6">
            Selecciona la distancia objetivo para tu entrenamiento
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <GoalSliderInput
              value={targetDistance}
              onChange={setTargetDistance}
              min={1}
              max={42}
              step={1}
              unit="km"
              placeholder="5"
              type="distance"
              label="Distancia objetivo"
              description="¿Qué distancia quieres correr?"
            />

            {/* Resumen de la selección */}
            <div className="bg-runapp-light-purple/20 rounded-lg p-4 mt-6">
              <h3 className="text-sm font-medium text-runapp-navy mb-2">Tu objetivo de distancia:</h3>
              <p className="text-sm text-runapp-gray">
                {targetDistance} kilómetros
              </p>
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

export default TargetDistanceQuestion;
