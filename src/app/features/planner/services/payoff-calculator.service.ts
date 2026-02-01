import { Injectable } from '@angular/core';
import { Debt } from '../../debts/models/debt.model';

export type Strategy = 'avalanche' | 'snowball';

export type PlanRow = {
  month: number;
  payment: number;
  interest: number;
  remaining: number;
};

export type DebtPayoff = {
  debtId: string;
  name: string;
  payoffMonth: number; // 1..N
};

export type PayoffPlan = {
  strategy: Strategy;
  months: number;
  totalInterest: number;
  totalPaid: number;
  schedule: PlanRow[];
  payoffs: DebtPayoff[];
  firstPayoffMonth: number | null;
  warning?: string;
};

type SimDebt = {
  id: string;
  name: string;
  apr: number;
  minPayment: number;
  balance: number;
};

@Injectable({ providedIn: 'root' })
export class PayoffCalculatorService {
  buildPlan(debts: Debt[], strategy: Strategy, extraMonthly: number, maxMonths: number): PayoffPlan {
    const sim: SimDebt[] = debts
      .map(d => ({
        id: d.id,
        name: d.name,
        apr: d.apr,
        minPayment: d.minPayment,
        balance: d.balance,
      }))
      .filter(d => d.balance > 0.005);

    const initialMinTotal = sim.reduce((s, d) => s + d.minPayment, 0);
    const monthlyBudget = this.round2(Math.max(0, initialMinTotal + Math.max(0, extraMonthly)));

    const schedule: PlanRow[] = [];
    const payoffMonthById = new Map<string, number>();

    let totalInterest = 0;
    let totalPaid = 0;

    let warning: string | undefined;
    let consecutiveGrowth = 0;

    for (let month = 1; month <= maxMonths; month++) {
      if (sim.every(d => d.balance <= 0.005)) break;

      // 1) interest
      let monthInterest = 0;
      for (const d of sim) {
        if (d.balance <= 0.005) continue;
        const r = (d.apr / 100) / 12;
        const interest = d.balance * r;
        d.balance += interest;
        monthInterest += interest;
      }

      // 2) pay minimums (only for active debts; this naturally "rolls" freed mins)
      let budgetLeft = monthlyBudget;
      let monthPayment = 0;

      for (const d of sim) {
        if (d.balance <= 0.005) continue;

        const minDue = Math.min(d.minPayment, d.balance);
        d.balance -= minDue;
        budgetLeft -= minDue;
        monthPayment += minDue;
      }

      if (budgetLeft < -0.01) {
        warning = 'Your budget is below the sum of minimum payments.';
      }

      // 3) extra to target
      if (budgetLeft > 0.005) {
        const target = this.pickTarget(sim, strategy);
        if (target) {
          const extraPay = Math.min(budgetLeft, target.balance);
          target.balance -= extraPay;
          monthPayment += extraPay;
          budgetLeft -= extraPay;
        }
      }

      // 4) mark payoffs (when a debt becomes paid off for the first time)
      for (const d of sim) {
        if (!payoffMonthById.has(d.id) && d.balance <= 0.005) {
          payoffMonthById.set(d.id, month);
        }
      }

      totalInterest += monthInterest;
      totalPaid += monthPayment;

      const remaining = sim.reduce((s, d) => s + Math.max(0, d.balance), 0);

      schedule.push({
        month,
        payment: this.round2(monthPayment),
        interest: this.round2(monthInterest),
        remaining: this.round2(remaining),
      });

      // trend detection
      if (schedule.length >= 2) {
        const prev = schedule[schedule.length - 2].remaining;
        if (remaining > prev + 0.01) consecutiveGrowth++;
        else consecutiveGrowth = 0;

        if (!warning && consecutiveGrowth >= 6) {
          warning = 'Balances are growing month over month — payments may be too low for interest.';
        }
      }
    }

    const paidOff = schedule.length > 0 && schedule[schedule.length - 1].remaining <= 0.01;
    if (!paidOff && !warning) {
      warning = `Not paid off within ${maxMonths} months. Increase extra or max months.`;
    }

    const payoffs: DebtPayoff[] = debts
      .filter(d => payoffMonthById.has(d.id))
      .map(d => ({
        debtId: d.id,
        name: d.name,
        payoffMonth: payoffMonthById.get(d.id)!,
      }))
      .sort((a, b) => a.payoffMonth - b.payoffMonth);

    const firstPayoffMonth = payoffs.length ? payoffs[0].payoffMonth : null;

    return {
      strategy,
      months: schedule.length,
      totalInterest: this.round2(totalInterest),
      totalPaid: this.round2(totalPaid),
      schedule,
      payoffs,
      firstPayoffMonth,
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

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
