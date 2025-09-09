import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { catsListResolver } from './resolvers/cats-list.resolver';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) as any
  },
  {
    path: 'home',
    canActivate: [authGuard],
    resolve: {
      cats: catsListResolver
    },
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin')],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'extrato',
    canActivate: [authGuard],
    loadChildren: () => import('./features/extrato/extrato.routes').then(m => m.EXTRATO_ROUTES)
  },
  {
    path: 'demo',
    loadChildren: () => import('./shared/components/demo.routes').then(m => m.demoRoutes)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'home'
  }
];
