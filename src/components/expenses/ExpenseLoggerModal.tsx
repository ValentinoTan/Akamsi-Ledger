import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ExpenseCategory } from '../../types';
import { 
  X, 
  Receipt, 
  Calendar, 
  Check 
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface ExpenseLoggerModalProps {
  onClose: () => void;
}

export const ExpenseLoggerModal: React.FC<ExpenseLoggerModalProps> = ({ onClose }) => {
  const { addExpense } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(120000);
  const [category, setCategory] = useState<ExpenseCategory>('shuttlecocks');
  const [date, setDate] = useState(todayStr);

  const categories: { id: ExpenseCategory; label: string }[] = [
    { id: 'shuttlecocks', label: 'Shuttlecock / Kok' },
    { id: 'court_extra', label: 'Sewa Lapangan Tambahan' },
    { id: 'refreshment', label: 'Konsumsi / Air Minum' },
    { id: 'medical', label: 'Medis / Obat P3K' },
    { id: 'gear', label: 'Perlengkapan / Net / Grip' },
    { id: 'misc', label: 'Lain-lain / Operasional' },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!description.trim()) {
      setErrorMessage('Mohon isi deskripsi pengeluaran.');
      return;
    }
    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
      setErrorMessage('Nominal pengeluaran harus berupa angka lebih dari Rp 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      addExpense({
        description: description.trim(),
        amount,
        category,
        timestamp: new Date(date).toISOString(),
      });
      onClose();
    } catch {
      setErrorMessage('Gagal menyimpan pengeluaran.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border border-white/60 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-100 via-rose-50 to-pink-100 border-b border-rose-200/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Catat Pengeluaran Klub
              </h2>
              <p className="text-[11px] text-slate-600">Otomatis memotong saldo kas klub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/80 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Deskripsi Pembelian / Pengeluaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Beli 2 Slop Kok Samurai Hijau"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 text-xs"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Jumlah Pengeluaran (Nominal) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="text-slate-400 absolute left-3.5 top-2.5 font-bold">Rp</span>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 text-sm font-extrabold text-rose-600"
              />
            </div>
            {/* Quick preset pills */}
            <div className="flex gap-1.5 mt-1.5">
              {[50000, 100000, 150000, 250000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                    amount === amt
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Kategori Pengeluaran <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50 text-rose-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs font-semibold leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tanggal Transaksi</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim() || !amount || amount <= 0 || !Number.isFinite(amount)}
              className="flex-[2] py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none text-white font-extrabold shadow-md active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
