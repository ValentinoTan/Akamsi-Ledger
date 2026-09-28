import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDate, formatTime } from '../../utils/formatters';
import { 
  PlusCircle, 
  Trash2, 
  TrendingDown,
  TrendingUp,
  Receipt,
  Search,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  User
} from 'lucide-react';
import { ExpenseLoggerModal } from './ExpenseLoggerModal';
import { IncomeLoggerModal } from '../income/IncomeLoggerModal';

export const ExpensesListView: React.FC = () => {
  const { 
    transactions, 
    totalIncome, 
    totalExpense, 
    totalUangKas, 
    deleteTransaction,
    players 
  } = useApp();

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const expenseCount = transactions.filter((t) => t.type === 'expense').length;

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(term);
      const matchCat = tx.category ? tx.category.toLowerCase().includes(term) : false;
      return matchDesc || matchCat;
    }
    return true;
  });

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      // Expenses
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
      // Incomes
      case 'monthly_dues':
        return 'Iuran Kas / Rutin';
      case 'donation':
        return 'Donasi / Sponsor';
      case 'merchandise':
        return 'Jual Kok / Grip';
      case 'tournament_prize':
        return 'Hadiah / Sparring';
      case 'initial_balance':
        return 'Saldo Awal / Modal';
      case 'session_fee':
        return 'Iuran Sesi Main';
      case 'other_income':
        return 'Pemasukan Lain';
      default:
        return 'Lain-lain';
    }
  };

  const getPlayerName = (playerId?: string) => {
    if (!playerId) return null;
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : null;
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Top Bar with Dual Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Buku Kas & Keuangan Klub
          </h2>
          <p className="text-xs text-slate-500">
            Catat arus kas masuk (iuran/donasi) dan kas keluar (kok, sewa, konsumsi)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowIncomeModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Pemasukan</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-xs active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary 3-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Pemasukan */}
        <div className="glass-panel p-4 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-white shadow-2xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-bold block truncate">Total Pemasukan</span>
            <h4 className="text-lg font-black text-emerald-700 font-mono tracking-tight truncate">
              {formatRupiah(totalIncome)}
            </h4>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="glass-panel p-4 rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 via-white to-white shadow-2xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <TrendingDown className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-bold block truncate">Total Pengeluaran</span>
            <h4 className="text-lg font-black text-rose-600 font-mono tracking-tight truncate">
              {formatRupiah(totalExpense)}
            </h4>
          </div>
        </div>

        {/* Saldo Kas Bersih */}
        <div className={`glass-panel p-4 rounded-3xl border shadow-2xs flex items-center space-x-3 ${
          totalUangKas < 0 
            ? 'border-rose-300 bg-gradient-to-br from-rose-50 via-white to-rose-50/30' 
            : 'border-grainient-teal/40 bg-gradient-to-br from-grainient-mint/30 via-white to-white'
        }`}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs flex-shrink-0 ${
            totalUangKas < 0 ? 'bg-rose-600 text-white' : 'bg-grainient-darkTeal text-white'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-bold block truncate">Saldo Kas Bersih</span>
            <h4 className={`text-lg font-black font-mono tracking-tight truncate ${
              totalUangKas < 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {formatRupiah(totalUangKas)}
            </h4>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Type Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold self-start">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              typeFilter === 'income'
                ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pemasukan ({incomeCount})
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              typeFilter === 'expense'
                ? 'bg-rose-500 text-white shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pengeluaran ({expenseCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari transaksi / keterangan..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 shadow-2xs font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 shadow-2xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            <optgroup label="Pemasukan">
              <option value="monthly_dues">Iuran Kas / Rutin</option>
              <option value="initial_balance">Saldo Awal / Modal</option>
              <option value="donation">Donasi / Sponsor</option>
              <option value="merchandise">Jual Kok / Grip</option>
              <option value="session_fee">Iuran Sesi Main</option>
              <option value="other_income">Pemasukan Lain</option>
            </optgroup>
            <optgroup label="Pengeluaran">
              <option value="shuttlecocks">Shuttlecock / Kok</option>
              <option value="court_extra">Sewa Lapangan</option>
              <option value="refreshment">Konsumsi / Minum</option>
              <option value="medical">Medis / P3K</option>
              <option value="gear">Perlengkapan</option>
              <option value="misc">Lain-lain</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Unified Transaction List Card */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs bg-white/95">
        <div className="divide-y divide-slate-100">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Belum ada catatan mutasi kas yang cocok dengan filter.</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const playerName = getPlayerName(tx.player_id);

              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between group hover:bg-slate-50/80 px-2 rounded-2xl transition"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
                      isIncome 
                        ? 'bg-emerald-50 border-emerald-200/70 text-emerald-600' 
                        : 'bg-rose-50 border-rose-200/70 text-rose-500'
                    }`}>
                      {isIncome ? (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                        {tx.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-medium">
                        <span>{formatDate(tx.timestamp)}</span>
                        <span>{formatTime(tx.timestamp)}</span>
                        <span>•</span>
                        <span className={`font-semibold px-1.5 py-0.5 rounded-md ${
                          isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {getCategoryLabel(tx.category)}
                        </span>
                        {playerName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-slate-600 bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-md font-semibold">
                              <User className="w-3 h-3" />
                              {playerName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className={`text-xs sm:text-sm font-black font-mono ${
                      isIncome ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {isIncome ? `+ ${formatRupiah(tx.amount)}` : `- ${formatRupiah(tx.amount)}`}
                    </span>
                    <button
                      onClick={() => {
                        const label = isIncome ? 'pemasukan' : 'pengeluaran';
                        if (confirm(`Hapus catatan ${label} "${tx.description}"?`)) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      {showIncomeModal && (
        <IncomeLoggerModal onClose={() => setShowIncomeModal(false)} />
      )}
      {showExpenseModal && (
        <ExpenseLoggerModal onClose={() => setShowExpenseModal(false)} />
      )}
    </div>
  );
};
