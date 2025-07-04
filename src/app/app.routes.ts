import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'members',
    loadChildren: () => import('./features/members/members.routes').then(m => m.MEMBERS_ROUTES)
  },
  {
    path: 'meetings',
    loadChildren: () => import('./features/meetings/meetings.routes').then(m => m.MEETINGS_ROUTES)
  },
  {
    path: 'statistics',
    loadComponent: () => import('./features/statistics/statistics.component').then(m => m.StatisticsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
