import React from 'react';
import { Plus, Sun, Moon, Laptop, Database, WifiOff, Activity, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-stone-50/80 dark:bg-stone-950/85 border-b border-stone-200/60 dark:border-stone-800/80 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-3 sm:py-3.5">
        {/* Top utility row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Holographic / Tech icon badge */}
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20">
                <Activity className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-white dark:ring-stone-950"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 font-display">
                  HABIT<span className="text-blue-600 dark:text-blue-400 font-normal ml-0.5">TRACKER</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold uppercase bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                  SYSTEM ACTIVE
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 capitalize mt-0.5 flex items-center space-x-1.5">
                <span>{formatFullRussianDate(todayStr)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {isOffline && (
              <div
                id="offline-indicator"
                className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300"
                title="Офлайн-режим активен"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px] font-semibold">ОФЛАЙН</span>
              </div>
            )}

            {/* Backup/Restore HUD button */}
            <button
              id="header-backup-btn"
              type="button"
              onClick={onOpenBackup}
              aria-label="Резервное копирование и экспорт"
              title="Резервное копирование и экспорт данных"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/80 border border-stone-200/70 dark:border-stone-800 transition-all active:scale-95"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Theme Toggle HUD button */}
            <button
              id="header-theme-toggle-btn"
              type="button"
              onClick={onToggleTheme}
              aria-label="Переключить тему"
              title={`Тема: ${theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Системная'}`}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/80 border border-stone-200/70 dark:border-stone-800 transition-all active:scale-95"
            >
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-cyan-400" />}
              {theme === 'system' && <Laptop className="w-4 h-4" />}
            </button>

            {/* Add Habit Button */}
            <button
              id="header-add-habit-btn"
              type="button"
              onClick={onOpenNewHabit}
              disabled={habitsCount >= MAX_HABITS}
              className={`h-9 px-3 sm:px-3.5 rounded-xl flex items-center space-x-1.5 font-semibold text-xs transition-all shadow-sm ${
                habitsCount >= MAX_HABITS
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed border border-stone-300 dark:border-stone-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 active:scale-95 ring-1 ring-white/20'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Новая</span>
              <span className="px-1 py-0.2 rounded bg-black/20 text-[10px] font-mono">
                {habitsCount}/{MAX_HABITS}
              </span>
            </button>
          </div>
        </div>

        {/* Progress summary block with futuristic HUD telemetry (F-3.1) */}
        {totalScheduledCount > 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-stone-900/70 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 p-3 sm:p-3.5 shadow-xs">
            {/* Subtle high-tech ambient light top bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 opacity-80"
            />

            <div className="flex items-center justify-between text-xs font-medium mb-2">
              <div className="flex items-center space-x-1.5 text-stone-600 dark:text-stone-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Телеметрия дня
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                  {completedCount}/{totalScheduledCount} задач
                </span>
                <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 border border-blue-200/60 dark:border-blue-900/60">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Glowing segmented progress bar */}
            <div className="relative w-full h-2 rounded-full bg-stone-100 dark:bg-stone-950/80 p-0.5 overflow-hidden border border-stone-200/50 dark:border-stone-800/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 transition-all duration-500 ease-out relative shadow-sm shadow-blue-500/30"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse-glow" />
              </div>
            </div>
          </div>
        ) : habitsCount > 0 ? (
          <div className="text-xs text-stone-500 dark:text-stone-400 bg-stone-100/50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/60 rounded-xl px-3 py-2 text-center font-mono">
            // Расписание: на сегодня привычек не запланировано
          </div>
        ) : null}
      </div>
    </header>
  );
};
