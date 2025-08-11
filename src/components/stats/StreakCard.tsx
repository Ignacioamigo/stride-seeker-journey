import React, { useEffect, useMemo, useState } from 'react';
import { useStats } from '@/context/StatsContext';
import { getAllPlannedSessions } from '@/services/planService';
import { getCompletedWorkouts } from '@/services/completedWorkoutService';
import { startOfWeekMonday, toYmdUTC } from '@/utils/dateUtils';
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
  const { stats } = useStats();
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [plannedSet, setPlannedSet] = useState<Set<string>>(new Set());
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const dayKeys = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

  const refresh = async () => {
    setIsLoading(true);
    const today = new Date();
    const monday = startOfWeekMonday(today);
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      days.push(toYmdUTC(d));
    }
    setWeekDates(days);

    const planned = await getAllPlannedSessions();
    const plannedThisWeek = planned.filter(p => days.includes(p.date));
    const plannedDates: Set<string> = new Set(plannedThisWeek.map(p => p.date as string));
    setPlannedSet(plannedDates as Set<string>);

    const completed = await getCompletedWorkouts();
    const completedThisWeek = completed
      .filter(w => w.distancia_recorrida && w.distancia_recorrida > 0)
      .filter(w => days.includes(w.fecha_completado));
    const completedDates: Set<string> = new Set(completedThisWeek.map((w: any) => w.fecha_completado as string));
    setCompletedSet(completedDates as Set<string>);
    setIsLoading(false);
  };

  useEffect(() => {
    refresh();
    const onWorkout = () => refresh();
    const onPlan = () => refresh();
    window.addEventListener('workoutCompleted', onWorkout);
    window.addEventListener('plan-updated', onPlan);
    return () => {
      window.removeEventListener('workoutCompleted', onWorkout);
      window.removeEventListener('plan-updated', onPlan);
    };
  }, []);

  const week = useMemo(() => {
    return weekDates.map((date, idx) => {
      const planned = plannedSet.has(date);
      const completed = completedSet.has(date);
      const done = planned && completed;
      return {
        key: dayKeys[idx],
        date,
        status: done ? 'done' : 'none'
      } as const;
    });
  }, [weekDates, plannedSet, completedSet]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <span className="text-orange-500 text-lg">🔥</span>
        </div>
        <div className="flex flex-col">
          <span className="text-runapp-gray text-sm no-select">Racha activa</span>
          <span className="text-runapp-navy text-2xl font-bold no-select">{isLoading ? '...' : stats?.totalRuns || 0}</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {week.map((d) => (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${pillColors[d.status]}`}>
              {d.status === 'done' ? <Check className="w-4 h-4" /> : ''}
            </div>
            <span className="text-xs text-runapp-gray no-select">{dayLabel[d.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


