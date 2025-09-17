
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import DaySelector from "@/components/ui/DaySelector";
import { WeekDay } from "@/types";
import { getCurrentWeekDays } from "@/utils/dateUtils";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const WeeklyWorkoutsQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [workouts, setWorkouts] = useState<number>(user.weeklyWorkouts || 3);
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);
  const [mode, setMode] = useState<'quantity' | 'days'>('quantity');
  const navigate = useNavigate();
  const { top, bottom, left, right, isReady } = useSafeAreaInsets();

  // Inicializar días de la semana
  useEffect(() => {
    const weekDays = getCurrentWeekDays();
    
    // Si el usuario ya tiene días seleccionados, aplicarlos
    if (user.selectedDays && user.selectedDays.length > 0) {
      const updatedDays = weekDays.map(day => ({
        ...day,
        selected: user.selectedDays?.some(selectedDay => selectedDay.id === day.id) || false
      }));
      setSelectedDays(updatedDays);
      setMode('days');
    } else {
      setSelectedDays(weekDays);
    }
  }, [user.selectedDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'quantity') {
      updateUser({ weeklyWorkouts: workouts });
    } else {
      const selectedDaysList = selectedDays.filter(day => day.selected);
      updateUser({ 
        weeklyWorkouts: selectedDaysList.length,
        selectedDays: selectedDaysList
      });
    }
    
    navigate("/onboarding/experience");
  };

  const handleDecrease = () => {
    if (workouts > 1) {
      setWorkouts(workouts - 1);
    }
  };

  const handleIncrease = () => {
    if (workouts < 7) {
      setWorkouts(workouts + 1);
    }
  };

  const handleDayToggle = (dayId: number) => {
    setSelectedDays(prevDays => 
      prevDays.map(day => 
        day.id === dayId ? { ...day, selected: !day.selected } : day
      )
    );
  };

  const handleModeSwitch = () => {
    setMode(mode === 'quantity' ? 'days' : 'quantity');
  };

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const selectedDaysCount = selectedDays.filter(day => day.selected).length;
  const isValid = mode === 'quantity' ? workouts > 0 : selectedDaysCount > 0;

  // Loading state
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-runapp-light-purple/30 to-white">
        <div className="text-center">
          <div className="w-12 h-12 bg-runapp-light-purple rounded-full flex items-center justify-center mb-4 animate-pulse">
            <span className="text-xl">🗓️</span>
          </div>
          <p className="text-runapp-gray">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white"
      style={{
        paddingTop: top + 60, // safe area + header space
        paddingBottom: bottom + 80, // safe area + content space
        paddingLeft: Math.max(left, 16),
        paddingRight: Math.max(right, 16),
      }}
    >
      <ProgressHeader currentStep={9} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {/* Toggle de modo */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={handleModeSwitch}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all no-select ${
                mode === 'quantity' 
                  ? 'bg-runapp-purple text-white shadow-sm' 
                  : 'text-gray-600 hover:text-runapp-purple'
              }`}
            >
              📊 Cantidad
            </button>
            <button
              type="button"
              onClick={handleModeSwitch}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all no-select ${
                mode === 'days' 
                  ? 'bg-runapp-purple text-white shadow-sm' 
                  : 'text-gray-600 hover:text-runapp-purple'
              }`}
            >
              🗓️ Días específicos
            </button>
          </div>

          {mode === 'quantity' ? (
            <>
              <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
                ¿Cuántos días a la semana quieres entrenar?
              </h2>
              <p className="text-runapp-gray mb-6">Selecciona el número de días que te gustaría correr</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="w-10 h-10 rounded-full bg-runapp-light-purple text-runapp-purple text-xl font-bold flex items-center justify-center no-select"
                  >
                    -
                  </button>
                  
                  <span className="text-3xl font-bold text-runapp-navy no-select">
                    {workouts} {workouts === 1 ? 'día' : 'días'} 
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="w-10 h-10 rounded-full bg-runapp-light-purple text-runapp-purple text-xl font-bold flex items-center justify-center no-select"
                  >
                    +
                  </button>
                </div>
                
                <div className="flex justify-between mt-4">
                  {weekDays.map((day, index) => (
                    <div 
                      key={day} 
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-medium no-select ${
                        index < workouts 
                          ? 'bg-runapp-purple text-white' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                
                <RunButton type="submit" disabled={!isValid}>
                  Continuar
                </RunButton>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
                ¿Qué días quieres entrenar?
              </h2>
              <p className="text-runapp-gray mb-6">
                Selecciona los días específicos con las fechas de esta semana
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <DaySelector
                  days={selectedDays}
                  onDayToggle={handleDayToggle}
                  maxSelections={7}
                  minSelections={1}
                />
                
                <div className="text-center p-4 bg-runapp-light-purple/20 rounded-lg">
                  <p className="text-sm text-runapp-navy font-medium">
                    {selectedDaysCount > 0 
                      ? `${selectedDaysCount} día${selectedDaysCount > 1 ? 's' : ''} seleccionado${selectedDaysCount > 1 ? 's' : ''}`
                      : 'Selecciona al menos un día'
                    }
                  </p>
                </div>
                
                <RunButton type="submit" disabled={!isValid}>
                  Continuar
                </RunButton>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyWorkoutsQuestion;
