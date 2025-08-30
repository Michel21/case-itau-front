import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ListDetailService } from '../features/list-detail/services/list-detail.service';
import { ICatsTypes } from '../types/cats-types';

export const catDetailResolver: ResolveFn<ICatsTypes | null> = (route, state) => {
  const listDetailService = inject(ListDetailService);
  const router = inject(Router);
  const catId = route.paramMap.get('id');

  if (!catId) {
    router.navigate(['/home']);
    return of(null);
  }

  return listDetailService.getCatById(catId).pipe(
    map(cat => {
      if (cat) {
        return cat;
      } else {
        router.navigate(['/home']);
        return null;
      }
    }),
    catchError(() => {
      router.navigate(['/home']);
      return of(null);
    })
  );
};
