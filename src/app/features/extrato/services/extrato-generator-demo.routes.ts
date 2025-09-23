import { Routes } from '@angular/router';
import { ExtratoGeneratorDemoComponent } from './extrato-generator-demo.component';

/**
 * Rotas para o demo do ExtratoGeneratorService
 */
export const EXTRATO_GENERATOR_DEMO_ROUTES: Routes = [
  {
    path: '',
    component: ExtratoGeneratorDemoComponent,
    title: 'Demo ExtratoGeneratorService'
  }
];
