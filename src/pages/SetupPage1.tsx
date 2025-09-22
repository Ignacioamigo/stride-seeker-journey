import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SetupPage1: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress from 0 to 100%
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Auto-navigate to next page after reaching 100%
          setTimeout(() => {
            navigate('/setup-2');
          }, 1000);
          return 100;
        }
        return prev + 2; // Increment by 2% every interval
      });
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-sm mx-auto">
        
        {/* Progress Percentage */}
        <div className="text-8xl font-bold text-gray-900 mb-4">
          {progress}%
        </div>
        
        {/* Main Title */}
        <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
          Estamos configurando<br />todo para ti
        </h1>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mx-auto max-w-xs">
          <div 
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Running-focused subtitle */}
        <div className="space-y-4 text-gray-600">
          <p className="text-lg">
            Analizando tu perfil de corredor...
          </p>
          
          {/* Dynamic status messages based on progress */}
          <div className="text-base">
            {progress < 25 && <p>🏃‍♂️ Calculando tu ritmo ideal</p>}
            {progress >= 25 && progress < 50 && <p>📊 Analizando tu experiencia</p>}
            {progress >= 50 && progress < 75 && <p>🎯 Definiendo tus objetivos</p>}
            {progress >= 75 && progress < 100 && <p>⚡ Optimizando tu plan</p>}
            {progress === 100 && <p className="text-green-600 font-semibold">✅ ¡Plan personalizado listo!</p>}
          </div>
        </div>
        
        {/* Running-themed elements */}
        <div className="flex justify-center space-x-4 mt-8 opacity-60">
          <div className="text-2xl">🏃‍♂️</div>
          <div className="text-2xl">⏱️</div>
          <div className="text-2xl">🎯</div>
          <div className="text-2xl">📈</div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage1;
