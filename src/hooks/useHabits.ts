import { useState, useEffect, useCallback } from 'react';
import { Habit } from '../types/habit';
import { loadHabitsFromDB, saveHabitsToDB } from '../services/db';
import { formatDate } from '../utils/calculations';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState<string>(() => formatDate(new Date()));

  // Keep todayStr synced if tab remains open past midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const nowStr = formatDate(new Date());
      setTodayStr(prev => (prev !== nowStr ? nowStr : prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const refreshHabits = useCallback(async () => {
    try {
      const loaded = await loadHabitsFromDB();
      setHabits(loaded);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHabits();
  }, [refreshHabits]);

  const persistHabits = async (newHabits: Habit[]) => {
    setHabits(newHabits);
    try {
      await saveHabitsToDB(newHabits);
    } catch (err) {
      console.error('Failed to persist habits:', err);
    }
  };

  const createHabit = async (data: {
    title: string;
    emoji: string;
    color: string;
    schedule: number[];
  }): Promise<Habit> => {
    const newHabit: Habit = {
      id: crypto.randomUUID ? crypto.randomUUID() : `habit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: data.title.trim().slice(0, 40),
      emoji: data.emoji || '🎯',
      color: data.color,
      schedule: data.schedule,
      order: habits.length,
      createdAt: todayStr,
      completions: []
    };

    const updated = [...habits, newHabit];
    await persistHabits(updated);
    return newHabit;
  };

  const updateHabit = async (
    habitId: string,
    updates: Partial<Pick<Habit, 'title' | 'emoji' | 'color' | 'schedule'>>
  ) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          ...updates,
          title: updates.title !== undefined ? updates.title.trim().slice(0, 40) : h.title
        };
      }
      return h;
    });
    await persistHabits(updated);
  };

  const deleteHabit = async (habitId: string) => {
    const updated = habits
      .filter(h => h.id !== habitId)
      .map((h, i) => ({ ...h, order: i }));
    await persistHabits(updated);
  };

  const toggleCompletion = async (habitId: string, targetDateStr: string = todayStr) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const has = h.completions.includes(targetDateStr);
        const newCompletions = has
          ? h.completions.filter(d => d !== targetDateStr)
          : [...h.completions, targetDateStr];
        return {
          ...h,
          completions: newCompletions.sort()
        };
      }
      return h;
    });
    await persistHabits(updated);
  };

  const moveHabit = async (habitId: string, direction: 'up' | 'down') => {
    const index = habits.findIndex(h => h.id === habitId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= habits.length) return;

    const copy = [...habits];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    const reordered = copy.map((h, idx) => ({ ...h, order: idx }));
    await persistHabits(reordered);
  };

  const reorderHabits = async (startIndex: number, endIndex: number) => {
    if (startIndex === endIndex) return;
    const copy = [...habits];
    const [moved] = copy.splice(startIndex, 1);
    copy.splice(endIndex, 0, moved);

    const reordered = copy.map((h, idx) => ({ ...h, order: idx }));
    await persistHabits(reordered);
  };

  return {
    habits,
    loading,
    todayStr,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    moveHabit,
    reorderHabits,
    refreshHabits
  };
}
