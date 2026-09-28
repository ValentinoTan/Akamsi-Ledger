import React, { useState, useEffect } from 'react';
import { Download, X, Share2, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode (already installed)
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsStandalone(checkStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Don't show if already running as an installed PWA or dismissed
  if (isStandalone || isDismissed) return null;

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // Only show if install prompt is available OR if on mobile iOS browser
  if (!installPrompt && !isIOS) return null;

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-grainient-teal/40 bg-white/95 backdrop-blur-xl shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-grainient-button text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              {isIOS ? (
                <Smartphone className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Download className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 leading-tight truncate">
                Pasang Akamsi Ledger
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {isIOS ? 'Tambahkan ke Layar Utama iPhone' : 'Akses cepat offline seperti aplikasi HP'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-grainient-button text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition cursor-pointer"
            >
              {isIOS ? 'Cara Pasang' : 'Pasang'}
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

      {/* iOS Step-by-Step Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-grainient-darkTeal flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Cara Pasang di iPhone / iPad
                </h4>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  1
                </span>
                <p>
                  Buka website ini menggunakan browser <strong>Safari</strong> bawaan iPhone.
                </p>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  2
                </span>
                <p className="flex items-center gap-1.5 flex-wrap">
                  Ketuk tombol <strong>Bagikan / Share</strong>
                  <span className="inline-flex p-1 bg-slate-100 rounded border border-slate-300">
                    <Share2 className="w-3 h-3 text-sky-600" />
                  </span>
                  di bagian bawah layar.
                </p>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  3
                </span>
                <p>
                  Gulir ke bawah lalu pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-grainient-button text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
