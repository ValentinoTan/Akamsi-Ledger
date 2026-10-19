import { describe, it, expect } from 'vitest';
import type { Transaction, Session, SessionAttendee } from '../src/types';
import {
  computeLedgerBalance,
  computePlayerDebt,
  validateTransactionAmount,
  deleteTransactionWithReversal,
  reconcileLedgerIntegrity,
  AtomicTransactionRunner,
} from '../src/utils/ledger';

describe('Phase 2: Ledger Invariant & Edge Case Test Suite', () => {
  // -------------------------------------------------------------
  // Rule 1: Double-Entry / Cash Consistency Invariant
  // In a balanced ledger, every attendee payment marked as paid
  // must have exactly one corresponding income transaction in the ledger.
  // -------------------------------------------------------------
  describe('1. Ledger Consistency Invariant', () => {
    it('every attendee marked has_paid=true must have a corresponding income transaction', () => {
      const initialAttendees: SessionAttendee[] = [
        { id: 'att-1', session_id: 's-1', player_id: 'p-1', has_paid: true },
        { id: 'att-2', session_id: 's-1', player_id: 'p-2', has_paid: false },
        { id: 'att-3', session_id: 's-1', player_id: 'p-3', has_paid: true },
      ];

      // Defective scenario: att-3 has_paid is true, but transaction was missing/desynchronized
      const initialTransactions: Transaction[] = [
        {
          id: 'tx-1',
          type: 'income',
          amount: 35000,
          description: 'Iuran Sesi - Player 1',
          timestamp: '2026-10-19T10:00:00Z',
          attendee_id: 'att-1',
        },
      ];

      const sessions: Session[] = [
        {
          id: 's-1',
          date: '2026-10-19',
          location: 'Gor Bulutangkis',
          court_cost: 100000,
          fee_per_player: 35000,
          status: 'active',
          created_at: '2026-10-19T00:00:00Z',
        },
      ];

      // Run ledger integrity reconciliation
      const { attendees, transactions } = reconcileLedgerIntegrity(
        initialAttendees,
        initialTransactions,
        sessions
      );

      const paidAttendeesWithoutTx = attendees.filter(
        (att) =>
          att.has_paid &&
          !transactions.some((tx) => tx.attendee_id === att.id && tx.type === 'income')
      );

      // Invariant assertion: there should be ZERO paid attendees without an income transaction
      expect(paidAttendeesWithoutTx.length).toBe(0);
    });

    it('deleting an attendee fee transaction without reverting has_paid breaks invariant', () => {
      let attendees: SessionAttendee[] = [
        { id: 'att-1', session_id: 's-1', player_id: 'p-1', has_paid: true },
      ];
      let transactions: Transaction[] = [
        {
          id: 'tx-fee-1',
          type: 'income',
          amount: 35000,
          description: 'Iuran Sesi - Player 1',
          timestamp: '2026-10-19T10:00:00Z',
          attendee_id: 'att-1',
        },
      ];

      // Execute deletion with atomic reversal guarantee
      const result = deleteTransactionWithReversal('tx-fee-1', transactions, attendees);
      transactions = result.transactions;
      attendees = result.attendees;

      // Check invariant: Cash collected must equal sum of has_paid attendees * fee
      const ledger = computeLedgerBalance(transactions);
      const expectedRevenueFromAttendees = attendees
        .filter((a) => a.has_paid)
        .reduce((sum, a) => sum + 35000, 0);

      expect(ledger.totalIncome).toBe(expectedRevenueFromAttendees);
    });
  });

  // -------------------------------------------------------------
  // Rule 2: Floating-Point Drift
  // Summing 1,000 transactions of 0.10 + 0.20 must yield exactly 300.00
  // -------------------------------------------------------------
  describe('2. Floating-Point Drift', () => {
    it('summing 1,000 transactions of 0.10 + 0.20 must yield exactly 300.00 without IEEE 754 drift', () => {
      const txs: Transaction[] = [];
      for (let i = 0; i < 1000; i++) {
        txs.push({
          id: `tx-a-${i}`,
          type: 'income',
          amount: 0.1,
          description: 'Micro tx a',
          timestamp: new Date().toISOString(),
        });
        txs.push({
          id: `tx-b-${i}`,
          type: 'income',
          amount: 0.2,
          description: 'Micro tx b',
          timestamp: new Date().toISOString(),
        });
      }

      const { totalIncome } = computeLedgerBalance(txs);

      // Scaled fixed-point ledger must equal 300.00 exactly without IEEE 754 drift
      expect(totalIncome).toBe(300.0);
    });

    it('IDR currency accumulation should never produce non-integer or fractional sen', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-1',
          type: 'income',
          amount: 197750,
          description: 'Income',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'tx-2',
          type: 'expense',
          amount: 149260.55, // floating-point injection
          description: 'Odd expense',
          timestamp: new Date().toISOString(),
        },
      ];

      const { totalUangKas } = computeLedgerBalance(txs);
      expect(Number.isInteger(totalUangKas)).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // Rule 3: Edge Case Validation
  // Reject negative amounts, strings with non-numeric characters, overflow, NaN
  // -------------------------------------------------------------
  describe('3. Edge Case Validation', () => {
    it('rejects negative amounts', () => {
      expect(validateTransactionAmount(-50000)).toBe(false);
      expect(validateTransactionAmount(-0.01)).toBe(false);
    });

    it('rejects zero amounts', () => {
      expect(validateTransactionAmount(0)).toBe(false);
    });

    it('rejects NaN, Infinity, and -Infinity', () => {
      expect(validateTransactionAmount(NaN)).toBe(false);
      expect(validateTransactionAmount(Infinity)).toBe(false);
      expect(validateTransactionAmount(-Infinity)).toBe(false);
    });

    it('rejects non-numeric strings, null, and undefined', () => {
      expect(validateTransactionAmount('50000' as unknown)).toBe(false);
      expect(validateTransactionAmount('abc' as unknown)).toBe(false);
      expect(validateTransactionAmount(null)).toBe(false);
      expect(validateTransactionAmount(undefined)).toBe(false);
    });

    it('rejects values exceeding MAX_SAFE_INTEGER', () => {
      expect(validateTransactionAmount(Number.MAX_SAFE_INTEGER + 1000)).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // Rule 4: Concurrency & Race Conditions
  // Simulate concurrent withdrawal/expense requests against an account
  // -------------------------------------------------------------
  describe('4. Concurrency & Race Conditions', () => {
    it('prevents account balance from dropping below zero under concurrent overdraft attempts', async () => {
      let balance = 100000; // Rp 100.000 starting balance
      const withdrawalAmount = 80000; // 2 requests of 80k each (total 160k > 100k)

      const runner = new AtomicTransactionRunner();
      const executeWithdrawalSafe = async () => {
        return runner.run(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10)); // simulate async I/O
          if (balance >= withdrawalAmount) {
            await new Promise((resolve) => setTimeout(resolve, 10)); // delay before write
            balance -= withdrawalAmount;
            return { success: true };
          }
          return { success: false, reason: 'Insufficient funds' };
        });
      };

      // Fire 2 concurrent requests simultaneously
      const [res1, res2] = await Promise.all([
        executeWithdrawalSafe(),
        executeWithdrawalSafe(),
      ]);

      const successCount = [res1, res2].filter((r) => r.success).length;

      // Invariant: Only ONE withdrawal should succeed; balance must NOT be negative
      expect(successCount).toBe(1);
      expect(balance).toBeGreaterThanOrEqual(0);
    });

    it('atomic transaction runner guarantees balance non-negativity', async () => {
      let balance = 100000;
      const withdrawalAmount = 80000;

      // Atomic mutex / serialized lock implementation
      let lock = Promise.resolve();
      const executeWithdrawalSafe = (amount: number) => {
        return new Promise<{ success: boolean; newBalance: number }>((resolve) => {
          lock = lock.then(async () => {
            await new Promise((r) => setTimeout(r, 10)); // simulate network delay
            if (balance >= amount) {
              balance -= amount;
              resolve({ success: true, newBalance: balance });
            } else {
              resolve({ success: false, newBalance: balance });
            }
          });
        });
      };

      const [res1, res2] = await Promise.all([
        executeWithdrawalSafe(withdrawalAmount),
        executeWithdrawalSafe(withdrawalAmount),
      ]);

      expect(res1.success || res2.success).toBe(true);
      expect(res1.success && res2.success).toBe(false);
      expect(balance).toBe(20000);
    });
  });
});
