
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const WeightQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [weight, setWeight] = useState<string>(user.weight?.toString() || "");
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  // Calculate header height: safe area + padding + content
  const headerHeight = insets.top + 24 + 32; // safe area + py-3 (12px*2) + estimated content height

  const convertToKg = (lbs: number) => Math.round(lbs * 0.45359237);
  const convertToLbs = (kg: number) => Math.round(kg * 2.20462);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setWeight(value);
    }
  };

  const isValid = weight !== "" && Number(weight) > 0;

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
      <ProgressHeader currentStep={5} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-6">
            Peso actual
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
              <div className="bg-gray-100 rounded-full p-1 flex mb-4">
                <button
                  type="button"
                  onClick={() => handleUnitChange('kg')}
                  className={`toggle-option ${unit === 'kg' ? 'active' : ''}`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitChange('lbs')}
                  className={`toggle-option ${unit === 'lbs' ? 'active' : ''}`}
                >
                  lbs
                </button>
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  value={weight}
                  onChange={handleChange}
                  placeholder={unit === 'kg' ? "70" : "154"}
                  min="1"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-runapp-gray">
                  {unit}
                </span>
              </div>
              
              <div className="text-center mt-2 text-sm text-runapp-gray">
                {/* Numbers for the spinner visualization */}
                <div className="grid grid-cols-7 gap-1 text-gray-300 font-medium">
                  {Array.from({ length: 7 }, (_, i) => {
                    const baseNum = Math.max(parseInt(weight || '0') - 3 + i, 0);
                    return (
                      <div key={i} className={i === 3 ? "text-runapp-navy font-bold text-lg" : ""}>
                        {baseNum}
                      </div>
                    );
                  })}
                </div>
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

export default WeightQuestion;
