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
    path: 'validacao-periodo-demo',
    loadChildren: () => import('./features/extrato/selecao-periodo/demo/validacao-periodo-demo.routes').then(m => m.VALIDACAO_PERIODO_DEMO_ROUTES)
  },
  {
    path: 'extrato-filtro-demo',
    loadChildren: () => import('./features/extrato/selecao-periodo/demo/extrato-filtro-figma/extrato-filtro-figma.routes').then(m => m.extratoFiltroFigmaRoutes)
  },
  {
    path: 'periodo-mobile',
    loadComponent: () => import('./features/extrato/selecao-periodo/periodo-mobile/periodo-mobile.component').then(m => m.PeriodoMobileComponent)
  },
  {
    path: 'demo/modal-periodo',
    loadComponent: () => import('./shared/components/modal-periodo/modal-periodo-demo.component').then(m => m.ModalPeriodoDemoComponent)
  },
  // Rota do toggle-segmented-demo removida - componente não existe
  // {
  //   path: 'demo/toggle-segmented',
  //   loadComponent: () => import('./shared/components/toggle-segmented/toggle-segmented-demo.component').then(m => m.ToggleSegmentedDemoComponent)
  // },
  {
    path: 'extrato-generator-demo',
    loadChildren: () => import('./features/extrato/services/extrato-generator-demo.routes').then(m => m.EXTRATO_GENERATOR_DEMO_ROUTES)
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
