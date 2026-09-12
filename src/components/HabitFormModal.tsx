import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Habit, PALETTE_COLORS, POPULAR_EMOJIS, DAYS_OF_WEEK } from '../types/habit';

interface HabitFormModalProps {
  isOpen: boolean;
  initialHabit?: Habit | null;
  existingHabits: Habit[];
  onClose: () => void;
  onSave: (data: {
    title: string;
    emoji: string;
    color: string;
    schedule: number[];
  }) => Promise<void>;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  initialHabit,
  existingHabits,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialHabit;

  // Find first unused color from palette as default
  const getDefaultColor = () => {
    const usedColors = new Set(existingHabits.map(h => h.color));
    const firstFree = PALETTE_COLORS.find(c => !usedColors.has(c.hex));
    return firstFree ? firstFree.hex : PALETTE_COLORS[0].hex;
  };

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState(getDefaultColor);
  const [isDaily, setIsDaily] = useState(true);
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialHabit) {
        setTitle(initialHabit.title);
        setEmoji(initialHabit.emoji);
        setColor(initialHabit.color);
        const allDays = initialHabit.schedule.length === 7;
        setIsDaily(allDays);
        setScheduleDays(initialHabit.schedule);
      } else {
        setTitle('');
        setEmoji('🎯');
        setColor(getDefaultColor());
        setIsDaily(true);
        setScheduleDays([1, 2, 3, 4, 5, 6, 7]);
      }
      setError(null);
    }
  }, [isOpen, initialHabit]);

  if (!isOpen) return null;

  const toggleDay = (dayIso: number) => {
    let next: number[];
    if (scheduleDays.includes(dayIso)) {
      if (scheduleDays.length === 1) {
        setError('Выберите хотя бы один день недели');
        return;
      }
      next = scheduleDays.filter(d => d !== dayIso);
    } else {
      next = [...scheduleDays, dayIso].sort();
    }
    setError(null);
    setScheduleDays(next);
    setIsDaily(next.length === 7);
  };

  const handleSelectDaily = (daily: boolean) => {
    setIsDaily(daily);
    if (daily) {
      setScheduleDays([1, 2, 3, 4, 5, 6, 7]);
    } else if (scheduleDays.length === 7) {
      // Default to weekdays when switching to custom
      setScheduleDays([1, 2, 3, 4, 5]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError('Введите название привычки');
      return;
    }
    if (cleanTitle.length > 40) {
      setError('Название должно быть не более 40 символов');
      return;
    }
    if (scheduleDays.length === 0) {
      setError('Выберите хотя бы один день расписания');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: cleanTitle,
        emoji: emoji.trim() || '🎯',
        color,
        schedule: scheduleDays,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="habit-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="habit-form-modal"
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-50">
            {isEditing ? 'Редактировать привычку' : 'Новая привычка'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & Emoji preview */}
          <div>
            <label
              htmlFor="habit-title-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
            >
              Название привычки
            </label>
            <div className="flex items-center space-x-2">
              {/* Selected Emoji display */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-stone-200 dark:border-stone-700"
                style={{ backgroundColor: `${color}18` }}
              >
                <span>{emoji}</span>
              </div>

              <div className="relative flex-1">
                <input
                  id="habit-title-input"
                  type="text"
                  maxLength={40}
                  placeholder="Например, Читать 20 страниц"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-3.5 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-50 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-stone-400"
                  autoFocus
                />
                <span className="absolute right-3 top-3 text-[11px] font-mono text-stone-400">
                  {title.length}/40
                </span>
              </div>
            </div>
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Иконка
            </label>
            <div className="grid grid-cols-8 gap-1.5 p-2 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
              {POPULAR_EMOJIS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEmoji(item)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    emoji === item
                      ? 'bg-white dark:bg-stone-700 shadow-xs scale-110'
                      : 'hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette (8 colors - F-1.1) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Цвет
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PALETTE_COLORS.map((item) => {
                const isSelected = color === item.hex;
                return (
                  <button
                    key={item.hex}
                    type="button"
                    onClick={() => setColor(item.hex)}
                    title={item.name}
                    aria-label={`Выбрать цвет ${item.name}`}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: item.hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency (F-1.2) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Частота выполнения
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <button
                type="button"
                onClick={() => handleSelectDaily(true)}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                  isDaily
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                Каждый день
              </button>
              <button
                type="button"
                onClick={() => handleSelectDaily(false)}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                  !isDaily
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                Выбранные дни недели
              </button>
            </div>

            {/* Days of week chips */}
            {!isDaily && (
              <div className="flex items-center justify-between gap-1 pt-1 animate-fade-in">
                {DAYS_OF_WEEK.map((day) => {
                  const active = scheduleDays.includes(day.iso);
                  return (
                    <button
                      key={day.iso}
                      type="button"
                      onClick={() => toggleDay(day.iso)}
                      className={`w-10 h-10 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                      title={day.full}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium text-sm transition-colors"
            >
              Отмена
            </button>
            <button
              id="habit-form-save-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
