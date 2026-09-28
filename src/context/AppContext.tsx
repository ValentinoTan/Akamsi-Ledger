import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Player, Session, SessionAttendee, Transaction, ExpenseCategory, IncomeCategory } from '../types';
import { loadInitialData, resetDataToSeed } from '../services/storage';
import type { AppStateData } from '../services/storage';
import { generateId } from '../utils/formatters';
import { 
  fetchClubDataFromFirestore, 
  saveClubDataToFirestore, 
  subscribeToClubData 
} from '../services/firestoreSync';
import { isFirebaseConfigured } from '../services/firebase';

interface SessionMetrics {
  totalAttendees: number;
  paidAttendeesCount: number;
  unpaidAttendeesCount: number;
  feePerPlayer: number;
  courtCost: number;
  grossRevenue: number;
  collectedRevenue: number;
  pendingRevenue: number;
  projectedNet: number;
  collectedNet: number;
  paymentProgress: number; // 0 to 100
}

interface AppContextType {
  players: Player[];
  sessions: Session[];
  attendees: SessionAttendee[];
  transactions: Transaction[];
  clubName: string;
  activeTab: 'dashboard' | 'sessions' | 'expenses' | 'players';
  setActiveTab: (tab: 'dashboard' | 'sessions' | 'expenses' | 'players') => void;
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;

  // Computed Financials
  totalUangKas: number;
  totalIncome: number;
  totalExpense: number;
  totalPendingDebt: number;
  getPlayerDebt: (playerId: string) => { amount: number; unpaidSessionsCount: number };
  getSessionMetrics: (sessionId: string) => SessionMetrics;

  // Session Actions
  createSession: (data: {
    date: string;
    location: string;
    court_cost: number;
    fee_per_player: number;
    attendee_player_ids: string[];
    notes?: string;
  }) => string;
  toggleAttendeePayment: (attendeeId: string) => void;
  batchSetAttendancePayment: (sessionId: string, markAsPaid: boolean) => void;
  deleteSession: (sessionId: string) => void;

  // Transaction Actions (Income & Expense)
  addIncome: (data: {
    amount: number;
    description: string;
    category?: IncomeCategory;
    timestamp?: string;
    player_id?: string;
  }) => void;
  addExpense: (data: {
    amount: number;
    description: string;
    category: ExpenseCategory;
    timestamp?: string;
  }) => void;
  deleteTransaction: (transactionId: string) => void;

  // Player Actions
  addPlayer: (data: Omit<Player, 'id' | 'created_at'>) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  settleAllPlayerDebt: (playerId: string) => void;

  // Data Actions
  resetData: () => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  isCloudConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppStateData>(loadInitialData);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sessions' | 'expenses' | 'players'>('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const isInitialMount = useRef(true);
  const isRemoteUpdate = useRef(false);

