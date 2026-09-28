import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Player } from '../../types';
import { formatRupiah, normalizePhoneForWhatsApp } from '../../utils/formatters';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit2, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Clock, 
  UserCheck
} from 'lucide-react';
import { PlayerModal } from './PlayerModal';
import confetti from 'canvas-confetti';

export const PlayerRosterView: React.FC = () => {
  const { 
    players, 
    attendees,
    deletePlayer, 
    getPlayerDebt, 
    totalPendingDebt, 
    settleAllPlayerDebt 
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterSkill, setFilterSkill] = useState<string>('all');
  const [filterOnlyDebt, setFilterOnlyDebt] = useState<boolean>(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Active player count: count players who attended any recorded session
  const activePlayerCount = useMemo(() => {
    const attendedPlayerIds = new Set(attendees.map((a) => a.player_id));
    return players.filter((p) => attendedPlayerIds.has(p.id)).length;
  }, [players, attendees]);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Search text match
      if (
        search.trim() !== '' &&
        !player.name.toLowerCase().includes(search.toLowerCase()) &&
        !(player.phone && player.phone.includes(search))
      ) {
        return false;
      }

      // Skill filter
      if (filterSkill !== 'all' && player.skill_level !== filterSkill) {
        return false;
      }

      // Debt filter
      if (filterOnlyDebt) {
        const debt = getPlayerDebt(player.id);
        if (debt.amount <= 0) return false;
      }

      return true;
    });
  }, [players, search, filterSkill, filterOnlyDebt, getPlayerDebt]);

  const handleSettle = (player: Player) => {
    if (confirm(`Lunasi seluruh tunggakan untuk ${player.name}? Catatan pemasukan akan dicatat ke buku kas.`)) {
      settleAllPlayerDebt(player.id);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3AC4AF', '#BFEFE2'],
      });
    }
  };

  const getSkillBadge = (skill: string) => {
    switch (skill) {
      case 'advanced':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            ADVANCED
          </span>
        );
      case 'intermediate':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200">
            INTERMEDIATE
          </span>
        );
      case 'beginner':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
            BEGINNER
          </span>
        );
      default:
        return null;
    }
  };

  const getPlaystyleBadge = (playstyle: string) => {
    switch (playstyle) {
      case 'front-court':
        return (
          <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold border border-teal-200/60">
            Depan Net
          </span>
        );
      case 'rear-court':
        return (
          <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-semibold border border-sky-200/60">
            Smash / Belakang
          </span>
        );
      default:
        return (
          <span className="text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md font-semibold border border-slate-200/60">
            All-Round
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Database Anggota Klub
          </h2>
          <p className="text-xs text-slate-500">
            Profil member, skill, gaya main, dan catatan tunggakan iuran
          </p>
        </div>

        <button
          onClick={() => {
            setPlayerToEdit(null);
            setShowModal(true);
          }}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-grainient-button text-white font-extrabold text-xs shadow-grainient-sm hover:opacity-95 active:scale-95 transition flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Member</span>
        </button>
      </div>

      {/* Roster Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5 bg-white/90">
          <div className="w-10 h-10 rounded-xl bg-grainient-mint/60 text-grainient-darkTeal flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Total Member</span>
            <p className="text-base sm:text-lg font-black text-slate-900">{players.length} Pemain</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-200/80 bg-amber-50/50 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-amber-700 font-extrabold block uppercase tracking-wider">Total Piutang Kas</span>
            <p className="text-base sm:text-lg font-black text-amber-800 font-mono">{formatRupiah(totalPendingDebt)}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-teal-200/80 bg-teal-50/50 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-teal-700 font-extrabold block uppercase tracking-wider">Member Aktif</span>
            <p className="text-base sm:text-lg font-black text-teal-900">{activePlayerCount} Pemain Main</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anggota atau nomor telepon..."
            className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40 shadow-2xs font-medium"
          />
        </div>

        <div className="flex gap-2.5">
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="text-xs px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40 shadow-2xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Semua Skill</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button
            onClick={() => setFilterOnlyDebt(!filterOnlyDebt)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              filterOnlyDebt
                ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Ada Tunggakan</span>
          </button>
        </div>
      </div>

      {/* Responsive Player Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full py-12 text-center glass-panel rounded-3xl bg-white/90">
            <p className="text-xs text-slate-400 font-medium">Tidak ada pemain yang sesuai kriteria pencarian.</p>
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const debt = getPlayerDebt(player.id);
            const hasDebt = debt.amount > 0;
            const waNumber = normalizePhoneForWhatsApp(player.phone);

            return (
              <div
                key={player.id}
                className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-200/80 hover:border-grainient-teal/50 shadow-2xs hover:shadow-xs transition-all space-y-3 bg-white/95 flex flex-col justify-between"
              >
                <div>
                  {/* Header: Avatar, Name & Actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-grainient-mint via-grainient-teal/40 to-grainient-cyan/50 text-grainient-darkTeal font-black flex items-center justify-center text-sm shadow-2xs border border-white flex-shrink-0">
                        {player.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">
                          {player.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate">
                          {player.phone || 'Tanpa no. kontak'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {waNumber && (
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          title="Chat WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setPlayerToEdit(player);
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Edit Profil Pemain"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus anggota ${player.name} dari klub?`)) {
                            deletePlayer(player.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Anggota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges: Skill & Playstyle */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    {getSkillBadge(player.skill_level)}
                    {getPlaystyleBadge(player.playstyle)}
                  </div>
                </div>

                {/* Debt & Settlement Section */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {hasDebt ? (
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[11px] text-amber-700 font-bold">
                        Tunggakan: <strong className="font-mono">{formatRupiah(debt.amount)}</strong> ({debt.unpaidSessionsCount} sesi)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-emerald-600 font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Kas Lunas</span>
                    </div>
                  )}

                  {hasDebt && (
                    <button
                      onClick={() => handleSettle(player)}
                      className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      Lunasi Kas
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <PlayerModal
          playerToEdit={playerToEdit}
          onClose={() => {
            setShowModal(false);
            setPlayerToEdit(null);
          }}
        />
      )}
    </div>
  );
};
