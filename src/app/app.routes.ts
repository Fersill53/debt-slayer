import { Routes } from '@angular/router';

import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { PlannerComponent } from './features/planner/pages/planner/planner.component';
import { PlannerCompareComponent } from './features/planner/pages/planner-compare/planner-compare.component';

import { DebtListComponent } from './features/debts/pages/debt-list/debt-list.component';
import { DebtAddComponent } from './features/debts/pages/debt-add/debt-add.component';
import { DebtDetailsComponent } from './features/debts/pages/debt-details/debt-details.component';

import { GoalListComponent } from './features/goals/pages/goal-list/goal-list.component';
import { GoalAddComponent } from './features/goals/pages/goal-add/goal-add.component';

import { BudgetComponent } from './features/budget/pages/budget/budget.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: 'dashboard', component: DashboardComponent },
  { path: 'planner', component: PlannerComponent },
  { path: 'planner/compare', component: PlannerCompareComponent },

  // IMPORTANT: add BEFORE :id
  { path: 'debts', component: DebtListComponent },
  { path: 'debts/add', component: DebtAddComponent },
  { path: 'debts/:id', component: DebtDetailsComponent },

  { path: 'goals', component: GoalListComponent },
  { path: 'goals/add', component: GoalAddComponent },

  { path: 'budget', component: BudgetComponent },

  // IMPORTANT: wildcard LAST
  { path: '**', redirectTo: 'dashboard' },
];
