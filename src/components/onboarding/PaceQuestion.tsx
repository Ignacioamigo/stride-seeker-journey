
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const PaceQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [minutes, setMinutes] = useState<string>(user.pace ? user.pace.split(':')[0] : "");
  const [seconds, setSeconds] = useState<string>(user.pace ? user.pace.split(':')[1] : "");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [inputMode, setInputMode] = useState<boolean>(false);
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  const headerHeight = insets.top + 24 + 32;

  const predefinedOptions = [
    { label: "No lo sé / Soy principiante", value: "07:00", description: "Ritmo relajado para empezar" },
    { label: "Camino/troto despacio", value: "08:00", description: "~8 min/km" },
    { label: "Troto moderado", value: "06:30", description: "~6:30 min/km" },
    { label: "Corro a buen ritmo", value: "05:30", description: "~5:30 min/km" },
    { label: "Corro rápido", value: "04:30", description: "~4:30 min/km" },
    { label: "Soy corredor avanzado", value: "04:00", description: "~4:00 min/km" },
  ];

  const handleOptionSelect = (option: typeof predefinedOptions[0]) => {
    setSelectedOption(option.label);
    const [min, sec] = option.value.split(':');
    setMinutes(min);
    setSeconds(sec);
    setInputMode(false);
  };

  const handleCustomInput = () => {
    setInputMode(true);
    setSelectedOption("");
    setMinutes("");
    setSeconds("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pace = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    updateUser({ pace });
    navigate("/onboarding/goal");
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) < 60)) {
      setMinutes(value);
      setSelectedOption("");
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) < 60)) {
      setSeconds(value);
      setSelectedOption("");
    }
  };

  const isValid = minutes !== "" && seconds !== "";

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
      <ProgressHeader currentStep={7} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿Cuál es tu ritmo promedio?
          </h2>
          <p className="text-runapp-gray mb-6">Tiempo por kilómetro cuando corres</p>
          
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
                      <div className="text-sm text-gray-500 mt-1">
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCustomInput}
                    className="w-full p-3 rounded-lg border border-gray-300 text-runapp-gray hover:border-runapp-purple hover:text-runapp-purple transition-colors duration-200"
                  >
                    ⏱️ Introducir ritmo específico
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-runapp-gray mb-2">
                    Ritmo específico (minutos por kilómetro)
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    <div>
                      <input
                        type="number"
                        value={minutes}
                        onChange={handleMinutesChange}
                        placeholder="5"
                        min="0"
                        max="59"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent text-center text-xl"
                        autoFocus
                      />
                      <label className="block text-xs text-center mt-1 text-runapp-gray">min</label>
                    </div>
                    
                    <span className="text-2xl font-bold">:</span>
                    
                    <div>
                      <input
                        type="number"
                        value={seconds}
                        onChange={handleSecondsChange}
                        placeholder="30"
                        min="0"
                        max="59"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent text-center text-xl"
                      />
                      <label className="block text-xs text-center mt-1 text-runapp-gray">seg</label>
                    </div>
                    
                    <div className="ml-2 text-lg font-medium text-runapp-navy">/km</div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setInputMode(false);
                    setMinutes("");
                    setSeconds("");
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

export default PaceQuestion;
