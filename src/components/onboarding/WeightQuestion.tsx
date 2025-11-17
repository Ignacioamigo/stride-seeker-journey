
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import SliderInput from "@/components/ui/SliderInput";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const WeightQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [weight, setWeight] = useState<string>(user.weight?.toString() || "70");
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  // Calculate header height: safe area + padding + content
  const headerHeight = insets.top + 24 + 32; // safe area + py-3 (12px*2) + estimated content height

  const convertToKg = (lbs: number) => Math.round(lbs * 0.45359237);
  const convertToLbs = (kg: number) => Math.round(kg * 2.20462);

  // Get appropriate ranges based on unit
  const getWeightConfig = () => {
    if (unit === 'kg') {
      return {
        min: 30,
        max: 200,
        step: 1,
        placeholder: "70"
      };
    } else {
      return {
        min: 66,  // ~30kg
        max: 440, // ~200kg
        step: 1,
        placeholder: "154"
      };
    }
  };

  const handleUnitChange = (newUnit: 'kg' | 'lbs') => {
    if (unit !== newUnit) {
      setUnit(newUnit);
      if (weight) {
        const numWeight = parseFloat(weight);
        if (!isNaN(numWeight)) {
          if (newUnit === 'kg') {
            setWeight(convertToKg(numWeight).toString());
          } else {
            setWeight(convertToLbs(numWeight).toString());
          }
        }
      }
    }
  };

  const handleWeightChange = (newWeight: string) => {
    setWeight(newWeight);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numWeight = parseFloat(weight);
    const weightInKg = unit === 'lbs' ? convertToKg(numWeight) : numWeight;
    updateUser({ weight: weightInKg });
    
    // Calculate BMI for the IMC display
    if (user.height) {
      const heightInM = user.height / 100;
      const bmi = weightInKg / (heightInM * heightInM);
      console.log(`Tu IMC: ${bmi.toFixed(1)}`);
      // This would be shown in the UI as in your screenshot
    }
    
    navigate("/onboarding/max-distance");
  };

  const config = getWeightConfig();
  const isValid = weight !== "" && Number(weight) > 0 && Number(weight) >= config.min && Number(weight) <= config.max;

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
      <ProgressHeader currentStep={5} totalSteps={10} showBackButton={true} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-6">
            Peso actual
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              {/* Unit toggle */}
              <div className="bg-gray-100 rounded-full p-1 flex mb-6">
                <button
                  type="button"
                  onClick={() => handleUnitChange('kg')}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                    unit === 'kg' 
                      ? 'bg-runapp-purple text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitChange('lbs')}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                    unit === 'lbs' 
                      ? 'bg-runapp-purple text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  lbs
                </button>
              </div>
              
              {/* Slider Input */}
              <SliderInput
                value={weight}
                onChange={handleWeightChange}
                min={config.min}
                max={config.max}
                step={config.step}
                unit={unit}
                placeholder={config.placeholder}
                type="weight"
              />
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

export default WeightQuestion;
