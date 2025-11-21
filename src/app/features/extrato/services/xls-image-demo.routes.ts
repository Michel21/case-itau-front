import { Routes } from '@angular/router';

export const xlsImageDemoRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./xls-image-demo.component').then(m => m.XlsImageDemoComponent),
    title: 'XLS Image Demo'
  }
];

