import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Habit } from '../types/habit';

interface ConfirmDeleteModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (habitId: string) => Promise<void>;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  habit,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !habit) return null;

  return (
    <div
      id="confirm-delete-modal-backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="confirm-delete-modal"
        className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50 mb-1.5">
          Удалить привычку?
        </h3>

        <p className="text-sm text-stone-500 dark:text-stone-400 mb-5 leading-relaxed">
          Привычка <span className="font-semibold text-stone-800 dark:text-stone-200">«{habit.title}»</span> и вся её история отметок ({habit.completions.length} дней) будут удалены безвозвратно.
        </p>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium text-sm transition-colors"
          >
            Отмена
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            onClick={() => onConfirm(habit.id)}
            className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-medium text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  );
};
