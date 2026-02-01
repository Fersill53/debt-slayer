import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DebtStore } from '../../services/debt-store.service';

@Component({
  selector: 'app-debt-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './debt-list.component.html',
  styleUrls: ['./debt-list.component.scss'],
})
export class DebtListComponent {
  readonly store = inject(DebtStore);

  remove(id: string) {
    this.store.remove(id);
  }
}
