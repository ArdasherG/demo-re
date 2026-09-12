import React, { useState, useRef } from 'react';
import { X, Download, Upload, AlertCircle, CheckCircle2, FileJson } from 'lucide-react';
import { exportBackupJson, importBackupJson } from '../services/db';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => Promise<void>;
  habitsCount: number;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
  habitsCount,
}) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const json = await exportBackupJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `habit-tracker-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Данные успешно экспортированы');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Ошибка при экспорте данных');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.habits)) {
          setError('Неверный формат резервной копии. Требуется версия 1.');
          return;
        }
        setPendingContent(content);
        setShowConfirm(true);
      } catch (err) {
        setError('Не удалось прочитать JSON файл');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!pendingContent) return;
    setImporting(true);
    setError(null);

    try {
      const res = await importBackupJson(pendingContent);
      if (res.success) {
        await onDataImported();
        setShowConfirm(false);
        setPendingContent(null);
        setSuccess(`Успешно восстановлено ${res.habits?.length ?? 0} привычек`);
        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 1500);
      } else {
        setError(res.error || 'Ошибка импорта');
      }
    } catch (err: any) {
      setError(err?.message || 'Ошибка импорта данных');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      id="backup-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="backup-modal"
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50">
                Резервное копирование
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Локальные данные устройства ({habitsCount} привычек)
              </p>
            </div>
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

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {!showConfirm ? (
          <div className="space-y-4">
            {/* Export block */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">
                Экспорт данных
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
                Сохраните файл со всеми привычками и историей отметок на ваш компьютер или телефон.
              </p>
              <button
                id="export-json-btn"
                type="button"
                onClick={handleExport}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-xs transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Скачать JSON файл</span>
              </button>
            </div>

            {/* Import block */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">
                Импорт данных
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
                Восстановите привычки из сохранённого ранее JSON файла.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                id="import-json-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-200/80 dark:bg-stone-700/80 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Выбрать файл для загрузки</span>
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation dialog for F-5.3 */
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-fade-in">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-2">
              Подтвердите замену данных
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mb-4 leading-relaxed">
              Импорт файла полностью заменит текущий список привычек и их историю. Это действие нельзя будет отменить.
            </p>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setPendingContent(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium"
              >
                Отмена
              </button>
              <button
                id="confirm-import-btn"
                type="button"
                disabled={importing}
                onClick={handleConfirmImport}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {importing ? 'Загрузка...' : 'Заменить данные'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
