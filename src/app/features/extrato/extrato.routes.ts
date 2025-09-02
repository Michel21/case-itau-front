import { Routes } from '@angular/router';
import { ExtratoPdfComponent } from './extrato-pdf.component';
import { SelecaoPeriodoComponent } from './selecao-periodo/selecao-periodo.component';

export const EXTRATO_ROUTES: Routes = [
  {
    path: '',
    component: SelecaoPeriodoComponent
  },
  {
    path: 'pdf',
    component: ExtratoPdfComponent
  }
];
