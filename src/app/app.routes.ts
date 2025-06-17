import { Routes } from '@angular/router';
import { TrendsComponent } from './trends/trends.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChartsComponent } from './charts/charts.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Standardroute
  { path: 'dashboard', component: DashboardComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'charts', component: ChartsComponent },
];
