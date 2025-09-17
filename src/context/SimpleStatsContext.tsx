import React, { createContext, useContext, ReactNode } from 'react';
import { useSimpleStats, SimpleStats } from '@/hooks/useSimpleStats';

interface SimpleStatsContextType {
  stats: SimpleStats;
  isLoading: boolean;
  refreshStats: () => void;
  resetStats: () => void;
}

const SimpleStatsContext = createContext<SimpleStatsContextType | undefined>(undefined);

export const SimpleStatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { stats, isLoading, refreshStats, resetStats } = useSimpleStats();

  return (
    <SimpleStatsContext.Provider value={{ 
      stats, 
      isLoading, 
      refreshStats, 
      resetStats 
    }}>
      {children}
    </SimpleStatsContext.Provider>
  );
};

export const useSimpleStatsContext = () => {
  const context = useContext(SimpleStatsContext);
  if (context === undefined) {
    throw new Error('useSimpleStatsContext must be used within a SimpleStatsProvider');
  }
  return context;
};

// Hook para compatibilidad con el código existente
export const useStats = () => {
  const { stats, isLoading, refreshStats } = useSimpleStatsContext();
  
  return {
    stats: {
      // Mapear a formato compatible con hooks existentes
      weeklyDistance: stats.weeklyDistance,
      totalRuns: stats.totalWorkouts,
      averagePace: stats.averagePace,
      weeklyCalories: Math.round(stats.weeklyDistance * 60), // Estimación: 60 cal/km
      averageDistancePerRun: stats.totalWorkouts > 0 ? stats.totalDistance / stats.totalWorkouts : 0,
      monthlyDistance: stats.monthlyDistance,
      paceImprovement: 0, // Por ahora no calculamos mejora
      weeklyData: stats.weeklyData.map(d => ({
        day: d.day,
        distance: d.distance
      })),
      monthlyTotalTime: stats.totalTime,
      monthlyAveragePace: stats.averagePace,
      longestRun: stats.longestRun,
      bestPace: stats.averagePace,
      distanceVariation: 0, // Por ahora no calculamos variación
      paceVariation: 0,
      previousMonthDistance: 0, // Por ahora no calculamos mes anterior
      previousMonthAveragePace: '0:00 min/km'
    },
    isLoading,
    refreshStats,
    resetStats: () => {}, // El reset se maneja automáticamente
    updateCounter: 0, // Por compatibilidad
    forceUpdate: refreshStats
  };
};
