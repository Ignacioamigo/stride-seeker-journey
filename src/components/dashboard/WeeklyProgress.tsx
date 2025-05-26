
import { useUser } from "@/context/UserContext";
import { useRunningStats } from "@/hooks/useRunningStats";

const WeeklyProgress: React.FC = () => {
  const { user } = useUser();
  const { stats, isLoading } = useRunningStats();
  
  // Calcular progreso basado en entrenamientos completados vs planeados
  // Asumiendo un objetivo de 3 entrenamientos por semana
  const weeklyGoal = user.weeklyWorkouts || 3;
  const completedThisWeek = stats.weeklyData.filter(day => day.distance > 0).length;
  const progress = Math.min((completedThisWeek / weeklyGoal) * 100, 100);

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
      <p className="text-sm opacity-90 mb-2">
        Progreso semanal: {isLoading ? "..." : `${Math.round(progress)}%`}
      </p>
      <div className="h-2 bg-white/30 rounded-full mb-2">
        <div 
          className="h-2 bg-white rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs opacity-75">
        {isLoading ? "Cargando..." : `${completedThisWeek} de ${weeklyGoal} entrenamientos completados`}
      </p>
    </div>
  );
};

export default WeeklyProgress;
