import { useState, useEffect } from 'react';

/**
 * Hook para detectar la plataforma en la que está corriendo la aplicación
 * Útil para aplicar fixes específicos de plataforma (Android vs iOS)
 */
export function usePlatform() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const detectPlatform = () => {
      // Verificar si está en un entorno Capacitor (nativo)
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
        setIsNative(true);
        
        // Detectar plataforma específica
        if (window.Capacitor?.getPlatform) {
          const platformName = window.Capacitor.getPlatform();
          setPlatform(platformName === 'ios' ? 'ios' : 'android');
        } else {
          // Fallback: detectar por user agent
          const userAgent = window.navigator.userAgent.toLowerCase();
          if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ios')) {
            setPlatform('ios');
          } else if (userAgent.includes('android')) {
            setPlatform('android');
          }
        }
      } else {
        // En web, intentar detectar por user agent para testing
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ios')) {
          setPlatform('ios');
        } else if (userAgent.includes('android')) {
          setPlatform('android');
        } else {
          setPlatform('web');
        }
      }
    };

    detectPlatform();

    // Re-detectar si cambia el estado de Capacitor
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.Capacitor && !isNative) {
        detectPlatform();
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [isNative]);

  return {
    platform,
    isNative,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web' && !isNative
  };
}
