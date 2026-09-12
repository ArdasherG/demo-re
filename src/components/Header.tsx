import React from 'react';
import { Plus, Sun, Moon, Laptop, Database, WifiOff } from 'lucide-react';
import { formatFullRussianDate } from '../utils/calculations';
import { Theme } from '../hooks/useTheme';
import { MAX_HABITS } from '../types/habit';

interface HeaderProps {
  todayStr: string;
  completedCount: number;
  totalScheduledCount: number;
  habitsCount: number;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenNewHabit: () => void;
  onOpenBackup: () => void;
  isOffline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  todayStr,
  completedCount,
  totalScheduledCount,
  habitsCount,
  theme,
  onToggleTheme,
  onOpenNewHabit,
  onOpenBackup,
  isOffline,
}) => {
  const progressPercent = totalScheduledCount > 0
    ? Math.round((completedCount / totalScheduledCount) * 100)
    : 0;

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-stone-50/90 dark:bg-stone-950/90 border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4">
        {/* Top utility row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 font-bold text-base">
              ✓
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-none">
                Habit Tracker
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 capitalize mt-0.5">
                {formatFullRussianDate(todayStr)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {isOffline && (
              <div
                id="offline-indicator"
                className="flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                title="Офлайн-режим активен"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Офлайн</span>
              </div>
            )}

            {/* Backup/Restore */}
            <button
              id="header-backup-btn"
              type="button"
              onClick={onOpenBackup}
              aria-label="Резервное копирование и экспорт"
              title="Резервное копирование и экспорт"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              id="header-theme-toggle-btn"
              type="button"
              onClick={onToggleTheme}
              aria-label="Переключить тему"
              title={`Тема: ${theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Системная'}`}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            >
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-blue-400" />}
              {theme === 'system' && <Laptop className="w-4 h-4" />}
            </button>

            {/* Add Habit Button */}
            <button
              id="header-add-habit-btn"
              type="button"
              onClick={onOpenNewHabit}
              disabled={habitsCount >= MAX_HABITS}
              className={`h-10 px-3 sm:px-4 rounded-xl flex items-center space-x-1.5 font-medium text-sm transition-all shadow-sm ${
                habitsCount >= MAX_HABITS
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-95'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Привычка</span>
              <span className="text-xs opacity-75 font-mono">
                {habitsCount}/{MAX_HABITS}
              </span>
            </button>
          </div>
        </div>

        {/* Progress summary block (F-3.1) */}
        {totalScheduledCount > 0 ? (
          <div className="bg-stone-100/80 dark:bg-stone-900/70 border border-stone-200/60 dark:border-stone-800/60 rounded-2xl p-3 sm:p-3.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-1.5">
              <span className="text-stone-600 dark:text-stone-400">
                Прогресс на сегодня
              </span>
              <span className="text-stone-900 dark:text-stone-100 font-semibold font-mono">
                Выполнено {completedCount} из {totalScheduledCount} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-200/80 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : habitsCount > 0 ? (
          <div className="text-xs text-stone-500 dark:text-stone-400 bg-stone-100/60 dark:bg-stone-900/40 rounded-xl px-3 py-2 text-center">
            На сегодня нет запланированных привычек
          </div>
        ) : null}
      </div>
    </header>
  );
};
