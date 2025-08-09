import { useEffect, useMemo, useState } from 'react';
import { loadLatestPlan } from '@/services/planService';
import { getCompletedWorkouts } from '@/services/completedWorkoutService';

export type WeekDayKey = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';

export type DayStatus = 'done' | 'missed' | 'rest' | 'future' | 'none';

export interface WeekDayStatus {
  key: WeekDayKey;
  date: string; // YYYY-MM-DD
  status: DayStatus;
}

export interface StreakState {
  streakCount: number;
  week: WeekDayStatus[];
  isLoading: boolean;
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const jsDay = d.getDay(); // 0=Sun..6=Sat
  const mondayOffset = (jsDay + 6) % 7; // 0 for Monday
  d.setDate(d.getDate() - mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const WEEK_KEYS: WeekDayKey[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/**
 * Calcula la racha de entrenamientos consecutivos en días planificados.
 * Reglas:
 * - Solo cuentan los días planificados de entrenamiento (se ignoran "descanso").
 * - La racha suma 1 por cada día planificado que se completó en su fecha.
 * - Si se falla un día planificado pasado, la racha se reinicia a 0 desde ese fallo.
 * - Soporta datos desde Supabase (entrenamientos_completados / training_sessions) y fallback a localStorage.
 */
export function useStreak(): StreakState {
  const [streakCount, setStreakCount] = useState<number>(0);
  const [week, setWeek] = useState<WeekDayStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);

        // 1) Cargar plan actual
        const plan = await loadLatestPlan();
        if (!plan || !plan.workouts || plan.workouts.length === 0) {
          setStreakCount(0);
          setWeek(buildEmptyWeek());
          return;
        }

        // 2) Obtener completados del plan
        const allCompleted = await getCompletedWorkouts(plan.id);
        const completedDateSet = new Set<string>(
          (allCompleted || [])
            .map((w: any) => w.fecha_completado || w.day_date)
            .filter(Boolean)
        );

        // 3) Construir lista de días planificados (no descanso) con su fecha (YYYY-MM-DD)
        const plannedDays = plan.workouts
          .filter(w => (w.type || '').toLowerCase() !== 'descanso')
          .map(w => ({ date: w.date || toYmd(new Date()), id: w.id }))
          .sort((a, b) => a.date.localeCompare(b.date));

        const todayYmd = toYmd(new Date());

        // 4) Calcular racha contando hacia atrás en días planificados <= hoy
        let count = 0;
        for (let i = plannedDays.length - 1; i >= 0; i--) {
          const pd = plannedDays[i];
          if (pd.date > todayYmd) continue; // ignorar futuro
          const done = completedDateSet.has(pd.date);
          if (done) {
            count += 1;
          } else {
            // Primer fallo rompe racha
            break;
          }
        }
        setStreakCount(count);

        // 5) Estados de la semana actual para UI (L..D)
        const monday = startOfWeekMonday(new Date());
        const weekStatuses: WeekDayStatus[] = WEEK_KEYS.map((key, idx) => {
          const d = addDays(monday, idx);
          const ymd = toYmd(d);
          // Buscar si es un día planificado en el plan
          const isPlanned = plan.workouts.some(w => (w.type || '').toLowerCase() !== 'descanso' && (w.date === ymd));
          const isCompleted = completedDateSet.has(ymd);
          const isFuture = ymd > todayYmd;
          let status: DayStatus = 'none';
          if (!isPlanned) {
            status = isFuture ? 'future' : 'rest';
          } else if (isFuture) {
            status = 'future';
          } else if (isCompleted) {
            status = 'done';
          } else {
            status = 'missed';
          }
          return { key, date: ymd, status };
        });
        setWeek(weekStatuses);
      } catch (e) {
        console.error('[useStreak] Error calculando racha:', e);
        setStreakCount(0);
        setWeek(buildEmptyWeek());
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  return useMemo(() => ({ streakCount, week, isLoading }), [streakCount, week, isLoading]);
}

function buildEmptyWeek(): WeekDayStatus[] {
  const monday = startOfWeekMonday(new Date());
  return WEEK_KEYS.map((key, idx) => ({ key, date: toYmd(addDays(monday, idx)), status: 'none' }));
}


