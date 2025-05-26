
import BottomNav from "@/components/layout/BottomNav";
import { useRunningStats } from "@/hooks/useRunningStats";

const Stats: React.FC = () => {
  const { stats, isLoading } = useRunningStats();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold">Estadísticas</h1>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h2 className="text-lg font-medium text-runapp-navy mb-2">Distancia esta semana</h2>
          
          <div className="h-40 w-full">
            <div className="h-full w-full flex items-end justify-between">
              {stats.weeklyData.map((day) => (
                <div key={day.day} className="flex flex-col items-center w-1/7">
                  <div 
                    className="w-5/6 bg-runapp-light-purple rounded-sm" 
                    style={{ 
                      height: `${stats.weeklyData.length > 0 ? (day.distance / Math.max(...stats.weeklyData.map(d => d.distance))) * 70 : 0}%`,
                      minHeight: day.distance > 0 ? '10%' : '0%'
                    }}
                  ></div>
                  <p className="text-xs text-runapp-gray mt-1">{day.day}</p>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-runapp-gray mt-2">
            {isLoading ? "Cargando..." : `Total: ${stats.weeklyDistance} km • Promedio: ${stats.averageDistancePerRun} km por carrera`}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h2 className="text-lg font-medium text-runapp-navy mb-2">Progreso mensual</h2>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-runapp-navy">
                {isLoading ? "..." : `${stats.monthlyDistance} km`}
              </p>
              <p className="text-runapp-gray">Distancia este mes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-medium text-runapp-navy mb-2">Mejora de ritmo</h2>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-runapp-navy">
                {isLoading ? "..." : stats.averagePace}
              </p>
              <p className="text-runapp-gray">Ritmo promedio actual</p>
            </div>
          </div>
          {stats.paceImprovement !== 0 && (
            <div className={`mt-3 p-3 border rounded-lg text-sm ${
              stats.paceImprovement > 0 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
              {stats.paceImprovement > 0 
                ? `¡Estás mejorando! Tu rendimiento ha aumentado un ${stats.paceImprovement}% este mes.`
                : `Mantén el ritmo. Pequeños cambios en el entrenamiento pueden mejorar tu rendimiento.`
              }
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Stats;
