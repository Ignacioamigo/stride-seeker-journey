import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useStats } from '@/context/StatsContext';

interface WeekCompletionData {
  isWeekCompleted: boolean;
  completedWorkouts: number;
  totalWorkouts: number;
  weeklyDistance: number;
  averagePace: string;
  shouldShowFeedback: boolean;
}

export const useWeekCompletion = () => {
  const { user } = useUser();
  const { stats } = useStats();
  const [lastFeedbackWeek, setLastFeedbackWeek] = useState<string | null>(() => {
    return localStorage.getItem('lastWeeklyFeedback');
  });

  // Obtener el identificador de la semana actual (formato: YYYY-WW)
  const getCurrentWeekId = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
  };

  const checkWeekCompletion = (): WeekCompletionData => {
    const weeklyGoal = user.weeklyWorkouts || 3;
    const completedThisWeek = stats.weeklyData.filter(day => day.distance > 0).length;
    const isWeekCompleted = completedThisWeek >= weeklyGoal;
    
    const currentWeekId = getCurrentWeekId();
    const shouldShowFeedback = isWeekCompleted && lastFeedbackWeek !== currentWeekId;

    return {
      isWeekCompleted,
      completedWorkouts: completedThisWeek,
      totalWorkouts: weeklyGoal,
      weeklyDistance: stats.weeklyDistance,
      averagePace: stats.averagePace,
      shouldShowFeedback
    };
  };

  const markFeedbackAsShown = () => {
    const currentWeekId = getCurrentWeekId();
    setLastFeedbackWeek(currentWeekId);
    localStorage.setItem('lastWeeklyFeedback', currentWeekId);
  };

  return {
    ...checkWeekCompletion(),
    markFeedbackAsShown
  };
}; 