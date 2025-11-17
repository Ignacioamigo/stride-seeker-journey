import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const TargetTimeframeQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  // Calculate header height: safe area + padding + content
  const headerHeight = insets.top + 24 + 32;

  const [months, setMonths] = useState<string>(
    user.targetTimeframeUnit === 'months' && user.targetTimeframe 
      ? user.targetTimeframe.toString() 
      : "3"
  );
  const [days, setDays] = useState<string>("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertir todo a días para almacenar
    const totalDays = (parseInt(months) * 30) + parseInt(days);
    
    // Crear un objetivo descriptivo basado en los valores seleccionados
    const distanceText = user.targetDistance === 1 ? "1 kilómetro" : `${user.targetDistance} kilómetros`;
    
    // Formatear el ritmo objetivo correctamente
    const paceMinutes = Math.floor(user.targetPace || 0);
    const paceSeconds = Math.round(((user.targetPace || 0) % 1) * 60);
    const paceText = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} min/km`;
    
    // Crear texto del tiempo
    let timeframeText = "";
    if (parseInt(months) > 0 && parseInt(days) > 0) {
      timeframeText = `${months} ${parseInt(months) === 1 ? 'mes' : 'meses'} y ${days} ${parseInt(days) === 1 ? 'día' : 'días'}`;
    } else if (parseInt(months) > 0) {
      timeframeText = `${months} ${parseInt(months) === 1 ? 'mes' : 'meses'}`;
    } else {
      timeframeText = `${days} ${parseInt(days) === 1 ? 'día' : 'días'}`;
    }
    
    const goalDescription = `Correr ${distanceText} a un ritmo de ${paceText} en ${timeframeText}`;
    
    updateUser({ 
      goal: goalDescription,
      targetTimeframe: totalDays,
      targetTimeframeUnit: 'days'
    });
    navigate("/onboarding/race-preparation");
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 12)) {
      setMonths(value);
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) < 90)) {
      setDays(value);
    }
  };

  const isValid = (months !== "" && parseInt(months) > 0) || (days !== "" && parseInt(days) > 0);

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
      <ProgressHeader currentStep={10} totalSteps={12} showBackButton={true} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿En cuánto tiempo quieres lograrlo?
          </h2>
          <p className="text-runapp-gray mb-6">
            Introduce el tiempo para alcanzar tu objetivo
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Meses */}
              <div>
                <label className="block text-sm font-medium text-runapp-gray mb-3">
                  Meses
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={months}
                    onChange={handleMonthsChange}
                    placeholder="3"
                    min="0"
                    max="12"
                    className="flex-1 px-6 py-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent text-center text-2xl font-semibold"
                    autoFocus
                  />
                  <span className="text-lg font-medium text-runapp-gray min-w-[60px]">meses</span>
                </div>
              </div>

              {/* Días */}
              <div>
                <label className="block text-sm font-medium text-runapp-gray mb-3">
                  Días adicionales
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={days}
                    onChange={handleDaysChange}
                    placeholder="0"
                    min="0"
                    max="89"
                    className="flex-1 px-6 py-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent text-center text-2xl font-semibold"
                  />
                  <span className="text-lg font-medium text-runapp-gray min-w-[60px]">días</span>
                </div>
              </div>
            </div>

            {/* Resumen completo del objetivo */}
            {isValid && (
              <div className="bg-runapp-light-purple/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-runapp-navy mb-2">Tu objetivo completo:</h3>
                <p className="text-sm text-runapp-gray">
                  Correr {user.targetDistance} km a un ritmo de {user.targetPace ? `${Math.floor(user.targetPace)}:${Math.round((user.targetPace % 1) * 60).toString().padStart(2, '0')}` : '-'} min/km en{' '}
                  {parseInt(months) > 0 && parseInt(days) > 0 
                    ? `${months} ${parseInt(months) === 1 ? 'mes' : 'meses'} y ${days} ${parseInt(days) === 1 ? 'día' : 'días'}`
                    : parseInt(months) > 0 
                    ? `${months} ${parseInt(months) === 1 ? 'mes' : 'meses'}`
                    : `${days} ${parseInt(days) === 1 ? 'día' : 'días'}`
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

export default TargetTimeframeQuestion;
