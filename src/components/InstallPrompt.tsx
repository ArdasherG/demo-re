import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div
      id="pwa-install-banner"
      className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 bg-stone-900 text-stone-100 dark:bg-stone-800 dark:text-stone-100 p-3.5 rounded-2xl shadow-xl border border-stone-700/80 flex items-center justify-between space-x-3 animate-fade-in"
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
          <Download className="w-4 h-4" />
        </div>
        <div className="text-xs truncate">
          <p className="font-semibold">Установить Habit Tracker</p>
          <p className="text-stone-400 text-[11px] truncate">
            Быстрый запуск и работа без интернета
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          Установить
        </button>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-200"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
