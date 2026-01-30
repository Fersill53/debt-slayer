import { Routes } from '@angular/router';

import { DebtListComponent } from './features/debts/pages/debt-list/debt-list.component';
import { DebtAddComponent } from './features/debts/pages/debt-add/debt-add.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'debts' },
  { path: 'debts', component: DebtListComponent },
  { path: 'debts/add', component: DebtAddComponent },
  { path: '**', redirectTo: 'debts' },
];
