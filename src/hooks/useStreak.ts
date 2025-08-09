import { useEffect, useMemo, useState } from 'react';
import { loadLatestPlan, getAllPlannedSessions } from '@/services/planService';
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
// Función de debugging manual para diagnosticar problemas de racha
export const debugStreakCalculation = async (): Promise<void> => {
  console.log('🔍 === DEBUGGING MANUAL DE RACHA ===');
  
  try {
    const toYmdDebug = (date: Date): string => {
      const y = date.getFullYear();
      const m = `${date.getMonth() + 1}`.padStart(2, '0');
      const d = `${date.getDate()}`.padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    // 1. Verificar entrenamientos completados
    console.log('🔍 1. Obteniendo entrenamientos completados...');
    const allCompleted = await getCompletedWorkouts();
    console.log('🔍 1. RAW completados:', allCompleted);
    
    const completedDateSet = new Set<string>(
      (allCompleted || [])
        .map((w: any) => {
          console.log('🔍 1. Procesando workout:', w);
          return w.fecha_completado || w.day_date;
        })
        .filter(Boolean)
    );
    console.log('🔍 1. Fechas completadas SET:', Array.from(completedDateSet));

    // 2. Verificar sesiones planificadas
    console.log('🔍 2. Obteniendo sesiones planificadas...');
    const allSessions = await getAllPlannedSessions();
    console.log('🔍 2. RAW sesiones:', allSessions);

    // 3. Verificar plan actual como fallback
    console.log('🔍 3. Obteniendo plan actual...');
    const currentPlan = await loadLatestPlan();
    console.log('🔍 3. Plan actual:', currentPlan);
    
    const todayYmd = toYmdDebug(new Date());
    console.log('🔍 Hoy es:', todayYmd);

    // 4. Construir días planificados
    let plannedDays: { date: string }[] = [];
    
    if (allSessions && allSessions.length > 0) {
      plannedDays = allSessions
        .filter(s => (s.type || '').toLowerCase() !== 'descanso')
        .map(s => ({ date: s.date }))
        .sort((a, b) => a.date.localeCompare(b.date));
      console.log('🔍 4. Usando sesiones de Supabase:', plannedDays);
    } else if (currentPlan && currentPlan.workouts) {
      plannedDays = currentPlan.workouts
        .filter(w => (w.type || '').toLowerCase() !== 'descanso')
        .map(w => ({ date: w.date || todayYmd }))
        .sort((a, b) => a.date.localeCompare(b.date));
      console.log('🔍 4. Usando plan actual:', plannedDays);
    } else {
      plannedDays = [{ date: todayYmd }];
      console.log('🔍 4. Usando fallback extremo:', plannedDays);
    }

    // 5. Calcular racha paso a paso
    console.log('🔍 5. === CALCULANDO RACHA ===');
    let count = 0;
    
    for (let i = plannedDays.length - 1; i >= 0; i--) {
      const pd = plannedDays[i];
      console.log(`🔍 5. Evaluando día ${i}: ${pd.date}`);
      
      if (pd.date > todayYmd) {
        console.log(`🔍 5. SALTANDO (futuro): ${pd.date} > ${todayYmd}`);
        continue;
      }
      
      const done = completedDateSet.has(pd.date);
      console.log(`🔍 5. ${pd.date}: ${done ? '✅ COMPLETADO' : '❌ NO COMPLETADO'}`);
      
      if (done) {
        count += 1;
        console.log(`🔍 5. Racha aumenta a: ${count}`);
      } else {
        console.log(`🔍 5. RACHA ROTA en ${pd.date}. Final: ${count}`);
        break;
      }
    }
    
    console.log(`🔍 === RESULTADO FINAL: RACHA = ${count} ===`);
    
  } catch (e) {
    console.error('🔍 ❌ Error en debugging:', e);
  }
};

// Exponer función globalmente para testing
(window as any).debugStreakCalculation = debugStreakCalculation;

export function useStreak(): StreakState {
  const [streakCount, setStreakCount] = useState<number>(0);
  const [week, setWeek] = useState<WeekDayStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);

        // 1) Obtener TODOS los entrenamientos completados históricos (no filtrar por plan)
        console.log('[useStreak] Obteniendo todos los entrenamientos completados...');
        const allCompleted = await getCompletedWorkouts(); // Sin filtros
        const completedDateSet = new Set<string>(
          (allCompleted || [])
            .map((w: any) => w.fecha_completado || w.day_date)
            .filter(Boolean)
        );
        console.log('[useStreak] Fechas completadas encontradas:', Array.from(completedDateSet));

        // 2) Obtener TODAS las sesiones planificadas históricas
        console.log('[useStreak] Obteniendo todas las sesiones planificadas...');
        const allSessions = await getAllPlannedSessions();
        console.log('[useStreak] RAW allSessions:', allSessions);
        
        const todayYmd = toYmd(new Date());
        
        // Si no hay sesiones de Supabase, intentar obtener del plan actual como fallback
        let plannedDays: { date: string }[] = [];
        
        if (allSessions && allSessions.length > 0) {
          // Usar sesiones de Supabase
          plannedDays = allSessions
            .filter(s => (s.type || '').toLowerCase() !== 'descanso')
            .map(s => ({ date: s.date }))
            .sort((a, b) => a.date.localeCompare(b.date));
          console.log('[useStreak] Usando sesiones de Supabase. Días planificados encontrados:', plannedDays.map(p => p.date));
        } else {
          // Fallback: obtener del plan actual si existe
          console.log('[useStreak] No hay sesiones en Supabase, intentando fallback al plan actual...');
          try {
            const currentPlan = await loadLatestPlan();
            if (currentPlan && currentPlan.workouts) {
              plannedDays = currentPlan.workouts
                .filter(w => (w.type || '').toLowerCase() !== 'descanso')
                .map(w => ({ date: w.date || todayYmd }))
                .sort((a, b) => a.date.localeCompare(b.date));
              console.log('[useStreak] FALLBACK: Usando plan actual. Días planificados:', plannedDays.map(p => p.date));
            }
          } catch (e) {
            console.error('[useStreak] Error obteniendo plan actual para fallback:', e);
          }
        }

        // Si todavía no tenemos días planificados, crear al menos el día de hoy como fallback de emergencia
        if (plannedDays.length === 0) {
          console.log('[useStreak] FALLBACK EXTREMO: Creando día de hoy como planificado');
          plannedDays = [{ date: todayYmd }];
        }

        // 3) Calcular racha contando hacia atrás en días planificados <= hoy
        let count = 0;
        for (let i = plannedDays.length - 1; i >= 0; i--) {
          const pd = plannedDays[i];
          if (pd.date > todayYmd) continue; // ignorar futuro
          const done = completedDateSet.has(pd.date);
          console.log(`[useStreak] Evaluando ${pd.date}: ${done ? 'COMPLETADO' : 'FALTÓ'}`);
          if (done) {
            count += 1;
          } else {
            // Primer fallo rompe racha
            console.log(`[useStreak] Racha rota en ${pd.date}, total: ${count}`);
            break;
          }
        }
        console.log(`[useStreak] Racha final calculada: ${count}`);
        setStreakCount(count);
        
        // Disparar evento para notificar cambio de racha
        window.dispatchEvent(new CustomEvent('streakUpdated', { detail: { newStreak: count } }));

        // 4) Estados de la semana actual para UI (L..D)
        const monday = startOfWeekMonday(new Date());
        const weekStatuses: WeekDayStatus[] = WEEK_KEYS.map((key, idx) => {
          const d = addDays(monday, idx);
          const ymd = toYmd(d);
          // Buscar si es un día planificado a nivel global
          const isPlanned = plannedDays.some(p => p.date === ymd);
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

    // Escuchar eventos de actualización de entrenamientos para recalcular
    const handleWorkoutCompleted = () => {
      console.log('[useStreak] Evento workoutCompleted recibido, recalculando...');
      run();
    };

    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    return () => window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
  }, []);

  return useMemo(() => ({ streakCount, week, isLoading }), [streakCount, week, isLoading]);
}

function buildEmptyWeek(): WeekDayStatus[] {
  const monday = startOfWeekMonday(new Date());
  return WEEK_KEYS.map((key, idx) => ({ key, date: toYmd(addDays(monday, idx)), status: 'none' }));
}


