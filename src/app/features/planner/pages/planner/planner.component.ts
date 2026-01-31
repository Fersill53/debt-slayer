import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DebtStore } from '../../../debts/services/debt-store.service';
import { Debt } from '../../../debts/models/debt.model';

type Strategy = 'avalanche' | 'snowball';

type PlanRow = {
  month: number;
  payment: number;
  interest: number;
  remaining: number;
};

type PayoffPlan = {
  months: number;
  totalInterest: number;
  totalPaid: number;
  schedule: PlanRow[];
  warning?: string;
};

type SimDebt = {
  id: string;
  name: string;
  apr: number;
  minPayment: number;
  balance: number;
};

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
})
export class PlannerComponent {
  private readonly store = inject(DebtStore);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly showAll = signal(false);

  readonly form = this.fb.nonNullable.group({
    strategy: this.fb.nonNullable.control<Strategy>('avalanche'),
    extraMonthly: this.fb.nonNullable.control<number>(0, [Validators.min(0)]),
    maxMonths: this.fb.nonNullable.control<number>(240, [Validators.min(1), Validators.max(600)]),
  });

  // keep form values in signals for easy computed plan
  private readonly strategy = signal<Strategy>('avalanche');
  private readonly extraMonthly = signal<number>(0);
  private readonly maxMonths = signal<number>(240);

  constructor() {
    this.form.controls.strategy.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.strategy.set(v));

    this.form.controls.extraMonthly.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.extraMonthly.set(this.safeNum(v)));

    this.form.controls.maxMonths.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.maxMonths.set(this.safeNum(v) || 240));
  }

  readonly plan = computed<PayoffPlan | null>(() => {
    const debts = this.store.debts();
    if (!debts.length) return null;

    const extra = Math.max(0, this.extraMonthly());
    const strategy = this.strategy();
    const maxMonths = Math.min(600, Math.max(1, this.maxMonths()));

    return this.buildPlan(debts, strategy, extra, maxMonths);
  });

  toggleShowAll() {
    this.showAll.update(v => !v);
  }

  private buildPlan(debts: Debt[], strategy: Strategy, extraMonthly: number, maxMonths: number): PayoffPlan {
    // clone into simulation debts
    const sim: SimDebt[] = debts
      .map(d => ({
        id: d.id,
        name: d.name,
        apr: d.apr,
        minPayment: d.minPayment,
        balance: d.balance,
      }))
      .filter(d => d.balance > 0);

    const initialMinTotal = sim.reduce((s, d) => s + d.minPayment, 0);
    const monthlyBudget = initialMinTotal + extraMonthly;

    const schedule: PlanRow[] = [];
    let totalInterest = 0;
    let totalPaid = 0;

    let warning: string | undefined;
    let consecutiveGrowth = 0;

    for (let month = 1; month <= maxMonths; month++) {
      // stop if all paid
      if (sim.every(d => d.balance <= 0.005)) break;

      // 1) Apply interest
      let monthInterest = 0;
      for (const d of sim) {
        if (d.balance <= 0.005) continue;

        const r = (d.apr / 100) / 12;
        const interest = d.balance * r;

        d.balance += interest;
        monthInterest += interest;
      }

      // 2) Pay minimums for all active debts (capped)
      let budgetLeft = monthlyBudget;
      let monthPayment = 0;

      for (const d of sim) {
        if (d.balance <= 0.005) continue;

        const minDue = Math.min(d.minPayment, d.balance);
        d.balance -= minDue;
        budgetLeft -= minDue;
        monthPayment += minDue;
      }

      // If budgetLeft is negative, min payments exceed budget. This plan can’t work.
      if (budgetLeft < -0.01) {
        warning = 'Your extra/monthly budget is below the sum of minimum payments.';
        // still record this month
      }

      // 3) Apply remaining budget to target debt (avalanche/snowball)
      if (budgetLeft > 0.005) {
        const target = this.pickTarget(sim, strategy);
        if (target) {
          const extraPay = Math.min(budgetLeft, target.balance);
          target.balance -= extraPay;
          monthPayment += extraPay;
          budgetLeft -= extraPay;
        }
      }

      // 4) Totals for this month
      totalInterest += monthInterest;
      totalPaid += monthPayment;

      const remaining = sim.reduce((s, d) => s + Math.max(0, d.balance), 0);

      schedule.push({
        month,
        payment: this.round2(monthPayment),
        interest: this.round2(monthInterest),
        remaining: this.round2(remaining),
      });

      // 5) Detect negative amortization trend (remaining keeps growing)
      if (schedule.length >= 2) {
        const prev = schedule[schedule.length - 2].remaining;
        if (remaining > prev + 0.01) consecutiveGrowth++;
        else consecutiveGrowth = 0;

        if (!warning && consecutiveGrowth >= 6) {
          warning = 'Balances are growing month over month — your payments may be too low for the interest.';
        }
      }
    }

    const paidOff = schedule.length && schedule[schedule.length - 1].remaining <= 0.01;

    if (!paidOff && !warning) {
      warning = `Not paid off within ${maxMonths} months. Increase extra payment or raise max months.`;
    }

    return {
      months: schedule.length,
      totalInterest: this.round2(totalInterest),
      totalPaid: this.round2(totalPaid),
      schedule,
      warning,
    };
  }

  private pickTarget(sim: SimDebt[], strategy: Strategy): SimDebt | null {
    const active = sim.filter(d => d.balance > 0.005);
    if (!active.length) return null;

    if (strategy === 'avalanche') {
      // highest APR; tie-breaker: higher balance
      return active.reduce((best, cur) => {
        if (cur.apr > best.apr) return cur;
        if (cur.apr === best.apr && cur.balance > best.balance) return cur;
        return best;
      });
    }

    // snowball: lowest balance; tie-breaker: higher APR
    return active.reduce((best, cur) => {
      if (cur.balance < best.balance) return cur;
      if (cur.balance === best.balance && cur.apr > best.apr) return cur;
      return best;
    });
  }

  private safeNum(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
