// 🔥 HOOK MEJORADO PARA ESTABILIDAD DE LAYOUT
import { useEffect, useCallback, useRef } from 'react';

export const useLayoutStability = () => {
  const isStabilizing = useRef(false);

  const forceLayoutRecalculation = useCallback(() => {
    if (isStabilizing.current) return;
    isStabilizing.current = true;

    try {
      // 1. Asegurar que el viewport meta tag esté correcto
      let viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }

      // 2. Forzar recalculo de layout suave
      requestAnimationFrame(() => {
        // Forzar reflow de manera más suave
        const body = document.body;
        const html = document.documentElement;
        
        // Aplicar transform para forzar layer de compositing
        body.style.transform = 'translateZ(0)';
        html.style.transform = 'translateZ(0)';
        
        // Forzar reflow
        body.offsetHeight;
        
        // Reset después de siguiente frame
        requestAnimationFrame(() => {
          body.style.transform = '';
          html.style.transform = '';
          isStabilizing.current = false;
        });
      });
    } catch (error) {
      console.warn('Layout stability adjustment failed:', error);
      isStabilizing.current = false;
    }
  }, []);

  useEffect(() => {
    // Ejecutar solo una vez al montar
    const timer = setTimeout(forceLayoutRecalculation, 50);
    
    // Escuchar cambios de orientación
    const handleOrientationChange = () => {
      setTimeout(forceLayoutRecalculation, 100);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [forceLayoutRecalculation]);

  return forceLayoutRecalculation;
};
