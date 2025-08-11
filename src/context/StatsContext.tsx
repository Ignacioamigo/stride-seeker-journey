
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
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
    console.log('🚀 StatsContext: FORZANDO ACTUALIZACIÓN con counter:', updateCounter + 1);
    console.log('🚀 StatsContext: refreshStats function:', typeof refreshStats);
    setUpdateCounter(prev => {
      console.log('🚀 StatsContext: Counter cambia de', prev, 'a', prev + 1);
      return prev + 1;
    });
    console.log('🚀 StatsContext: Llamando refreshStats()');
    refreshStats();
    console.log('🚀 StatsContext: forceUpdate completado');
  };

  useEffect(() => {
    const onReset = () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Stats] resetStats event recibido en Context - forzando recalculo');
      }
      resetStats();
      forceUpdate();
    };
    window.addEventListener('resetStats', onReset as EventListener);
    return () => window.removeEventListener('resetStats', onReset as EventListener);
  }, []);

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
