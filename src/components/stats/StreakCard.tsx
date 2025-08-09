import React from 'react';
import { useStreak } from '@/hooks/useStreak';

const pillColors: Record<string, string> = {
  done: 'bg-orange-500 text-white',
  missed: 'bg-gray-300 text-gray-600',
  rest: 'bg-gray-200 text-gray-500',
  future: 'bg-gray-100 text-gray-400',
  none: 'bg-gray-100 text-gray-400',
};

const dayLabel: Record<string, string> = { L: 'L', M: 'M', X: 'X', J: 'J', V: 'V', S: 'S', D: 'D' };

export default function StreakCard() {
  const { streakCount, week, isLoading } = useStreak();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <span className="text-orange-500 text-lg">🔥</span>
        </div>
        <div className="flex flex-col">
          <span className="text-runapp-gray text-sm no-select">Racha activa</span>
          <span className="text-runapp-navy text-2xl font-bold no-select">{isLoading ? '...' : streakCount}</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {week.map((d) => (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${pillColors[d.status]}`}>
              {d.status === 'done' ? '✓' : ''}
            </div>
            <span className="text-xs text-runapp-gray no-select">{dayLabel[d.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


