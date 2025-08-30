import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HomeService } from '../features/home/services/home.service';
import { ICatsTypes } from '../types/cats-types';

export const catsListResolver: ResolveFn<ICatsTypes[]> = (route, state) => {
  const homeService = inject(HomeService);

  return homeService.getCats().pipe(
    catchError(() => {
      // Return empty array on error
      return of([]);
    })
  );
};
