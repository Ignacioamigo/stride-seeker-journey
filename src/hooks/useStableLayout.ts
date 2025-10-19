import { useEffect, useCallback, useRef } from 'react';

/**
 * 🔥 HOOK MAESTRO DE ESTABILIZACIÓN DE LAYOUT
 * Coordinador central para prevenir descuadres de UI
 * Uso: const stabilizeLayout = useStableLayout();
 */
export const useStableLayout = () => {
  const hasStabilized = useRef(false);
  const stabilizationInProgress = useRef(false);

  const forceStabilization = useCallback(() => {
    if (stabilizationInProgress.current) return;
    
    stabilizationInProgress.current = true;
    console.log('🔧 Forzando estabilización de layout...');

    requestAnimationFrame(() => {
      try {
        // 1. Aplicar clases de estabilidad si no están ya aplicadas
        if (!document.documentElement.classList.contains('layout-ready')) {
          document.documentElement.classList.add('layout-ready');
          document.body.classList.add('layout-ready');
          const root = document.getElementById('root');
          if (root) {
            root.classList.add('layout-ready');
          }
        }

        // 2. Estabilizar elementos críticos
        const criticalElements = document.querySelectorAll(
          '[style*="position: fixed"], .fixed, nav, header'
        );
        
        criticalElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.transform = 'translate3d(0, 0, 0)';
            el.style.backfaceVisibility = 'hidden';
            el.style.WebkitBackfaceVisibility = 'hidden';
          }
        });

        // 3. Forzar reflow suave
        document.body.offsetHeight;
        
        console.log('✅ Estabilización de layout completada');
      } catch (error) {
        console.warn('Error en estabilización de layout:', error);
      } finally {
        stabilizationInProgress.current = false;
      }
    });
  }, []);

  const scheduleStabilization = useCallback(() => {
    if (!hasStabilized.current) {
      setTimeout(forceStabilization, 16);
    }
  }, [forceStabilization]);

  useEffect(() => {
    // Marcar como estabilizado después de la primera ejecución
    const timer = setTimeout(() => {
      hasStabilized.current = true;
    }, 2000);

    // Listeners para eventos que pueden causar descuadre
    const handleLayoutDisruption = () => {
      if (hasStabilized.current) {
        scheduleStabilization();
      }
    };

    // Solo escuchar eventos críticos después de la estabilización inicial
    const events = [
      { event: 'orientationchange', handler: handleLayoutDisruption },
      { event: 'resize', handler: handleLayoutDisruption },
      { event: 'visibilitychange', handler: () => {
        if (!document.hidden && hasStabilized.current) {
          scheduleStabilization();
        }
      }},
    ];

    events.forEach(({ event, handler }) => {
      window.addEventListener(event, handler);
    });

    return () => {
      clearTimeout(timer);
      events.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler);
      });
    };
  }, [scheduleStabilization]);

  return forceStabilization;
};

export default useStableLayout;
