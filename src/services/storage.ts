import type { Player, Session, SessionAttendee, Transaction } from '../types';

const STORAGE_KEY = 'akamsi_ledger_club_data_v2';

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
    name: 'Tino',
    phone: '081237673355',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'BS',
    phone: '081331790895',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p3',
    name: 'Leon',
    phone: '08991662313',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p4',
    name: 'Patrick',
    phone: '082167945089',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p5',
    name: 'Hia',
    phone: '085183006604',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p6',
    name: 'Anastasia',
    phone: '08113168987',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p7',
    name: 'Darren Sipen',
    phone: '085157206619',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p8',
    name: 'Cathlin',
    phone: '081216787802',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p9',
    name: 'Jeanice',
    phone: '0895339615925',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p10',
    name: 'Jessica Frisianti',
    phone: '081222890199',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p11',
    name: 'Jason Jonathan JJ',
    phone: '089681607035',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p12',
    name: 'Kedrick',
    phone: '08992228189',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p13',
    name: 'Frederico',
    phone: '087773568169',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p14',
    name: 'Mario Joseph MJ',
    phone: '08563338888',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p15',
    name: 'Dylan',
    phone: '0411694850',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p16',
    name: 'Ricardo',
    phone: '085186821304',
    skill_level: 'beginner',
    playstyle: 'all-round',
    created_at: '2026-09-28T10:00:00.000Z',
  },
];

const DEFAULT_SESSIONS: Session[] = [];
const DEFAULT_ATTENDEES: SessionAttendee[] = [];
export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-inc-1',
    type: 'income',
    amount: 197750,
    description: 'Pemasukan Kas',
    category: 'other_income',
    timestamp: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'tx-exp-1',
    type: 'expense',
    amount: 120000,
    description: 'Pengeluaran Kas',
    category: 'misc',
    timestamp: '2026-09-26T10:00:00.000Z',
  },
  {
    id: 'tx-exp-2',
    type: 'expense',
    amount: 149260,
    description: 'Pengeluaran Kas',
    category: 'misc',
    timestamp: '2026-09-27T10:00:00.000Z',
  },
];

export const loadInitialData = (): AppStateData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed && 
        Array.isArray(parsed.players) && 
        Array.isArray(parsed.sessions) &&
        parsed.clubName !== 'PB Smash Nusantara'
      ) {
        if (!parsed.transactions || parsed.transactions.length === 0) {
          parsed.transactions = DEFAULT_TRANSACTIONS;
        }
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
    clubName: 'Akamsi Badminton Club',
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
    clubName: 'Akamsi Badminton Club',
  };
  saveData(seed);
  return seed;
};
