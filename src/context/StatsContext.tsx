
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useRunningStats } from '@/hooks/useRunningStats';

interface StatsContextType {
  refreshStats: () => void;
  stats: any;
  isLoading: boolean;
  resetStats: () => void;
  updateCounter: number;
  forceUpdate: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [updateCounter, setUpdateCounter] = useState(0);
  const { stats, isLoading, refreshStats, resetStats } = useRunningStats(updateCounter);

  const forceUpdate = () => {
    console.log('StatsContext: FORZANDO ACTUALIZACIÓN con counter:', updateCounter + 1);
    setUpdateCounter(prev => prev + 1);
    refreshStats();
  };

  return (
    <StatsContext.Provider value={{ 
      refreshStats, 
      stats, 
      isLoading, 
      resetStats, 
      updateCounter,
      forceUpdate 
    }}>
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
