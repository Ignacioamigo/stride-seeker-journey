// 🔥 HOOK SUPER MEJORADO PARA ESTABILIDAD DE LAYOUT ANTI-DESCUADRE
import { useEffect, useCallback, useRef } from 'react';

export const useLayoutStability = () => {
  const isStabilizing = useRef(false);
  const stabilityTimer = useRef<NodeJS.Timeout | null>(null);

  const forceLayoutRecalculation = useCallback(() => {
    if (isStabilizing.current) return;
    isStabilizing.current = true;

    try {
      // 1. Asegurar que el viewport meta tag esté correcto
      let viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }

      // 2. Aplicar estilos anti-descuadre globales
      const root = document.getElementById('root');
      const body = document.body;
      const html = document.documentElement;

      // Forzar estabilidad en elementos críticos
      if (root) {
        root.style.transform = 'translate3d(0, 0, 0)';
        root.style.backfaceVisibility = 'hidden';
        root.style.WebkitBackfaceVisibility = 'hidden';
        root.style.contain = 'layout style paint';
      }

      // 3. Forzar recalculo de layout suave y progresivo
      requestAnimationFrame(() => {
        // Primera pasada: estabilizar capa principal
        body.style.transform = 'translateZ(0)';
        html.style.transform = 'translateZ(0)';
        
        // Forzar reflow
        body.offsetHeight;
        
        requestAnimationFrame(() => {
          // Segunda pasada: estabilizar elementos fixed
          const fixedElements = document.querySelectorAll('[style*="position: fixed"], .fixed');
          fixedElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.willChange = 'transform';
              el.style.transform = 'translateZ(0)';
              el.style.backfaceVisibility = 'hidden';
              el.style.WebkitBackfaceVisibility = 'hidden';
            }
          });

          // Tercera pasada: limpiar y finalizar
          requestAnimationFrame(() => {
            body.style.transform = '';
            html.style.transform = '';
            
            // Mantener estabilidad en elementos críticos
            fixedElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.willChange = 'auto';
              }
            });
            
            isStabilizing.current = false;
          });
        });
      });
    } catch (error) {
      console.warn('Layout stability adjustment failed:', error);
      isStabilizing.current = false;
    }
  }, []);

  const scheduleStabilization = useCallback(() => {
    if (stabilityTimer.current) {
      clearTimeout(stabilityTimer.current);
    }
    stabilityTimer.current = setTimeout(forceLayoutRecalculation, 16); // ~1 frame
  }, [forceLayoutRecalculation]);

  useEffect(() => {
    // Ejecutar inmediatamente al montar
    const initialTimer = setTimeout(forceLayoutRecalculation, 50);
    
    // Escuchar eventos que pueden causar descuadre
    const handleLayoutDisruption = () => {
      scheduleStabilization();
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        scheduleStabilization();
      }
    };

    // Eventos críticos para descuadre
    window.addEventListener('orientationchange', handleLayoutDisruption);
    window.addEventListener('resize', handleLayoutDisruption);
    window.addEventListener('scroll', handleLayoutDisruption, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // iOS específico
    window.addEventListener('pagehide', handleLayoutDisruption);
    window.addEventListener('pageshow', handleLayoutDisruption);
    window.addEventListener('focus', handleLayoutDisruption);
    
    return () => {
      clearTimeout(initialTimer);
      if (stabilityTimer.current) {
        clearTimeout(stabilityTimer.current);
      }
      window.removeEventListener('orientationchange', handleLayoutDisruption);
      window.removeEventListener('resize', handleLayoutDisruption);
      window.removeEventListener('scroll', handleLayoutDisruption);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleLayoutDisruption);
      window.removeEventListener('pageshow', handleLayoutDisruption);
      window.removeEventListener('focus', handleLayoutDisruption);
    };
  }, [forceLayoutRecalculation, scheduleStabilization]);

  return forceLayoutRecalculation;
};
