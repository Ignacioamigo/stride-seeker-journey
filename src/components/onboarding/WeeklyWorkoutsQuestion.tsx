
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";

const WeeklyWorkoutsQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [workouts, setWorkouts] = useState<number>(user.weeklyWorkouts || 3);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ weeklyWorkouts: workouts });
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

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="min-h-screen pt-16 pb-20 flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white">
      <ProgressHeader currentStep={9} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿Cuántos días a la semana quieres entrenar?
          </h2>
          <p className="text-runapp-gray mb-6">Selecciona el número de días que te gustaría correr</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleDecrease}
                className="w-10 h-10 rounded-full bg-runapp-light-purple text-runapp-purple text-xl font-bold flex items-center justify-center"
              >
                -
              </button>
              
              <span className="text-3xl font-bold text-runapp-navy">
                {workouts} {workouts === 1 ? 'día' : 'días'} 
              </span>
              
              <button
                type="button"
                onClick={handleIncrease}
                className="w-10 h-10 rounded-full bg-runapp-light-purple text-runapp-purple text-xl font-bold flex items-center justify-center"
              >
                +
              </button>
            </div>
            
            <div className="flex justify-between mt-4">
              {weekDays.map((day, index) => (
                <div 
                  key={day} 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-medium ${
                    index < workouts 
                      ? 'bg-runapp-purple text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            
            <RunButton type="submit">
              Continuar
            </RunButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WeeklyWorkoutsQuestion;
