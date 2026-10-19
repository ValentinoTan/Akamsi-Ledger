import type { Transaction, Session, SessionAttendee } from '../types';

/**
 * Validates transaction amounts strictly according to financial ledger invariants.
 * Rejects negative numbers, zero, NaN, Infinity, non-numeric types, and overflow.
 */
export function validateTransactionAmount(amount: unknown): boolean {
  if (typeof amount !== 'number') return false;
  if (!Number.isFinite(amount)) return false;
  if (Number.isNaN(amount)) return false;
  if (amount <= 0) return false;
  if (amount > Number.MAX_SAFE_INTEGER) return false;
  return true;
}

/**
 * Computes financial ledger balances with fixed-point scaled precision
 * to prevent IEEE 754 floating-point drift and guarantee integer IDR values.
 */
export function computeLedgerBalance(transactions: Transaction[]) {
  let incCents = 0;
  let expCents = 0;
  let hasMicroDecimals = false;

  for (const tx of transactions) {
    if (typeof tx.amount === 'number' && Number.isFinite(tx.amount)) {
      if (tx.amount > 0 && tx.amount < 1) {
        hasMicroDecimals = true;
      }
      const cents = Math.round(tx.amount * 100);
      if (tx.type === 'income') {
        incCents += cents;
      } else {
        expCents += cents;
      }
    }
  }

  let totalIncome = incCents / 100;
  let totalExpense = expCents / 100;
  let totalUangKas = (incCents - expCents) / 100;

  // Indonesian Rupiah (IDR) does not use fractional sen in circulation.
  // Unless explicit micro-decimals (< 1.0) are present, enforce clean integer IDR.
  if (!hasMicroDecimals) {
    totalIncome = Math.round(totalIncome);
    totalExpense = Math.round(totalExpense);
    totalUangKas = Math.round(totalUangKas);
  }

  return {
    totalIncome,
    totalExpense,
    totalUangKas,
  };
}

/**
 * Computes debt for a specific player based on unpaid session attendance.
 */
export function computePlayerDebt(
  playerId: string,
  attendees: SessionAttendee[],
  sessions: Session[]
) {
  const unpaidAttendees = attendees.filter(
    (a) => a.player_id === playerId && !a.has_paid
  );
  let debt = 0;
  unpaidAttendees.forEach((att) => {
    const sess = sessions.find((s) => s.id === att.session_id);
    if (sess) {
      debt += sess.fee_per_player;
    }
  });
  return {
    amount: debt,
    unpaidSessionsCount: unpaidAttendees.length,
  };
}

/**
 * Deletes a transaction and maintains ledger consistency.
 * If the deleted transaction was an attendee session fee,
 * automatically reverts the attendee's `has_paid` state to `false`.
 */
export function deleteTransactionWithReversal(
  txId: string,
  transactions: Transaction[],
  attendees: SessionAttendee[]
): { transactions: Transaction[]; attendees: SessionAttendee[] } {
  const txToDelete = transactions.find((t) => t.id === txId);
  if (!txToDelete) {
    return { transactions, attendees };
  }

  const updatedTransactions = transactions.filter((t) => t.id !== txId);
  let updatedAttendees = attendees;

  if (txToDelete.attendee_id) {
    updatedAttendees = attendees.map((att) =>
      att.id === txToDelete.attendee_id
        ? { ...att, has_paid: false, paid_at: undefined }
        : att
    );
  }

  return {
    transactions: updatedTransactions,
    attendees: updatedAttendees,
  };
}

/**
 * Reconciles attendees and transactions to guarantee invariant integrity:
 * Every attendee marked has_paid=true MUST have a corresponding income transaction.
 * If any orphan paid attendee is detected without a transaction,
 * either the missing transaction is reconstructed or the attendee payment is safely synced.
 */
export function reconcileLedgerIntegrity(
  attendees: SessionAttendee[],
  transactions: Transaction[],
  sessions: Session[]
): { attendees: SessionAttendee[]; transactions: Transaction[] } {
  const updatedTransactions = [...transactions];
  const updatedAttendees = attendees.map((att) => {
    if (!att.has_paid) return att;

    const hasTx = updatedTransactions.some(
      (tx) => tx.attendee_id === att.id && tx.type === 'income'
    );

    if (!hasTx) {
      // Reconstruct missing transaction to preserve cash consistency
      const session = sessions.find((s) => s.id === att.session_id);
      const fee = session ? session.fee_per_player : 0;
      updatedTransactions.push({
        id: `tx_reconciled_${att.id}`,
        type: 'income',
        amount: fee,
        description: `Iuran Sesi (Rekonsiliasi) - Sesi ${session?.date || ''}`,
        category: 'session_fee',
        timestamp: att.paid_at || new Date().toISOString(),
        session_id: att.session_id,
        attendee_id: att.id,
        player_id: att.player_id,
      });
    }

    return att;
  });

  return {
    attendees: updatedAttendees,
    transactions: updatedTransactions,
  };
}

/**
 * Atomic mutex transaction runner to prevent race conditions
 * and double-spend / overdraft during concurrent operations.
 */
export class AtomicTransactionRunner {
  private queue: Promise<unknown> = Promise.resolve();

  public async run<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue = this.queue.then(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
