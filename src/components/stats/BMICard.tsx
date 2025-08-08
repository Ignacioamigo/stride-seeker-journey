import React from 'react';
import { useUser } from '@/context/UserContext';

const BMICard: React.FC = () => {
  const { user } = useUser();
  
  // Calculate BMI
  const calculateBMI = (): { bmi: number; category: string; color: string } => {
    if (!user.weight || !user.height) {
      return { bmi: 0, category: 'No disponible', color: 'text-gray-500' };
    }
    
    const heightInMeters = user.height / 100;
    const bmi = user.weight / (heightInMeters * heightInMeters);
    
    let category = '';
    let color = '';
    
    if (bmi < 18.5) {
      category = 'Bajo peso';
      color = 'text-blue-500';
    } else if (bmi < 25) {
      category = 'Saludable';
      color = 'text-green-500';
    } else if (bmi < 30) {
      category = 'Sobrepeso';
      color = 'text-yellow-500';
    } else {
      category = 'Obeso';
      color = 'text-red-500';
    }
    
    return { bmi: Math.round(bmi * 10) / 10, category, color };
  };
  
  const { bmi, category, color } = calculateBMI();
  
  // BMI scale position (percentage)
  const getBMIPosition = (bmiValue: number): number => {
    // Scale: 15 (start) to 35 (end) - 20 units total
    const minBMI = 15;
    const maxBMI = 35;
    const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmiValue));
    return ((clampedBMI - minBMI) / (maxBMI - minBMI)) * 100;
  };
  
  const position = getBMIPosition(bmi);
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-runapp-navy">Tu IMC</h2>
        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-600">?</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-runapp-navy">{bmi}</span>
          <span className="text-gray-500">Tu peso es</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            category === 'Saludable' ? 'bg-green-100 text-green-700' :
            category === 'Bajo peso' ? 'bg-blue-100 text-blue-700' :
            category === 'Sobrepeso' ? 'bg-yellow-100 text-yellow-700' :
            category === 'Obeso' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {category}
          </span>
        </div>
      </div>

      {/* BMI Scale */}
      {bmi > 0 && (
        <div className="relative">
          {/* Color gradient bar */}
          <div className="h-3 rounded-full overflow-hidden mb-4">
            <div className="h-full flex">
              <div className="bg-blue-400 flex-1"></div>
              <div className="bg-green-400 flex-1"></div>
              <div className="bg-yellow-400 flex-1"></div>
              <div className="bg-red-400 flex-1"></div>
            </div>
          </div>
          
          {/* BMI indicator */}
          <div 
            className="absolute -top-2 w-0.5 h-6 bg-black rounded-full transform -translate-x-0.5"
            style={{ left: `${position}%` }}
          ></div>
          
          {/* Scale labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className="text-blue-600 no-select">Bajo peso</span>
            <span className="text-green-600 no-select">Saludable</span>
            <span className="text-yellow-600 no-select">Sobrepeso</span>
            <span className="text-red-600 no-select">Obeso</span>
          </div>
        </div>
      )}
      
      {!user.weight || !user.height ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Completa tu perfil con peso y altura para ver tu IMC
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default BMICard;
