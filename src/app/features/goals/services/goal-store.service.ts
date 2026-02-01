import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from '../../../core/storage/storage.service';
import { Goal } from '../models/goal.model';

const KEY = 'debt-slayer.goals.v1';

@Injectable({ providedIn: 'root' })
export class GoalStore {
  private readonly _goals = signal<Goal[]>([]);
  readonly goals = this._goals.asReadonly();

  readonly totalTarget = computed(() =>
    this._goals().reduce((s, g) => s + g.targetAmount, 0)
  );

  readonly totalSaved = computed(() =>
    this._goals().reduce((s, g) => s + g.savedSoFar, 0)
  );

  constructor(private storage: StorageService) {
    this._goals.set(this.storage.get<Goal[]>(KEY, []));
  }

  add(goal: Goal) {
    const next = [goal, ...this._goals()];
    this.setAll(next);
  }

  update(updated: Goal) {
    const next = this._goals().map(g => (g.id === updated.id ? updated : g));
    this.setAll(next);
  }

  remove(id: string) {
    const next = this._goals().filter(g => g.id !== id);
    this.setAll(next);
  }

  getById(id: string): Goal | undefined {
    return this._goals().find(g => g.id === id);
  }

  private setAll(next: Goal[]) {
    this._goals.set(next);
    this.storage.set(KEY, next);
  }
}
