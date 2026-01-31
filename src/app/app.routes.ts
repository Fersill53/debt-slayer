import { Routes } from '@angular/router';

import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { DebtListComponent } from './features/debts/pages/debt-list/debt-list.component';
import { DebtAddComponent } from './features/debts/pages/debt-add/debt-add.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: 'dashboard', component: DashboardComponent },
  { path: 'debts', component: DebtListComponent },
  { path: 'debts/add', component: DebtAddComponent },

  { path: '**', redirectTo: 'dashboard' },
];
