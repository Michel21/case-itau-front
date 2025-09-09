import { Component, Input, Output, EventEmitter, OnInit, signal, computed, effect, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

export interface DatePickerConfig {
  title?: string;
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
  format?: string;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
  @Input() config: DatePickerConfig = {};
  @Input() selectedDate: Date | null = null;
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() cancelled = new EventEmitter<void>();

  // Angular Features: Inject DestroyRef
  private destroyRef = inject(DestroyRef);

  // Signals para estado reativo
  readonly currentDate = signal(new Date());
  readonly selectedDateSignal = signal<Date | null>(null);
  readonly currentMonth = signal(new Date().getMonth());
  readonly currentYear = signal(new Date().getFullYear());
  readonly showMonthPicker = signal(false);
  readonly showYearPicker = signal(false);
  readonly isDragging = signal(false);

  // Computed values
  readonly monthNames = computed(() => [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]);

  readonly dayNames = computed(() => ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']);

  readonly calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Adicionar dias vazios para alinhar o primeiro dia do mês
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  });

  readonly selectedDateFormatted = computed(() => {
    const date = this.selectedDateSignal();
    if (!date) return '';
    
    const day = date.getDate();
    const month = this.monthNames()[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month.toLowerCase()} de ${year}`;
  });

  readonly availableYears = computed(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  });

  // Computed signal for drag state
  readonly dragState = computed(() => ({
    isDragging: this.isDragging(),
    cursor: this.isDragging() ? 'grabbing' : 'grab'
  }));

  // Drag and Drop properties using signals
  private dragStartX = 0;
  private dragStartY = 0;
  private initialX = 0;
  private initialY = 0;

  ngOnInit(): void {
    if (this.selectedDate) {
      this.selectedDateSignal.set(this.selectedDate);
      this.currentMonth.set(this.selectedDate.getMonth());
      this.currentYear.set(this.selectedDate.getFullYear());
    }

    // Center modal in viewport when it opens
    setTimeout(() => {
      this.centerModalInViewport();
    }, 0);

    // Angular Features: Effect for reactive updates
    effect(() => {
      const dragging = this.isDragging();
      const dialog = document.querySelector('.date-picker-dialog') as HTMLElement;
      if (dialog) {
        if (dragging) {
          dialog.classList.add('dragging');
        } else {
          dialog.classList.remove('dragging');
        }
      }
    });
  }

  private centerModalInViewport(): void {
    const dialog = document.querySelector('.date-picker-dialog') as HTMLElement;
    if (dialog) {
      const rect = dialog.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate center position
      const centerX = (viewportWidth - rect.width) / 2;
      const centerY = (viewportHeight - rect.height) / 2;
      
      // Ensure modal is within viewport bounds
      const constrainedX = Math.max(20, Math.min(centerX, viewportWidth - rect.width - 20));
      const constrainedY = Math.max(20, Math.min(centerY, viewportHeight - rect.height - 20));
      
      // Set initial position
      dialog.style.position = 'fixed';
      dialog.style.left = `${constrainedX}px`;
      dialog.style.top = `${constrainedY}px`;
      dialog.style.margin = '0';
      dialog.style.transform = 'none';
      
      // Store initial position for drag calculations
      this.initialX = constrainedX;
      this.initialY = constrainedY;
    }
  }

  selectDate(day: number): void {
    if (!day) return;
    
    const selectedDate = new Date(this.currentYear(), this.currentMonth(), day);
    this.selectedDateSignal.set(selectedDate);
  }

  isSelectedDate(day: number): boolean {
    if (!day || !this.selectedDateSignal()) return false;
    
    const selectedDate = this.selectedDateSignal()!;
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === this.currentMonth() &&
           selectedDate.getFullYear() === this.currentYear();
  }

  isToday(day: number): boolean {
    if (!day) return false;
    
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === this.currentMonth() &&
           today.getFullYear() === this.currentYear();
  }

  isDisabled(day: number): boolean {
    if (!day) return false;
    
    const date = new Date(this.currentYear(), this.currentMonth(), day);
    
    if (this.config.minDate && date < this.config.minDate) return true;
    if (this.config.maxDate && date > this.config.maxDate) return true;
    
    return false;
  }

  previousMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.set(this.currentYear() - 1);
    } else {
      this.currentMonth.set(this.currentMonth() - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.set(this.currentYear() + 1);
    } else {
      this.currentMonth.set(this.currentMonth() + 1);
    }
  }

  toggleMonthPicker(): void {
    this.showMonthPicker.set(!this.showMonthPicker());
    this.showYearPicker.set(false);
  }

  toggleYearPicker(): void {
    this.showYearPicker.set(!this.showYearPicker());
    this.showMonthPicker.set(false);
  }

  selectMonth(month: number): void {
    this.currentMonth.set(month);
    this.showMonthPicker.set(false);
  }

  selectYear(year: number): void {
    this.currentYear.set(year);
    this.showYearPicker.set(false);
  }

  confirmSelection(): void {
    if (this.selectedDateSignal()) {
      this.dateSelected.emit(this.selectedDateSignal()!);
    }
  }

  cancelSelection(): void {
    this.cancelled.emit();
  }

  closeDialog(): void {
    this.cancelled.emit();
  }

  // Drag and Drop Methods for Modal - Fixed positioning
  onHeaderMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return; // Only left mouse button
    
    event.preventDefault();
    this.isDragging.set(true);
    
    const dialog = (event.target as HTMLElement).closest('.date-picker-dialog') as HTMLElement;
    if (dialog) {
      const rect = dialog.getBoundingClientRect();
      
      // Store initial positions
      this.initialX = rect.left;
      this.initialY = rect.top;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      
      // Set up for smooth dragging
      dialog.style.position = 'fixed';
      dialog.style.left = `${this.initialX}px`;
      dialog.style.top = `${this.initialY}px`;
      dialog.style.margin = '0';
      dialog.style.transform = 'none';
      dialog.style.willChange = 'transform';
    }
    
    // Angular Features: Use takeUntilDestroyed for automatic cleanup
    const mouseMove$ = new Observable<MouseEvent>(subscriber => {
      const handler = (e: MouseEvent) => subscriber.next(e);
      document.addEventListener('mousemove', handler, { passive: true });
      return () => document.removeEventListener('mousemove', handler);
    });
    
    const mouseUp$ = new Observable<MouseEvent>(subscriber => {
      const handler = (e: MouseEvent) => subscriber.next(e);
      document.addEventListener('mouseup', handler, { passive: true });
      return () => document.removeEventListener('mouseup', handler);
    });
    
    mouseMove$.pipe(
      takeUntilDestroyed(this.destroyRef),
      takeUntil(mouseUp$.pipe(take(1)))
    ).subscribe(this.onMouseMove.bind(this));
    
    mouseUp$.pipe(
      takeUntilDestroyed(this.destroyRef),
      take(1)
    ).subscribe(() => this.onMouseUp());
  }

  onHeaderTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    
    this.isDragging.set(true);
    this.dragStartX = event.touches[0].clientX;
    this.dragStartY = event.touches[0].clientY;
    
    const dialog = (event.target as HTMLElement).closest('.date-picker-dialog') as HTMLElement;
    if (dialog) {
      const rect = dialog.getBoundingClientRect();
      this.initialX = rect.left;
      this.initialY = rect.top;
      
      dialog.style.position = 'fixed';
      dialog.style.left = `${this.initialX}px`;
      dialog.style.top = `${this.initialY}px`;
      dialog.style.margin = '0';
      dialog.style.transform = 'none';
    }
    
    // Angular Features: Use RxJS for touch events
    const touchMove$ = new Observable<TouchEvent>(subscriber => {
      const handler = (e: TouchEvent) => subscriber.next(e);
      document.addEventListener('touchmove', handler, { passive: false });
      return () => document.removeEventListener('touchmove', handler);
    });
    
    const touchEnd$ = new Observable<TouchEvent>(subscriber => {
      const handler = (e: TouchEvent) => subscriber.next(e);
      document.addEventListener('touchend', handler);
      return () => document.removeEventListener('touchend', handler);
    });
    
    touchMove$.pipe(
      takeUntilDestroyed(this.destroyRef),
      takeUntil(touchEnd$)
    ).subscribe(this.onTouchMove.bind(this));
    
    touchEnd$.pipe(
      takeUntilDestroyed(this.destroyRef),
      take(1)
    ).subscribe(() => this.onTouchEnd());
    
    event.preventDefault();
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging()) return;
    
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    
    const newX = this.initialX + deltaX;
    const newY = this.initialY + deltaY;
    
    // Constrain to viewport with smooth boundaries
    const dialog = document.querySelector('.date-picker-dialog') as HTMLElement;
    if (dialog) {
      const rect = dialog.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      // Smooth constraint with easing
      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));
      
      // Use direct positioning for smoother movement
      dialog.style.left = `${constrainedX}px`;
      dialog.style.top = `${constrainedY}px`;
    }
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.isDragging() || event.touches.length !== 1) return;
    
    const deltaX = event.touches[0].clientX - this.dragStartX;
    const deltaY = event.touches[0].clientY - this.dragStartY;
    
    const newX = this.initialX + deltaX;
    const newY = this.initialY + deltaY;
    
    // Constrain to viewport with smooth boundaries
    const dialog = document.querySelector('.date-picker-dialog') as HTMLElement;
    if (dialog) {
      const rect = dialog.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      // Smooth constraint with easing
      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));
      
      // Use direct positioning for smoother movement
      dialog.style.left = `${constrainedX}px`;
      dialog.style.top = `${constrainedY}px`;
    }
    
    event.preventDefault();
  }

  private onMouseUp(): void {
    this.isDragging.set(false);
    
    // Reset dialog styles for smooth transition
    const dialog = document.querySelector('.date-picker-dialog') as HTMLElement;
    if (dialog) {
      dialog.style.willChange = 'auto';
      dialog.style.transform = '';
    }
  }

  private onTouchEnd(): void {
    this.isDragging.set(false);
    
    // Reset dialog styles for smooth transition
    const dialog = document.querySelector('.date-picker-dialog') as HTMLElement;
    if (dialog) {
      dialog.style.willChange = 'auto';
      dialog.style.transform = '';
    }
  }
}
