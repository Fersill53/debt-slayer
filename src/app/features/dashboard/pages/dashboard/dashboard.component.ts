import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { DebtStore } from '../../../debts/services/debt-store.service';
import { ContainerComponent } from '../../../../shared/ui/container/container.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ContainerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly store = inject(DebtStore);

  readonly debtCount = computed(() => this.store.debts().length);

  readonly highestAprDebt = computed(() => {
    const debts = this.store.debts();
    if (!debts.length) return null;
    return debts.reduce((best, cur) => (cur.apr > best.apr ? cur : best));
  });

  readonly largestBalanceDebt = computed(() => {
    const debts = this.store.debts();
    if (!debts.length) return null;
    return debts.reduce((best, cur) => (cur.balance > best.balance ? cur : best));
  });

  // optional: "next due" based on dueDay (simple day-of-month logic)
  readonly nextDue = computed(() => {
    const debts = this.store.debts().filter(d => typeof d.dueDay === 'number');
    if (!debts.length) return null;

    const today = new Date();
    const todayDay = today.getDate();

    // pick the smallest dueDay >= todayDay; otherwise smallest dueDay overall
    const upcoming = debts
      .map(d => d.dueDay as number)
      .sort((a, b) => a - b);

    const next = upcoming.find(day => day >= todayDay) ?? upcoming[0];
    return next ?? null;
  });
}
