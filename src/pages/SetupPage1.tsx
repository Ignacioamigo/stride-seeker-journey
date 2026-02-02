import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SetupPage1: React.FC = () => {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);

  const dynamicMessages = [
    "Analizando tus métricas...",
    "Diseñando tu Semana 1 de Calibración...",
    "Configurando el sistema de adaptación para la Semana 2...",
  ];

  useEffect(() => {
    // Cambiar mensaje cada 2 segundos
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => {
        if (prev >= dynamicMessages.length - 1) {
          return prev; // Mantener el último mensaje
        }
        return prev + 1;
      });
    }, 2000);

    // Navegar después de 5 segundos (tiempo total de la pantalla)
    const navigationTimer = setTimeout(() => {
      navigate('/setup-2');
    }, 5000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-10 max-w-sm mx-auto">
        
        {/* Animación de carga circular */}
        <div className="relative flex items-center justify-center">
          {/* Círculo exterior animado */}
          <div className="w-32 h-32 rounded-full border-4 border-gray-200 relative">
            <div 
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-pink-500 animate-spin"
              style={{ animationDuration: '1.5s' }}
            />
            {/* Ondas de pulso */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/20 to-pink-500/20 animate-pulse" />
          </div>
          
          {/* Icono central */}
          <div className="absolute">
            <span className="text-4xl">🏃</span>
          </div>
        </div>
        
        {/* Texto dinámico principal */}
        <div className="space-y-2 min-h-[80px] flex flex-col justify-center">
          <p 
            key={messageIndex}
            className="text-xl font-semibold text-gray-900 animate-fade-in"
          >
            {dynamicMessages[messageIndex]}
          </p>
        </div>
        
        {/* Barra de progreso sutil */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mx-auto max-w-xs overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 h-1.5 rounded-full animate-progress"
          />
        </div>
        
        {/* Separador */}
        <div className="border-t border-gray-200 w-full" />
        
        {/* Sección: Cómo funciona - 3 iconos */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Cómo funciona
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Entrena */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏃</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-sm">Entrena</p>
                <p className="text-xs text-gray-500 leading-tight">
                  Completa tus sesiones de la semana
                </p>
              </div>
            </div>
            
            {/* Analizamos */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-sm">Analizamos</p>
                <p className="text-xs text-gray-500 leading-tight">
                  Un entrenador mide tu esfuerzo y fatiga
                </p>
              </div>
            </div>
            
            {/* Evoluciona */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-sm">Evoluciona</p>
                <p className="text-xs text-gray-500 leading-tight">
                  Tu semana se recalibra según resultados
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default SetupPage1;
