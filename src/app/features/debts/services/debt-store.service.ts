import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from '../../../core/storage/storage.service';
import { Debt } from '../models/debt.model';

const KEY = 'debt-slayer.debts.v1';

@Injectable({ providedIn: 'root' })
export class DebtStore {
  private readonly _debts = signal<Debt[]>([]);
  readonly debts = this._debts.asReadonly();

  readonly totalBalance = computed(() =>
    this._debts().reduce((sum, d) => sum + d.balance, 0)
  );

  readonly totalMinPayment = computed(() =>
    this._debts().reduce((sum, d) => sum + d.minPayment, 0)
  );

  // Weighted APR by balance (useful summary metric)
  readonly weightedApr = computed(() => {
    const debts = this._debts();
    const total = debts.reduce((s, d) => s + d.balance, 0);
    if (total <= 0) return 0;

    const weighted = debts.reduce((s, d) => s + d.apr * (d.balance / total), 0);
    return Math.round(weighted * 100) / 100; // 2 decimals
  });

  constructor(private storage: StorageService) {
    this._debts.set(this.storage.get<Debt[]>(KEY, []));
  }

  add(debt: Debt) {
    const next = [debt, ...this._debts()];
    this.setAll(next);
  }

  update(updated: Debt) {
    const next = this._debts().map(d => (d.id === updated.id ? updated : d));
    this.setAll(next);
  }

  remove(id: string) {
    const next = this._debts().filter(d => d.id !== id);
    this.setAll(next);
  }

  getById(id: string): Debt | undefined {
    return this._debts().find(d => d.id === id);
  }

  clearAll() {
    this.setAll([]);
  }

  private setAll(next: Debt[]) {
    this._debts.set(next);
    this.storage.set(KEY, next);
  }
}
