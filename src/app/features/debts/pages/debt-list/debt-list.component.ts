import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DebtStore } from '../../services/debt-store.service';

@Component({
  selector: 'app-debt-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './debt-list.component.html',
  styleUrl: './debt-list.component.scss',
})
export class DebtListComponent {
  readonly store = inject(DebtStore);

  remove(id: string) {
    this.store.remove(id);
  }
}
