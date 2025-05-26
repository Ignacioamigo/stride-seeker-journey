
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useRunningStats } from '@/hooks/useRunningStats';

interface StatsContextType {
  refreshStats: () => void;
  stats: any;
  isLoading: boolean;
  resetStats: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { stats, isLoading, refreshStats, resetStats } = useRunningStats();

  useEffect(() => {
    const handleStatsUpdated = () => {
      console.log('StatsContext: Evento statsUpdated recibido, actualizando...');
      refreshStats();
    };

    const handleResetStats = () => {
      console.log('StatsContext: Evento resetStats recibido, reseteando...');
      resetStats();
    };

    window.addEventListener('statsUpdated', handleStatsUpdated);
    window.addEventListener('resetStats', handleResetStats);
    
    return () => {
      window.removeEventListener('statsUpdated', handleStatsUpdated);
      window.removeEventListener('resetStats', handleResetStats);
    };
  }, [refreshStats, resetStats]);

  return (
    <StatsContext.Provider value={{ refreshStats, stats, isLoading, resetStats }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};