  // Sync to Cloud Firestore and localStorage whenever data changes (guarded & debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const timer = setTimeout(() => {
      saveClubDataToFirestore(data);
    }, 400);

    return () => clearTimeout(timer);
  }, [data]);

  // Subscribe to live Firestore updates across devices
  useEffect(() => {
    if (isFirebaseConfigured()) {
      fetchClubDataFromFirestore().then((cloudData) => {
        if (cloudData) {
          isRemoteUpdate.current = true;
          setData(cloudData);
        }
      });

      const unsubscribe = subscribeToClubData((cloudData) => {
        isRemoteUpdate.current = true;
        setData(cloudData);
      });

      return () => unsubscribe();
    }
  }, []);

  // Total Uang Kas: Sum of all income transactions - sum of all expense transactions
  const { totalUangKas, totalIncome, totalExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    data.transactions.forEach((tx) => {
      if (tx.type === 'income') {
        inc += tx.amount;
      } else {
        exp += tx.amount;
      }
    });
    return {
      totalIncome: inc,
      totalExpense: exp,
      totalUangKas: inc - exp,
    };
  }, [data.transactions]);

  // Calculate debt for any player
  const getPlayerDebt = useCallback(
    (playerId: string) => {
      const unpaidAttendees = data.attendees.filter(
        (a) => a.player_id === playerId && !a.has_paid
      );
      let debt = 0;
      unpaidAttendees.forEach((att) => {
        const sess = data.sessions.find((s) => s.id === att.session_id);
        if (sess) {
          debt += sess.fee_per_player;
        }
      });
      return {
        amount: debt,
        unpaidSessionsCount: unpaidAttendees.length,
      };
    },
    [data.attendees, data.sessions]
  );

  // Total Pending Club Debt across all members
  const totalPendingDebt = useMemo(() => {
    let total = 0;
    data.attendees.forEach((att) => {
      if (!att.has_paid) {
        const sess = data.sessions.find((s) => s.id === att.session_id);
        if (sess) {
          total += sess.fee_per_player;
        }
      }
    });
    return total;
  }, [data.attendees, data.sessions]);

  // Session metrics helper
  const getSessionMetrics = useCallback(
    (sessionId: string): SessionMetrics => {
      const session = data.sessions.find((s) => s.id === sessionId);
      const sessionAttendees = data.attendees.filter((a) => a.session_id === sessionId);

      if (!session) {
        return {
          totalAttendees: 0,
          paidAttendeesCount: 0,
          unpaidAttendeesCount: 0,
          feePerPlayer: 0,
          courtCost: 0,
          grossRevenue: 0,
          collectedRevenue: 0,
          pendingRevenue: 0,
          projectedNet: 0,
          collectedNet: 0,
          paymentProgress: 0,
        };
      }

      const totalAttendees = sessionAttendees.length;
      const paidAttendeesCount = sessionAttendees.filter((a) => a.has_paid).length;
      const unpaidAttendeesCount = totalAttendees - paidAttendeesCount;
      const feePerPlayer = session.fee_per_player;
      const courtCost = session.court_cost;

      const grossRevenue = totalAttendees * feePerPlayer;
      const collectedRevenue = paidAttendeesCount * feePerPlayer;
      const pendingRevenue = unpaidAttendeesCount * feePerPlayer;
      const projectedNet = grossRevenue - courtCost;
      const collectedNet = collectedRevenue - courtCost;
      const paymentProgress = totalAttendees > 0 ? Math.round((paidAttendeesCount / totalAttendees) * 100) : 0;

      return {
        totalAttendees,
        paidAttendeesCount,
        unpaidAttendeesCount,
        feePerPlayer,
        courtCost,
        grossRevenue,
        collectedRevenue,
        pendingRevenue,
        projectedNet,
        collectedNet,
        paymentProgress,
      };
    },
    [data.sessions, data.attendees]
  );

  // 1. Create a new Session
  const createSession = useCallback(
    (params: {
      date: string;
      location: string;
      court_cost: number;
      fee_per_player: number;
      attendee_player_ids: string[];
      notes?: string;
    }): string => {
      const sessionId = 's_' + generateId();
      const newSession: Session = {
        id: sessionId,
        date: params.date,
        location: params.location,
        court_cost: params.court_cost,
        fee_per_player: params.fee_per_player,
        status: 'active',
        notes: params.notes,
        created_at: new Date().toISOString(),
      };

      // Create attendance entries (default unpaid)
      const newAttendees: SessionAttendee[] = params.attendee_player_ids.map((playerId) => ({
        id: 'att_' + generateId(),
        session_id: sessionId,
        player_id: playerId,
        has_paid: false,
      }));

      // Create transaction for court rental expense
      const courtTx: Transaction = {
        id: 'tx_court_' + generateId(),
        type: 'expense',
        amount: params.court_cost,
        description: `Sewa Lapangan di ${params.location}`,
        category: 'court_extra',
        timestamp: new Date().toISOString(),
        session_id: sessionId,
      };

      setData((prev) => ({
        ...prev,
        sessions: [newSession, ...prev.sessions],
        attendees: [...newAttendees, ...prev.attendees],
        transactions: [courtTx, ...prev.transactions],
      }));

      return sessionId;
    },
    []
  );

  // 2. Toggle Attendee Payment
  const toggleAttendeePayment = useCallback(
    (attendeeId: string) => {
      setData((prev) => {
        const attendee = prev.attendees.find((a) => a.id === attendeeId);
        if (!attendee) return prev;

        const session = prev.sessions.find((s) => s.id === attendee.session_id);
        if (!session) return prev;

        const player = prev.players.find((p) => p.id === attendee.player_id);
        const playerName = player ? player.name : 'Pemain';

        const newHasPaid = !attendee.has_paid;

        const updatedAttendees = prev.attendees.map((a) =>
          a.id === attendeeId
            ? { ...a, has_paid: newHasPaid, paid_at: newHasPaid ? new Date().toISOString() : undefined }
            : a
        );

        let updatedTransactions = [...prev.transactions];

        if (newHasPaid) {
          // Add income transaction for this attendee fee
          const incomeTx: Transaction = {
            id: `tx_fee_${attendee.id}_${Date.now()}`,
            type: 'income',
            amount: session.fee_per_player,
            description: `Iuran Sesi ${session.date} - ${playerName}`,
            category: 'session_fee',
            timestamp: new Date().toISOString(),
            session_id: session.id,
            attendee_id: attendee.id,
            player_id: attendee.player_id,
          };
          updatedTransactions = [incomeTx, ...updatedTransactions];
        } else {
          // Remove transaction for this attendee
          updatedTransactions = updatedTransactions.filter(
            (tx) => tx.attendee_id !== attendee.id
          );
        }

        return {
          ...prev,
          attendees: updatedAttendees,
          transactions: updatedTransactions,
        };
      });
    },
    []
  );

  // 3. Batch Mark All Paid / Unpaid for a session
  const batchSetAttendancePayment = useCallback(
    (sessionId: string, markAsPaid: boolean) => {
      setData((prev) => {
        const session = prev.sessions.find((s) => s.id === sessionId);
        if (!session) return prev;

        const sessionAttendees = prev.attendees.filter((a) => a.session_id === sessionId);
        const updatedAttendees = prev.attendees.map((a) => {
          if (a.session_id === sessionId) {
            return {
              ...a,
              has_paid: markAsPaid,
              paid_at: markAsPaid ? (a.paid_at || new Date().toISOString()) : undefined,
            };
          }
          return a;
        });

        // Clean out existing fees for this session
        let updatedTransactions = prev.transactions.filter(
          (tx) => !(tx.session_id === sessionId && tx.category === 'session_fee')
        );

        if (markAsPaid) {
          // Create income transactions for all attendees
          const newFeeTxs: Transaction[] = sessionAttendees.map((att) => {
            const player = prev.players.find((p) => p.id === att.player_id);
            return {
              id: `tx_fee_${att.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              type: 'income',
              amount: session.fee_per_player,
              description: `Iuran Sesi ${session.date} - ${player?.name || 'Pemain'}`,
              category: 'session_fee',
              timestamp: new Date().toISOString(),
              session_id: session.id,
              attendee_id: att.id,
              player_id: att.player_id,
            };
          });
          updatedTransactions = [...newFeeTxs, ...updatedTransactions];
        }

        return {
          ...prev,
          attendees: updatedAttendees,
          transactions: updatedTransactions,
        };
      });
    },
    []
  );

  // 4. Delete Session
  const deleteSession = useCallback((sessionId: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
      attendees: prev.attendees.filter((a) => a.session_id !== sessionId),
      transactions: prev.transactions.filter((tx) => tx.session_id !== sessionId),
    }));
  }, []);

  // 5a. Add Club Income
  const addIncome = useCallback(
    (params: {
      amount: number;
      description: string;
      category?: IncomeCategory;
      timestamp?: string;
      player_id?: string;
    }) => {
      const newTx: Transaction = {
        id: 'tx_inc_' + generateId(),
        type: 'income',
        amount: params.amount,
        description: params.description,
        category: params.category || 'other_income',
        timestamp: params.timestamp || new Date().toISOString(),
        player_id: params.player_id,
      };

      setData((prev) => ({
        ...prev,
        transactions: [newTx, ...prev.transactions],
      }));
    },
    []
  );

  // 5b. Add Club Expense
  const addExpense = useCallback(
    (params: {
      amount: number;
      description: string;
      category: ExpenseCategory;
      timestamp?: string;
    }) => {
      const newTx: Transaction = {
        id: 'tx_exp_' + generateId(),
        type: 'expense',
        amount: params.amount,
        description: params.description,
        category: params.category,
        timestamp: params.timestamp || new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        transactions: [newTx, ...prev.transactions],
      }));
    },
    []
  );

  // 6. Delete Transaction
  const deleteTransaction = useCallback((txId: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== txId),
    }));
  }, []);

  // 7. Player Management
  const addPlayer = useCallback((playerData: Omit<Player, 'id' | 'created_at'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: 'p_' + generateId(),
      created_at: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));
  }, []);

  const updatePlayer = useCallback((player: Player) => {
    setData((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === player.id ? player : p)),
    }));
  }, []);

  const deletePlayer = useCallback((playerId: string) => {
    setData((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== playerId),
      attendees: prev.attendees.filter((a) => a.player_id !== playerId),
    }));
  }, []);

  // 8. Settle All Unpaid Debt for a Player
  const settleAllPlayerDebt = useCallback((playerId: string) => {
    setData((prev) => {
      const player = prev.players.find((p) => p.id === playerId);
      const playerName = player ? player.name : 'Pemain';

      const unpaidForPlayer = prev.attendees.filter(
        (a) => a.player_id === playerId && !a.has_paid
      );

      if (unpaidForPlayer.length === 0) return prev;

      const updatedAttendees = prev.attendees.map((a) => {
        if (a.player_id === playerId && !a.has_paid) {
          return {
            ...a,
            has_paid: true,
            paid_at: new Date().toISOString(),
          };
        }
        return a;
      });

      const newTxs: Transaction[] = unpaidForPlayer.map((att) => {
        const session = prev.sessions.find((s) => s.id === att.session_id);
        const fee = session ? session.fee_per_player : 35000;
        return {
          id: `tx_settle_${att.id}_${Date.now()}`,
          type: 'income',
          amount: fee,
          description: `Pelunasan Iuran Kas - ${playerName} (${session ? session.date : 'Sesi Lama'})`,
          category: 'session_fee',
          timestamp: new Date().toISOString(),
          session_id: session?.id,
          attendee_id: att.id,
          player_id: playerId,
        };
      });

      return {
        ...prev,
        attendees: updatedAttendees,
        transactions: [...newTxs, ...prev.transactions],
      };
    });
  }, []);

  // 9. Reset to default sample data
  const resetData = useCallback(() => {
    const seed = resetDataToSeed();
    setData(seed);
  }, []);

  // 10. Backup & Restore
  const exportData = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smashledger-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [data]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.players) && Array.isArray(parsed.sessions)) {
        setData(parsed);
        saveClubDataToFirestore(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse import JSON:', e);
      return false;
    }
  }, []);

  const value: AppContextType = {
    players: data.players,
    sessions: data.sessions,
    attendees: data.attendees,
    transactions: data.transactions,
    clubName: data.clubName,
    activeTab,
    setActiveTab,
    selectedSessionId,
    setSelectedSessionId,

    totalUangKas,
    totalIncome,
    totalExpense,
    totalPendingDebt,
    getPlayerDebt,
    getSessionMetrics,

    createSession,
    toggleAttendeePayment,
    batchSetAttendancePayment,
    deleteSession,

    addIncome,
    addExpense,
    deleteTransaction,

    addPlayer,
    updatePlayer,
    deletePlayer,
    settleAllPlayerDebt,

    resetData,
    exportData,
    importData,
    isCloudConnected: isFirebaseConfigured(),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
