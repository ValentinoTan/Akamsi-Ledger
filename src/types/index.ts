export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type Playstyle = 'front-court' | 'rear-court' | 'all-round';

export interface Player {
  id: string;
  name: string;
  phone?: string;
  skill_level: SkillLevel;
  playstyle: Playstyle;
  avatar_color?: string;
  notes?: string;
  created_at: string;
}

export type SessionStatus = 'active' | 'completed';

export interface SessionAttendee {
  id: string;
  session_id: string;
  player_id: string;
  has_paid: boolean;
  paid_at?: string;
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  location: string;
  court_cost: number;
  fee_per_player: number;
  status: SessionStatus;
  notes?: string;
  created_at: string;
}

export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'shuttlecocks'
  | 'gear'
  | 'court_extra'
  | 'medical'
  | 'refreshment'
  | 'misc';

export type IncomeCategory =
  | 'monthly_dues'
  | 'donation'
  | 'merchandise'
  | 'tournament_prize'
  | 'initial_balance'
  | 'session_fee'
  | 'other_income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: ExpenseCategory | IncomeCategory | string;
  timestamp: string; // ISO string
  session_id?: string;
  attendee_id?: string;
  player_id?: string; // which player paid or benefited
}
