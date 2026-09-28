import type { Player, Session, SessionAttendee, Transaction } from '../types';

const STORAGE_KEY = 'smashledger_club_data_v1';

export interface AppStateData {
  players: Player[];
  sessions: Session[];
  attendees: SessionAttendee[];
  transactions: Transaction[];
  clubName: string;
}

const DEFAULT_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Budi Santoso',
    phone: '081234567890',
    skill_level: 'advanced',
    playstyle: 'rear-court',
    created_at: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'Kevin Wijaya',
    phone: '081298765432',
    skill_level: 'advanced',
    playstyle: 'front-court',
    created_at: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'p3',
    name: 'Agus Pratama',
    phone: '085712345678',
    skill_level: 'intermediate',
    playstyle: 'all-round',
    created_at: '2026-08-02T10:00:00.000Z',
  },
  {
    id: 'p4',
    name: 'Rizky Firmansyah',
    phone: '087812345678',
    skill_level: 'intermediate',
    playstyle: 'rear-court',
    created_at: '2026-08-02T10:00:00.000Z',
  },
  {
    id: 'p5',
    name: 'Dimas Setiawan',
    phone: '081399887766',
    skill_level: 'intermediate',
    playstyle: 'front-court',
    created_at: '2026-08-05T10:00:00.000Z',
  },
  {
    id: 'p6',
    name: 'Hendra Gunawan',
    phone: '082155443322',
    skill_level: 'advanced',
    playstyle: 'all-round',
    created_at: '2026-08-05T10:00:00.000Z',
  },
  {
    id: 'p7',
    name: 'Fajar Nugroho',
    phone: '085211223344',
    skill_level: 'intermediate',
    playstyle: 'rear-court',
    created_at: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 'p8',
    name: 'Doni Kurniawan',
    phone: '081733221100',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-08-12T10:00:00.000Z',
  },
  {
    id: 'p9',
    name: 'Eko Prasetyo',
    phone: '089677889900',
    skill_level: 'beginner',
    playstyle: 'front-court',
    created_at: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 'p10',
    name: 'Wahyu Hidayat',
    phone: '082233445566',
    skill_level: 'intermediate',
    playstyle: 'rear-court',
    created_at: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'p11',
    name: 'Ari Wibowo',
    phone: '081855667788',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'p12',
    name: 'Taufik Rahman',
    phone: '087799001122',
    skill_level: 'advanced',
    playstyle: 'front-court',
    created_at: '2026-08-25T10:00:00.000Z',
  },
];

const DEFAULT_SESSIONS: Session[] = [
  {
    id: 's1',
    date: '2026-09-15',
    location: 'GOR Smash Arena (Lap 1 & 2)',
    court_cost: 160000,
    fee_per_player: 35000,
    status: 'completed',
    notes: 'Main 2 jam 2 lapangan. Shuttlecock Samurai hijau.',
    created_at: '2026-09-15T19:00:00.000Z',
  },
  {
    id: 's2',
    date: '2026-09-18',
    location: 'GOR Champion Hall B',
    court_cost: 180000,
    fee_per_player: 40000,
    status: 'completed',
    notes: 'Sesi Jumat malam rutin.',
    created_at: '2026-09-18T20:00:00.000Z',
  },
  {
    id: 's3',
    date: '2026-09-22',
    location: 'GOR Rajawali Arena',
    court_cost: 170000,
    fee_per_player: 35000,
    status: 'active',
    notes: 'Sesi aktif hari ini. Latihan & matchmaking doubles.',
    created_at: '2026-09-22T14:00:00.000Z',
  },
];

