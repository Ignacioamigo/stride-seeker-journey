import { useEffect, useMemo, useState } from 'react';
import { getAllPlannedSessions } from '@/services/planService';
import { getCompletedWorkouts } from '@/services/completedWorkoutService';

export type UseStreakStrictConfig = {
  beforeGraceHours: number; // horas antes del día planificado permitidas
  afterGraceHours: number;  // horas después del día planificado permitidas
  requireTypeMatch?: boolean;
};

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(dateStr: string): Date {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(dateStr: string): Date {
  const d = new Date(`${dateStr}T23:59:59`);
  d.setMilliseconds(999);
  return d;
}

function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

export function useStreakStrict(config: UseStreakStrictConfig) {
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const [plannedSessions, completed] = await Promise.all([
          getAllPlannedSessions(),
          getCompletedWorkouts(),
        ]);

        const todayYmd = toYmd(new Date());

        // Filtrar sesiones planificadas válidas (no descanso) y pasadas/hoy
        const slots = (plannedSessions || [])
          .map((s: any) => ({ date: s.date, type: String(s.type || ''), plan_id: s.plan_id }))
          .filter(s => s.date && (s.type || '').toLowerCase() !== 'descanso')
          .filter(s => s.date <= todayYmd)
          .sort((a, b) => a.date.localeCompare(b.date));

        let count = 0;

        for (let i = slots.length - 1; i >= 0; i--) {
          const slot = slots[i];
          const windowStart = addHours(startOfDay(slot.date), -config.beforeGraceHours);
          const windowEnd = addHours(endOfDay(slot.date), config.afterGraceHours);

          const matched = (completed || []).some((w: any) => {
            // Debug: Verificar cada entrenamiento completado
            console.log(`[useStreakStrict] Evaluando match para slot ${slot.date}:`, {
              slot: { date: slot.date, type: slot.type, plan_id: slot.plan_id },
              workout: { 
                fecha_completado: w.fecha_completado, 
                workout_type: w.workout_type, 
                plan_id: w.plan_id,
                created_at: w.created_at,
                completion_date: w.completion_date
              }
            });

            // 1) Verificar plan_id si es requerido
            if (slot.plan_id && w.plan_id && w.plan_id !== slot.plan_id) {
              console.log(`[useStreakStrict] ❌ Plan ID no coincide: ${w.plan_id} vs ${slot.plan_id}`);
              return false;
            }

            // 2) Verificar tipo si es requerido
            const typeOk = !config.requireTypeMatch || !slot.type || !w.workout_type
              ? true
              : String(w.workout_type).toLowerCase().includes(slot.type.toLowerCase());
            
            if (!typeOk) {
              console.log(`[useStreakStrict] ❌ Tipo no coincide: ${w.workout_type} vs ${slot.type}`);
              return false;
            }

            // 3) Match directo por fecha_completado === slot.date (prioridad alta)
            if (w.fecha_completado && w.fecha_completado === slot.date) {
              console.log(`[useStreakStrict] ✅ Match directo por fecha: ${w.fecha_completado} === ${slot.date}`);
              return true;
            }

            // 4) Match por ventana temporal usando created_at o completion_date
            const ts = w.created_at || w.completion_date;
            if (!ts) {
              // Si no hay timestamp, pero es de hoy, aceptarlo
              const today = toYmd(new Date());
              if (slot.date === today) {
                console.log(`[useStreakStrict] ✅ Match por ser de hoy sin timestamp: ${slot.date}`);
                return true;
              }
              console.log(`[useStreakStrict] ❌ Sin timestamp para verificar ventana temporal`);
              return false;
            }
            
            const t = new Date(ts);
            const inWindow = t >= windowStart && t <= windowEnd;
            
            console.log(`[useStreakStrict] Verificando ventana temporal:`, {
              timestamp: ts,
              windowStart: windowStart.toISOString(),
              windowEnd: windowEnd.toISOString(),
              inWindow
            });
            
            if (inWindow) {
              console.log(`[useStreakStrict] ✅ Match por ventana temporal`);
              return true;
            }
            
            console.log(`[useStreakStrict] ❌ Fuera de ventana temporal`);
            return false;
          });

          if (matched) count += 1; else break;
        }

        console.log(`[useStreakStrict] ✅ Streak calculado: ${count} días consecutivos`);
        setStreak(count);
        window.dispatchEvent(new CustomEvent('streakUpdated', { detail: { newStreak: count } }));
      } catch (e) {
        console.error('[useStreakStrict] Error:', e);
        setStreak(0);
      } finally {
        setIsLoading(false);
      }
    };

    run();
    const onEvents = () => run();
    window.addEventListener('workoutCompleted', onEvents);
    window.addEventListener('plan-updated', onEvents);
    return () => {
      window.removeEventListener('workoutCompleted', onEvents);
      window.removeEventListener('plan-updated', onEvents);
    };
  }, [config.beforeGraceHours, config.afterGraceHours, config.requireTypeMatch]);

  return useMemo(() => ({ streak, isLoading }), [streak, isLoading]);
}


