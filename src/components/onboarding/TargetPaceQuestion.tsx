import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const TargetPaceQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  // Calculate header height: safe area + padding + content
  const headerHeight = insets.top + 24 + 32;

  // Inicializar minutos y segundos desde targetPace si existe
  const initialMinutes = user.targetPace ? Math.floor(user.targetPace).toString() : "5";
  const initialSeconds = user.targetPace ? Math.round((user.targetPace % 1) * 60).toString() : "0";

  const [minutes, setMinutes] = useState<string>(initialMinutes);
  const [seconds, setSeconds] = useState<string>(initialSeconds);
  const [noTargetPace, setNoTargetPace] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noTargetPace) {
      // Si no tiene ritmo objetivo, guardar null
      updateUser({ targetPace: null });
    } else {
      // Convertir minutos y segundos a formato decimal (ej: 4:30 = 4.5)
      const totalMinutes = parseInt(minutes) + parseInt(seconds) / 60;
      updateUser({ targetPace: totalMinutes });
    }
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

  const isValid = noTargetPace || (minutes !== "" && seconds !== "");

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
      <ProgressHeader currentStep={9} totalSteps={12} showBackButton={true} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
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
                    disabled={noTargetPace}
                    className="w-full px-4 py-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent text-center text-2xl font-semibold disabled:bg-gray-100 disabled:text-gray-400"
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
                    disabled={noTargetPace}
                    className="w-full px-4 py-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent text-center text-2xl font-semibold disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <label className="block text-sm text-center mt-2 text-runapp-gray font-medium">seg</label>
                </div>
                
                <div className="ml-2 text-xl font-medium text-runapp-navy pb-6">/km</div>
              </div>

              {/* Opción para quienes no tienen ritmo objetivo */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noTargetPace}
                    onChange={(e) => setNoTargetPace(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-runapp-purple focus:ring-runapp-purple"
                  />
                  <span className="text-sm text-runapp-gray">
                    Prefiero descubrir mi ritmo durante el entrenamiento
                  </span>
                </label>
              </div>
            </div>

            {/* Resumen de la selección */}
            {isValid && (
              <div className="bg-runapp-light-purple/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-runapp-navy mb-2">Tu objetivo de ritmo:</h3>
                <p className="text-sm text-runapp-gray">
                  {noTargetPace 
                    ? "Irás descubriendo tu ritmo ideal con el plan de entrenamiento" 
                    : `${minutes}:${seconds.padStart(2, '0')} minutos por kilómetro`
                  }
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
