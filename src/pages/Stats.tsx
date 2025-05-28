
import BottomNav from "@/components/layout/BottomNav";
import { useStats } from "@/context/StatsContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

const Stats: React.FC = () => {
  const { stats, isLoading, refreshStats } = useStats();
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [chartKey, setChartKey] = useState<number>(0);

  const chartConfig = {
    distance: {
      label: "Distancia (km)",
      color: "#8B5CF6",
    },
  };

  // Escuchar eventos de entrenamientos completados MEJORADO
  useEffect(() => {
    console.log('=== STATS PAGE: Configurando listeners (MEJORADO) ===');
    
    const handleStatsUpdated = () => {
      console.log('Stats: Evento statsUpdated - FORZANDO ACTUALIZACIÓN COMPLETA...');
      setLastUpdate(Date.now());
      setChartKey(prev => prev + 1);
      
      // Delay para asegurar que Supabase se haya actualizado
      setTimeout(() => {
        refreshStats();
      }, 150);
    };

    const handleWorkoutCompleted = () => {
      console.log('Stats: Evento workoutCompleted - FORZANDO ACTUALIZACIÓN COMPLETA...');
      setLastUpdate(Date.now());
      setChartKey(prev => prev + 1);
      
      // Delay para asegurar que Supabase se haya actualizado
      setTimeout(() => {
        refreshStats();
      }, 150);
    };

    window.addEventListener('statsUpdated', handleStatsUpdated);
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    
    return () => {
      window.removeEventListener('statsUpdated', handleStatsUpdated);
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
    };
  }, [refreshStats]);

  // Log detallado de los datos del gráfico
  useEffect(() => {
    console.log('=== STATS GRÁFICO: ANÁLISIS DETALLADO ===');
    console.log('Timestamp última actualización:', lastUpdate);
    console.log('Chart key (re-render):', chartKey);
    console.log('isLoading:', isLoading);
    console.log('Datos del gráfico semanal:', stats.weeklyData);
    console.log('Distancia semanal total:', stats.weeklyDistance);
    
    // Verificar cada día individualmente
    stats.weeklyData.forEach((day, index) => {
      console.log(`DÍA ${index + 1} - ${day.day}: ${day.distance}km`);
    });
    
    // Verificar coherencia
    const totalFromChart = stats.weeklyData.reduce((sum, day) => sum + day.distance, 0);
    console.log('Total calculado desde gráfico:', totalFromChart);
    console.log('Total desde stats.weeklyDistance:', stats.weeklyDistance);
    
    if (Math.abs(totalFromChart - stats.weeklyDistance) > 0.1) {
      console.warn('⚠️ INCONSISTENCIA DETECTADA en los datos del gráfico');
    } else {
      console.log('✅ COHERENCIA: Los datos del gráfico son correctos');
    }
  }, [stats.weeklyData, stats.weeklyDistance, lastUpdate, chartKey]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold">Estadísticas</h1>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        {/* Gráfico de distancia semanal - CORREGIDO CON FECHAS REALES */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h2 className="text-lg font-medium text-runapp-navy mb-4">Distancia esta semana</h2>
          
          <div className="h-52 w-full mb-6">
            <ChartContainer config={chartConfig} key={chartKey}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={stats.weeklyData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 70 }}
                >
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    height={50}
                  />
                  <YAxis 
                    hide 
                    domain={[0, 'dataMax + 1']}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="distance" 
                    fill="var(--color-distance)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-runapp-gray">
              {isLoading ? "Cargando..." : `Total: ${stats.weeklyDistance} km • Promedio: ${stats.averageDistancePerRun} km por carrera`}
            </p>
            <p className="text-xs text-runapp-gray mt-1">
              Última actualización: {new Date(lastUpdate).toLocaleTimeString()} • Chart: #{chartKey}
            </p>
          </div>
        </div>
        
        {/* Progreso mensual */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h2 className="text-lg font-medium text-runapp-navy mb-4">Progreso mensual</h2>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Métrica</TableHead>
                <TableHead className="text-xs">Valor</TableHead>
                <TableHead className="text-xs">Variación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-xs font-medium">Distancia total</TableCell>
                <TableCell className="text-xs">{isLoading ? "..." : `${stats.monthlyDistance} km`}</TableCell>
                <TableCell className={`text-xs ${stats.distanceVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isLoading ? "..." : stats.distanceVariation !== 0 ? `${stats.distanceVariation > 0 ? '+' : ''}${stats.distanceVariation}%` : '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium">Tiempo total</TableCell>
                <TableCell className="text-xs">
                  {isLoading ? "..." : `${Math.floor(stats.monthlyTotalTime / 60)}h ${stats.monthlyTotalTime % 60}min`}
                </TableCell>
                <TableCell className="text-xs">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium">Ritmo medio</TableCell>
                <TableCell className="text-xs">{isLoading ? "..." : stats.monthlyAveragePace}</TableCell>
                <TableCell className={`text-xs ${stats.paceVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isLoading ? "..." : stats.paceVariation !== 0 ? `${stats.paceVariation > 0 ? '+' : ''}${stats.paceVariation}%` : '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium">Carrera más larga</TableCell>
                <TableCell className="text-xs">{isLoading ? "..." : `${stats.longestRun} km`}</TableCell>
                <TableCell className="text-xs">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium">Mejor ritmo</TableCell>
                <TableCell className="text-xs">{isLoading ? "..." : stats.bestPace}</TableCell>
                <TableCell className="text-xs">-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {/* Mejora de ritmo */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-medium text-runapp-navy mb-2">Mejora de ritmo</h2>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-runapp-navy">
                {isLoading ? "..." : stats.monthlyAveragePace}
              </p>
              <p className="text-runapp-gray">Ritmo promedio mensual</p>
              {stats.paceVariation !== 0 && (
                <p className={`text-sm mt-2 ${stats.paceVariation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.paceVariation > 0 ? '+' : ''}{stats.paceVariation}% vs mes anterior
                </p>
              )}
            </div>
          </div>
          {stats.paceVariation !== 0 && (
            <div className={`mt-3 p-3 border rounded-lg text-sm ${
              stats.paceVariation > 0 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
              {stats.paceVariation > 0 
                ? `¡Estás mejorando! Tu ritmo ha mejorado un ${stats.paceVariation}% este mes.`
                : `Mantén el esfuerzo. Tu ritmo se ha reducido un ${Math.abs(stats.paceVariation)}% este mes.`
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
