import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { 
  X, 
  Calculator, 
  MapPin, 
  Calendar, 
  Users, 
  Check, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SessionLoggerModalProps {
  onClose: () => void;
  onCreated?: (sessionId: string) => void;
}

export const SessionLoggerModal: React.FC<SessionLoggerModalProps> = ({ onClose, onCreated }) => {
  const { players, createSession, setSelectedSessionId } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(todayStr);
  const [location, setLocation] = useState('GOR Badminton Champion');
  const [courtCost, setCourtCost] = useState<number>(160000);
  const [feePerPlayer, setFeePerPlayer] = useState<number>(35000);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    players.slice(0, 8).map((p) => p.id)
  );
  const [notes, setNotes] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Math Logic
  const attendeeCount = selectedPlayerIds.length;
  const grossRevenue = attendeeCount * feePerPlayer;
  const netIncome = grossRevenue - courtCost;

  const filteredPlayers = useMemo(() => {
    if (!searchFilter.trim()) return players;
    return players.filter((p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [players, searchFilter]);

  const togglePlayer = (id: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlayerIds.length === players.length) {
      setSelectedPlayerIds([]);
    } else {
      setSelectedPlayerIds(players.map((p) => p.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert('Mohon isi nama GOR / lokasi lapangan.');
      return;
    }
    if (selectedPlayerIds.length === 0) {
      alert('Pilih minimal 1 pemain yang hadir.');
      return;
    }

    const sessionId = createSession({
      date,
      location,
      court_cost: courtCost,
      fee_per_player: feePerPlayer,
      attendee_player_ids: selectedPlayerIds,
      notes,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#BFEFE2', '#3AC4AF', '#75C6F9'],
    });

    setSelectedSessionId(sessionId);
    if (onCreated) onCreated(sessionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-white/60 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-grainient-mint/50 via-grainient-teal/20 to-grainient-cyan/40 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-grainient-button text-white flex items-center justify-center shadow-grainient-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Catat Sesi & Kalkulator Iuran
              </h2>
              <p className="text-[11px] text-slate-600">Hitung otomatis pemasukan bersih klub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/80 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Lokasi / Nama GOR <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: GOR Smash Hall B"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tanggal Sesi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40"
                />
              </div>
            </div>
          </div>

          {/* Court Price & Flat Fee per Player */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Biaya Sewa Lapangan (Total) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="text-slate-400 absolute left-3 top-2 font-bold">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={courtCost}
                  onChange={(e) => setCourtCost(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40 font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Dipotong dari kas sebagai beban sewa</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Iuran Flat per Pemain <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="text-slate-400 absolute left-3 top-2 font-bold">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={feePerPlayer}
                  onChange={(e) => setFeePerPlayer(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40 font-bold text-emerald-700"
                />
              </div>
              {/* Quick preset buttons */}
              <div className="flex gap-1.5 mt-1.5">
                {[30000, 35000, 40000, 50000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setFeePerPlayer(amt)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      feePerPlayer === amt
                        ? 'bg-grainient-darkTeal text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {amt / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ATTENDEE PICKER */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-grainient-darkTeal" />
                <span>Pilih Pemain Hadir ({selectedPlayerIds.length} terpilih)</span>
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-grainient-darkTeal hover:underline font-bold text-[11px]"
              >
                {selectedPlayerIds.length === players.length ? 'Batalkan Semua' : 'Pilih Semua'}
              </button>
            </div>

            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cari nama member..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-grainient-teal/40"
            />

            {/* Attendance selection grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200/80">
              {filteredPlayers.map((player) => {
                const isSelected = selectedPlayerIds.includes(player.id);
                return (
                  <button
                    type="button"
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className={`p-2 rounded-xl text-left flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-white border-grainient-teal shadow-sm text-slate-900 font-bold'
                        : 'bg-white/50 border-slate-200/60 text-slate-500 hover:bg-white'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <p className="truncate text-[11px]">{player.name}</p>
                      <span className="text-[9px] text-slate-400 capitalize">
                        {player.skill_level}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-grainient-darkTeal text-white'
                          : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LIVE MATH BREAKDOWN (THE CALCULATOR) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-grainient-mint/30 via-grainient-teal/15 to-grainient-cyan/30 border border-grainient-teal/30 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
              <Sparkles className="w-4 h-4 text-grainient-darkTeal" />
              <span>Simulasi Kas Masuk Sesi Ini:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
              <div>
                <span className="text-slate-500">Pemain Hadir:</span>
                <p className="font-bold text-slate-800">{attendeeCount} orang</p>
              </div>
              <div>
                <span className="text-slate-500">Total Kotor (Gross):</span>
                <p className="font-bold text-slate-800">{formatRupiah(grossRevenue)}</p>
              </div>
              <div>
                <span className="text-slate-500">Biaya Sewa Lapangan:</span>
                <p className="font-bold text-rose-600">- {formatRupiah(courtCost)}</p>
              </div>
              <div>
                <span className="text-slate-500">Hasil Bersih Kas:</span>
                <p
                  className={`font-black text-sm ${
                    netIncome >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {netIncome >= 0 ? '+' : ''} {formatRupiah(netIncome)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Bawa 2 slop kok JP Gold, main court 1 & 2"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 px-4 rounded-2xl bg-grainient-button text-white font-extrabold shadow-grainient-glow hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan & Buka Sesi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
