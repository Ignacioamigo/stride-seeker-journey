
import BottomNav from "@/components/layout/BottomNav";
import { BarChart } from "recharts";

const Stats: React.FC = () => {
  const weeklyData = [
    { day: 'Lun', distance: 3.2 },
    { day: 'Mar', distance: 0 },
    { day: 'Mié', distance: 5.7 },
    { day: 'Jue', distance: 2.1 },
    { day: 'Vie', distance: 0 },
    { day: 'Sáb', distance: 7.4 },
    { day: 'Dom', distance: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold">Estadísticas</h1>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h2 className="text-lg font-medium text-runapp-navy mb-2">Distancia esta semana</h2>
          
          <div className="h-40 w-full">
            {/* Recharts would go here in full implementation */}
            <div className="h-full w-full flex items-end justify-between">
              {weeklyData.map((day) => (
                <div key={day.day} className="flex flex-col items-center w-1/7">
                  <div 
                    className="w-5/6 bg-runapp-light-purple rounded-sm" 
                    style={{ 
                      height: `${(day.distance / Math.max(...weeklyData.map(d => d.distance))) * 70}%`,
                      minHeight: day.distance > 0 ? '10%' : '0%'
                    }}
                  ></div>
                  <p className="text-xs text-runapp-gray mt-1">{day.day}</p>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-runapp-gray mt-2">Total: 18.4 km • Promedio: 3.07 km por carrera</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h2 className="text-lg font-medium text-runapp-navy mb-2">Progreso mensual</h2>
          {/* Placeholder for the monthly progress chart */}
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-runapp-gray">Gráfico de progreso mensual</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-medium text-runapp-navy mb-2">Mejora de ritmo</h2>
          {/* Placeholder for the pace improvement chart */}
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-runapp-gray">Gráfico de mejora de ritmo</p>
          </div>
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ¡Estás mejorando! Tu ritmo ha disminuido un 16% en el último mes.
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Stats;
