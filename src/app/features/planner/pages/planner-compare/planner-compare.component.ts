/*
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { DebtStore } from '../../../debts/services/debt-store.service';
import { PayoffCalculatorService, PayoffPlan } from '../../services/payoff-calculator.service';
import { BudgetStore } from '../../../budget/services/budget-store.service';

type Recommendation = {
  winner: 'avalanche' | 'snowball';
  title: string;
  reasons: string[];
};

@Component({
  selector: 'app-planner-compare',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './planner-compare.component.html',
  styleUrls: ['./planner-compare.component.scss'],
})
export class PlannerCompareComponent {
  private readonly store = inject(DebtStore);
  private readonly calc = inject(PayoffCalculatorService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.nonNullable.group({
    extraMonthly: this.fb.nonNullable.control<number>(0, [Validators.min(0)]),
    maxMonths: this.fb.nonNullable.control<number>(240, [Validators.min(1), Validators.max(600)]),
  });

  private readonly extraMonthly = signal<number>(0);
  private readonly maxMonths = signal<number>(240);

  constructor() {
    this.form.controls.extraMonthly.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.extraMonthly.set(this.safeNum(v)));

    this.form.controls.maxMonths.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.maxMonths.set(this.safeNum(v) || 240));
  }

  readonly plans = computed<{ avalanche: PayoffPlan; snowball: PayoffPlan } | null>(() => {
    const debts = this.store.debts();
    if (!debts.length) return null;

    const extra = Math.max(0, this.extraMonthly());
    const maxMonths = Math.min(600, Math.max(1, this.maxMonths()));

    const avalanche = this.calc.buildPlan(debts, 'avalanche', extra, maxMonths);
    const snowball = this.calc.buildPlan(debts, 'snowball', extra, maxMonths);

    return { avalanche, snowball };
  });

  readonly recommendation = computed<Recommendation | null>(() => {
    const plans = this.plans();
    if (!plans) return null;

    const a = plans.avalanche;
    const s = plans.snowball;

    // Heuristic:
    // - If avalanche saves meaningful interest, recommend avalanche
    // - Else if snowball gets an earlier first payoff by 2+ months, recommend snowball
    // - Else default avalanche
    const interestSaved = this.round2(s.totalInterest - a.totalInterest);
    const monthDiff = s.months - a.months;

    const aFirst = a.firstPayoffMonth ?? 9999;
    const sFirst = s.firstPayoffMonth ?? 9999;

    if (interestSaved >= 50) {
      return {
        winner: 'avalanche',
        title: 'Recommended: Avalanche',
        reasons: [
          `Saves about ${this.money(interestSaved)} in interest compared to snowball.`,
          monthDiff !== 0 ? `Finishes ${Math.abs(monthDiff)} month(s) ${monthDiff > 0 ? 'sooner' : 'later'} than snowball.` : 'Finishes in about the same time.',
        ],
      };
    }

    if (sFirst + 2 <= aFirst) {
      return {
        winner: 'snowball',
        title: 'Recommended: Snowball',
        reasons: [
          `Gets your first payoff sooner (month ${s.firstPayoffMonth} vs month ${a.firstPayoffMonth ?? '—'}).`,
          `Motivation wins can help you stick to the plan even if interest is slightly higher.`,
        ],
      };
    }

    return {
      winner: 'avalanche',
      title: 'Recommended: Avalanche',
      reasons: [
        'Generally minimizes interest over time.',
        interestSaved > 0 ? `Still saves about ${this.money(interestSaved)} in interest.` : 'Interest difference is small.',
      ],
    };
  });

  private safeNum(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  private money(n: number): string {
    return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }
}
*/

import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { DebtStore } from '../../../debts/services/debt-store.service';
import { BudgetStore } from '../../../budget/services/budget-store.service';
import { PayoffCalculatorService, PayoffPlan } from '../../services/payoff-calculator.service';

type Recommendation = {
  winner: 'avalanche' | 'snowball';
  title: string;
  reasons: string[];
};

@Component({
  selector: 'app-planner-compare',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './planner-compare.component.html',
  styleUrls: ['./planner-compare.component.scss'],
})
export class PlannerCompareComponent {
  private readonly store = inject(DebtStore);
  private readonly budget = inject(BudgetStore);
  private readonly calc = inject(PayoffCalculatorService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.nonNullable.group({
    extraMonthly: this.fb.nonNullable.control<number>(0, [Validators.min(0)]),
    maxMonths: this.fb.nonNullable.control<number>(240, [Validators.min(1), Validators.max(600)]),
  });

  private readonly extraMonthly = signal<number>(0);
  private readonly maxMonths = signal<number>(240);

  readonly budgetExtra = computed(() => this.budget.availableForDebt());

  constructor() {
    // Prefill extraMonthly ONCE if user hasn't set anything yet (still 0) and budget has value
    const suggested = this.budgetExtra();
    if (this.form.controls.extraMonthly.value === 0 && suggested > 0) {
      this.form.controls.extraMonthly.setValue(suggested, { emitEvent: false });
      this.extraMonthly.set(suggested);
    }

    this.form.controls.extraMonthly.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.extraMonthly.set(this.safeNum(v)));

    this.form.controls.maxMonths.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.maxMonths.set(this.safeNum(v) || 240));
  }

  useBudgetAmount() {
    const suggested = this.budgetExtra();
    this.form.controls.extraMonthly.setValue(suggested, { emitEvent: false });
    this.extraMonthly.set(suggested);
  }

  readonly plans = computed<{ avalanche: PayoffPlan; snowball: PayoffPlan } | null>(() => {
    const debts = this.store.debts();
    if (!debts.length) return null;

    const extra = Math.max(0, this.extraMonthly());
    const maxMonths = Math.min(600, Math.max(1, this.maxMonths()));

    const avalanche = this.calc.buildPlan(debts, 'avalanche', extra, maxMonths);
    const snowball = this.calc.buildPlan(debts, 'snowball', extra, maxMonths);

    return { avalanche, snowball };
  });

  readonly recommendation = computed<Recommendation | null>(() => {
    const plans = this.plans();
    if (!plans) return null;

    const a = plans.avalanche;
    const s = plans.snowball;

    const interestSaved = this.round2(s.totalInterest - a.totalInterest);
    const monthDiff = s.months - a.months;

    const aFirst = a.firstPayoffMonth ?? 9999;
    const sFirst = s.firstPayoffMonth ?? 9999;

    if (interestSaved >= 50) {
      return {
        winner: 'avalanche',
        title: 'Recommended: Avalanche',
        reasons: [
          `Saves about ${this.money(interestSaved)} in interest compared to snowball.`,
          monthDiff !== 0
            ? `Finishes ${Math.abs(monthDiff)} month(s) ${monthDiff > 0 ? 'sooner' : 'later'} than snowball.`
            : 'Finishes in about the same time.',
        ],
      };
    }

    if (sFirst + 2 <= aFirst) {
      return {
        winner: 'snowball',
        title: 'Recommended: Snowball',
        reasons: [
          `Gets your first payoff sooner (month ${s.firstPayoffMonth} vs month ${a.firstPayoffMonth ?? '—'}).`,
          'Motivation wins can help you stick to the plan even if interest is slightly higher.',
        ],
      };
    }

    return {
      winner: 'avalanche',
      title: 'Recommended: Avalanche',
      reasons: [
        'Generally minimizes interest over time.',
        interestSaved > 0 ? `Still saves about ${this.money(interestSaved)} in interest.` : 'Interest difference is small.',
      ],
    };
  });

  private safeNum(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  private money(n: number): string {
    return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }
}
