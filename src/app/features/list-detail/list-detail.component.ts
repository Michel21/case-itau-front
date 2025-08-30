import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { _PATH } from '../../shared/constants/constants';
import { ListDetailService } from './services/list-detail.service';
import { ICatsTypes } from '../../types/cats-types';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.component.html',
  styleUrls: ['./list-detail.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ListDetailComponent implements OnInit {
  private readonly listDetailService = inject(ListDetailService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Signals
  private readonly detailsSignal = signal<ICatsTypes | null>(null);
  private readonly loadingSignal = signal<boolean>(false);

  // Computed signals
  public readonly details = this.detailsSignal.asReadonly();
  public readonly loading = this.loadingSignal.asReadonly();
  public readonly hasDetails = computed(() => this.detailsSignal() !== null);

  // Properties
  public readonly listScheleton = [1, 2, 3, 4, 5, 6, 7];
  public readonly path = `${_PATH}/load.gif`;
  public readonly state = this.router.getCurrentNavigation()?.extras?.state as ICatsTypes | undefined;

  ngOnInit(): void {
    const catId = this.route.snapshot.params['id'];
    this.loadingSignal.set(true);

    // Convert observable to signal
    const details$ = this.listDetailService.getCatsId(catId);
    const detailsFromService = toSignal(details$, { initialValue: null });

    // Effect to update details signal when service data changes
    effect(() => {
      const details = detailsFromService();
      if (details && Array.isArray(details) && details.length > 0) {
        this.detailsSignal.set(details[0]);
      } else {
        this.detailsSignal.set(null);
      }
      this.loadingSignal.set(false);
    });
  }

  doSomethingOnError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = this.path;
  }
}
