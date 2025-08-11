import { WeekDay } from '@/types';

/**
 * Obtiene los días de la semana actual con fechas reales
 * @param startDate - Fecha base (por defecto: hoy)
 * @returns Array de WeekDay con fechas de la semana actual
 */
export function getCurrentWeekDays(startDate: Date = new Date()): WeekDay[] {
  const days = [
    { name: 'Lunes', shortName: 'L' },
    { name: 'Martes', shortName: 'M' },
    { name: 'Miércoles', shortName: 'X' },
    { name: 'Jueves', shortName: 'J' },
    { name: 'Viernes', shortName: 'V' },
    { name: 'Sábado', shortName: 'S' },
    { name: 'Domingo', shortName: 'D' }
  ];

  // Encontrar el lunes de esta semana
  const today = new Date(startDate);
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Ajustar para que lunes sea 0
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToSubtract);

  return days.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    
    return {
      id: index,
      name: day.name,
      shortName: day.shortName,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      selected: false
    };
  });
}

/**
 * Obtiene los días de la próxima semana con fechas reales
 * @param startDate - Fecha base (por defecto: hoy)
 * @returns Array de WeekDay con fechas de la próxima semana
 */
export function getNextWeekDays(startDate: Date = new Date()): WeekDay[] {
  const nextWeek = new Date(startDate);
  nextWeek.setDate(startDate.getDate() + 7);
  return getCurrentWeekDays(nextWeek);
}

/**
 * Formatea una fecha para mostrar día y mes en español
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns String formateado como "15 Ene"
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00'); // Evitar problemas de timezone
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  return `${day} ${month}`;
}

/**
 * Formatea una fecha para mostrar día completo en español
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns String formateado como "15 de Enero"
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00');
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  return `${day} de ${month}`;
}

/**
 * Verifica si una fecha es hoy
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns true si es hoy
 */
export function isToday(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
}

/**
 * Verifica si una fecha es mañana
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns true si es mañana
 */
export function isTomorrow(dateString: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];
  return dateString === tomorrowString;
}

/**
 * Obtiene un texto descriptivo para la fecha
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns "Hoy", "Mañana" o fecha formateada
 */
export function getDateLabel(dateString: string): string {
  if (isToday(dateString)) return 'Hoy';
  if (isTomorrow(dateString)) return 'Mañana';
  return formatDateShort(dateString);
}

// NUEVAS UTILIDADES EN UTC
/**
 * Normaliza una fecha a formato YYYY-MM-DD en UTC.
 */
export function toYmdUTC(date: Date): string {
  // Crear una fecha en UTC descartando la parte de tiempo local
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Devuelve el lunes de la semana de la fecha dada, normalizado a 00:00 UTC.
 */
export function startOfWeekMonday(date: Date): Date {
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth();
  const utcDate = date.getUTCDate();
  const tmp = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0));
  const day = tmp.getUTCDay(); // 0=Domingo, 1=Lunes, ...
  const diff = day === 0 ? -6 : 1 - day; // mover a lunes
  tmp.setUTCDate(tmp.getUTCDate() + diff);
  // Asegurar 00:00 UTC
  tmp.setUTCHours(0, 0, 0, 0);
  return tmp;
}
