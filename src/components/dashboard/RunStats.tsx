
import { BarChart2, Clock } from "lucide-react";
import { useRunningStats } from "@/hooks/useRunningStats";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext: string;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtext, change, positive, icon, isLoading }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-runapp-gray mb-1">{title}</h3>
          <p className="text-2xl font-bold text-runapp-navy">
            {isLoading ? "..." : value}
          </p>
          <p className="text-xs text-runapp-gray">{subtext}</p>
          {change && (
            <p className={`text-xs mt-1 ${positive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              {positive ? '+' : ''}{change}
            </p>
          )}
        </div>
        <div className="p-2 bg-runapp-light-purple/50 rounded-full">
          {icon || <BarChart2 className="text-runapp-purple" size={18} />}
        </div>
      </div>
    </div>
  );
};

const RunStats: React.FC = () => {
  const { stats, isLoading } = useRunningStats();

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-runapp-navy mb-4">Estadísticas</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <StatsCard 
          title="Distancia Semanal" 
          value={`${stats.weeklyDistance} km`} 
          subtext="Esta semana" 
          change={stats.weeklyDistance > 0 ? "Activo" : "Sin actividad"} 
          positive={stats.weeklyDistance > 0} 
          isLoading={isLoading}
        />
        <StatsCard 
          title="Total de carreras" 
          value={stats.totalRuns} 
          subtext="Completadas" 
          isLoading={isLoading}
        />
        <StatsCard 
          title="Ritmo promedio" 
          value={stats.averagePace} 
          subtext="Tiempo/km global" 
          change={stats.paceImprovement !== 0 ? `${Math.abs(stats.paceImprovement)}% vs. mes anterior` : undefined} 
          positive={stats.paceImprovement > 0} 
          isLoading={isLoading}
        />
        <StatsCard 
          title="Promedio distancia" 
          value={`${stats.averageDistancePerRun} km`} 
          subtext="Por carrera" 
          icon={<Clock className="text-runapp-purple" size={18} />}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default RunStats;
