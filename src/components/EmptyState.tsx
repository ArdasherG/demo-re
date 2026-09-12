import React from 'react';
import { Plus, Sparkles, CheckCircle2 } from 'lucide-react';

interface EmptyStateProps {
  onAddHabit: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddHabit }) => {
  return (
    <div
      id="empty-habits-state"
      className="text-center py-12 px-4 max-w-sm mx-auto flex flex-col items-center animate-fade-in"
    >
      <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-inner">
        <Sparkles className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">
        Начните с малого
      </h2>

      <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
        Добавьте привычку, которую хотите развивать каждый день. Например, читать 20 страниц, пить воду или делать зарядку.
      </p>

      <button
        id="empty-state-add-btn"
        type="button"
        onClick={onAddHabit}
        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>Добавить привычку</span>
      </button>

      <div className="mt-8 grid grid-cols-2 gap-2 text-left w-full">
        <div className="p-2.5 rounded-xl bg-stone-100/60 dark:bg-stone-900/40 text-xs text-stone-500 dark:text-stone-400 flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>Отмечайте прогресс одним касанием</span>
        </div>
        <div className="p-2.5 rounded-xl bg-stone-100/60 dark:bg-stone-900/40 text-xs text-stone-500 dark:text-stone-400 flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>Сохраняйте серии и наблюдайте рост</span>
        </div>
      </div>
    </div>
  );
};
