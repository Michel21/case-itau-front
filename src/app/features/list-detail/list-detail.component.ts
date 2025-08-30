import { Component, OnInit, signal, computed, inject, effect, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

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

    // Convert observable to signal with error handling
    const details$ = this.listDetailService.getCatsId(catId);
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
}
