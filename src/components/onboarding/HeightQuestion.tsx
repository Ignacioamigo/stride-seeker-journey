
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";

const HeightQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [height, setHeight] = useState<string>(user.height?.toString() || "");
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const navigate = useNavigate();

  const convertToCm = (inches: number) => Math.round(inches * 2.54);
  const convertToInches = (cm: number) => Math.round(cm / 2.54);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numHeight = parseFloat(height);
    const heightInCm = unit === 'in' ? convertToCm(numHeight) : numHeight;
    updateUser({ height: heightInCm });
    navigate("/onboarding/weight");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setHeight(value);
    }
  };

  const isValid = height !== "" && Number(height) > 0;

  return (
    <div className="min-h-screen pt-16 pb-20 flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white">
      <ProgressHeader currentStep={4} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-6">
            Altura
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
              <div className="bg-gray-100 rounded-full p-1 flex mb-4">
                <button
                  type="button"
                  onClick={() => handleUnitChange('cm')}
                  className={`toggle-option ${unit === 'cm' ? 'active' : ''}`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitChange('in')}
                  className={`toggle-option ${unit === 'in' ? 'active' : ''}`}
                >
                  in
                </button>
              </div>
              
              <input
                type="number"
                value={height}
                onChange={handleChange}
                placeholder={unit === 'cm' ? "170" : "67"}
                min="1"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent"
              />
              <div className="text-center mt-2 text-sm text-runapp-gray">
                {/* Numbers for the spinner visualization like in the screenshot */}
                <div className="grid grid-cols-7 gap-1 text-gray-300 font-medium">
                  {Array.from({ length: 7 }, (_, i) => {
                    const baseNum = Math.max(parseInt(height || '0') - 3 + i, 0);
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

export default HeightQuestion;
