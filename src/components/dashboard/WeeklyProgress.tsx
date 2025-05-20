
import { useUser } from "@/context/UserContext";

const WeeklyProgress: React.FC = () => {
  const { user } = useUser();
  // Placeholder progress
  const progress = 35;

  return (
    <div className="bg-runapp-purple text-white rounded-xl p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">¡Hola, {user.name}! 👋</h2>
        <div className="flex items-center gap-1">
          <span className="text-sm opacity-90">Premios</span>
          <div className="h-6 w-6 bg-white/30 rounded-full flex items-center justify-center">
            🏆
          </div>
        </div>
      </div>
      <p className="text-sm opacity-90 mb-2">Progreso semanal: {progress}%</p>
      <div className="h-2 bg-white/30 rounded-full mb-2">
        <div 
          className="h-2 bg-white rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default WeeklyProgress;
