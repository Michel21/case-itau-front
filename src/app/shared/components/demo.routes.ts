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
  },
  {
    path: 'tabela',
    loadChildren: () => import('./tabela/tabela-demo.routes').then(m => m.tabelaDemoRoutes)
  },
  {
    path: 'checkbox',
    loadComponent: () => import('./checkbox/checkbox-example.component').then(m => m.CheckboxExampleComponent),
    title: 'Checkbox - Exemplos'
  },
  {
    path: 'operacoes',
    loadComponent: () => import('./operacoes-compromissadas/operacoes-compromissadas.component').then(m => m.OperacoesCompromissadasComponent),
    title: 'Operações Compromissadas'
  },
  {
    path: 'xls-image',
    loadChildren: () => import('../../features/extrato/services/xls-image-demo.routes').then(m => m.xlsImageDemoRoutes),
    title: 'XLS Image Demo'
  },
  {
    path: 'extrato-filtro',
    loadChildren: () => import('../../features/extrato/selecao-periodo/demo/extrato-filtro-figma/extrato-filtro-figma.routes').then(m => m.extratoFiltroFigmaRoutes),
    title: 'Extrato Filtro Acessível'
  }
];
