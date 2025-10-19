import React, { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';

interface AppLoaderProps {
  children: React.ReactNode;
}

/**
 * 🔥 COMPONENTE ANTI-DESCUADRE MEJORADO
 * Garantiza inicialización coordinada y estable de toda la UI
 */
const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isStabilized, setIsStabilized] = useState(false);
  const insets = useSafeAreaInsets();
  const hasStabilized = useRef(false);

  // 🔥 ESTABILIZACIÓN COORDINADA ULTRA-POTENTE
  const performFullStabilization = () => {
    if (hasStabilized.current) return;
    hasStabilized.current = true;

    console.log('🚀 MÁXIMO POTENCIAL - Iniciando estabilización completa...');

    // 1. Asegurar meta viewport correcto
    let viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // 2. Variables críticas del viewport
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // 3. Estabilización progresiva por capas
    const stabilizationSteps = [
      () => {
        // Paso 1: Elementos base
        const root = document.getElementById('root');
        const body = document.body;
        const html = document.documentElement;

        [root, body, html].forEach(el => {
          if (el) {
            el.style.transform = 'translate3d(0, 0, 0)';
            el.style.backfaceVisibility = 'hidden';
            el.style.WebkitBackfaceVisibility = 'hidden';
            el.style.contain = 'layout style paint';
          }
        });
      },
      () => {
        // Paso 2: Elementos fixed y críticos
        const criticalElements = document.querySelectorAll(
          '[style*="position: fixed"], .fixed, nav, header, .layout-stable-fixed'
        );
        
        criticalElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.willChange = 'transform';
            el.style.transform = 'translate3d(0, 0, 0)';
            el.style.backfaceVisibility = 'hidden';
            el.style.WebkitBackfaceVisibility = 'hidden';
            el.style.contain = 'layout style paint';
          }
        });
      },
      () => {
        // Paso 3: Forzar reflows múltiples
        document.body.offsetHeight;
        document.documentElement.offsetHeight;
        window.getComputedStyle(document.body).height;
      },
      () => {
        // Paso 4: Limpiar y finalizar
        const allElements = document.querySelectorAll('[style*="will-change: transform"]');
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.willChange = 'auto';
          }
        });
        
        console.log('✅ MÁXIMO POTENCIAL - Estabilización completa terminada');
        
        // Aplicar clases de estabilidad progresiva
        document.documentElement.classList.add('layout-ready');
        document.body.classList.add('layout-ready');
        const root = document.getElementById('root');
        if (root) {
          root.classList.add('layout-ready');
        }
        
        setIsStabilized(true);
      }
    ];

    // Ejecutar pasos de forma escalonada
    stabilizationSteps.forEach((step, index) => {
      setTimeout(step, index * 25); // 25ms entre pasos para mayor suavidad
    });
  };

  useEffect(() => {
    // Coordinación ultra-precisa de la inicialización
    const initializationSequence = async () => {
      // 1. Esperar que insets estén listos
      if (!insets.isReady) {
        return;
      }

      // 2. Ejecutar estabilización completa
      performFullStabilization();

      // 3. Esperar tiempo mínimo para asegurar que todo esté listo
      await new Promise(resolve => setTimeout(resolve, 200));

      // 4. Un último check de estabilidad
      requestAnimationFrame(() => {
        document.body.offsetHeight; // Forzar un último reflow
        console.log('🎯 AppLoader: Todo listo, iniciando aplicación');
        setIsReady(true);
      });
    };

    initializationSequence();
  }, [insets.isReady]); // Depender del estado de insets

  // Mostrar loading screen coordinado mientras no esté todo listo
  if (!isReady || !isStabilized) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-b from-runapp-light-purple/30 to-white flex flex-col items-center justify-center layout-stable"
        style={{
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        }}
      >
        <div className="text-center">
          {/* Logo animado */}
          <div className="w-20 h-20 mb-4 animate-pulse">
            <img 
              src="/BeRun_appicon_1024_blue1463FF.png" 
              alt="BeRun Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Texto de carga con indicador de progreso */}
          <h1 className="text-2xl font-bold text-runapp-navy mb-2">BeRun</h1>
          <p className="text-runapp-gray">
            {!insets.isReady ? 'Preparando interfaz...' : 
             !isStabilized ? 'Estabilizando layout...' : 
             'Iniciando tu entrenador personal...'}
          </p>
          
          {/* Indicador de carga progresivo */}
          <div className="mt-6 w-32 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-runapp-purple rounded-full transition-all duration-300" 
              style={{
                width: !insets.isReady ? '20%' : 
                       !isStabilized ? '60%' : 
                       '90%'
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppLoader;
