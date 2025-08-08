import React from 'react';

interface CaloriesData {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface CaloriesChartProps {
  data: CaloriesData[];
  totalCalories: number;
}

const CaloriesChart: React.FC<CaloriesChartProps> = ({ data, totalCalories }) => {
  const maxCalories = Math.max(...data.map(d => d.calories), 400);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-runapp-navy">Total Calories</h2>
      </div>
      
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-runapp-navy">{totalCalories}</span>
          <span className="text-gray-500">cals</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between h-40 mb-4">
          {days.map((day, index) => {
            const dayData = data[index] || { calories: 0, protein: 0, carbs: 0, fats: 0 };
            const heightPercentage = (dayData.calories / maxCalories) * 100;
            
            // Calculate stack percentages
            const total = dayData.protein + dayData.carbs + dayData.fats;
            const proteinHeight = total > 0 ? (dayData.protein / total) * heightPercentage : 0;
            const carbsHeight = total > 0 ? (dayData.carbs / total) * heightPercentage : 0;
            const fatsHeight = total > 0 ? (dayData.fats / total) * heightPercentage : 0;
            
            return (
              <div key={day} className="flex flex-col items-center">
                <div className="w-8 flex flex-col justify-end h-32 mb-2">
                  {dayData.calories > 0 && (
                    <div className="w-full rounded-t-sm overflow-hidden">
                      {/* Fats - Red */}
                      {fatsHeight > 0 && (
                        <div 
                          className="w-full bg-red-400"
                          style={{ height: `${fatsHeight}%` }}
                        />
                      )}
                      {/* Carbs - Orange */}
                      {carbsHeight > 0 && (
                        <div 
                          className="w-full bg-orange-400"
                          style={{ height: `${carbsHeight}%` }}
                        />
                      )}
                      {/* Protein - Blue */}
                      {proteinHeight > 0 && (
                        <div 
                          className="w-full bg-blue-400"
                          style={{ height: `${proteinHeight}%` }}
                        />
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 font-medium">{day}</span>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 h-32 flex flex-col justify-between text-xs text-gray-400 -ml-8">
          <span>400</span>
          <span>300</span>
          <span>200</span>
          <span>100</span>
          <span>0</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span className="text-sm text-gray-600 no-select">Protein</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          <span className="text-sm text-gray-600 no-select">Carbs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span className="text-sm text-gray-600 no-select">Fats</span>
        </div>
      </div>
    </div>
  );
};

export default CaloriesChart;
