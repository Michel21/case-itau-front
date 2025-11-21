import { Routes } from '@angular/router';

export const tabelaDemoRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabela-example.component').then(m => m.TabelaExampleComponent),
    title: 'Tabela - Exemplos'
  }
];

