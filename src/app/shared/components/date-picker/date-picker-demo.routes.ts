import { Routes } from '@angular/router';
import { DatePickerDemoComponent } from './date-picker-demo.component';

export const datePickerDemoRoutes: Routes = [
  {
    path: 'date-picker',
    component: DatePickerDemoComponent,
    title: 'DatePicker Demo'
  },
  {
    path: '',
    redirectTo: 'date-picker',
    pathMatch: 'full'
  }
];
