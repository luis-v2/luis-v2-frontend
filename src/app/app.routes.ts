import { Routes } from '@angular/router';
import { TrendsComponent } from './trends/trends.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Standardroute
  { path: 'dashboard', component: DashboardComponent },
  { path: 'trends', component: TrendsComponent },
];
