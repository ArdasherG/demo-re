import { Habit } from '../types/habit';

/**
 * Format a Date object to YYYY-MM-DD using local time
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string into a local Date object set to 00:00:00
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Add or subtract days from a YYYY-MM-DD date string
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * Get ISO day of week: 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
 */
export function getIsoDayOfWeek(dateStr: string): number {
  const d = parseDate(dateStr);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday...
  return day === 0 ? 7 : day;
}

/**
 * Check if a given date is scheduled for the habit
 */
export function isDateScheduled(habit: Habit, dateStr: string): boolean {
  const dayIso = getIsoDayOfWeek(dateStr);
  return habit.schedule.includes(dayIso);
}

/**
 * Check if habit is completed on dateStr
 */
export function isCompleted(habit: Habit, dateStr: string): boolean {
  return habit.completions.includes(dateStr);
}

/**
 * Calculate the current streak:
 * "идём от сегодняшнего дня назад, считаем запланированные дни;
 * серия прерывается на первом запланированном дне без отметки.
 * Незапланированные дни пропускаются и серию не прерывают.
 * Если сегодня день запланирован, но ещё не отмечен, серия считается от вчерашнего дня."
 */
export function calculateCurrentStreak(habit: Habit, todayStr: string): number {
  if (!habit.schedule || habit.schedule.length === 0) return 0;

  const todayIsScheduled = isDateScheduled(habit, todayStr);
  const todayIsCompleted = isCompleted(habit, todayStr);

  let streak = 0;
  if (todayIsScheduled && todayIsCompleted) {
    streak = 1;
  }

  // Iterate backwards starting from yesterday
  let currentDate = addDays(todayStr, -1);
  
  // Safety guard: do not go further back than 5 years (1825 days) or before createdAt if no completions exist
  const minDateLimit = habit.completions.length > 0
    ? habit.completions[0] < habit.createdAt ? habit.completions[0] : habit.createdAt
    : habit.createdAt;
  const stopDate = addDays(minDateLimit, -7);

  while (currentDate >= stopDate) {
    if (isDateScheduled(habit, currentDate)) {
      if (isCompleted(habit, currentDate)) {
        streak += 1;
      } else {
        // Scheduled day was NOT completed -> streak is broken!
        break;
      }
    }
    // Unscheduled days are skipped and do not break the streak
    currentDate = addDays(currentDate, -1);
  }

  return streak;
}

/**
 * Calculate best streak of all time up to todayStr
 */
export function calculateBestStreak(habit: Habit, todayStr: string): number {
  if (!habit.schedule || habit.schedule.length === 0) return 0;

  // Determine starting point
  let startDate = habit.createdAt;
  if (habit.completions.length > 0 && habit.completions[0] < startDate) {
    startDate = habit.completions[0];
  }

  let maxStreak = 0;
  let currentRun = 0;
  let cursor = startDate;

  // Go forward from startDate up to todayStr
  while (cursor <= todayStr) {
    const scheduled = isDateScheduled(habit, cursor);

    if (scheduled) {
      if (isCompleted(habit, cursor)) {
        currentRun += 1;
        if (currentRun > maxStreak) {
          maxStreak = currentRun;
        }
      } else {
        // If it's today and not marked yet, today does not penalize historical best run
        if (cursor === todayStr) {
          // do not reset currentRun if today is still in progress
        } else {
          currentRun = 0;
        }
      }
    }
    // Unscheduled days are skipped
    cursor = addDays(cursor, 1);
  }

  const currentStreak = calculateCurrentStreak(habit, todayStr);
  return Math.max(maxStreak, currentStreak);
}

/**
 * Calculate completion rate for the last N applicable (scheduled) days:
 * "отмеченные запланированные дни ÷ все запланированные дни за период × 100, округление до целого."
 */
export function calculateCompletionRate(
  habit: Habit,
  todayStr: string,
  targetApplicableDaysCount: number = 30
): number {
  if (!habit.schedule || habit.schedule.length === 0) return 0;

  let applicableDaysCount = 0;
  let completedDaysCount = 0;

  let cursor = todayStr;
  let loopCount = 0;
  const maxIterations = 365 * 2; // Guard

  while (applicableDaysCount < targetApplicableDaysCount && loopCount < maxIterations) {
    // If we passed the habit creation date AND there are no earlier completions, we can stop
    if (cursor < habit.createdAt && (!habit.completions[0] || cursor < habit.completions[0])) {
      break;
    }

    if (isDateScheduled(habit, cursor)) {
      applicableDaysCount += 1;
      if (isCompleted(habit, cursor)) {
        completedDaysCount += 1;
      }
    }

    cursor = addDays(cursor, -1);
    loopCount += 1;
  }

  if (applicableDaysCount === 0) return 0;

  return Math.round((completedDaysCount / applicableDaysCount) * 100);
}

/**
 * Russian month names
 */
export const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export const MONTH_NAMES_RU_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

export const DAYS_OF_WEEK_SHORT_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/**
 * Format date nicely for Russian display: e.g. "Суббота, 12 сентября"
 */
export function formatFullRussianDate(dateStr: string): string {
  const d = parseDate(dateStr);
  const daysFull = [
    'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
  ];
  const dayName = daysFull[d.getDay()];
  const dayNum = d.getDate();
  const monthName = MONTH_NAMES_RU_GENITIVE[d.getMonth()];
  return `${dayName}, ${dayNum} ${monthName}`;
}

/**
 * Calendar grid for a given year and month (1-based month: 1=Jan, 12=Dec)
 */
export interface CalendarDay {
  dateStr: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  isScheduled: boolean;
  isCompleted: boolean;
}

export function generateMonthCalendar(
  year: number,
  month: number, // 1 to 12
  habit: Habit,
  todayStr: string
): CalendarDay[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const totalDays = lastDay.getDate();

  // Day of week of the 1st of the month: 1 (Mon) to 7 (Sun)
  let startDayOfWeek = firstDay.getDay();
  if (startDayOfWeek === 0) startDayOfWeek = 7;

  const days: CalendarDay[] = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = startDayOfWeek - 1; i > 0; i--) {
    const dayNum = prevMonthLastDay - i + 1;
    const prevMonthDate = new Date(year, month - 2, dayNum);
    const dateStr = formatDate(prevMonthDate);
    days.push({
      dateStr,
      dayOfMonth: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      isScheduled: isDateScheduled(habit, dateStr),
      isCompleted: isCompleted(habit, dateStr)
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const currDate = new Date(year, month - 1, d);
    const dateStr = formatDate(currDate);
    days.push({
      dateStr,
      dayOfMonth: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      isScheduled: isDateScheduled(habit, dateStr),
      isCompleted: isCompleted(habit, dateStr)
    });
  }

  // Next month padding to fill out complete 7-day rows
  const remaining = (7 - (days.length % 7)) % 7;
  for (let n = 1; n <= remaining; n++) {
    const nextDate = new Date(year, month, n);
    const dateStr = formatDate(nextDate);
    days.push({
      dateStr,
      dayOfMonth: n,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      isScheduled: isDateScheduled(habit, dateStr),
      isCompleted: isCompleted(habit, dateStr)
    });
  }

  return days;
}
