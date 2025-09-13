// 🔥 HOOK DEFINITIVO PARA ELIMINAR DESCUADRE
import { useEffect, useCallback } from 'react';

export const useLayoutStability = () => {
  const forceLayoutRecalculation = useCallback(() => {
    // 1. Forzar GPU layer creation
    document.body.style.transform = 'translate3d(0, 0, 0)';
    document.documentElement.style.transform = 'translate3d(0, 0, 0)';
    
    // 2. Forzar reflow
    document.body.offsetHeight;
    
    // 3. Reset inmediato
    requestAnimationFrame(() => {
      document.body.style.transform = '';
      document.documentElement.style.transform = '';
    });
    
    // 4. Arreglar elementos fixed específicos
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], .fixed');
    fixedElements.forEach((el) => {
      const element = el as HTMLElement;
      element.style.transform = 'translate3d(0, 0, 0)';
      
      requestAnimationFrame(() => {
        element.style.transform = '';
      });
    });
  }, []);

  useEffect(() => {
    // Ejecutar inmediatamente
    forceLayoutRecalculation();
    
    // Y después de un pequeño delay para asegurar
    const timer = setTimeout(forceLayoutRecalculation, 100);
    
    return () => clearTimeout(timer);
  }, [forceLayoutRecalculation]);

  return forceLayoutRecalculation;
};
