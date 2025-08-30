import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, signal, computed, effect, inject, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { HomeService } from './services/home.service';
import { _PATH } from '../../shared/constants/constants';
import { ICatsTypes } from '../../types/cats-types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly homeService = inject(HomeService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Signals with better performance
  private readonly catsSignal = signal<ICatsTypes[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly searchTermSignal = signal<string>('');

  // Computed signals with memoization
  public readonly cats = this.catsSignal.asReadonly();
  public readonly loading = this.loadingSignal.asReadonly();
  public readonly filteredCats = computed(() => {
    const cats = this.catsSignal();
    const searchTerm = this.searchTermSignal();
    
    if (!searchTerm.trim()) return cats;
    
    const term = searchTerm.toLowerCase().trim();
    return cats.filter(cat => 
      cat.origin.toLowerCase().includes(term) ||
      cat.name.toLowerCase().includes(term)
    );
  }, { equal: (a, b) => a.length === b.length && a.every((cat, i) => cat.id === b[i]?.id) });

  // Properties
  public readonly listScheleton = Array.from({ length: 6 }, (_, i) => i + 1);
  public readonly path = `${_PATH}/circle-loading-animation.gif`;
  
  @ViewChild('input', { static: true }) input!: ElementRef;

  // Convert RxJS observable to signal with error handling
  private readonly cats$ = this.homeService.getCats();
  private readonly catsFromService = toSignal(this.cats$, { 
    initialValue: [],
    requireSync: false 
  });

  constructor() {
    // Effect to update cats when service data changes
    effect(() => {
      const cats = this.catsFromService();
      if (cats && cats.length > 0) {
        this.catsSignal.set(cats);
      }
    });
  }

  ngOnInit(): void {
    // Data is automatically loaded via toSignal
  }

  ngAfterViewInit(): void {
    if (this.input?.nativeElement) {
      fromEvent(this.input.nativeElement, 'keyup')
        .pipe(
          filter(Boolean),
          debounceTime(300), // Reduced debounce time
          distinctUntilChanged(),
          map(() => this.input.nativeElement.value),
          takeUntil(this.destroy$)
        )
        .subscribe((searchTerm: string) => {
          this.searchTermSignal.set(searchTerm);
          this.loadingSignal.set(true);
          
          // Simulate loading delay
          setTimeout(() => {
            this.loadingSignal.set(false);
          }, 200);
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNavigateTo(item: ICatsTypes): void {
    this.router.navigate([`home/list-detalhe/${item.id}`], { state: item });
  }
  
  doSomethingOnError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = this.path;
  }

  // Performance optimization: track function for ngFor
  trackByCatId(index: number, cat: ICatsTypes): string {
    return cat.id;
  }

  // Helper methods for display
  getBreedName(item: ICatsTypes): string {
    return item?.name || 'Raça não disponível';
  }

  getDescription(item: ICatsTypes): string {
    return item?.description || 'Descrição não disponível';
  }
}
