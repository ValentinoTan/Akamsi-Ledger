import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { 
  Clock, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';

export const StatCards: React.FC = () => {
  const { 
    totalUangKas, 
    totalIncome, 
    totalExpense, 
    totalPendingDebt, 
    sessions, 
    setActiveTab, 
    setSelectedSessionId 
  } = useApp();

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const latestSession = sortedSessions[0];

  return (
    <div className="space-y-3.5">
      {/* 1. HERO UANG KAS CARD (Modern Athletic Ledger Style) */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 text-slate-900 border shadow-xs transition-all duration-300 ${
        totalUangKas < 0
          ? 'bg-gradient-to-br from-rose-50 via-white to-rose-100/50 border-rose-200/80'
          : 'glass-card-grainient border-white/60'
      }`}>
        {/* Ambient decorative glowing rings */}
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-white/35 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-grainient-cyan/35 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/90 shadow-2xs">
              <Wallet className={`w-3.5 h-3.5 ${totalUangKas < 0 ? 'text-rose-600' : 'text-grainient-darkTeal'}`} />
              <span className={`text-[11px] font-black uppercase tracking-wider ${totalUangKas < 0 ? 'text-rose-700' : 'text-grainient-darkTeal'}`}>
                Total Uang Kas Klub
              </span>
            </div>

            {/* Latest Session Link Badge */}
            {latestSession && (
              <button
                onClick={() => {
                  setSelectedSessionId(latestSession.id);
                  setActiveTab('sessions');
                }}
                className="inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-grainient-darkTeal text-[11px] font-extrabold px-3 py-1 rounded-full shadow-2xs border border-emerald-300/70 transition active:scale-95 cursor-pointer group"
                title="Buka detail sesi terbaru"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Latest Session</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <div className="my-1.5 flex items-baseline gap-2.5 flex-wrap">
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-2xs font-mono ${
              totalUangKas < 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {formatRupiah(totalUangKas)}
            </h2>
            {totalUangKas < 0 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                Defisit
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUB-METRIC CARDS GRID (Interactive & Connected to Pages) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* Income Card */}
        <div 
          onClick={() => {
            const el = document.getElementById('transaction-ledger');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-sm shadow-2xs flex flex-col justify-between transition cursor-pointer group bg-white/90"
          title="Klik untuk melihat transaksi pemasukan"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 transition">Pemasukan</span>
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-700 tracking-tight font-mono">
              {formatRupiah(totalIncome)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Iuran & donasi</p>
          </div>
        </div>

        {/* Expenses (Outcome) Card - Navigates to Expenses tab */}
        <div 
          onClick={() => setActiveTab('expenses')}
          className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-rose-100 hover:border-rose-300 hover:shadow-sm shadow-2xs flex flex-col justify-between transition cursor-pointer group bg-white/90"
          title="Buka buku pengeluaran kas"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-rose-600 transition">Pengeluaran</span>
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-sm sm:text-base lg:text-lg font-black text-rose-600 tracking-tight font-mono">
              {formatRupiah(totalExpense)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sewa & shuttlecock</p>
          </div>
        </div>

        {/* Pending / Debt Card - Navigates to Member tab */}
        <div 
          onClick={() => setActiveTab('players')}
          className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-sm shadow-2xs flex flex-col justify-between transition cursor-pointer group bg-white/90"
          title="Buka daftar member dan catatan tunggakan"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-amber-700 transition">Belum Bayar</span>
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-sm sm:text-base lg:text-lg font-black text-amber-600 tracking-tight font-mono">
              {formatRupiah(totalPendingDebt)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Piutang kas</p>
          </div>
        </div>
      </div>
    </div>
  );
};
