
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import SliderInput from "@/components/ui/SliderInput";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const HeightQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [height, setHeight] = useState<string>(user.height?.toString() || "170");
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  // Calculate header height: safe area + padding + content
  const headerHeight = insets.top + 24 + 32; // safe area + py-3 (12px*2) + estimated content height

  const convertToCm = (inches: number) => Math.round(inches * 2.54);
  const convertToInches = (cm: number) => Math.round(cm / 2.54);

  // Get appropriate ranges based on unit
  const getHeightConfig = () => {
    if (unit === 'cm') {
      return {
        min: 120,
        max: 220,
        step: 1,
        placeholder: "170"
      };
    } else {
      return {
        min: 47,  // ~120cm
        max: 87,  // ~220cm
        step: 1,
        placeholder: "67"
      };
    }
  };

  const handleUnitChange = (newUnit: 'cm' | 'in') => {
    if (unit !== newUnit) {
      setUnit(newUnit);
      if (height) {
        const numHeight = parseFloat(height);
        if (!isNaN(numHeight)) {
          if (newUnit === 'cm') {
            setHeight(convertToCm(numHeight).toString());
          } else {
            setHeight(convertToInches(numHeight).toString());
          }
        }
      }
    }
  };

  const handleHeightChange = (newHeight: string) => {
    setHeight(newHeight);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numHeight = parseFloat(height);
    const heightInCm = unit === 'in' ? convertToCm(numHeight) : numHeight;
    updateUser({ height: heightInCm });
    navigate("/onboarding/weight");
  };

  const config = getHeightConfig();
  const isValid = height !== "" && Number(height) > 0 && Number(height) >= config.min && Number(height) <= config.max;

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
      <ProgressHeader currentStep={4} totalSteps={10} showBackButton={true} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-6">
            Altura
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              {/* Unit toggle */}
              <div className="bg-gray-100 rounded-full p-1 flex mb-6">
                <button
                  type="button"
                  onClick={() => handleUnitChange('cm')}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                    unit === 'cm' 
                      ? 'bg-runapp-purple text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitChange('in')}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                    unit === 'in' 
                      ? 'bg-runapp-purple text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  in
                </button>
              </div>
              
              {/* Slider Input */}
              <SliderInput
                value={height}
                onChange={handleHeightChange}
                min={config.min}
                max={config.max}
                step={config.step}
                unit={unit}
                placeholder={config.placeholder}
                type="height"
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

export default HeightQuestion;
