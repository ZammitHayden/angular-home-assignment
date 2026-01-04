import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard, LoginGuard } from './guards/guards-guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [LoginGuard],
    loadComponent: () =>
      import('./components/login/login')
        .then(m => m.LoginComponent)
  },
  {
    path: 'records',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./components/record-list/record-list')
        .then(m => m.RecordListComponent)
  },
  {
    path: 'add',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['clerk', 'manager', 'admin'] },
    loadComponent: () =>
      import('./components/record-form/record-form')
        .then(m => m.RecordFormComponent)
  },
  {
    path: 'view/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./components/record-detail/record-view/record-view')
        .then(m => m.RecordViewComponent)
  },
  {
    path: 'edit/:id',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['manager', 'admin'] },
    loadComponent: () =>
      import('./components/record-edit/record-edit')  
        .then(m => m.RecordEditComponent)
  },
  {
    path: 'edit/:id',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['manager', 'admin'] },
    loadComponent: () =>
      import('./components/record-form/record-form')
        .then(m => m.RecordFormComponent)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];