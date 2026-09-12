import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Percent,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  Check
} from 'lucide-react';
import { Habit } from '../types/habit';
import {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateCompletionRate,
  generateMonthCalendar,
  MONTH_NAMES_RU,
  DAYS_OF_WEEK_SHORT_RU,
} from '../utils/calculations';

interface HabitDetailModalProps {
  habit: Habit | null;
  todayStr: string;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onToggleDate: (habitId: string, dateStr: string) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  habit,
  todayStr,
  onClose,
  onEdit,
  onDelete,
  onToggleDate,
}) => {
  if (!habit) return null;

  const [currentYear, setCurrentYear] = useState(() => Number(todayStr.split('-')[0]));
  const [currentMonth, setCurrentMonth] = useState(() => Number(todayStr.split('-')[1]));

  const currentStreak = calculateCurrentStreak(habit, todayStr);
  const bestStreak = calculateBestStreak(habit, todayStr);
  const completionRate = calculateCompletionRate(habit, todayStr, 30);

  const calendarDays = generateMonthCalendar(currentYear, currentMonth, habit, todayStr);

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const resetToToday = () => {
    const [y, m] = todayStr.split('-').map(Number);
    setCurrentYear(y);
    setCurrentMonth(m);
  };

  const getScheduleSummary = () => {
    if (habit.schedule.length === 7) return 'Каждый день';
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return habit.schedule.map(d => dayNames[d - 1]).join(', ');
  };

  return (
    <div
      id="habit-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="habit-detail-modal"
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and close */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{
                backgroundColor: `${habit.color}20`,
                border: `2px solid ${habit.color}40`,
              }}
            >
              <span>{habit.emoji || '🎯'}</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-50 leading-tight">
                {habit.title}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Расписание: {getScheduleSummary()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Metric cards (F-4.2, F-4.3, F-4.4) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
          {/* Current Streak */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="flex items-center justify-center space-x-1 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>Серия</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300 font-mono">
              {currentStreak}
            </div>
            <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
              текущая
            </div>
          </div>

          {/* Best Streak */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="flex items-center justify-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Рекорд</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">
              {bestStreak}
            </div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
              лучшая
            </div>
          </div>

          {/* 30-Day Completion Rate */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
            <div className="flex items-center justify-center space-x-1 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-1">
              <Percent className="w-3.5 h-3.5" />
              <span>30 дней</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300 font-mono">
              {completionRate}%
            </div>
            <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80">
              успешность
            </div>
          </div>
        </div>

        {/* Month Calendar Section (F-4.1, F-2.3, F-2.4, F-2.5) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 mb-5">
          {/* Calendar header with navigation */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1.5">
              <CalendarIcon className="w-4 h-4 text-stone-400" />
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {MONTH_NAMES_RU[currentMonth - 1]} {currentYear}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={resetToToday}
                title="Перейти к сегодняшнему дню"
                className="px-2 py-1 text-xs font-medium rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors mr-1"
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Предыдущий месяц"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Следующий месяц"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {DAYS_OF_WEEK_SHORT_RU.map((dayName) => (
              <div
                key={dayName}
                className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 py-1"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((day) => {
              const canClick = !day.isFuture;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  disabled={!canClick}
                  onClick={() => onToggleDate(habit.id, day.dateStr)}
                  title={
                    day.isFuture
                      ? 'Будущая дата (отметка запрещена)'
                      : !day.isScheduled
                      ? `${day.dateStr}: не запланирован по расписанию (нажмите для отметки)`
                      : day.isCompleted
                      ? `${day.dateStr}: выполнено (нажмите чтобы отменить)`
                      : `${day.dateStr}: не выполнено (нажмите чтобы отметить)`
                  }
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all ${
                    !day.isCurrentMonth
                      ? 'opacity-30'
                      : day.isFuture
                      ? 'opacity-30 cursor-not-allowed bg-stone-100/40 dark:bg-stone-900/40 text-stone-400'
                      : day.isCompleted
                      ? 'text-white shadow-xs scale-[0.98]'
                      : day.isScheduled
                      ? 'hover:bg-stone-200/60 dark:hover:bg-stone-700/60 text-stone-700 dark:text-stone-300'
                      : 'border border-dashed border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:bg-stone-200/40'
                  } ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-stone-900 font-bold' : ''}`}
                  style={{
                    backgroundColor: day.isCompleted ? habit.color : undefined,
                  }}
                >
                  <span>{day.dayOfMonth}</span>
                  {day.isCompleted && (
                    <Check className="w-2.5 h-2.5 stroke-[3] text-white -mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-stone-400 dark:text-stone-500 px-1">
            <div className="flex items-center space-x-1.5">
              <span
                className="w-3 h-3 rounded-md"
                style={{ backgroundColor: habit.color }}
              />
              <span>Выполнено</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md border border-dashed border-stone-400" />
              <span>Не по расписанию</span>
            </div>
            <span>Нажмите на день для отметки</span>
          </div>
        </div>

        {/* Action Buttons: Edit and Delete (F-4.5) */}
        <div className="flex items-center space-x-2.5">
          <button
            id="habit-detail-edit-btn"
            type="button"
            onClick={() => onEdit(habit)}
            className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium text-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Редактировать</span>
          </button>

          <button
            id="habit-detail-delete-btn"
            type="button"
            onClick={() => onDelete(habit)}
            className="py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-medium text-sm flex items-center justify-center space-x-2 transition-colors border border-rose-200/60 dark:border-rose-900/60"
          >
            <Trash2 className="w-4 h-4" />
            <span>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  );
};
