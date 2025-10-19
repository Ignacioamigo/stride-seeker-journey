import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";

const TargetPaceQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  // Inicializar minutos y segundos desde targetPace si existe
  const initialMinutes = user.targetPace ? Math.floor(user.targetPace).toString() : "5";
  const initialSeconds = user.targetPace ? Math.round((user.targetPace % 1) * 60).toString() : "0";

  const [minutes, setMinutes] = useState<string>(initialMinutes);
  const [seconds, setSeconds] = useState<string>(initialSeconds);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convertir minutos y segundos a formato decimal (ej: 4:30 = 4.5)
    const totalMinutes = parseInt(minutes) + parseInt(seconds) / 60;
    updateUser({ targetPace: totalMinutes });
    navigate("/onboarding/target-timeframe");
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) < 60)) {
      setMinutes(value);
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) < 60)) {
      setSeconds(value);
    }
  };

  const isValid = minutes !== "" && seconds !== "";

  return (
    <div className="min-h-screen pt-16 pb-20 flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white">
      <ProgressHeader currentStep={9} totalSteps={12} />

      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿A qué ritmo quieres correr?
          </h2>
          <p className="text-runapp-gray mb-6">
            Introduce tu ritmo objetivo por kilómetro
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-runapp-gray mb-3">
                Ritmo objetivo (minutos por kilómetro)
              </label>
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 max-w-[100px]">
                  <input
                    type="number"
                    value={minutes}
                    onChange={handleMinutesChange}
                    placeholder="4"
                    min="0"
                    max="59"
                    className="w-full px-4 py-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent text-center text-2xl font-semibold"
                    autoFocus
                  />
                  <label className="block text-sm text-center mt-2 text-runapp-gray font-medium">min</label>
                </div>
                
                <span className="text-3xl font-bold text-runapp-navy pb-6">:</span>
                
                <div className="flex-1 max-w-[100px]">
                  <input
                    type="number"
                    value={seconds}
                    onChange={handleSecondsChange}
                    placeholder="35"
                    min="0"
                    max="59"
                    className="w-full px-4 py-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent text-center text-2xl font-semibold"
                  />
                  <label className="block text-sm text-center mt-2 text-runapp-gray font-medium">seg</label>
                </div>
                
                <div className="ml-2 text-xl font-medium text-runapp-navy pb-6">/km</div>
              </div>
            </div>

            {/* Resumen de la selección */}
            {isValid && (
              <div className="bg-runapp-light-purple/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-runapp-navy mb-2">Tu objetivo de ritmo:</h3>
                <p className="text-sm text-runapp-gray">
                  {minutes}:{seconds.padStart(2, '0')} minutos por kilómetro
                </p>
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

export default TargetPaceQuestion;
