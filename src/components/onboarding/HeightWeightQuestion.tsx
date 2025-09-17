import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import ScrollPicker from "@/components/ui/ScrollPicker";
import { useOnboardingLayout } from "@/hooks/useOnboardingLayout";

const HeightWeightQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [height, setHeight] = useState<string>(user.height?.toString() || "170");
  const [weight, setWeight] = useState<string>(user.weight?.toString() || "70");
  const navigate = useNavigate();
  const { isReady, paddingTop, paddingBottom, paddingLeft, paddingRight } = useOnboardingLayout();

  // Generate height values (120-220 cm)
  const heightValues = Array.from({ length: 101 }, (_, i) => (120 + i).toString());
  
  // Generate weight values (30-200 kg)
  const weightValues = Array.from({ length: 171 }, (_, i) => (30 + i).toString());

  // Si los insets no están listos, mostrar loading simple
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-runapp-light-purple/30 to-white">
        <div className="text-center">
          <div className="w-12 h-12 bg-runapp-light-purple rounded-full flex items-center justify-center mb-4 animate-pulse">
            <span className="text-xl">🏃</span>
          </div>
          <p className="text-runapp-gray">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ 
      height: parseInt(height), 
      weight: parseInt(weight) 
    });
    navigate("/onboarding/max-distance");
  };

  const isValid = height !== "" && weight !== "";

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white"
      style={{
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
      }}
    >
      <ProgressHeader currentStep={4} totalSteps={9} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2 text-center">
            Altura y peso
          </h2>
          <p className="text-runapp-gray mb-8 text-center">Esto se utilizará para calibrar tu plan personalizado</p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Height and Weight Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Height Picker */}
              <ScrollPicker
                values={heightValues}
                selectedValue={height}
                onValueChange={setHeight}
                unit="cm"
                label="Altura"
              />

              {/* Weight Picker */}
              <ScrollPicker
                values={weightValues}
                selectedValue={weight}
                onValueChange={setWeight}
                unit="kg"
                label="Peso"
              />
            </div>
            
            <div className="pt-4">
              <RunButton type="submit" disabled={!isValid}>
                Continuar
              </RunButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HeightWeightQuestion;
