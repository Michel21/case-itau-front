import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ListDetailComponent } from '../list-detail/list-detail.component';
import { catDetailResolver } from '../../resolvers/cat-detail.resolver';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'list-detalhe/:id',
    component: ListDetailComponent,
    resolve: {
      cat: catDetailResolver
    }
  }
];
