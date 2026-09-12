import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { HabitCard } from './components/HabitCard';
import { EmptyState } from './components/EmptyState';
import { HabitFormModal } from './components/HabitFormModal';
import { HabitDetailModal } from './components/HabitDetailModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { BackupModal } from './components/BackupModal';
import { InstallPrompt } from './components/InstallPrompt';
import { useHabits } from './hooks/useHabits';
import { useTheme } from './hooks/useTheme';
import { Habit, MAX_HABITS } from './types/habit';
import { isDateScheduled, isCompleted } from './utils/calculations';
import { Plus, ListFilter, CalendarCheck } from 'lucide-react';

export const App: React.FC = () => {
  const {
    habits,
    loading,
    todayStr,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    moveHabit,
    reorderHabits,
    refreshHabits,
  } = useHabits();

  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Drag and drop state
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);

  // Keep offline status updated
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update selectedHabitForDetail whenever habits list updates
  useEffect(() => {
    if (selectedHabitForDetail) {
      const updated = habits.find(h => h.id === selectedHabitForDetail.id);
      if (updated) {
        setSelectedHabitForDetail(updated);
      } else {
        setSelectedHabitForDetail(null);
      }
    }
  }, [habits, selectedHabitForDetail?.id]);

  // Habits scheduled for today
  const scheduledTodayHabits = useMemo(() => {
    return habits.filter(h => isDateScheduled(h, todayStr));
  }, [habits, todayStr]);

  const completedTodayCount = useMemo(() => {
    return scheduledTodayHabits.filter(h => isCompleted(h, todayStr)).length;
  }, [scheduledTodayHabits, todayStr]);

  // For "today" view: Sort uncompleted first, then completed sink to the bottom (F-3.3)
  const displayHabits = useMemo(() => {
    if (activeTab === 'all') {
      return [...habits].sort((a, b) => a.order - b.order);
    }

    // "today" view
    const uncompleted: Habit[] = [];
    const completed: Habit[] = [];

    for (const h of scheduledTodayHabits) {
      if (isCompleted(h, todayStr)) {
        completed.push(h);
      } else {
        uncompleted.push(h);
      }
    }

    return [...uncompleted, ...completed];
  }, [habits, scheduledTodayHabits, activeTab, todayStr]);

  const handleToggleToday = async (habitId: string) => {
    const target = habits.find(h => h.id === habitId);
    const wasCompleted = target ? isCompleted(target, todayStr) : false;

    await toggleCompletion(habitId, todayStr);

    // If this completion finishes all scheduled habits for today, celebrate with confetti!
    if (!wasCompleted && scheduledTodayHabits.length > 0 && completedTodayCount + 1 === scheduledTodayHabits.length) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E']
      });
    }
  };

  const handleTogglePastDate = async (habitId: string, dateStr: string) => {
    await toggleCompletion(habitId, dateStr);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, habitId: string) => {
    e.dataTransfer.setData('text/plain', habitId);
    setDraggedHabitId(habitId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetHabitId: string) => {
    e.preventDefault();
    const sourceId = draggedHabitId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetHabitId) return;

    const sourceIdx = habits.findIndex(h => h.id === sourceId);
    const targetIdx = habits.findIndex(h => h.id === targetHabitId);
    if (sourceIdx !== -1 && targetIdx !== -1) {
      await reorderHabits(sourceIdx, targetIdx);
    }
    setDraggedHabitId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans pb-16 transition-colors bg-tech-grid relative">
      {/* Subtle ambient light glow on top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-36 bg-blue-500/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <Header
        todayStr={todayStr}
        completedCount={completedTodayCount}
        totalScheduledCount={scheduledTodayHabits.length}
        habitsCount={habits.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenNewHabit={() => {
          setHabitToEdit(null);
          setIsFormOpen(true);
        }}
        onOpenBackup={() => setIsBackupOpen(true)}
        isOffline={isOffline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-3 sm:pt-5 z-10">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3 shadow-sm" />
            <p className="text-xs font-mono tracking-wider uppercase">ИНИЦИАЛИЗАЦИЯ ДАННЫХ...</p>
          </div>
        ) : habits.length === 0 ? (
          /* Empty state for initial launch (C-1, F-3.4) */
          <EmptyState
            onAddHabit={() => {
              setHabitToEdit(null);
              setIsFormOpen(true);
            }}
          />
        ) : (
          <div>
            {/* View Switcher: "На сегодня" vs "Все привычки" */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center p-1 bg-stone-200/60 dark:bg-stone-900/80 backdrop-blur-md rounded-xl border border-stone-200/60 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('today')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'today'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-xs border border-stone-200/40 dark:border-stone-700/60'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                  <span>На сегодня</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300">
                    {scheduledTodayHabits.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-xs border border-stone-200/40 dark:border-stone-700/60'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Все привычки</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300">
                    {habits.length}
                  </span>
                </button>
              </div>

              {habits.length < MAX_HABITS && (
                <button
                  type="button"
                  onClick={() => {
                    setHabitToEdit(null);
                    setIsFormOpen(true);
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Добавить</span>
                </button>
              )}
            </div>

            {/* List of Habits */}
            {displayHabits.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 p-6 bg-white/40 dark:bg-stone-900/20 backdrop-blur-xs">
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-2 font-mono">
                  {activeTab === 'today'
                    ? '// На сегодня нет запланированных привычек'
                    : '// Список привычек пуст'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  Посмотреть все привычки
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {displayHabits.map((habit, idx) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    todayStr={todayStr}
                    isFirst={idx === 0}
                    isLast={idx === displayHabits.length - 1}
                    onToggle={handleToggleToday}
                    onClick={(h) => setSelectedHabitForDetail(h)}
                    onMoveUp={(id) => moveHabit(id, 'up')}
                    onMoveDown={(id) => moveHabit(id, 'down')}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Habit Detail & Statistics Modal (F-4) */}
      <HabitDetailModal
        habit={selectedHabitForDetail}
        todayStr={todayStr}
        onClose={() => setSelectedHabitForDetail(null)}
        onEdit={(h) => {
          setSelectedHabitForDetail(null);
          setHabitToEdit(h);
          setIsFormOpen(true);
        }}
        onDelete={(h) => {
          setSelectedHabitForDetail(null);
          setHabitToDelete(h);
        }}
        onToggleDate={handleTogglePastDate}
      />

      {/* Create / Edit Habit Modal (F-1) */}
      <HabitFormModal
        isOpen={isFormOpen}
        initialHabit={habitToEdit}
        existingHabits={habits}
        onClose={() => {
          setIsFormOpen(false);
          setHabitToEdit(null);
        }}
        onSave={async (data) => {
          if (habitToEdit) {
            await updateHabit(habitToEdit.id, data);
          } else {
            await createHabit(data);
          }
        }}
      />

      {/* Confirm Delete Modal (F-1.4) */}
      <ConfirmDeleteModal
        isOpen={!!habitToDelete}
        habit={habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirm={async (id) => {
          await deleteHabit(id);
          setHabitToDelete(null);
        }}
      />

      {/* Backup and Restore Modal (F-5) */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataImported={refreshHabits}
        habitsCount={habits.length}
      />

      {/* PWA Install Banner */}
      <InstallPrompt />
    </div>
  );
};
