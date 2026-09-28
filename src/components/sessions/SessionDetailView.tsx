import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  formatRupiah, 
  formatDate
} from '../../utils/formatters';
import { 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SessionDetailViewProps {
  sessionId: string;
  onBack: () => void;
}

export const SessionDetailView: React.FC<SessionDetailViewProps> = ({ sessionId, onBack }) => {
  const { 
    sessions, 
    attendees, 
    players, 
    toggleAttendeePayment, 
    batchSetAttendancePayment, 
    deleteSession, 
    getSessionMetrics
  } = useApp();

  const session = sessions.find((s) => s.id === sessionId);
  const sessionAttendees = attendees.filter((a) => a.session_id === sessionId);
  const metrics = getSessionMetrics(sessionId);

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const isLatest = sortedSessions[0]?.id === session?.id;

  if (!session) {
    return (
      <div className="p-8 text-center glass-panel rounded-3xl">
        <p className="text-slate-500 mb-4">Sesi tidak ditemukan atau telah dihapus.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-grainient-button text-white font-bold"
        >
          Kembali ke Daftar Sesi
        </button>
      </div>
    );
  }

  const handleToggle = (attendeeId: string, currentStatus: boolean) => {
    toggleAttendeePayment(attendeeId);
    if (!currentStatus) {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#3AC4AF', '#BFEFE2'],
      });
    }
  };

  const handleMarkAllPaid = () => {
    batchSetAttendancePayment(session.id, true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#BFEFE2', '#3AC4AF', '#75C6F9'],
    });
  };

  const handleMarkAllUnpaid = () => {
    if (confirm('Tandai semua peserta belum bayar untuk sesi ini?')) {
      batchSetAttendancePayment(session.id, false);
    }
  };

  const handleDelete = () => {
    if (confirm(`Yakin ingin menghapus sesi di ${session.location} tanggal ${session.date}? Semua catatan iuran terkait akan dibersihkan.`)) {
      deleteSession(session.id);
      onBack();
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Sesi</span>
        </button>

        <button
          onClick={handleDelete}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
          title="Hapus Sesi Ini"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Session Card */}
      <div className="glass-panel p-5 rounded-3xl border border-grainient-teal/40 bg-gradient-to-br from-white via-grainient-mint/15 to-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isLatest
                  ? 'bg-grainient-mint/90 text-grainient-darkTeal border border-grainient-teal/40'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isLatest ? 'Latest Session' : 'Selesai'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {formatDate(session.date)}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{session.location}</h2>
            {session.notes && (
              <p className="text-xs text-slate-500 mt-1 italic">"{session.notes}"</p>
            )}
          </div>
        </div>

        {/* Expected vs Collected Revenue Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-2xl bg-white border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Iuran per Orang:</span>
            <span className="font-extrabold text-slate-800 text-sm">
              {formatRupiah(session.fee_per_player)}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Sewa Lapangan:</span>
            <span className="font-extrabold text-rose-600 text-sm">
              - {formatRupiah(session.court_cost)}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-emerald-700 block text-[10px] font-semibold">
              Terkumpul (Masuk Kas):
            </span>
            <span className="font-black text-emerald-700 text-sm">
              {formatRupiah(metrics.collectedRevenue)}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-amber-700 block text-[10px] font-semibold">
              Target (Jika Semua Lunas):
            </span>
            <span className="font-black text-slate-800 text-sm">
              {formatRupiah(metrics.grossRevenue)}
            </span>
          </div>
        </div>

        {/* Payment Progress Ring / Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Progress Pembayaran ({metrics.paidAttendeesCount} / {metrics.totalAttendees})
            </span>
            <span className="text-grainient-darkTeal font-bold">
              {metrics.paymentProgress}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className="h-full bg-gradient-to-r from-grainient-teal via-emerald-400 to-grainient-cyan rounded-full transition-all duration-500"
              style={{ width: `${metrics.paymentProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ATTENDEE PAYMENT TRACKER LIST */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-grainient-darkTeal" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Daftar Peserta & Status Pembayaran
            </h3>
          </div>

          {/* Batch Actions */}
          <div className="flex items-center space-x-2 text-xs font-bold">
            <button
              onClick={handleMarkAllPaid}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition"
            >
              Semua Lunas
            </button>
            <button
              onClick={handleMarkAllUnpaid}
              className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
            >
              Reset Status
            </button>
          </div>
        </div>

        {/* List of Attendees with Toggle */}
        <div className="divide-y divide-slate-100">
          {sessionAttendees.map((att) => {
            const player = players.find((p) => p.id === att.player_id);
            if (!player) return null;

            const isPaid = att.has_paid;

            return (
              <div
                key={att.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-2xl transition"
              >
                {/* Left: Player Profile */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-2xl font-bold flex items-center justify-center text-xs flex-shrink-0 ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400/40'
                        : 'bg-amber-100 text-amber-800 ring-2 ring-amber-300/40'
                    }`}
                  >
                    {player.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {player.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 capitalize">
                      <span>{player.skill_level}</span>
                      <span>•</span>
                      <span>{player.playstyle}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Payment Toggle Pill */}
                <div className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => handleToggle(att.id, isPaid)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                      isPaid
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {isPaid ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Lunas</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 stroke-[2]" />
                        <span>Belum Bayar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
