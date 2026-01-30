import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { DebtStore } from '../../services/debt-store.service';
import { Debt } from '../../models/debt.model';

@Component({
  selector: 'app-debt-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './debt-add.component.html',
  styleUrl: './debt-add.component.scss',
})
export class DebtAddComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(DebtStore);

  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    balance: [0, [Validators.required, Validators.min(0.01)]],
    apr: [0, [Validators.required, Validators.min(0), Validators.max(200)]],
    minPayment: [0, [Validators.required, Validators.min(0.01)]],
    dueDay: [null as number | null, [Validators.min(1), Validators.max(31)]],
  });

  get f() {
    return this.form.controls;
  }

  cancel() {
    this.router.navigateByUrl('/debts');
  }

  submit() {
    if (this.saving()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);

    const raw = this.form.getRawValue();

    const debt: Debt = {
      id: this.makeId(),
      name: raw.name.trim(),
      balance: Number(raw.balance),
      apr: Number(raw.apr),
      minPayment: Number(raw.minPayment),
      dueDay: raw.dueDay ?? undefined,
    };

    this.store.add(debt);
    this.router.navigateByUrl('/debts');
  }

  private makeId(): string {
    const anyCrypto = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
    if (anyCrypto.crypto?.randomUUID) return anyCrypto.crypto.randomUUID();

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
