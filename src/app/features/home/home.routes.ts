import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ListDetailComponent } from '../list-detail/list-detail.component';
import { catDetailResolver } from '../../resolvers/cat-detail.resolver';
import { LoginComponent } from './components/login/login.component';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'list-detalhe/:id',
    component: ListDetailComponent,
    resolve: {
      cat: catDetailResolver
    }
  }
];
