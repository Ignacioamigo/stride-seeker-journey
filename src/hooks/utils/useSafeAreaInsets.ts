import { useState, useEffect, useRef, useMemo } from "react";

// Cache global para evitar recálculos entre componentes
let globalInsets: { top: number; right: number; bottom: number; left: number } | null = null;
let globalReady = false;

/**
 * Hook para obtener los insets seguros usando CSS env() en web (iOS notch).
 * Completamente optimizado para iOS con cache global y estabilidad total.
 * Devuelve { top, right, bottom, left } en px, además de isReady para indicar si los valores están listos.
 */
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState(() => globalInsets || { top: 0, right: 0, bottom: 0, left: 0 });
  const [isReady, setIsReady] = useState(globalReady);
  const calculatedRef = useRef(globalReady);
  
  // Timeout para asegurar que isReady se vuelve true después de un tiempo máximo
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isReady) {
        setIsReady(true);
        globalReady = true;
      }
    }, 500); // 500ms máximo de espera
    
    return () => clearTimeout(fallbackTimer);
  }, [isReady]);

  // Solo funciona en navegador
  const getInset = (name: string) => {
    if (typeof window === "undefined") return 0;
    
    try {
      // Usar CSS custom properties directamente si están disponibles
      const style = getComputedStyle(document.documentElement);
      const value = style.getPropertyValue(`--${name.replace('safe-area-inset-', 'sa')}`);
      if (value && value !== '') {
        return parseInt(value) || 0;
      }
      
      // Fallback: crear elemento temporal
      const el = document.createElement("div");
      el.style.cssText = `position: absolute; visibility: hidden; top: 0; left: 0; width: 0; height: 0; padding-top: env(${name}, 0px);`;
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).paddingTop;
      document.body.removeChild(el);
      return parseInt(computed) || 0;
    } catch (error) {
      console.warn(`Error reading safe area inset ${name}:`, error);
      return 0;
    }
  };

  const calculateInsets = () => {
    if (calculatedRef.current && globalInsets) return; // Ya calculado
    
    const newInsets = {
      top: getInset("safe-area-inset-top"),
      right: getInset("safe-area-inset-right"),
      bottom: getInset("safe-area-inset-bottom"),
      left: getInset("safe-area-inset-left"),
    };
    
    // Actualizar cache global
    globalInsets = newInsets;
    globalReady = true;
    
    setInsets(newInsets);
    setIsReady(true);
    calculatedRef.current = true;
  };

  useEffect(() => {
    // Si ya tenemos valores globales, úsalos inmediatamente
    if (globalInsets && globalReady) {
      setInsets(globalInsets);
      setIsReady(true);
      calculatedRef.current = true;
      return;
    }

    // Solo calcular una vez por sesión
    if (!calculatedRef.current) {
      // Ejecutar inmediatamente si es posible
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        calculateInsets();
      } else {
        // Múltiples estrategias para asegurar inicialización rápida
        const timer1 = setTimeout(calculateInsets, 16); // Un frame
        const timer2 = setTimeout(() => {
          if (!calculatedRef.current) {
            calculateInsets();
          }
        }, 100); // Fallback más rápido
        
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    }

    // Recalcular en cambios de orientación y regreso del background
    const handleLayoutChange = () => {
      globalInsets = null; // Reset cache
      globalReady = false;
      calculatedRef.current = false;
      setTimeout(calculateInsets, 100);
    };
    
    window.addEventListener('orientationchange', handleLayoutChange);
    window.addEventListener('resize', handleLayoutChange);
    
    // Listener para regreso del background (solo si Capacitor está disponible)
    let backgroundListener: any = null;
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      try {
        const { App } = (window as any).Capacitor.Plugins;
        if (App && App.addListener) {
          backgroundListener = App.addListener('appStateChange', (state: any) => {
            if (state.isActive) {
              handleLayoutChange();
            }
          });
        }
      } catch (e) {
        // Capacitor no disponible o error
      }
    }
    
    return () => {
      window.removeEventListener('orientationchange', handleLayoutChange);
      window.removeEventListener('resize', handleLayoutChange);
      if (backgroundListener && backgroundListener.remove) {
        backgroundListener.remove();
      }
    };
  }, []); // Dependencias vacías - solo ejecutar al montar

  // Memoizar el resultado para evitar re-renders innecesarios
  return useMemo(() => ({
    ...insets,
    isReady
  }), [insets.top, insets.right, insets.bottom, insets.left, isReady]);
} 