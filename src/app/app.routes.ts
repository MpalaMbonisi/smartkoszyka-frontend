// src/app/app.routes.ts (Updated)
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard-component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'shopping-lists',
    loadComponent: () =>
      import('./features/shopping-lists/shopping-list-management-component/shopping-list-management-component').then(
        m => m.ShoppingListManagementComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'shopping-lists/:id',
    loadComponent: () =>
      import('./features/shopping-lists/shopping-list-detail-component/shopping-list-detail-component').then(
        m => m.ShoppingListDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'shopping-lists/:id/shop',
    loadComponent: () =>
      import('./features/shopping-lists/shopping-view-component/shopping-view-component').then(
        m => m.ShoppingViewComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
