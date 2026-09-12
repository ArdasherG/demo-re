import { openDB, IDBPDatabase } from 'idb';
import { Habit, HabitStoreData } from '../types/habit';

const DB_NAME = 'habit_tracker_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const DATA_KEY = 'habits_data';

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

/**
 * Load all habits from IndexedDB
 */
export async function loadHabitsFromDB(): Promise<Habit[]> {
  try {
    const db = await getDB();
    const data = await db.get(STORE_NAME, DATA_KEY) as HabitStoreData | undefined;
    if (data && Array.isArray(data.habits)) {
      // Sort by order
      return data.habits.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return [];
  } catch (error) {
    console.error('Failed to read from IndexedDB:', error);
    return [];
  }
}

/**
 * Save habits immediately to IndexedDB
 */
export async function saveHabitsToDB(habits: Habit[]): Promise<void> {
  try {
    const db = await getDB();
    const data: HabitStoreData = {
      version: 1,
      habits: habits.map((h, idx) => ({
        ...h,
        order: idx,
        // ensure completions are unique and sorted
        completions: Array.from(new Set(h.completions)).sort()
      }))
    };
    await db.put(STORE_NAME, data, DATA_KEY);
  } catch (error) {
    console.error('Failed to write to IndexedDB:', error);
    throw error;
  }
}

/**
 * Export full JSON data
 */
export async function exportBackupJson(): Promise<string> {
  const habits = await loadHabitsFromDB();
  const data: HabitStoreData = {
    version: 1,
    habits
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Import JSON backup, validating structure
 */
export async function importBackupJson(jsonString: string): Promise<{ success: boolean; habits?: Habit[]; error?: string }> {
  try {
    const parsed = JSON.parse(jsonString) as HabitStoreData;

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Неверный формат JSON файла' };
    }

    if (parsed.version !== 1) {
      return { success: false, error: `Неподдерживаемая версия схемы: ${parsed.version}` };
    }

    if (!Array.isArray(parsed.habits)) {
      return { success: false, error: 'Список привычек отсутствует или имеет неверный формат' };
    }

    // Validate habits array
    const validHabits: Habit[] = [];
    for (const h of parsed.habits) {
      if (!h.id || typeof h.title !== 'string' || !h.title.trim()) {
        continue;
      }
      validHabits.push({
        id: String(h.id),
        title: h.title.trim().slice(0, 40),
        emoji: h.emoji || '🎯',
        color: h.color || '#3B82F6',
        schedule: Array.isArray(h.schedule) && h.schedule.length > 0 ? h.schedule : [1, 2, 3, 4, 5, 6, 7],
        order: typeof h.order === 'number' ? h.order : validHabits.length,
        createdAt: h.createdAt || new Date().toISOString().split('T')[0],
        completions: Array.isArray(h.completions)
          ? Array.from(new Set(h.completions.filter(c => typeof c === 'string'))).sort()
          : []
      });
    }

    // Limit to 20 habits max
    const trimmed = validHabits.slice(0, 20).map((h, i) => ({ ...h, order: i }));

    await saveHabitsToDB(trimmed);
    return { success: true, habits: trimmed };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Ошибка парсинга JSON файла' };
  }
}
