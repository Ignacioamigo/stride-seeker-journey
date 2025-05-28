
import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
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
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función de actualización robusta con debounce
  const robustRefreshStats = () => {
    console.log('StatsContext: Actualización robusta iniciada...');
    
    // Cancelar cualquier timeout pendiente
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Actualización inmediata
    refreshStats();
    
    // Programar una actualización adicional con delay
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('StatsContext: Actualización adicional con delay...');
      refreshStats();
    }, 200);
  };

  // Escuchar eventos globales para actualizar estadísticas - MEJORADO
  useEffect(() => {
    const handleStatsUpdated = () => {
      console.log('StatsContext: Evento statsUpdated recibido, actualizando AGRESIVAMENTE...');
      robustRefreshStats();
    };

    const handleWorkoutCompleted = () => {
      console.log('StatsContext: Evento workoutCompleted recibido, actualizando AGRESIVAMENTE...');
      robustRefreshStats();
    };

    const handleResetStats = () => {
      console.log('StatsContext: Evento resetStats recibido, reseteando...');
      resetStats();
    };

    // Escuchar múltiples eventos
    window.addEventListener('statsUpdated', handleStatsUpdated);
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('resetStats', handleResetStats);
    
    return () => {
      window.removeEventListener('statsUpdated', handleStatsUpdated);
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
      window.removeEventListener('resetStats', handleResetStats);
      
      // Limpiar timeout al desmontar
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshStats, resetStats]);

  return (
    <StatsContext.Provider value={{ refreshStats: robustRefreshStats, stats, isLoading, resetStats }}>
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
