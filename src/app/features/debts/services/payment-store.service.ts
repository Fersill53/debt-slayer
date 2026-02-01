import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from '../../../core/storage/storage.service';
import { Payment } from '../../goals/models/payment.model';


const KEY = 'debt-slayer.payment.v1';

@Injectable({ providedIn: 'root' })
export class PaymentStore {
  private readonly _payments = signal<Payment[]>([]);
  readonly payments = this._payments.asReadonly();

  constructor(private storage: StorageService) {
    this._payments.set(this.storage.get<Payment[]>(KEY, []));
  }

  paymentsForDebt(debtId: string) {
    return computed(() =>
      this.payments()
        .filter(p => p.debtId === debtId)
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1))
    );
  }

  add(payment: Payment) {
    const next = [payment, ...this._payments()];
    this.setAll(next);
  }

  remove(paymentId: string) {
    const next = this._payments().filter(p => p.id !== paymentId);
    this.setAll(next);
  }

  getById(paymentId: string): Payment | undefined {
    return this._payments().find(p => p.id === paymentId);
  }

  totalPaidForDebt(debtId: string) {
    return computed(() => 
      this._payments()
        .filter(p => p.debtId === debtId)
        .reduce((s, p) => s + p.amount, 0)
    );
  }

  private setAll(next: Payment[]) {
    this._payments.set(next);
    this.storage.set(KEY, next);
  }

}
