import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { 
  PlusCircle, 
  Users, 
  ChevronRight,
  Search,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SessionLoggerModal } from './SessionLoggerModal';
import { SessionDetailView } from './SessionDetailView';

export const SessionsListView: React.FC = () => {
  const { sessions, selectedSessionId, setSelectedSessionId, getSessionMetrics } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');

  // Sort sessions newest first by created_at timestamp
  const sortedSessions = useMemo(() => {
    return [...sessions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [sessions]);

  const latestSessionId = sortedSessions[0]?.id;

  // Filter sorted sessions by search query
  const filteredSessions = useMemo(() => {
    return sortedSessions.filter((s) =>
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.date.includes(search)
    );
  }, [sortedSessions, search]);

  // If a session is currently selected, render the detail view
  if (selectedSessionId) {
    return (
      <SessionDetailView
        sessionId={selectedSessionId}
        onBack={() => setSelectedSessionId(null)}
      />
    );
  }

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Daftar Sesi Badminton
          </h2>
          <p className="text-xs text-slate-500">
            Rekap iuran, absensi, dan kalkulator tiap sesi main
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-grainient-button text-white font-extrabold text-xs shadow-grainient-sm hover:opacity-95 active:scale-95 transition flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buka Sesi Baru</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama GOR atau tanggal sesi..."
          className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40 shadow-2xs transition font-medium"
        />
      </div>

      {/* Responsive Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full p-12 text-center glass-panel rounded-3xl border border-slate-200 bg-white/90">
            <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 mb-1">Tidak ada sesi yang cocok.</p>
            <p className="text-xs text-slate-400 mb-4">Mulai sesi latihan atau sparring baru sekarang.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-grainient-button text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Buka Sesi Pertama Sekarang
            </button>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const metrics = getSessionMetrics(session.id);
            const isLatest = session.id === latestSessionId;

            return (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className="glass-panel p-5 rounded-3xl border border-slate-200/80 hover:border-grainient-teal/50 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-3.5 bg-white/95 flex flex-col justify-between"
              >
                <div>
                  {/* Header & Status Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isLatest
                            ? 'bg-grainient-mint/90 text-grainient-darkTeal border border-grainient-teal/40 shadow-2xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isLatest ? 'Latest Session' : 'Selesai'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(session.date)}
                      </span>
                    </div>

                    <div className="flex items-center text-xs font-bold text-grainient-darkTeal group-hover:translate-x-1 transition-transform">
                      <span>Absensi</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>

                  {/* Location & Details */}
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-grainient-darkTeal transition">
                    {session.location}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{metrics.totalAttendees}</strong> Pemain
                    </span>
                    <span>•</span>
                    <span>Iuran: <strong className="text-slate-700">{formatRupiah(session.fee_per_player)}</strong></span>
                    <span>•</span>
                    <span className="text-rose-500 font-medium">Sewa: {formatRupiah(session.court_cost)}</span>
                  </div>
                </div>

                {/* Progress & Collected Revenue Bar */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 text-[11px]">
                      Lunas: <strong className="text-emerald-600">{metrics.paidAttendeesCount}</strong> / {metrics.totalAttendees} ({formatRupiah(metrics.collectedRevenue)})
                    </span>
                    <span className="font-extrabold text-grainient-darkTeal text-[11px]">
                      {metrics.paymentProgress}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-grainient-teal to-grainient-cyan rounded-full transition-all duration-500"
                      style={{ width: `${metrics.paymentProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreateModal && (
        <SessionLoggerModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};
