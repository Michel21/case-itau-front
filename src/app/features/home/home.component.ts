import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, catchError, filter, map } from 'rxjs/operators';
import { from, fromEvent } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { HomeService } from './services/home.service';
import { _PATH } from '../../shared/constants/constants';
import { ICatsTypes } from '../../types/cats-types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HomeComponent implements OnInit, AfterViewInit {
  private readonly homeService = inject(HomeService);
  private readonly router = inject(Router);

  // Signals
  private readonly catsSignal = signal<ICatsTypes[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly searchTermSignal = signal<string>('');

  // Computed signals
  public readonly cats = this.catsSignal.asReadonly();
  public readonly loading = this.loadingSignal.asReadonly();
  public readonly filteredCats = computed(() => {
    const cats = this.catsSignal();
    const searchTerm = this.searchTermSignal();
    
    if (!searchTerm) return cats;
    
    return cats.filter(cat => 
      cat.origin.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Properties
  public readonly listScheleton = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  public readonly path = `${_PATH}/circle-loading-animation.gif`;
  
  @ViewChild('input', { static: true }) input!: ElementRef;

  // Convert RxJS observable to signal
  private readonly cats$ = this.homeService.getCats();
  private readonly catsFromService = toSignal(this.cats$, { initialValue: [] });

  constructor() {
    // Effect to update cats when service data changes
    effect(() => {
      this.catsSignal.set(this.catsFromService());
    });
  }

  ngOnInit(): void {
    // Data is automatically loaded via toSignal
  }

  ngAfterViewInit(): void {
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(500),
        map(() => this.input.nativeElement.value)
      )
      .subscribe((searchTerm: string) => {
        this.searchTermSignal.set(searchTerm);
        this.loadingSignal.set(true);
        
        // Simulate loading delay
        setTimeout(() => {
          this.loadingSignal.set(false);
        }, 300);
      });
  }

  onNavigateTo(item: ICatsTypes): void {
    this.router.navigate([`home/list-detalhe/${item.id}`], { state: item });
  }
  
  doSomethingOnError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = this.path;
  }
}
