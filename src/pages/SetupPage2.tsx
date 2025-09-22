import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SetupPage2: React.FC = () => {
  const navigate = useNavigate();

  // Removed auto-navigation - now manual only

  const handleContinue = () => {
    navigate('/paywall');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6" style={{ paddingTop: '60px' }}>
      <div className="text-center space-y-8 max-w-md mx-auto">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Main Title */}
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Felicidades tu plan<br />personalizado está listo
        </h1>
        
        {/* Goal Achievement */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Deberías obtener:
          </h2>
          <div className="text-2xl font-bold text-blue-600">
            tu entrenamiento 100% personalizado
          </div>
        </div>
        
        {/* Plan Features */}
        <div className="space-y-4 text-left">
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
            Tu plan incluye:
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-800">Entrenamientos personalizados</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-800">Seguimiento de progreso</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-800">Recomendaciones nutricionales</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-800">Análisis de rendimiento</span>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-black text-white py-4 rounded-full font-semibold text-lg mt-8"
        >
          ¡Vamos a empezar!
        </button>
        
      </div>
    </div>
  );
};

export default SetupPage2;
