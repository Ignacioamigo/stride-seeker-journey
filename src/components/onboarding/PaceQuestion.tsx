
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";

const PaceQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [minutes, setMinutes] = useState<string>(user.pace ? user.pace.split(':')[0] : "");
  const [seconds, setSeconds] = useState<string>(user.pace ? user.pace.split(':')[1] : "");
  const navigate = useNavigate();

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
      <ProgressHeader currentStep={7} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿Cuál es tu ritmo promedio?
          </h2>
          <p className="text-runapp-gray mb-6">Minutos por kilómetro</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
