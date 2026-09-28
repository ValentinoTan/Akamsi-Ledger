import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { 
  PlusCircle, 
  Trash2, 
  TrendingDown,
  Receipt,
  Search
} from 'lucide-react';
import { ExpenseLoggerModal } from './ExpenseLoggerModal';

export const ExpensesListView: React.FC = () => {
  const { transactions, totalExpense, deleteTransaction } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const filteredExpenses = expenseTransactions.filter((tx) => {
    if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
    if (search.trim() && !tx.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'shuttlecocks':
        return 'Shuttlecock';
      case 'court_extra':
        return 'Sewa Lapangan';
      case 'refreshment':
        return 'Minuman / Konsumsi';
      case 'medical':
        return 'Medis / P3K';
      case 'gear':
        return 'Perlengkapan';
      default:
        return 'Lain-lain';
    }
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengeluaran Klub (Outcome)
          </h2>
          <p className="text-xs text-slate-500">Log biaya operasional: kok, sewa, minum, dan medis</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-xs active:scale-95 transition flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Catat Biaya</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-rose-200/80 bg-gradient-to-r from-rose-50/80 via-white to-rose-50/50 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <TrendingDown className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">Total Pengeluaran Kas</span>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight font-mono">
              {formatRupiah(totalExpense)}
            </h3>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold shadow-2xs">
            {expenseTransactions.length} Transaksi
          </span>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengeluaran atau pembelian..."
            className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 shadow-2xs font-medium"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 shadow-2xs font-bold text-slate-700 cursor-pointer"
        >
          <option value="all">Semua Kategori</option>
          <option value="shuttlecocks">Shuttlecock</option>
          <option value="court_extra">Sewa Lapangan</option>
          <option value="refreshment">Minuman / Konsumsi</option>
          <option value="medical">Medis / P3K</option>
          <option value="gear">Perlengkapan</option>
          <option value="misc">Lain-lain</option>
        </select>
      </div>

      {/* Expense List Card */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs bg-white/95">
        <div className="divide-y divide-slate-100">
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              Belum ada catatan pengeluaran yang cocok.
            </div>
          ) : (
            filteredExpenses.map((tx) => (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between group hover:bg-slate-50/80 px-2 rounded-2xl transition"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/70 flex items-center justify-center flex-shrink-0 text-rose-500">
                    <Receipt className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-medium">
                      <span>{formatDate(tx.timestamp)}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md">
                        {getCategoryLabel(tx.category)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="text-xs sm:text-sm font-black text-rose-600 font-mono">
                    - {formatRupiah(tx.amount)}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus pengeluaran "${tx.description}"?`)) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus pengeluaran"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && <ExpenseLoggerModal onClose={() => setShowModal(false)} />}
    </div>
  );
};
