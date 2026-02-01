import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

import { DebtStore } from '../../services/debt-store.service';
import { PaymentStore } from '../../services/payment-store.service';
import { Payment } from '../../../goals/models/payment.model';


@Component({
  selector: 'app-debt-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
  ],
  templateUrl: './debt-details.component.html',
  styleUrls: ['./debt-details.component.scss'],
})
export class DebtDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly debtStore = inject(DebtStore);
  private readonly paymentStore = inject(PaymentStore);

  readonly saving = signal(false);

  readonly debtId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  readonly debt = computed(() => this.debtStore.getById(this.debtId()));
  readonly payments = computed(() => this.paymentStore.paymentsForDebt(this.debtId())());
  readonly totalPaid = computed(() => this.paymentStore.totalPaidForDebt(this.debtId())());

  readonly form = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [this.todayIso(), [Validators.required]],
  });

  back() {
    this.router.navigateByUrl('/debts');
  }

  recordPayment() {
    if (this.saving()) return;

    const debt = this.debt();
    if (!debt) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const amount = this.round2(Number(raw.amount));
    if (amount <= 0) return;

    const payment: Payment = {
      id: this.makeId(),
      debtId: debt.id,
      amount,
      date: raw.date,
    };

    this.saving.set(true);

    // 1) persist payment record
    this.paymentStore.add(payment);

    // 2) update debt balance
    this.debtStore.applyPayment(debt.id, amount);

    // reset amount but keep date
    this.form.controls.amount.setValue(0);
    this.saving.set(false);
  }

  removePayment(paymentId: string) {
    const payment = this.paymentStore.getById(paymentId);
    const debt = this.debt();
    if (!payment || !debt) return;

    // 1) delete payment
    this.paymentStore.remove(paymentId);

    // 2) reverse balance change
    this.debtStore.reversePayment(debt.id, payment.amount);
  }

  private todayIso(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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
