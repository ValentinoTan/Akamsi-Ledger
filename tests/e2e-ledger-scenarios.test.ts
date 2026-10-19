import { describe, it, expect } from 'vitest';
import type { AppStateData } from '../src/services/storage';
import type { Transaction, Session, SessionAttendee, Player } from '../src/types';
import {
  computeLedgerBalance,
  validateTransactionAmount,
  deleteTransactionWithReversal,
  reconcileLedgerIntegrity,
  AtomicTransactionRunner,
} from '../src/utils/ledger';

describe('Phase 3: Frontend & E2E Scenarios', () => {
  // -------------------------------------------------------------
  // Scenario 1: Multi-Tab / Multi-Client Race Condition Simulation
  // Simulate two clients/tabs updating the ledger concurrently.
  // -------------------------------------------------------------
  describe('Multi-Tab Race Condition & Concurrency', () => {
    it('simulates two tabs executing transactions with atomic sync without double-spend or corruption', async () => {
      // Shared database/cloud store simulation
      let cloudStore: AppStateData = {
        clubName: 'Akamsi Badminton Club',
        players: [
          {
            id: 'p1',
            name: 'Tino',
            skill_level: 'intermediate',
            playstyle: 'all-round',
            created_at: '2026-09-28T10:00:00.000Z',
          },
        ],
        sessions: [],
        attendees: [],
        transactions: [
          {
            id: 'tx-init',
            type: 'income',
            amount: 100000,
            description: 'Saldo Awal',
            timestamp: '2026-10-19T00:00:00Z',
          },
        ],
      };

      const runner = new AtomicTransactionRunner();

      // Tab 1 executes a withdrawal of 70,000
      const tab1Withdrawal = async () => {
        return runner.run(async () => {
          await new Promise((r) => setTimeout(r, 15)); // simulate network latency
          const { totalUangKas } = computeLedgerBalance(cloudStore.transactions);
          if (totalUangKas >= 70000) {
            const tx: Transaction = {
              id: 'tx-tab1',
              type: 'expense',
              amount: 70000,
              description: 'Tab 1 Shuttlecock Purchase',
              timestamp: new Date().toISOString(),
            };
            cloudStore = {
              ...cloudStore,
              transactions: [tx, ...cloudStore.transactions],
            };
            return { success: true };
          }
          return { success: false, reason: 'Saldo tidak mencukupi' };
        });
      };

      // Tab 2 simultaneously attempts another withdrawal of 70,000 (total 140,000 > 100,000)
      const tab2Withdrawal = async () => {
        return runner.run(async () => {
          await new Promise((r) => setTimeout(r, 10)); // simulate network latency
          const { totalUangKas } = computeLedgerBalance(cloudStore.transactions);
          if (totalUangKas >= 70000) {
            const tx: Transaction = {
              id: 'tx-tab2',
              type: 'expense',
              amount: 70000,
              description: 'Tab 2 Court Extension',
              timestamp: new Date().toISOString(),
            };
            cloudStore = {
              ...cloudStore,
              transactions: [tx, ...cloudStore.transactions],
            };
            return { success: true };
          }
          return { success: false, reason: 'Saldo tidak mencukupi' };
        });
      };

      // Execute both tabs concurrently
      const [resTab1, resTab2] = await Promise.all([tab1Withdrawal(), tab2Withdrawal()]);

      // Exactly ONE transaction should succeed; the second must fail gracefully
      const successCount = [resTab1, resTab2].filter((r) => r.success).length;
      expect(successCount).toBe(1);

      // Verify final cloud store balance remains non-negative (Rp 30,000)
      const finalBalance = computeLedgerBalance(cloudStore.transactions);
      expect(finalBalance.totalUangKas).toBe(30000);
      expect(finalBalance.totalUangKas).toBeGreaterThanOrEqual(0);
    });

    it('simulates live cross-tab reactive balance synchronization without reload', () => {
      let clientTabA_Balance = 0;
      let clientTabB_Balance = 0;

      // Broadcast channel simulation
      const listeners: Array<(tx: Transaction) => void> = [];
      const onBroadcast = (fn: (tx: Transaction) => void) => listeners.push(fn);
      const broadcast = (tx: Transaction) => listeners.forEach((fn) => fn(tx));

      let ledgerA: Transaction[] = [];
      let ledgerB: Transaction[] = [];

      // Tab B listens to incoming transactions from Tab A
      onBroadcast((incomingTx) => {
        ledgerB = [incomingTx, ...ledgerB];
        clientTabB_Balance = computeLedgerBalance(ledgerB).totalUangKas;
      });

      // Tab A records an income of Rp 197.750
      const newIncomeTx: Transaction = {
        id: 'tx-live-1',
        type: 'income',
        amount: 197750,
        description: 'Pemasukan Kas Baru',
        timestamp: new Date().toISOString(),
      };

      ledgerA = [newIncomeTx, ...ledgerA];
      clientTabA_Balance = computeLedgerBalance(ledgerA).totalUangKas;

      // Tab A broadcasts to network
      broadcast(newIncomeTx);

      // Verify Tab B updated reactively to match Tab A exactly
      expect(clientTabA_Balance).toBe(197750);
      expect(clientTabB_Balance).toBe(197750);
      expect(clientTabA_Balance).toBe(clientTabB_Balance);
    });
  });

  // -------------------------------------------------------------
  // Scenario 2: UI Boundary Violations & Debounce Protection
  // -------------------------------------------------------------
  describe('UI Boundary Violations & Rapid-Fire Click Protection', () => {
    it('blocks rapid-fire duplicate submissions via isSubmitting lock', async () => {
      let isSubmitting = false;
      const submittedTransactions: Transaction[] = [];

      const handleSimulatedSubmit = async (data: { amount: number; description: string }) => {
        if (isSubmitting) {
          return { status: 'rejected_duplicate' };
        }
        if (!validateTransactionAmount(data.amount)) {
          return { status: 'rejected_invalid_amount' };
        }

        isSubmitting = true;
        await new Promise((resolve) => setTimeout(resolve, 30)); // simulate async state commitment

        submittedTransactions.push({
          id: `tx-${Date.now()}-${Math.random()}`,
          type: 'income',
          amount: data.amount,
          description: data.description,
          timestamp: new Date().toISOString(),
        });

        isSubmitting = false;
        return { status: 'success' };
      };

      // User spams the submit button 5 times in rapid succession (< 30ms apart)
      const rapidClicks = await Promise.all([
        handleSimulatedSubmit({ amount: 50000, description: 'Iuran Kas' }),
        handleSimulatedSubmit({ amount: 50000, description: 'Iuran Kas' }),
        handleSimulatedSubmit({ amount: 50000, description: 'Iuran Kas' }),
        handleSimulatedSubmit({ amount: 50000, description: 'Iuran Kas' }),
        handleSimulatedSubmit({ amount: 50000, description: 'Iuran Kas' }),
      ]);

      const successCount = rapidClicks.filter((c) => c.status === 'success').length;
      const rejectedCount = rapidClicks.filter((c) => c.status === 'rejected_duplicate').length;

      // Only 1 transaction should have passed through; the 4 duplicates rejected
      expect(successCount).toBe(1);
      expect(rejectedCount).toBe(4);
      expect(submittedTransactions.length).toBe(1);
      expect(submittedTransactions[0].amount).toBe(50000);
    });

    it('rejects boundary violation inputs (negative, NaN, strings, zero, oversized)', () => {
      const invalidAmounts = [-10000, 0, NaN, Infinity, -Infinity, '50000', null, undefined];
      invalidAmounts.forEach((badVal) => {
        const isValid = validateTransactionAmount(badVal);
        expect(isValid).toBe(false);
      });
    });
  });

  // -------------------------------------------------------------
  // Scenario 3: Visual & State Synchronization
  // -------------------------------------------------------------
  describe('Visual & State Synchronization Invariant', () => {
    it('header balance reactively matches the exact sum of transaction history across mutations', () => {
      let transactions: Transaction[] = [];

      const verifySynchronization = () => {
        const { totalIncome, totalExpense, totalUangKas } = computeLedgerBalance(transactions);
        expect(totalUangKas).toBe(totalIncome - totalExpense);
      };

      // Step 1: Initial empty ledger
      verifySynchronization();

      // Step 2: Add initial income
      transactions.push({
        id: 'tx-1',
        type: 'income',
        amount: 197750,
        description: 'Pemasukan Kas 20/09/2026',
        timestamp: '2026-09-20T10:00:00Z',
      });
      verifySynchronization();

      // Step 3: Add expense 1
      transactions.push({
        id: 'tx-2',
        type: 'expense',
        amount: 120000,
        description: 'Sewa Lapangan 26/09/2026',
        timestamp: '2026-09-26T10:00:00Z',
      });
      verifySynchronization();

      // Step 4: Add expense 2
      transactions.push({
        id: 'tx-3',
        type: 'expense',
        amount: 149260,
        description: 'Beli Kok 27/09/2026',
        timestamp: '2026-09-27T10:00:00Z',
      });
      verifySynchronization();

      const balance = computeLedgerBalance(transactions);
      expect(balance.totalIncome).toBe(197750);
      expect(balance.totalExpense).toBe(269260);
      expect(balance.totalUangKas).toBe(-71510);
    });
  });
});
