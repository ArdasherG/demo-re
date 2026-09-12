export interface Habit {
  id: string;
  title: string; // 1-40 characters
  emoji: string;
  color: string; // Hex color code from palette
  schedule: number[]; // 1 = Monday, 7 = Sunday
  order: number;
  createdAt: string; // YYYY-MM-DD
  completions: string[]; // YYYY-MM-DD unique sorted ascending
}

export interface HabitStoreData {
  version: number;
  habits: Habit[];
}

export const PALETTE_COLORS: { name: string; hex: string }[] = [
  { name: 'Синий', hex: '#3B82F6' },
  { name: 'Индиго', hex: '#6366F1' },
  { name: 'Изумрудный', hex: '#10B981' },
  { name: 'Янтарный', hex: '#F59E0B' },
  { name: 'Розовый', hex: '#F43F5E' },
  { name: 'Фиолетовый', hex: '#A855F7' },
  { name: 'Бирюзовый', hex: '#14B8A6' },
  { name: 'Оранжевый', hex: '#F97316' },
];

export const POPULAR_EMOJIS: string[] = [
  '📖', '💧', '🏃', '🧘', '🍎', '💤', '💪', '🎯',
  '✍️', '🚶', '🌱', '🧹', '🧠', '🚴', '💊', '✨',
  '☕', '🎸', '🎨', '📵', '🏋️', '🥗', '⚡', '🔥'
];

export const DAYS_OF_WEEK = [
  { iso: 1, short: 'Пн', full: 'Понедельник' },
  { iso: 2, short: 'Вт', full: 'Вторник' },
  { iso: 3, short: 'Ср', full: 'Среда' },
  { iso: 4, short: 'Чт', full: 'Четверг' },
  { iso: 5, short: 'Пт', full: 'Пятница' },
  { iso: 6, short: 'Сб', full: 'Суббота' },
  { iso: 7, short: 'Вс', full: 'Воскресенье' },
];

export const MAX_HABITS = 20;
