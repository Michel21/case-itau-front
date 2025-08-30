import { Component, OnInit, signal, computed, inject, effect, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { _PATH } from '../../shared/constants/constants';
import { ListDetailService } from './services/list-detail.service';
import { ICatsTypes } from '../../types/cats-types';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.component.html',
  styleUrls: ['./list-detail.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDetailComponent implements OnInit, OnDestroy {
  private readonly listDetailService = inject(ListDetailService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Signals with better performance
  private readonly detailsSignal = signal<ICatsTypes | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Computed signals with memoization
  public readonly details = this.detailsSignal.asReadonly();
  public readonly loading = this.loadingSignal.asReadonly();
  public readonly error = this.errorSignal.asReadonly();
  public readonly hasDetails = computed(() => this.detailsSignal() !== null);
  public readonly hasError = computed(() => this.errorSignal() !== null);

  // Properties
  public readonly listScheleton = Array.from({ length: 5 }, (_, i) => i + 1);
  public readonly path = `${_PATH}/load.gif`;
  public readonly state = this.router.getCurrentNavigation()?.extras?.state as ICatsTypes | undefined;

  ngOnInit(): void {
    const catId = this.route.snapshot.params['id'];
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Use state data if available, otherwise fetch from API
    if (this.state) {
      this.detailsSignal.set(this.state);
      this.loadingSignal.set(false);
    } else {
      // Convert observable to signal with error handling
      const details$ = this.listDetailService.getCatsId(catId).pipe(
        catchError(error => {
          console.error('Error fetching cat details:', error);
          return of(null);
        })
      );
      
      const detailsFromService = toSignal(details$, { 
        initialValue: null,
        requireSync: false 
      });

      // Effect to update details signal when service data changes
      effect(() => {
        const details = detailsFromService();
        if (details && Array.isArray(details) && details.length > 0) {
          this.detailsSignal.set(details[0]);
          this.errorSignal.set(null);
        } else if (details === null) {
          this.detailsSignal.set(null);
          this.errorSignal.set('Erro ao carregar detalhes do gato');
        } else {
          this.detailsSignal.set(null);
          this.errorSignal.set('Gato não encontrado');
        }
        this.loadingSignal.set(false);
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  doSomethingOnError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = this.path;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  // Helper methods for computed values
  getCatImageUrl(): string {
    const details = this.details();
    if (details?.image?.url) {
      return details.image.url;
    }
    return this.state?.image?.url || this.path;
  }

  getCatName(): string {
    const details = this.details();
    return details?.name || this.state?.name || 'Nome não disponível';
  }

  getCatOrigin(): string {
    const details = this.details();
    return details?.origin || this.state?.origin || 'Origem não disponível';
  }

  getCatBreedInfo(): string {
    const details = this.details();
    return details?.name || this.state?.name || 'Raça não disponível';
  }

  getCatWikipediaUrl(): string {
    const details = this.details();
    return details?.wikipedia_url || this.state?.wikipedia_url || '';
  }
}
