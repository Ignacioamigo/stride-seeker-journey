import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';

interface AppLoaderProps {
  children: React.ReactNode;
}

/**
 * Componente que maneja la carga inicial de la app y previene 
 * el renderizado hasta que los safe area insets estén listos
 */
const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Esperar un tick para asegurar que el DOM esté completamente listo
    // y los insets se hayan calculado correctamente
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150); // Pequeño delay para evitar flash de contenido no posicionado

    return () => clearTimeout(timer);
  }, []);

  // Mostrar loading screen mientras no esté listo
  if (!isReady) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-b from-runapp-light-purple/30 to-white flex flex-col items-center justify-center"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
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
          
          {/* Texto de carga */}
          <h1 className="text-2xl font-bold text-runapp-navy mb-2">BeRun</h1>
          <p className="text-runapp-gray">Iniciando tu entrenador personal...</p>
          
          {/* Indicador de carga */}
          <div className="mt-6 w-32 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-runapp-purple rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppLoader;
