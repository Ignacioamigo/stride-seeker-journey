
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";

const MaxDistanceQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [maxDistance, setMaxDistance] = useState<string>(user.maxDistance?.toString() || "");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ maxDistance: Number(maxDistance) });
    navigate("/onboarding/pace");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMaxDistance(value);
    }
  };

  const isValid = maxDistance !== "" && Number(maxDistance) >= 0;

  return (
    <div className="min-h-screen pt-16 pb-20 flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white">
      <ProgressHeader currentStep={6} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿Cuál es la distancia máxima que has corrido?
          </h2>
          <p className="text-runapp-gray mb-6">Esto nos ayudará a personalizar tu plan de entrenamiento</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="maxDistance" className="block text-sm font-medium text-runapp-gray mb-1">
                Distancia máxima
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="maxDistance"
                  value={maxDistance}
                  onChange={handleChange}
                  placeholder="5"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent"
                />
                <span className="ml-2 text-runapp-gray">km</span>
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

export default MaxDistanceQuestion;
