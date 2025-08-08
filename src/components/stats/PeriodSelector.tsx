import React from 'react';

export type TimePeriod = 'current_week' | 'current_month' | '3_months' | 'all_time';

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { id: 'current_week' as TimePeriod, label: 'Esta semana' },
    { id: 'current_month' as TimePeriod, label: 'Este mes' },
    { id: '3_months' as TimePeriod, label: '3 meses' },
    { id: 'all_time' as TimePeriod, label: 'Total' },
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto">
      {periods.map((period) => (
        <button
          key={period.id}
          onClick={() => onPeriodChange(period.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all no-select ${
            selectedPeriod === period.id
              ? 'bg-runapp-purple text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-runapp-purple hover:text-runapp-purple'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;
