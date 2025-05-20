
import { BarChart2 } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext: string;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtext, change, positive, icon }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-runapp-gray mb-1">{title}</h3>
          <p className="text-2xl font-bold text-runapp-navy">{value}</p>
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
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-runapp-navy mb-4">Estadísticas</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <StatsCard 
          title="Distancia Semanal" 
          value="18.5 km" 
          subtext="Esta semana" 
          change="12% vs. semana anterior" 
          positive={true} 
        />
        <StatsCard 
          title="Total de carreras" 
          value="12" 
          subtext="Este mes" 
        />
        <StatsCard 
          title="Ritmo promedio" 
          value="5:20 min/km" 
          subtext="Últimas 5 carreras" 
          change="5% vs. semana anterior" 
          positive={true} 
        />
        <StatsCard 
          title="Calorías" 
          value="2,480" 
          subtext="Esta semana" 
        />
      </div>
    </div>
  );
};

export default RunStats;
