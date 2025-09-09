import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // Signals para estado reativo
  readonly currentDate = signal(new Date());
  readonly selectedDateSignal = signal<Date | null>(null);
  readonly currentMonth = signal(new Date().getMonth());
  readonly currentYear = signal(new Date().getFullYear());
  readonly showMonthPicker = signal(false);
  readonly showYearPicker = signal(false);

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

  ngOnInit(): void {
    if (this.selectedDate) {
      this.selectedDateSignal.set(this.selectedDate);
      this.currentMonth.set(this.selectedDate.getMonth());
      this.currentYear.set(this.selectedDate.getFullYear());
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
}