const DEFAULT_ATTENDEES: SessionAttendee[] = [
  // Session 1 (8 players, all paid)
  { id: 'att-1-1', session_id: 's1', player_id: 'p1', has_paid: true, paid_at: '2026-09-15T21:00:00.000Z' },
  { id: 'att-1-2', session_id: 's1', player_id: 'p2', has_paid: true, paid_at: '2026-09-15T21:00:00.000Z' },
  { id: 'att-1-3', session_id: 's1', player_id: 'p3', has_paid: true, paid_at: '2026-09-15T21:05:00.000Z' },
  { id: 'att-1-4', session_id: 's1', player_id: 'p4', has_paid: true, paid_at: '2026-09-15T21:10:00.000Z' },
  { id: 'att-1-5', session_id: 's1', player_id: 'p5', has_paid: true, paid_at: '2026-09-15T21:12:00.000Z' },
  { id: 'att-1-6', session_id: 's1', player_id: 'p6', has_paid: true, paid_at: '2026-09-15T21:15:00.000Z' },
  { id: 'att-1-7', session_id: 's1', player_id: 'p7', has_paid: true, paid_at: '2026-09-15T21:20:00.000Z' },
  { id: 'att-1-8', session_id: 's1', player_id: 'p8', has_paid: true, paid_at: '2026-09-15T21:30:00.000Z' },

  // Session 2 (7 players, 5 paid, 2 unpaid)
  { id: 'att-2-1', session_id: 's2', player_id: 'p1', has_paid: true, paid_at: '2026-09-18T22:00:00.000Z' },
  { id: 'att-2-2', session_id: 's2', player_id: 'p2', has_paid: true, paid_at: '2026-09-18T22:00:00.000Z' },
  { id: 'att-2-3', session_id: 's2', player_id: 'p3', has_paid: true, paid_at: '2026-09-18T22:05:00.000Z' },
  { id: 'att-2-4', session_id: 's2', player_id: 'p8', has_paid: false }, // Doni hasn't paid s2
  { id: 'att-2-5', session_id: 's2', player_id: 'p9', has_paid: false }, // Eko hasn't paid s2
  { id: 'att-2-6', session_id: 's2', player_id: 'p10', has_paid: true, paid_at: '2026-09-18T22:10:00.000Z' },
  { id: 'att-2-7', session_id: 's2', player_id: 'p12', has_paid: true, paid_at: '2026-09-18T22:15:00.000Z' },

  // Session 3 (Today's active session, 8 attendees, 4 paid, 4 pending)
  { id: 'att-3-1', session_id: 's3', player_id: 'p1', has_paid: true, paid_at: '2026-09-22T14:30:00.000Z' },
  { id: 'att-3-2', session_id: 's3', player_id: 'p2', has_paid: true, paid_at: '2026-09-22T14:35:00.000Z' },
  { id: 'att-3-3', session_id: 's3', player_id: 'p4', has_paid: true, paid_at: '2026-09-22T14:40:00.000Z' },
  { id: 'att-3-4', session_id: 's3', player_id: 'p5', has_paid: true, paid_at: '2026-09-22T14:45:00.000Z' },
  { id: 'att-3-5', session_id: 's3', player_id: 'p6', has_paid: false },
  { id: 'att-3-6', session_id: 's3', player_id: 'p7', has_paid: false },
  { id: 'att-3-7', session_id: 's3', player_id: 'p8', has_paid: false },
  { id: 'att-3-8', session_id: 's3', player_id: 'p11', has_paid: false },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  // Initial club fund reserve
  {
    id: 'tx-0',
    type: 'income',
    amount: 500000,
    description: 'Saldo Awal Kas Komunitas PB Smash Nusantara',
    category: 'other_income',
    timestamp: '2026-09-01T08:00:00.000Z',
  },
  // Session 1: Paid fees (8 x 35,000 = 280,000)
  {
    id: 'tx-s1-income',
    type: 'income',
    amount: 280000,
    description: 'Iuran Sesi 15 Sep (8 Pemain)',
    category: 'session_fee',
    timestamp: '2026-09-15T21:30:00.000Z',
    session_id: 's1',
  },
  // Session 1: Court payment expense
  {
    id: 'tx-s1-court',
    type: 'expense',
    amount: 160000,
    description: 'Sewa Lapangan GOR Smash Arena (2 Jam)',
    category: 'court_extra',
    timestamp: '2026-09-15T21:35:00.000Z',
    session_id: 's1',
  },
  // Club Expense: Buy shuttlecocks
  {
    id: 'tx-exp-1',
    type: 'expense',
    amount: 240000,
    description: 'Beli 2 Slop Shuttlecock Samurai Hijau',
    category: 'shuttlecocks',
    timestamp: '2026-09-16T11:00:00.000Z',
  },
  // Session 2: Collected fees (5 x 40,000 = 200,000)
  {
    id: 'tx-s2-income',
    type: 'income',
    amount: 200000,
    description: 'Iuran Sesi 18 Sep (5 dari 7 Pemain lunas)',
    category: 'session_fee',
    timestamp: '2026-09-18T22:15:00.000Z',
    session_id: 's2',
  },
  // Session 2: Court payment expense
  {
    id: 'tx-s2-court',
    type: 'expense',
    amount: 180000,
    description: 'Sewa Lapangan GOR Champion Hall B',
    category: 'court_extra',
    timestamp: '2026-09-18T22:20:00.000Z',
    session_id: 's2',
  },
  // Club Expense: Refreshment / Aqua Galon
  {
    id: 'tx-exp-2',
    type: 'expense',
    amount: 45000,
    description: 'Beli Air Mineral & Pocari Sweat Tim',
    category: 'refreshment',
    timestamp: '2026-09-19T16:00:00.000Z',
  },
  // Session 3: Today's collected fees so far (4 x 35,000 = 140,000)
  {
    id: 'tx-s3-income',
    type: 'income',
    amount: 140000,
    description: 'Iuran Sesi 22 Sep (4 Pemain lunas awal)',
    category: 'session_fee',
    timestamp: '2026-09-22T14:45:00.000Z',
    session_id: 's3',
  },
  // Session 3: Court cost paid
  {
    id: 'tx-s3-court',
    type: 'expense',
    amount: 170000,
    description: 'DP / Lunas Sewa Lapangan GOR Rajawali',
    category: 'court_extra',
    timestamp: '2026-09-22T14:05:00.000Z',
    session_id: 's3',
  },
];

export const loadInitialData = (): AppStateData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.players) && Array.isArray(parsed.sessions)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading data from localStorage, falling back to seed data:', err);
  }

  const defaultData: AppStateData = {
    players: DEFAULT_PLAYERS,
    sessions: DEFAULT_SESSIONS,
    attendees: DEFAULT_ATTENDEES,
    transactions: DEFAULT_TRANSACTIONS,
    clubName: 'PB Smash Nusantara',
  };

  saveData(defaultData);
  return defaultData;
};

export const saveData = (data: AppStateData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving data to localStorage:', err);
  }
};

export const resetDataToSeed = (): AppStateData => {
  const seed: AppStateData = {
    players: DEFAULT_PLAYERS,
    sessions: DEFAULT_SESSIONS,
    attendees: DEFAULT_ATTENDEES,
    transactions: DEFAULT_TRANSACTIONS,
    clubName: 'PB Smash Nusantara',
  };
  saveData(seed);
  return seed;
};
