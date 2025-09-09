import { Routes } from '@angular/router';

export const demoRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./demo-nav/demo-nav.component').then(m => m.DemoNavComponent),
    title: 'Component Demos'
  },
  {
    path: 'date-picker',
    loadChildren: () => import('./date-picker/date-picker-demo.routes').then(m => m.datePickerDemoRoutes)
  }
];
