import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { GoalStore } from '../../services/goal-store.service';
import { Goal } from '../../models/goal.model';

type Category = 'trip' | 'bill' | 'repair' | 'gift' | 'other';

@Component({
  selector: 'app-goal-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './goal-add.component.html',
  styleUrls: ['./goal-add.component.scss'],
})
export class GoalAddComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(GoalStore);

  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    category: this.fb.nonNullable.control<Category>('trip'),
    targetAmount: [0, [Validators.required, Validators.min(1)]],
    savedSoFar: [0, [Validators.min(0)]],
    targetDate: ['', [Validators.required]],
  });

  cancel() {
    this.router.navigateByUrl('/goals');
  }

  submit() {
    if (this.saving()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const targetAmount = Number(raw.targetAmount);
    const savedSoFar = Math.max(0, Math.min(Number(raw.savedSoFar), targetAmount));

    const goal: Goal = {
      id: this.makeId(),
      name: raw.name.trim(),
      category: raw.category,
      targetAmount,
      savedSoFar,
      targetDate: raw.targetDate,
    };

    this.saving.set(true);
    this.store.add(goal);
    this.router.navigateByUrl('/goals');
  }

  private makeId(): string {
    const anyCrypto = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
    if (anyCrypto.crypto?.randomUUID) return anyCrypto.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
