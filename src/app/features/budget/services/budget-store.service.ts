import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from '../../../core/storage/storage.service';
import { Budget, BudgetExpense } from '../models/budget.model';

const KEY = 'debt-slayer.budget.v1';

function nowIso(): string {
  return new Date().toISOString();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function safeNum(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

const EMPTY: Budget = {
  incomeMonthly: 0,
  expenses: [],
  updatedAt: nowIso(),
};

@Injectable({ providedIn: 'root' })
export class BudgetStore {
  private readonly _budget = signal<Budget>(EMPTY);
  readonly budget = this._budget.asReadonly();

  readonly incomeMonthly = computed(() => this._budget().incomeMonthly);

  readonly totalExpenses = computed(() =>
    round2(this._budget().expenses.reduce((s, e) => s + safeNum(e.amount), 0))
  );

  readonly fixedExpenses = computed(() =>
    round2(this._budget().expenses.filter(e => e.type === 'fixed').reduce((s, e) => s + safeNum(e.amount), 0))
  );

  readonly variableExpenses = computed(() =>
    round2(this._budget().expenses.filter(e => e.type === 'variable').reduce((s, e) => s + safeNum(e.amount), 0))
  );

  readonly availableForDebt = computed(() => {
    const available = safeNum(this.incomeMonthly()) - safeNum(this.totalExpenses());
    return round2(Math.max(0, available));
  });

  constructor(private storage: StorageService) {
    this._budget.set(this.storage.get<Budget>(KEY, EMPTY));
  }

  setBudget(budget: Budget) {
    const cleaned: Budget = {
      incomeMonthly: round2(Math.max(0, safeNum(budget.incomeMonthly))),
      expenses: (budget.expenses ?? []).map(this.cleanExpense),
      updatedAt: budget.updatedAt || nowIso(),
    };

    this._budget.set(cleaned);
    this.storage.set(KEY, cleaned);
  }

  reset() {
    this.setBudget({ ...EMPTY, updatedAt: nowIso() });
  }

  private cleanExpense(e: BudgetExpense): BudgetExpense {
    return {
      id: e.id,
      name: (e.name ?? '').trim(),
      amount: round2(Math.max(0, safeNum(e.amount))),
      type: e.type === 'variable' ? 'variable' : 'fixed',
    };
  }
}
