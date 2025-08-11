import React from 'react';
import { useStats } from '@/context/StatsContext';
import { Check } from 'lucide-react';

const pillColors: Record<string, string> = {
  done: 'bg-orange-500 text-white',
  missed: 'bg-gray-300 text-gray-600',
  rest: 'bg-gray-200 text-gray-500',
  future: 'bg-gray-100 text-gray-400',
  none: 'bg-gray-100 text-gray-400',
};

const dayLabel: Record<string, string> = { L: 'L', M: 'M', X: 'X', J: 'J', V: 'V', S: 'S', D: 'D' };

export default function StreakCard() {
  const { stats, isLoading } = useStats();
  const weekly = Array.isArray(stats?.weeklyData) ? stats.weeklyData : [];

  // weeklyData viene ordenado de lunes a domingo
  const completedByDayThisWeek: boolean[] = weekly.map((d: any) => (d?.distance || 0) > 0);
  const dayLetters = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4 select-none">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
            <span className="text-3xl leading-none">🔥</span>
          </div>
          <div className="absolute -bottom-1 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center border border-orange-200">
            <span className="text-orange-600 text-sm font-bold">{isLoading ? '…' : stats.totalRuns}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-runapp-navy font-bold text-xl">Day Streak</span>
          <span className="text-runapp-gray text-sm">Racha total basada en carreras completadas</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-2">
        {dayLetters.map((letter, idx) => {
          const done = completedByDayThisWeek[idx];
          return (
            <div key={letter} className="flex flex-col items-center gap-1 w-full">
              <div className={`w-7 h-7 rounded-full grid place-items-center ${done ? 'bg-orange-500 text-white' : 'bg-gray-100 border border-gray-200 text-gray-400'}`}>
                {done ? <Check size={16} /> : null}
              </div>
              <span className={`text-xs ${done ? 'text-runapp-navy' : 'text-runapp-gray'}`}>{letter}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}




