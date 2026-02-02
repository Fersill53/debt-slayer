import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { BudgetStore } from '../../services/budget-store.service';
import { Budget, BudgetExpense, BudgetExpenseType } from '../../models/budget.model';

type ExpenseForm = {
  id: string;
  name: string;
  amount: number;
  type: BudgetExpenseType;
};

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
})
export class BudgetComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(BudgetStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.nonNullable.group({
    incomeMonthly: this.fb.nonNullable.control<number>(0, [Validators.min(0)]),
    expenses: this.fb.array([] as any[]),
  });

  get expensesArray(): FormArray {
    return this.form.get('expenses') as FormArray;
  }

  readonly summary = computed(() => ({
    income: this.store.incomeMonthly(),
    fixed: this.store.fixedExpenses(),
    variable: this.store.variableExpenses(),
    total: this.store.totalExpenses(),
    available: this.store.availableForDebt(),
  }));

  constructor() {
    const current = this.store.budget();
    this.form.controls.incomeMonthly.setValue(current.incomeMonthly, { emitEvent: false });
    this.setExpenses(current.expenses);

    // Keeping this pattern so you can later add live preview if you want
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {});
  }

  addExpense(type: BudgetExpenseType = 'fixed') {
    this.expensesArray.push(this.expenseGroup({
      id: this.makeId(),
      name: '',
      amount: 0,
      type,
    }));
  }

  removeExpense(index: number) {
    this.expensesArray.removeAt(index);
  }

  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const rawExpenses = (raw.expenses ?? []) as unknown as ExpenseForm[];

    const expenses: BudgetExpense[] = rawExpenses
      .map((e): BudgetExpense => ({
        id: e.id,
        name: (e.name ?? '').trim(),
        amount: this.round2(Number(e.amount)),
        type: e.type === 'variable' ? 'variable' : 'fixed',
      }))
      .filter(e => e.name.length > 0 || e.amount > 0);

    const budget: Budget = {
      incomeMonthly: this.round2(Number(raw.incomeMonthly)),
      expenses,
      updatedAt: new Date().toISOString(),
    };

    this.store.setBudget(budget);
  }

  reset() {
    this.store.reset();
    const current = this.store.budget();
    this.form.controls.incomeMonthly.setValue(current.incomeMonthly, { emitEvent: false });
    this.setExpenses(current.expenses);
  }

  trackById = (index: number, ctrl: any) => ctrl?.value?.id ?? index;

  private setExpenses(expenses: BudgetExpense[]) {
    this.expensesArray.clear();

    for (const e of expenses) {
      this.expensesArray.push(this.expenseGroup({
        id: e.id,
        name: e.name,
        amount: e.amount,
        type: e.type,
      }));
    }

    if (!expenses.length) {
      this.addExpense('fixed');
      this.addExpense('variable');
    }
  }

  private expenseGroup(e: ExpenseForm) {
    return this.fb.nonNullable.group({
      id: this.fb.nonNullable.control<string>(e.id),
      name: this.fb.nonNullable.control<string>(e.name, [Validators.maxLength(60)]),
      amount: this.fb.nonNullable.control<number>(e.amount, [Validators.min(0)]),
      type: this.fb.nonNullable.control<BudgetExpenseType>(e.type),
    });
  }

  private makeId(): string {
    const anyCrypto = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
    if (anyCrypto.crypto?.randomUUID) return anyCrypto.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
