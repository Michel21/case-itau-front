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

  return listDetailService.getCatsId(catId).pipe(
    map(cats => {
      if (cats && cats.length > 0) {
        return cats[0]; // Return first cat from array
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
