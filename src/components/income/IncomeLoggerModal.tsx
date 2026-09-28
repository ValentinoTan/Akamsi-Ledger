import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { IncomeCategory } from '../../types';
import { 
  X, 
  TrendingUp, 
  Calendar, 
  Check,
  User,
  Coins
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface IncomeLoggerModalProps {
  onClose: () => void;
}

export const IncomeLoggerModal: React.FC<IncomeLoggerModalProps> = ({ onClose }) => {
  const { addIncome, players } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(50000);
  const [category, setCategory] = useState<IncomeCategory>('monthly_dues');
  const [playerId, setPlayerId] = useState<string>('');
  const [date, setDate] = useState(todayStr);

  const categories: { id: IncomeCategory; label: string; desc: string }[] = [
    { id: 'monthly_dues', label: 'Iuran Kas / Rutin', desc: 'Iuran bulanan atau mingguan rutin' },
    { id: 'initial_balance', label: 'Saldo Awal / Tambahan Kas', desc: 'Setoran modal atau saldo pembuka' },
    { id: 'donation', label: 'Donasi / Sponsor', desc: 'Sumbangan sukarela atau sponsor' },
    { id: 'merchandise', label: 'Penjualan Kok / Grip', desc: 'Pemain beli kok cadangan / aksesoris' },
    { id: 'tournament_prize', label: 'Hadiah / Sparring', desc: 'Uang pembinaan turnamen atau sparring' },
    { id: 'other_income', label: 'Pemasukan Lainnya', desc: 'Pemasukan di luar kategori rutin' },
  ];

  const quickAmounts = [20000, 50000, 100000, 200000, 500000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Mohon isi keterangan atau deskripsi pemasukan.');
      return;
    }
    if (amount <= 0) {
      alert('Nominal pemasukan harus lebih dari Rp 0.');
      return;
    }

    addIncome({
      description: description.trim(),
      amount,
      category,
      player_id: playerId || undefined,
      timestamp: new Date(date).toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border border-white/60 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 border-b border-emerald-200/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Catat Pemasukan Kas
              </h2>
              <p className="text-[11px] text-slate-600">Menambah saldo uang kas klub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/80 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Keterangan Pemasukan <span className="text-emerald-600">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Iuran Kas Rutin, Donasi Lapangan, Penjualan Kok"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 text-xs font-medium"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nominal Pemasukan (Rupiah) <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">Rp</span>
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 text-sm font-black font-mono text-emerald-700"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                    amount === q
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200'
                  }`}
                >
                  +{q >= 1000 ? `${q / 1000}k` : q}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Kategori Pemasukan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    category === c.id
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-extrabold text-[11px] text-slate-800">{c.label}</span>
                    {category === c.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 leading-tight">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Associated Player */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Dari Pemain / Anggota (Opsional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <select
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 text-xs bg-white text-slate-700"
              >
                <option value="">-- Umum / Bukan dari Pemain Spesifik --</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.phone ? `(${p.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Tanggal Transaksi
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 text-xs"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Simpan Pemasukan ({formatRupiah(amount)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
