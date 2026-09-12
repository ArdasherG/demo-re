import React from 'react';
import { Check, Flame, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { Habit } from '../types/habit';
import { calculateCurrentStreak, isCompleted } from '../utils/calculations';

interface HabitCardProps {
  habit: Habit;
  todayStr: string;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (habitId: string) => void;
  onClick: (habit: Habit) => void;
  onMoveUp: (habitId: string) => void;
  onMoveDown: (habitId: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, habitId: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  todayStr,
  isFirst,
  isLast,
  onToggle,
  onClick,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const completed = isCompleted(habit, todayStr);
  const currentStreak = calculateCurrentStreak(habit, todayStr);

  const getStreakLabel = (num: number) => {
    if (num % 10 === 1 && num % 100 !== 11) return `${num} дн.`;
    if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return `${num} дн.`;
    return `${num} дн.`;
  };

  return (
    <div
      id={`habit-card-${habit.id}`}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, habit.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, habit.id)}
      onClick={() => onClick(habit)}
      className={`group relative flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        completed
          ? 'bg-stone-100/50 dark:bg-stone-900/30 border-stone-200/40 dark:border-stone-800/40 opacity-70'
          : 'bg-white/90 dark:bg-stone-900/80 backdrop-blur-md border-stone-200/80 dark:border-stone-800/90 shadow-xs hover:shadow-md hover:border-blue-500/40 dark:hover:border-cyan-500/30'
      }`}
    >
      {/* Dynamic colored edge indicator (Tech blade) */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-opacity"
        style={{
          backgroundColor: habit.color,
          opacity: completed ? 0.3 : 0.9,
          boxShadow: completed ? 'none' : `0 0 8px ${habit.color}80`,
        }}
      />

      {/* Left side: Reorder handles + Color badge + Emoji + Info */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2 pl-1.5">
        {/* Reorder controls */}
        <div
          className="flex flex-col items-center justify-center -ml-1 text-stone-300 dark:text-stone-600 group-hover:text-stone-400 dark:group-hover:text-stone-500 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMoveUp(habit.id)}
            aria-label="Переместить привычку выше"
            className="w-5 h-4 flex items-center justify-center hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-10 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <GripVertical className="w-3.5 h-3.5 cursor-grab active:cursor-grabbing opacity-40" />
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMoveDown(habit.id)}
            aria-label="Переместить привычку ниже"
            className="w-5 h-4 flex items-center justify-center hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-10 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Color Pill & Emoji with cyber bevel */}
        <div
          className="relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-105 select-none shadow-xs border"
          style={{
            backgroundColor: `${habit.color}15`,
            borderColor: `${habit.color}35`,
          }}
        >
          <span>{habit.emoji || '🎯'}</span>
          {completed && (
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-stone-900"
              style={{ backgroundColor: habit.color }}
            >
              <Check className="w-2 h-2 text-white stroke-[3]" />
            </span>
          )}
        </div>

        {/* Title & Telemetry info */}
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h3
              className={`text-sm sm:text-base font-semibold truncate transition-colors ${
                completed
                  ? 'line-through text-stone-400 dark:text-stone-500'
                  : 'text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-cyan-300'
              }`}
            >
              {habit.title}
            </h3>
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <span
              className={`inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded-md border transition-colors ${
                currentStreak > 0
                  ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  : 'bg-stone-100 dark:bg-stone-800/60 text-stone-400 border-stone-200/60 dark:border-stone-800'
              }`}
            >
              <Flame
                className={`w-3 h-3 ${
                  currentStreak > 0 ? 'text-amber-500 fill-amber-500' : 'text-stone-400'
                }`}
              />
              <span className="font-semibold">{getStreakLabel(currentStreak)}</span>
            </span>

            {/* Schedule indicator if not daily */}
            {habit.schedule.length < 7 ? (
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500 px-1.5 py-0.5 rounded bg-stone-100/70 dark:bg-stone-800/40 border border-stone-200/50 dark:border-stone-800">
                {habit.schedule.length} ДН/НЕД
              </span>
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400/80 dark:text-stone-500/80 hidden sm:inline">
                ЕЖЕДНЕВНО
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Futuristic Checkbox button with min 44x44px target (N-6) */}
      <div className="shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
        <button
          id={`habit-check-btn-${habit.id}`}
          type="button"
          onClick={() => onToggle(habit.id)}
          aria-label={completed ? `Снять отметку с ${habit.title}` : `Отметить ${habit.title} как выполненную`}
          className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
            completed
              ? 'text-white shadow-md'
              : 'border-2 border-stone-300/80 dark:border-stone-700/80 hover:border-blue-500/80 dark:hover:border-cyan-400/80 bg-stone-50/50 dark:bg-stone-800/40 text-transparent'
          }`}
          style={{
            backgroundColor: completed ? habit.color : undefined,
            borderColor: completed ? habit.color : undefined,
            boxShadow: completed ? `0 0 16px ${habit.color}50` : undefined,
          }}
        >
          <Check
            className={`w-6 h-6 stroke-[2.5] transition-transform duration-200 ${
              completed ? 'scale-100 text-white' : 'scale-75 opacity-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
