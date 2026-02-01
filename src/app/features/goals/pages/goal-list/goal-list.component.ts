import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GoalStore } from '../../services/goal-store.service';
import { Goal } from '../../models/goal.models';

type GoalVM = Goal & {
  remaining: number;
  monthsLeft: number;
  requiredMonthly: number;
  progressPct: number;
};

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './goal-list.component.html',
  styleUrls: ['./goal-list.component.scss'],
})
export class GoalListComponent {
  readonly store = inject(GoalStore);

  readonly goalsVm = computed<GoalVM[]>(() => {
    const goals = this.store.goals();
    return goals.map(g => this.toVm(g));
  });

  remove(id: string) {
    this.store.remove(id);
  }

  private toVm(g: Goal): GoalVM {
    const remaining = Math.max(0, g.targetAmount - g.savedSoFar);
    const monthsLeft = this.monthsUntil(g.targetDate);
    const requiredMonthly = monthsLeft <= 0 ? remaining : remaining / monthsLeft;
    const progressPct =
      g.targetAmount <= 0 ? 0 : Math.min(100, Math.max(0, (g.savedSoFar / g.targetAmount) * 100));

    return {
      ...g,
      remaining: this.round2(remaining),
      monthsLeft,
      requiredMonthly: this.round2(requiredMonthly),
      progressPct: this.round2(progressPct),
    };
  }

  private monthsUntil(targetIso: string): number {
    const now = new Date();
    const target = new Date(targetIso);

    if (!isFinite(target.getTime())) return 0;

    // Count full months difference, but never return < 0
    let months =
      (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth());

    // If target day is later in the month than today, treat as still having that month
    if (target.getDate() > now.getDate()) months += 1;

    return Math.max(0, months);
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
