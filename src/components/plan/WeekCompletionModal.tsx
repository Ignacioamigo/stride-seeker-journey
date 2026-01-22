import React from 'react';
import { X, TrendingUp, Zap, Target, AlertCircle } from 'lucide-react';
import { WorkoutPlan } from '@/types';
import RunButton from '@/components/ui/RunButton';

interface WeekCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  plan: WorkoutPlan;
}

const WeekCompletionModal: React.FC<WeekCompletionModalProps> = ({ 
  isOpen, 
  onClose, 
  onContinue,
  plan 
}) => {
  if (!isOpen) return null;

  // Analizar los datos del plan completado
  const completedWorkouts = plan.workouts.filter(w => w.completed && w.type !== 'descanso');
  const totalDistance = completedWorkouts.reduce((sum, w) => sum + (w.actualDistance || 0), 0);
  const avgDistance = completedWorkouts.length > 0 ? totalDistance / completedWorkouts.length : 0;
  
  // Calcular ritmo promedio
  const calculateAvgPace = () => {
    const workoutsWithPace = completedWorkouts.filter(w => w.actualDuration && w.actualDistance);
    if (workoutsWithPace.length === 0) return null;
    
    let totalMinutes = 0;
    let totalKm = 0;
    
    workoutsWithPace.forEach(w => {
      if (w.actualDuration && w.actualDistance) {
        const [hours, mins, secs] = w.actualDuration.split(':').map(Number);
        const minutes = (hours || 0) * 60 + (mins || 0) + (secs || 0) / 60;
        totalMinutes += minutes;
        totalKm += w.actualDistance;
      }
    });
    
    const avgPaceMinPerKm = totalMinutes / totalKm;
    const mins = Math.floor(avgPaceMinPerKm);
    const secs = Math.round((avgPaceMinPerKm - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const avgPace = calculateAvgPace();

  // Generar análisis personalizado basado en los datos
  const generatePersonalizedAnalysis = () => {
    const insights = [];
    
    // Análisis de resistencia
    if (avgDistance > 5) {
      insights.push({
        icon: <TrendingUp className="w-6 h-6 text-green-600" />,
        title: "Excelente resistencia",
        description: `Promedio de ${avgDistance.toFixed(1)}km por sesión. Vas muy sobrado en resistencia.`
      });
    } else if (avgDistance > 3) {
      insights.push({
        icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
        title: "Buena base aeróbica",
        description: `Promedio de ${avgDistance.toFixed(1)}km. Tienes una base sólida para construir.`
      });
    } else {
      insights.push({
        icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
        title: "Construyendo resistencia",
        description: "Estás en el camino correcto. La resistencia mejorará con constancia."
      });
    }
    
    // Análisis de velocidad/ritmo
    if (avgPace) {
      const [mins, secs] = avgPace.split(':').map(Number);
      const paceInMinutes = mins + secs / 60;
      
      if (paceInMinutes < 5.5) {
        insights.push({
          icon: <Zap className="w-6 h-6 text-yellow-600" />,
          title: "Ritmo excelente",
          description: `${avgPace} min/km. Tu velocidad es impresionante. Mantén este nivel.`
        });
      } else if (paceInMinutes < 6.5) {
        insights.push({
          icon: <Zap className="w-6 h-6 text-green-600" />,
          title: "Buen ritmo",
          description: `${avgPace} min/km. Un ritmo sólido y sostenible.`
        });
      } else {
        insights.push({
          icon: <Zap className="w-6 h-6 text-blue-600" />,
          title: "Oportunidad de mejora",
          description: `${avgPace} min/km. Tu plan de la Semana 2 incluirá trabajo de velocidad específico.`
        });
      }
    }
    
    // Constancia
    insights.push({
      icon: <Target className="w-6 h-6 text-purple-600" />,
      title: "Constancia demostrada",
      description: `Has completado ${completedWorkouts.length} entrenamientos. La consistencia es clave para el éxito.`
    });
    
    return insights;
  };

  const personalizedInsights = generatePersonalizedAnalysis();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Felicidades por completar la Semana 1!
            </h2>
            <p className="text-white/90 text-sm">
              Hemos analizado tus {completedWorkouts.length} entrenamientos
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Resumen de métricas */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-center mb-4">
              Tu rendimiento en números
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {totalDistance.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600 mt-1">km totales</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {completedWorkouts.length}
                </div>
                <div className="text-xs text-gray-600 mt-1">entrenamientos</div>
              </div>
            </div>
            {avgPace && (
              <div className="text-center pt-3 border-t border-gray-200">
                <div className="text-2xl font-bold text-purple-600">
                  {avgPace}
                </div>
                <div className="text-xs text-gray-600 mt-1">ritmo promedio (min/km)</div>
              </div>
            )}
          </div>

          {/* Análisis personalizado */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Tu análisis personalizado
            </h3>
            
            {personalizedInsights.map((insight, index) => (
              <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl">
                <div className="mt-1">{insight.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Plan para Semana 2 */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border-2 border-orange-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Tu plan para la Semana 2
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Basándonos en tu rendimiento, hemos calculado un plan optimizado que corregirá tus puntos débiles y potenciará tus fortalezas.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Entrenamientos ajustados a tu ritmo real</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Trabajo específico de velocidad y resistencia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Progresión personalizada hacia tu objetivo</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <RunButton
              onClick={onContinue}
              className="w-full"
            >
              Ver mi Semana 2
            </RunButton>
            <p className="text-xs text-center text-gray-500 mt-3">
              Desbloquea tu evolución semanal y llega a tu objetivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekCompletionModal;







