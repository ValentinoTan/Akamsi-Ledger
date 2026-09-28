import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCards } from './StatCards';
import { TransactionLedger } from './TransactionLedger';
import { 
  PlusCircle, 
  Receipt, 
  UserPlus, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { SessionLoggerModal } from '../sessions/SessionLoggerModal';
import { ExpenseLoggerModal } from '../expenses/ExpenseLoggerModal';
import { IncomeLoggerModal } from '../income/IncomeLoggerModal';
import { PlayerModal } from '../players/PlayerModal';

export const DashboardView: React.FC = () => {
  const { 
    sessions, 
    setActiveTab, 
    setSelectedSessionId, 
    getSessionMetrics 
  } = useApp();

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // Latest Session logic: most recently created session
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const latestSession = sortedSessions[0];
  const latestMetrics = latestSession ? getSessionMetrics(latestSession.id) : null;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Bento Grid layout: Stack on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        
        {/* Left Column (5 cols on lg): Hero Financials, Quick Actions & Latest Session Spotlight */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Stat Cards (Hero Uang Kas & 3 Connected Metrics) */}
          <StatCards />

          {/* 2. Courtside Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setShowSessionModal(true)}
              className="p-3 rounded-2xl bg-gradient-to-br from-grainient-mint/80 to-grainient-teal/30 hover:to-grainient-teal/50 border border-grainient-teal/40 text-slate-800 shadow-2xs flex items-center space-x-2.5 transition active:scale-95 group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-grainient-darkTeal text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition flex-shrink-0">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight text-slate-900 truncate">Sesi Baru</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">Iuran main</p>
              </div>
            </button>

            <button
              onClick={() => setShowIncomeModal(true)}
              className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/60 hover:to-emerald-100 border border-emerald-200/80 text-slate-800 shadow-2xs flex items-center space-x-2.5 transition active:scale-95 group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition flex-shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight text-slate-900 truncate">Pemasukan</p>
                <p className="text-[10px] text-emerald-700 font-medium truncate">Kas / donasi</p>
              </div>
            </button>

            <button
              onClick={() => setShowExpenseModal(true)}
              className="p-3 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/60 hover:to-rose-100 border border-rose-200/80 text-slate-800 shadow-2xs flex items-center space-x-2.5 transition active:scale-95 group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition flex-shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight text-slate-900 truncate">Pengeluaran</p>
                <p className="text-[10px] text-rose-600 font-medium truncate">Beli kok / sewa</p>
              </div>
            </button>

            <button
              onClick={() => setShowPlayerModal(true)}
              className="p-3 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-100/60 hover:to-cyan-100 border border-sky-200/80 text-slate-800 shadow-2xs flex items-center space-x-2.5 transition active:scale-95 group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition flex-shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight text-slate-900 truncate">Member</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">Tambah pemain</p>
              </div>
            </button>
          </div>

          {/* 3. Courtside Latest Session Spotlight */}
          {latestSession && latestMetrics ? (
            <div 
              onClick={() => {
                setSelectedSessionId(latestSession.id);
                setActiveTab('sessions');
              }}
              className="glass-panel p-4 sm:p-5 rounded-3xl border border-grainient-teal/40 bg-gradient-to-r from-white/95 via-grainient-mint/20 to-white/95 shadow-xs space-y-3 cursor-pointer hover:border-grainient-teal hover:shadow-sm transition group"
              title="Klik untuk membuka absensi dan pembayaran sesi ini"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-grainient-darkTeal">
                    Latest Session
                  </span>
                </div>
                <div className="text-xs font-bold text-grainient-darkTeal flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Buka Absensi</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-black text-slate-900 text-base group-hover:text-grainient-darkTeal transition">
                    {latestSession.location}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(latestSession.date)}</span>
                    <span>•</span>
                    <span>Iuran: <strong className="text-slate-700">{formatRupiah(latestSession.fee_per_player)}/org</strong></span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-500">Terkumpul / Target:</span>
                  <p className="text-sm font-extrabold text-slate-800 font-mono">
                    <span className="text-emerald-600">{formatRupiah(latestMetrics.collectedRevenue)}</span>
                    <span className="text-slate-400"> / {formatRupiah(latestMetrics.grossRevenue)}</span>
                  </p>
                </div>
              </div>

              {/* Payment Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {latestMetrics.paidAttendeesCount} dari {latestMetrics.totalAttendees} Pemain Lunas
                  </span>
                  <span className="text-grainient-darkTeal font-bold">
                    {latestMetrics.paymentProgress}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-grainient-teal to-grainient-cyan transition-all duration-500 rounded-full"
                    style={{ width: `${latestMetrics.paymentProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-600">Belum ada sesi main tercatat.</p>
              <button
                onClick={() => setShowSessionModal(true)}
                className="px-3 py-1.5 rounded-xl bg-grainient-button text-white font-bold text-xs"
              >
                Buka Sesi Pertama
              </button>
            </div>
          )}
        </div>

        {/* Right Column (7 cols on lg): Live Unified Transaction Ledger */}
        <div className="lg:col-span-7 space-y-5">
          <TransactionLedger />
        </div>
      </div>

      {/* Modals */}
      {showSessionModal && (
        <SessionLoggerModal onClose={() => setShowSessionModal(false)} />
      )}
      {showIncomeModal && (
        <IncomeLoggerModal onClose={() => setShowIncomeModal(false)} />
      )}
      {showExpenseModal && (
        <ExpenseLoggerModal onClose={() => setShowExpenseModal(false)} />
      )}
      {showPlayerModal && (
        <PlayerModal onClose={() => setShowPlayerModal(false)} />
      )}
    </div>
  );
};
