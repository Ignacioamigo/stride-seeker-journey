import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Target, Calendar, Trophy, Zap, ChevronRight } from 'lucide-react';
import { useWeeklyFeedback } from '@/context/WeeklyFeedbackContext';
import { WeeklyInsights } from '@/utils/weeklyAnalyzer';

const WeeklyFeedbackModal: React.FC = () => {
  const { showFeedbackModal, feedbackData, closeFeedbackModal } = useWeeklyFeedback();
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (showFeedbackModal && feedbackData) {
      // Activar confetti al abrir
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Animar pasos progresivamente
      setCurrentStep(0);
      const timer = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
      
      return () => clearInterval(timer);
    }
  }, [showFeedbackModal, feedbackData]);

  if (!showFeedbackModal || !feedbackData) {
    return null;
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  const getPerformanceEmoji = (performance: string) => {
    switch (performance) {
      case 'excellent': return '🏆';
      case 'good': return '💪';
      default: return '🌱';
    }
  };

  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        >
          {['🎉', '🎊', '⭐', '🏃‍♀️', '💪'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {showConfetti && <Confetti />}
      
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300">
        {/* Modal Container */}
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-end sm:items-center justify-center p-4 pb-4 sm:pb-8">
            {/* Modal */}
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-500 relative flex flex-col shadow-2xl">
              
              {/* Header - Fijo */}
              <div className="relative bg-gradient-to-b from-runapp-light-purple/30 to-transparent flex-shrink-0">
                {/* Close button */}
                <button
                  onClick={closeFeedbackModal}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
                >
                  <X size={20} className="text-gray-600" />
                </button>

                {/* Coach Avatar */}
                <div className="text-center pt-8 pb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-runapp-purple rounded-full flex items-center justify-center text-3xl animate-bounce shadow-lg">
                    🏃‍♂️
                  </div>
                  <h2 className="text-xl font-bold text-runapp-navy">¡Tu Entrenador Personal!</h2>
                  <p className="text-sm text-gray-600 mt-1">Resumen semanal de tu progreso</p>
                </div>
              </div>

              {/* Content - Scrolleable */}
              <div className="flex-1 overflow-y-auto px-6 pb-20 overscroll-contain" style={{ scrollbarWidth: 'thin' }}>
                <div className="space-y-6">
                  
                  {/* Performance Badge */}
                  <div className={`text-center transform transition-all duration-700 ${currentStep >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${getPerformanceColor(feedbackData.performance)}`}>
                      <span className="mr-2 text-lg">{getPerformanceEmoji(feedbackData.performance)}</span>
                      {feedbackData.performance === 'excellent' ? 'Semana Excelente' :
                       feedbackData.performance === 'good' ? 'Buen Progreso' : 'En Construcción'}
                    </div>
                  </div>

                  {/* Personal Message */}
                  <div className={`transform transition-all duration-700 delay-300 ${currentStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                      <p className="text-gray-800 leading-relaxed text-sm">
                        {feedbackData.personalizedMessage}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className={`grid grid-cols-2 gap-3 transform transition-all duration-700 delay-500 ${currentStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <div className="bg-blue-50 rounded-lg p-3 text-center shadow-sm">
                      <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-blue-600 font-medium">Entrenamientos</p>
                      <p className="text-lg font-bold text-blue-800">
                        {feedbackData.dataHighlights.completedWorkouts}/{feedbackData.dataHighlights.goalWorkouts}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-3 text-center shadow-sm">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-green-600 font-medium">Distancia</p>
                      <p className="text-lg font-bold text-green-800">
                        {feedbackData.dataHighlights.totalDistance} km
                      </p>
                      {feedbackData.dataHighlights.improvementVsPrevious.distance > 0 && (
                        <p className="text-xs text-green-600">
                          +{feedbackData.dataHighlights.improvementVsPrevious.distance}%
                        </p>
                      )}
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 text-center shadow-sm">
                      <Zap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-purple-600 font-medium">Ritmo Promedio</p>
                      <p className="text-sm font-bold text-purple-800">
                        {feedbackData.dataHighlights.averagePace}
                      </p>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-3 text-center shadow-sm">
                      <Trophy className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                      <p className="text-xs text-amber-600 font-medium">Consistencia</p>
                      <p className="text-lg font-bold text-amber-800">
                        {feedbackData.patterns.consistencyScore}%
                      </p>
                    </div>
                  </div>

                  {/* Patterns Insight */}
                  <div className={`transform transition-all duration-700 delay-700 ${currentStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <div className="bg-gradient-to-r from-runapp-purple/10 to-runapp-light-purple/10 rounded-xl p-4 shadow-sm">
                      <h3 className="font-semibold text-runapp-navy mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Patrón Detectado
                      </h3>
                      <p className="text-sm text-gray-700">
                        Tu día favorito para entrenar es <strong>{feedbackData.patterns.favoriteDay}</strong>.
                        Continúa aprovechando este momentum natural.
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className={`transform transition-all duration-700 delay-900 ${currentStep >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <h3 className="font-semibold text-runapp-navy mb-3">Recomendaciones del Coach</h3>
                    <div className="space-y-2">
                      {feedbackData.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm bg-white rounded-lg p-3 shadow-sm">
                          <ChevronRight className="w-4 h-4 text-runapp-purple mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Week Focus */}
                  <div className={`transform transition-all duration-700 delay-1100 ${currentStep >= 5 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <div className="bg-runapp-navy text-white rounded-xl p-4 shadow-lg">
                      <h3 className="font-semibold mb-2">🎯 Próxima Semana</h3>
                      <p className="text-sm opacity-90">{feedbackData.nextWeekFocus}</p>
                    </div>
                  </div>

                  {/* Motivational Quote */}
                  <div className={`transform transition-all duration-700 delay-1300 ${currentStep >= 6 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <div className="text-center border-t border-gray-100 pt-4">
                      <p className="text-sm italic text-gray-600 leading-relaxed">
                        "{feedbackData.motivationalQuote}"
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className={`transform transition-all duration-700 delay-1500 ${currentStep >= 7 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} pb-4`}>
                    <button
                      onClick={closeFeedbackModal}
                      className="w-full bg-runapp-purple text-white py-4 rounded-xl font-medium hover:bg-runapp-purple/90 transition-colors shadow-lg active:scale-95"
                    >
                      ¡A por la próxima semana! 🚀
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WeeklyFeedbackModal; 