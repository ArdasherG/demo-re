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
    if (num % 10 === 1 && num % 100 !== 11) return `${num} день`;
    if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return `${num} дня`;
    return `${num} дней`;
  };

  return (
    <div
      id={`habit-card-${habit.id}`}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, habit.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, habit.id)}
      onClick={() => onClick(habit)}
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        completed
          ? 'bg-stone-100/70 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-800/40 opacity-75'
          : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700'
      }`}
    >
      {/* Left side: Reorder handles + Color badge + Emoji + Info */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
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
            className="w-5 h-4 flex items-center justify-center hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <GripVertical className="w-3.5 h-3.5 cursor-grab active:cursor-grabbing opacity-50" />
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMoveDown(habit.id)}
            aria-label="Переместить привычку ниже"
            className="w-5 h-4 flex items-center justify-center hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Color Pill & Emoji */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-105 select-none shadow-xs"
          style={{
            backgroundColor: `${habit.color}18`,
            border: `1.5px solid ${habit.color}40`,
          }}
        >
          <span>{habit.emoji || '🎯'}</span>
        </div>

        {/* Title & Streak */}
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h3
              className={`text-sm sm:text-base font-semibold truncate transition-colors ${
                completed
                  ? 'line-through text-stone-400 dark:text-stone-500'
                  : 'text-stone-800 dark:text-stone-100'
              }`}
            >
              {habit.title}
            </h3>
          </div>

          <div className="flex items-center space-x-2 mt-0.5">
            <span
              className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                currentStreak > 0
                  ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
              }`}
            >
              <Flame
                className={`w-3 h-3 ${
                  currentStreak > 0 ? 'text-amber-500 fill-amber-500' : 'text-stone-400'
                }`}
              />
              <span>{getStreakLabel(currentStreak)}</span>
            </span>

            {/* Schedule indicator if not daily */}
            {habit.schedule.length < 7 && (
              <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden sm:inline">
                {habit.schedule.length} дн/нед
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Checkbox button with min 44x44px target (N-6) */}
      <div className="shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
        <button
          id={`habit-check-btn-${habit.id}`}
          type="button"
          onClick={() => onToggle(habit.id)}
          aria-label={completed ? `Снять отметку с ${habit.title}` : `Отметить ${habit.title} как выполненную`}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
            completed
              ? 'text-white shadow-md'
              : 'border-2 border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 bg-stone-50/50 dark:bg-stone-800/40 text-transparent'
          }`}
          style={{
            backgroundColor: completed ? habit.color : undefined,
            borderColor: completed ? habit.color : undefined,
            boxShadow: completed ? `0 4px 12px ${habit.color}40` : undefined,
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
