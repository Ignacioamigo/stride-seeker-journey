import BottomNav from "@/components/layout/BottomNav";
// Reemplazamos el banner de progreso semanal por la racha
import StreakCard from "@/components/stats/StreakCard";
import { StatsProvider } from "@/context/StatsContext";
import { useUser } from "@/context/UserContext";
import Header from "@/components/layout/Header";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";
import PeriodSelector, { TimePeriod } from "@/components/stats/PeriodSelector";
import { usePeriodStats } from "@/hooks/usePeriodStats";
import { useLayoutStability } from "@/hooks/useLayoutStability";
import { useState } from "react";
import { BarChart2, Clock } from "lucide-react";

const HEADER_HEIGHT = 44;

// StatsCard component matching the original design
interface StatsCardProps {
  title: string;
  value: string | number;
  subtext: string;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtext, 
  change, 
  positive = true, 
  icon, 
  isLoading 
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-runapp-gray mb-1 no-select">{title}</h3>
          <p className="text-2xl font-bold text-runapp-navy">
            {isLoading ? "..." : value}
          </p>
          <p className="text-xs text-runapp-gray no-select">{subtext}</p>
          {change && (
            <p className={`text-xs mt-1 ${positive ? 'text-green-500' : 'text-red-500'} flex items-center no-select`}>
              {positive ? '+' : ''}{change}
            </p>
          )}
        </div>
        <div className="p-2 bg-runapp-light-purple/50 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

const Stats: React.FC = () => {
  const { user } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('current_week');
  
  // 🔥 HOOK ANTI-DESCUADRE - DEBE IR AL INICIO
  useLayoutStability();
  const { top, bottom, left, right, isReady } = useSafeAreaInsets();
  const { stats: periodStats, isLoading: periodLoading, currentPlan } = usePeriodStats(selectedPeriod);
  
  // Usar fallbacks seguros cuando isReady es false
  const safeTop = isReady ? (top || 0) : 44;
  const safeBottom = isReady ? (bottom || 0) : 34;
  const safeLeft = isReady ? left : 0;
  const safeRight = isReady ? right : 0;
  
  // Calculate change indicators based on period
  const getDistanceSubtext = (): string => {
    switch (selectedPeriod) {
      case 'current_week': 
        return currentPlan ? `Semana ${currentPlan.weekNumber} del plan` : 'Esta semana';
      case 'current_month': return 'Este mes';
      case '3_months': return 'Últimos 3 meses';
      case 'all_time': return 'Histórico total';
      default: return 'Esta semana';
    }
  };

  const getChangeText = (): string | undefined => {
    if (periodStats.totalDistance > 0) {
      return 'Activo';
    }
    return 'Sin actividad';
  };
  
  return (
    <StatsProvider>
      <div className="bg-gray-50 min-h-screen">
        {/* Header - let it handle its own fixed positioning */}
        <Header title="Estadísticas" subtitle={`Hola, ${user.name} 👋 | Tu progreso detallado`} />
        
        {/* Content area with perfect alignment */}
        <div 
          className="w-full flex justify-center"
          style={{ 
            paddingTop: safeTop + HEADER_HEIGHT + 80, // Safe area + Header height + ESPACIO AMPLIO para selector
            paddingBottom: `calc(600px + ${safeBottom}px)`, // MÁXIMO espacio estable para scroll completo
            paddingLeft: Math.max(safeLeft, 16),
            paddingRight: Math.max(safeRight, 16),
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <div className="w-full max-w-md mx-auto px-4">
            {/* Period Selector */}
            <PeriodSelector 
              selectedPeriod={selectedPeriod} 
              onPeriodChange={setSelectedPeriod} 
            />
            
            {/* Streak Banner */}
            <StreakCard />
            
            {/* Statistics Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-runapp-navy mb-4 no-select">Estadísticas</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <StatsCard 
                  title={selectedPeriod === 'current_week' ? 
                          (currentPlan ? `Distancia Semana ${currentPlan.weekNumber}` : "Distancia Semanal") : 
                         selectedPeriod === 'current_month' ? "Distancia Mensual" :
                         selectedPeriod === '3_months' ? "Distancia 3 Meses" : 
                         "Distancia Total"} 
                  value={`${periodStats.totalDistance} km`} 
                  subtext={getDistanceSubtext()} 
                  change={getChangeText()} 
                  positive={periodStats.totalDistance > 0} 
                  icon={<BarChart2 className="text-runapp-purple" size={18} />}
                  isLoading={periodLoading}
                />
                <StatsCard 
                  title="Total de carreras" 
                  value={periodStats.totalWorkouts} 
                  subtext="Completadas" 
                  icon={<BarChart2 className="text-runapp-purple" size={18} />}
                  isLoading={periodLoading}
                />
                <StatsCard 
                  title="Ritmo promedio" 
                  value={periodStats.averagePace} 
                  subtext="Tiempo/km global" 
                  icon={<BarChart2 className="text-runapp-purple" size={18} />}
                  isLoading={periodLoading}
                />
                <StatsCard 
                  title="Promedio distancia" 
                  value={`${Math.round((periodStats.totalDistance / Math.max(periodStats.totalWorkouts, 1)) * 10) / 10} km`} 
                  subtext="Por carrera" 
                  icon={<Clock className="text-runapp-purple" size={18} />}
                  isLoading={periodLoading}
                />
              </div>
            </div>
          </div>
        </div>
        
        <BottomNav />
      </div>
    </StatsProvider>
  );
};

export default Stats;
