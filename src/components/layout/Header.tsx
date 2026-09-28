import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatShortRupiah } from '../../utils/formatters';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  MoreVertical, 
  Wallet,
  ShieldCheck,
  LayoutDashboard,
  CalendarCheck2,
  Receipt,
  Users,
  Plus
} from 'lucide-react';
import { SessionLoggerModal } from '../sessions/SessionLoggerModal';

export const Header: React.FC = () => {
  const { 
    totalUangKas, 
    exportData, 
    importData, 
    resetData, 
    activeTab, 
    setActiveTab, 
    setSelectedSessionId, 
    totalPendingDebt 
  } = useApp();
  
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickSessionModal, setShowQuickSessionModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrandClick = () => {
    setActiveTab('dashboard');
    setSelectedSessionId(null);
  };

  const handleNavClick = (tab: 'dashboard' | 'sessions' | 'expenses' | 'players') => {
    setActiveTab(tab);
    if (tab === 'sessions') {
      setSelectedSessionId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importData(content);
          if (success) {
            alert('✅ Data klub berhasil dipulihkan!');
          } else {
            alert('❌ Format file backup tidak valid.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('Kembalikan semua data ke data contoh bawaan? Perubahan Anda akan direset.')) {
      resetData();
      setShowMenu(false);
    }
  };

  interface HeaderNavItem {
    id: 'dashboard' | 'sessions' | 'expenses' | 'players';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: HeaderNavItem[] = [
    { id: 'dashboard', label: 'Kas', icon: LayoutDashboard },
    { id: 'sessions', label: 'Sesi', icon: CalendarCheck2 },
    { id: 'expenses', label: 'Biaya', icon: Receipt },
    { 
      id: 'players', 
      label: 'Member', 
      icon: Users,
      badge: totalPendingDebt > 0 ? '!' : undefined 
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Clickable Brand Identity */}
          <button
            onClick={handleBrandClick}
            className="flex items-center space-x-3 text-left group transition-transform active:scale-98 cursor-pointer focus:outline-none"
            title="Ke Dashboard Kas"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 via-grainient-darkTeal to-emerald-500 shadow-sm flex items-center justify-center text-white ring-2 ring-emerald-100 flex-shrink-0 group-hover:shadow-md transition">
              {/* Shuttlecock SVG Icon */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="M14.83 14.83 19.07 19.07" />
                <path d="M4.93 19.07 9.17 14.83" />
                <circle cx="12" cy="12" r="4" fill="#BFEFE2" fillOpacity="0.4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-grainient-darkTeal transition">
                Akamsi Ledger
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                Courtside Badminton Ledger
              </p>
            </div>
          </button>

          {/* Center: Desktop Navigation Bar */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60 shadow-xs">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-grainient-darkTeal stroke-[2.5]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Quick Action, Kas Pill & Menu */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Sesi Baru Button on Desktop */}
            <button
              onClick={() => setShowQuickSessionModal(true)}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-grainient-button text-white text-xs font-extrabold shadow-xs hover:opacity-95 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Sesi Baru</span>
            </button>

            {/* Quick Uang Kas Pill (Clickable) */}
            <button
              onClick={handleBrandClick}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
                totalUangKas < 0
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800'
                  : 'bg-gradient-to-r from-grainient-mint/50 to-grainient-cyan/30 hover:from-grainient-mint/70 hover:to-grainient-cyan/50 border-grainient-teal/25 text-slate-700'
              }`}
              title="Lihat Saldo Kas"
            >
              <Wallet className={`w-3.5 h-3.5 ${totalUangKas < 0 ? 'text-rose-600' : 'text-grainient-darkTeal'}`} />
              <span className="hidden sm:inline text-slate-500">Kas:</span>
              <span className={`font-mono ${totalUangKas >= 0 ? 'text-emerald-700 font-extrabold' : 'text-rose-600 font-extrabold'}`}>
                {formatShortRupiah(totalUangKas)}
              </span>
            </button>

            {/* Data Management Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Pengaturan Data"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="font-bold text-slate-900">Manajemen Data</p>
                      <p className="text-[11px] text-slate-500">Cadangan & Pemulihan Kas</p>
                    </div>

                    <button
                      onClick={() => {
                        exportData();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center space-x-2 text-slate-700 transition cursor-pointer font-medium"
                    >
                      <Download className="w-4 h-4 text-grainient-darkTeal" />
                      <span>Download Backup (JSON)</span>
                    </button>

                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center space-x-2 text-slate-700 transition cursor-pointer font-medium"
                    >
                      <Upload className="w-4 h-4 text-sky-600" />
                      <span>Pulihkan dari File JSON</span>
                    </button>

                    <button
                      onClick={handleReset}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 flex items-center space-x-2 text-rose-600 transition cursor-pointer font-medium"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-500" />
                      <span>Reset ke Data Demo</span>
                    </button>

                    <div className="mt-1 pt-1 border-t border-slate-100 px-3 py-1 text-[10px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Disimpan lokal di browser</span>
                    </div>
                  </div>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </div>
      </header>

      {showQuickSessionModal && (
        <SessionLoggerModal onClose={() => setShowQuickSessionModal(false)} />
      )}
    </>
  );
};
