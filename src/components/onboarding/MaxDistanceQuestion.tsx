
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const MaxDistanceQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [maxDistance, setMaxDistance] = useState<string>(user.maxDistance?.toString() || "");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [inputMode, setInputMode] = useState<boolean>(false);
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  const headerHeight = insets.top + 24 + 32;

  const predefinedOptions = [
    { label: "Soy principiante / Nunca he corrido", value: "0" },
    { label: "Menos de 1 km", value: "0.5" },
    { label: "1-2 km", value: "1.5" },
    { label: "3-5 km", value: "4" },
    { label: "5-10 km", value: "7.5" },
    { label: "Más de 10 km", value: "12" },
  ];

  const handleOptionSelect = (option: typeof predefinedOptions[0]) => {
    setSelectedOption(option.label);
    setMaxDistance(option.value);
    setInputMode(false);
  };

  const handleCustomInput = () => {
    setInputMode(true);
    setSelectedOption("");
    setMaxDistance("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ maxDistance: Number(maxDistance) });
    navigate("/onboarding/pace");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMaxDistance(value);
      setSelectedOption("");
    }
  };

  const isValid = maxDistance !== "" && Number(maxDistance) >= 0;

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
      <ProgressHeader currentStep={6} totalSteps={10} showBackButton={true} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿Cuál es la distancia máxima que has corrido?
          </h2>
          <p className="text-runapp-gray mb-6">Esto nos ayudará a personalizar tu plan de entrenamiento</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!inputMode ? (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {predefinedOptions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleOptionSelect(option)}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                        selectedOption === option.label
                          ? 'border-runapp-purple bg-runapp-purple/5 text-runapp-purple'
                          : 'border-gray-200 hover:border-gray-300 text-runapp-navy'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      {option.value !== "0" && (
                        <div className="text-sm text-gray-500 mt-1">
                          ~{option.value} km
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCustomInput}
                    className="w-full p-3 rounded-lg border border-gray-300 text-runapp-gray hover:border-runapp-purple hover:text-runapp-purple transition-colors duration-200"
                  >
                    ✏️ Introducir distancia específica
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="maxDistance" className="block text-sm font-medium text-runapp-gray mb-2">
                    Distancia máxima específica
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="maxDistance"
                      value={maxDistance}
                      onChange={handleChange}
                      placeholder="5.0"
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent"
                      autoFocus
                    />
                    <span className="ml-2 text-runapp-gray font-medium">km</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setInputMode(false);
                    setMaxDistance("");
                  }}
                  className="text-sm text-runapp-purple hover:underline"
                >
                  ← Volver a opciones predefinidas
                </button>
              </div>
            )}
            
            <RunButton type="submit" disabled={!isValid}>
              Continuar
            </RunButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaxDistanceQuestion;
