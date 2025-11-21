import { Routes } from '@angular/router';

export const extratoFiltroFigmaRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./extrato-filtro-figma.component').then(m => m.ExtratoFiltroFigmaComponent),
    title: 'Filtro de Extrato (Acessível)'
  }
];
