import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!installPrompt || isDismissed) return null;

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-grainient-teal/40 bg-white/95 backdrop-blur-xl shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-grainient-button text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Download className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 leading-tight truncate">
              Pasang Akamsi Ledger
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              Akses cepat offline dari layar utama HP
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-grainient-button text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition cursor-pointer"
          >
            Pasang
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
