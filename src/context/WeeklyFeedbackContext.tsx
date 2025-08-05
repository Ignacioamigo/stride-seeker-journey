import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateWeeklyInsights, WeeklyInsights } from '@/utils/weeklyAnalyzer';
import { useUser } from '@/context/UserContext';
import { useStats } from '@/context/StatsContext';
import { WorkoutPlan } from '@/types';

interface WeeklyFeedbackContextProps {
  showFeedbackModal: boolean;
  feedbackData: WeeklyInsights | null;
  isGeneratingFeedback: boolean;
  closeFeedbackModal: () => void;
  showWeeklyFeedback: (currentPlan: WorkoutPlan, onClose?: () => void) => Promise<void>;
}

const WeeklyFeedbackContext = createContext<WeeklyFeedbackContextProps>({
  showFeedbackModal: false,
  feedbackData: null,
  isGeneratingFeedback: false,
  closeFeedbackModal: () => {},
  showWeeklyFeedback: async (currentPlan, onClose) => {}
});

export const WeeklyFeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState<WeeklyInsights | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [onModalClose, setOnModalClose] = useState<(() => void) | null>(null);
  
  const { user } = useUser();
  const { stats } = useStats();

  // Función para mostrar el feedback manualmente (llamada desde el botón)
  const showWeeklyFeedback = useCallback(async (currentPlan: WorkoutPlan, onClose?: () => void) => {
    if (isGeneratingFeedback || showFeedbackModal) {
      return;
    }

    console.log('🎊 Generando feedback semanal para', user.name);
    setIsGeneratingFeedback(true);
    setOnModalClose(() => onClose || null);

    try {
      // Generar insights personalizados con información del plan actual
      const insights = await generateWeeklyInsights(
        user.name || 'Usuario',
        user.weeklyWorkouts || 3,
        stats,
        currentPlan // Pasar el plan actual para filtrar correctamente
      );

      setFeedbackData(insights);
      setShowFeedbackModal(true);
      
      console.log('✅ Feedback semanal generado:', insights.performance);
    } catch (error) {
      console.error('❌ Error generando feedback semanal:', error);
      // Si hay error, ejecutar callback inmediatamente
      if (onClose) {
        onClose();
      }
    } finally {
      setIsGeneratingFeedback(false);
    }
  }, [user.name, user.weeklyWorkouts, stats, isGeneratingFeedback, showFeedbackModal]);

  const closeFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false);
    setFeedbackData(null);
    
    // Ejecutar callback de cierre si existe
    if (onModalClose) {
      onModalClose();
      setOnModalClose(null);
    }
  }, [onModalClose]);

  return (
    <WeeklyFeedbackContext.Provider 
      value={{
        showFeedbackModal,
        feedbackData,
        isGeneratingFeedback,
        closeFeedbackModal,
        showWeeklyFeedback
      }}
    >
      {children}
    </WeeklyFeedbackContext.Provider>
  );
};

export const useWeeklyFeedback = () => {
  const context = useContext(WeeklyFeedbackContext);
  if (!context) {
    throw new Error('useWeeklyFeedback must be used within a WeeklyFeedbackProvider');
  }
  return context;
}; 