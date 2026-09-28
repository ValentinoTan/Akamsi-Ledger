import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDate, formatTime } from '../../utils/formatters';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Receipt, 
  Trash2,
  Search
} from 'lucide-react';

export const TransactionLedger: React.FC = () => {
  const { transactions, deleteTransaction } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const expenseCount = transactions.filter((t) => t.type === 'expense').length;

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return (
        tx.description.toLowerCase().includes(term) ||
        (tx.category && tx.category.toLowerCase().includes(term))
      );
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
      case 'session_fee':
        return 'Iuran Sesi';
      case 'other_income':
        return 'Pemasukan Lain';
      default:
        return 'Lain-lain';
    }
  };

  return (
    <div 
      id="transaction-ledger"
      className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 bg-white/95"
    >
      {/* Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-grainient-mint/60 flex items-center justify-center text-grainient-darkTeal flex-shrink-0">
            <Receipt className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Buku Kas (Ledger Transaksi)
            </h3>
            <p className="text-[11px] text-slate-500">Mutasi keuangan real-time kas klub</p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterType === 'income'
                ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk ({incomeCount})
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterType === 'expense'
                ? 'bg-rose-500 text-white shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Keluar ({expenseCount})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari deskripsi transaksi atau kategori..."
          className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40 transition font-medium"
        />
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            Tidak ada catatan transaksi yang cocok.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between group hover:bg-slate-50/80 px-2 rounded-xl transition-all"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                      isIncome
                        ? 'bg-emerald-100/80 text-emerald-600 border border-emerald-200/50'
                        : 'bg-rose-100/80 text-rose-600 border border-rose-200/50'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="min-w-0 pr-2">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[10px] text-slate-400 font-medium">
                      <span>{formatDate(tx.timestamp)} • {formatTime(tx.timestamp)}</span>
                      {tx.category && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-semibold">
                          {getCategoryLabel(tx.category)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 flex-shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-xs sm:text-sm font-black font-mono tracking-tight ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                    </span>
                  </div>

                  {/* Delete button (with confirmation) */}
                  <button
                    onClick={() => {
                      if (confirm(`Hapus transaksi "${tx.description}"?`)) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus transaksi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
