/*
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DebtStore } from '../../../debts/services/debt-store.service';
import { PayoffCalculatorService, PayoffPlan, Strategy } from '../../services/payoff-calculator.service';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
})
export class PlannerComponent {
  private readonly store = inject(DebtStore);
  private readonly calc = inject(PayoffCalculatorService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly showAll = signal(false);

  readonly form = this.fb.nonNullable.group({
    strategy: this.fb.nonNullable.control<Strategy>('avalanche'),
    extraMonthly: this.fb.nonNullable.control<number>(0, [Validators.min(0)]),
    maxMonths: this.fb.nonNullable.control<number>(240, [Validators.min(1), Validators.max(600)]),
  });

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

    return this.calc.buildPlan(debts, strategy, extra, maxMonths);
  });

  toggleShowAll() {
    this.showAll.update(v => !v);
  }

  private safeNum(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  }
}
*/

import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DebtStore } from '../../../debts/services/debt-store.service';
import { BudgetStore } from '../../../budget/services/budget-store.service';
import { PayoffCalculatorService, PayoffPlan, Strategy } from '../../services/payoff-calculator.service';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
})
export class PlannerComponent {
  private readonly store = inject(DebtStore);
  private readonly budget = inject(BudgetStore);
  private readonly calc = inject(PayoffCalculatorService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly showAll = signal(false);

  readonly form = this.fb.nonNullable.group({
    strategy: this.fb.nonNullable.control<Strategy>('avalanche'),
    extraMonthly: this.fb.nonNullable.control<number>(0, [Validators.min(0)]),
    maxMonths: this.fb.nonNullable.control<number>(240, [Validators.min(1), Validators.max(600)]),
  });

  private readonly strategy = signal<Strategy>('avalanche');
  private readonly extraMonthly = signal<number>(0);
  private readonly maxMonths = signal<number>(240);

  readonly budgetExtra = computed(() => this.budget.availableForDebt());

  constructor() {
    // Prefill extraMonthly ONCE if it's 0 and budget has a value
    const suggested = this.budgetExtra();
    if (this.form.controls.extraMonthly.value === 0 && suggested > 0) {
      this.form.controls.extraMonthly.setValue(suggested, { emitEvent: false });
      this.extraMonthly.set(suggested);
    }

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

  useBudgetAmount() {
    const suggested = this.budgetExtra();
    this.form.controls.extraMonthly.setValue(suggested, { emitEvent: false });
    this.extraMonthly.set(suggested);
  }

  readonly plan = computed<PayoffPlan | null>(() => {
    const debts = this.store.debts();
    if (!debts.length) return null;

    const extra = Math.max(0, this.extraMonthly());
    const strategy = this.strategy();
    const maxMonths = Math.min(600, Math.max(1, this.maxMonths()));

    return this.calc.buildPlan(debts, strategy, extra, maxMonths);
  });

  toggleShowAll() {
    this.showAll.update(v => !v);
  }

  private safeNum(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  }
}
