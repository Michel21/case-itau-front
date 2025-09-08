import { Component, Input, Output, EventEmitter, signal, computed, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface DatePickerConfig {
  placeholder?: string;
  maxLength?: number;
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
  withInterval?: boolean;
  separatorInterval?: string;
  listMode?: boolean;
  hideInput?: boolean;
  calendarOnly?: boolean;
  showYearMonthView?: boolean;
}

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})

export class DatePickerComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() control: FormControl = new FormControl();
  @Input() config: DatePickerConfig = {};
  @Input() value: string = '';
  @Output() dateChange = new EventEmitter<string>();
  @Output() modalOpen = new EventEmitter<boolean>();

  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('modal', { static: false }) modal!: ElementRef<HTMLDivElement>;

  // Configuração do componente
  withInterval = true;
  separatorInterval = " - ";
  values: Date[] = [];
  calendarOnly = false;
  showYearMonthView = false;
  
  // Estados para seleção de período
  readonly isSelectingPeriod = signal<boolean>(false);
  readonly periodStartDate = signal<Date | null>(null);
  readonly periodEndDate = signal<Date | null>(null);
  readonly periodValidation = signal<{ isValid: boolean; message: string }>({ isValid: true, message: '' });

  // Signals para estado do componente
  readonly isModalOpen = signal<boolean>(false);
  readonly selectedDate = signal<Date | null>(null);
  readonly currentMonth = signal<number>(new Date().getMonth());
  readonly currentYear = signal<number>(new Date().getFullYear());
  readonly selectedDates = signal<Date[]>([]);
  readonly listMode = signal<boolean>(true);
  readonly currentView = signal<'days' | 'months' | 'years'>('days');
  
  // Estados dos botões
  readonly isClearButtonEnabled = signal<boolean>(false);
  readonly isConfirmButtonEnabled = signal<boolean>(false);

  // Computed values
  readonly displayValue = computed(() => {
    if (this.values.length === 0) return this.config.placeholder || 'Escolha a data';
    return this.generateDateString();
  });

  readonly maxLength = computed(() => {
    return this.withInterval ? 20 + this.separatorInterval.length : 10;
  });

  readonly monthName = computed(() => {
    const month = this.currentMonth();
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month];
  });

  readonly monthsList = computed(() => {
    const months = [
      { value: 0, name: 'Janeiro', short: 'Jan' },
      { value: 1, name: 'Fevereiro', short: 'Fev' },
      { value: 2, name: 'Março', short: 'Mar' },
      { value: 3, name: 'Abril', short: 'Abr' },
      { value: 4, name: 'Maio', short: 'Mai' },
      { value: 5, name: 'Junho', short: 'Jun' },
      { value: 6, name: 'Julho', short: 'Jul' },
      { value: 7, name: 'Agosto', short: 'Ago' },
      { value: 8, name: 'Setembro', short: 'Set' },
      { value: 9, name: 'Outubro', short: 'Out' },
      { value: 10, name: 'Novembro', short: 'Nov' },
      { value: 11, name: 'Dezembro', short: 'Dez' }
    ];
    return months;
  });

  readonly yearsList = computed(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Mostrar anos de 10 anos atrás até 10 anos no futuro
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  });

  readonly calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior (para preencher a primeira semana)
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isSelected: this.isDateSelected(date),
        isToday: this.isToday(date),
        isInPeriod: this.isDateInPeriod(date),
        isPeriodStart: this.isPeriodStart(date),
        isPeriodEnd: this.isPeriodEnd(date),
        date
      });
    }

    // Dias do mês atual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = this.isDateSelected(date);
      const isToday = this.isToday(date);
      const isInPeriod = this.isDateInPeriod(date);
      const isPeriodStart = this.isPeriodStart(date);
      const isPeriodEnd = this.isPeriodEnd(date);
      
      days.push({
        day,
        isCurrentMonth: true,
        isSelected,
        isToday,
        isInPeriod,
        isPeriodStart,
        isPeriodEnd,
        date
      });
    }

    // Dias do próximo mês (para completar a última semana)
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        day,
        isCurrentMonth: false,
        isSelected: this.isDateSelected(date),
        isToday: this.isToday(date),
        isInPeriod: this.isDateInPeriod(date),
        isPeriodStart: this.isPeriodStart(date),
        isPeriodEnd: this.isPeriodEnd(date),
        date
      });
    }

    return days;
  });

  readonly weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  ngOnInit(): void {
    // Inicializar valores baseados na configuração
    this.withInterval = this.config.withInterval ?? true;
    this.separatorInterval = this.config.separatorInterval ?? ' - ';
    this.listMode.set(this.config.listMode ?? true);
    this.calendarOnly = this.config.calendarOnly ?? false;
    this.showYearMonthView = this.config.showYearMonthView ?? false;
    
    // Inicializar valores se fornecidos
    if (this.value) {
      this.parseAndSetValues(this.value);
    }
    
    // Configurar FormControl se fornecido
    if (this.control) {
      this.control.valueChanges.subscribe(value => {
        if (value && value !== this.generateDateString()) {
          this.parseAndSetValues(value);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    // Configurar input após a view ser inicializada
    this.setupInputField();
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
  }

  // Configurar campo de input
  private setupInputField(): void {
    if (this.dateInput?.nativeElement) {
      const input = this.dateInput.nativeElement;
      input.setAttribute('maxlength', this.withInterval ? '23' : '10');
      input.setAttribute('placeholder', this.config.placeholder || 'Escolha a data');
      input.setAttribute('readonly', 'true'); // Prevenir digitação manual
    }
  }

  // Métodos nativos do componente

  // Métodos auxiliares
  private parseAndSetValues(value: string): void {
    const dates = this.parseDateString(value);
    this.values = dates;
    this.selectedDates.set(dates);
    if (dates.length > 0) {
      this.selectedDate.set(dates[0]);
    }
  }

  private parseDateString(value: string): Date[] {
    const dates: Date[] = [];
    const parts = value.split(this.separatorInterval);
    
    parts.forEach(part => {
      const date = this.parseDate(part.trim());
      if (date) {
        dates.push(date);
      }
    });
    
    return dates;
  }

  // Métodos públicos para interação com o template

  // Métodos públicos para interação com o template
  openModal(): void {
    this.isModalOpen.set(true);
    this.modalOpen.emit(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.modalOpen.emit(false);
  }

  selectDate(date: Date): void {
    if (this.withInterval) {
      this.handlePeriodSelection(date);
    } else {
      this.values = [date];
      this.selectedDate.set(date);
      this.selectedDates.set([date]);
    }
    
    this.updateDisplayValue();
    this.updateButtonStates();
  }

  clearSelection(): void {
    this.values = [];
    this.selectedDate.set(null);
    this.selectedDates.set([]);
    this.periodStartDate.set(null);
    this.periodEndDate.set(null);
    this.isSelectingPeriod.set(false);
    this.periodValidation.set({ isValid: true, message: '' });
    
    // Limpar o FormControl também
    this.control.setValue('');
    this.dateChange.emit('');
    
    this.updateDisplayValue();
    this.updateButtonStates();
  }

  confirmSelection(): void {
    const dateString = this.generateDateString();
    this.control.setValue(dateString);
    this.dateChange.emit(dateString);
    this.closeModal();
  }

  // Métodos auxiliares para seleção de período
  private handlePeriodSelection(date: Date): void {
    const startDate = this.periodStartDate();
    const endDate = this.periodEndDate();
    
    if (!startDate) {
      // Primeira seleção - definir data inicial
      this.periodStartDate.set(date);
      this.periodEndDate.set(null);
      this.isSelectingPeriod.set(true);
      this.validatePeriod();
    } else if (!endDate) {
      // Segunda seleção - definir data final
      if (date < startDate) {
        // Se a data selecionada for anterior à inicial, trocar
        this.periodStartDate.set(date);
        this.periodEndDate.set(startDate);
      } else {
        this.periodEndDate.set(date);
      }
      this.isSelectingPeriod.set(false);
      this.validatePeriod();
      this.updateValuesFromPeriod();
    } else {
      // Nova seleção - reiniciar
      this.periodStartDate.set(date);
      this.periodEndDate.set(null);
      this.isSelectingPeriod.set(true);
      this.validatePeriod();
    }
  }

  private updateValuesFromPeriod(): void {
    const startDate = this.periodStartDate();
    const endDate = this.periodEndDate();
    
    if (startDate && endDate) {
      this.values = [startDate, endDate];
      this.selectedDates.set([startDate, endDate]);
    } else if (startDate) {
      this.values = [startDate];
      this.selectedDates.set([startDate]);
    }
  }

  private validatePeriod(): void {
    const startDate = this.periodStartDate();
    const endDate = this.periodEndDate();
    
    if (!startDate) {
      this.periodValidation.set({ isValid: true, message: '' });
      return;
    }
    
    if (!endDate) {
      this.periodValidation.set({ isValid: true, message: 'Selecione a data final' });
      return;
    }
    
    // Validar se o período não excede 90 dias
    const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference > 90) {
      this.periodValidation.set({ 
        isValid: false, 
        message: 'O período não pode exceder 90 dias' 
      });
    } else {
      this.periodValidation.set({ 
        isValid: true, 
        message: `Período de ${daysDifference + 1} dias` 
      });
    }
  }

  private updateDisplayValue(): void {
    const dateString = this.generateDateString();
    this.control.setValue(dateString);
  }

  private updateButtonStates(): void {
    const hasValues = this.values.length > 0;
    const isValidPeriod = this.periodValidation().isValid;
    const hasCompletePeriod = !!(this.periodStartDate() && this.periodEndDate());
    
    this.isClearButtonEnabled.set(hasValues);
    
    if (this.withInterval) {
      this.isConfirmButtonEnabled.set(hasCompletePeriod && isValidPeriod);
    } else {
      this.isConfirmButtonEnabled.set(hasValues);
    }
  }

  private generateDateString(): string {
    if (this.values.length === 0) return '';
    
    if (this.withInterval && this.values.length === 2) {
      const startDate = this.formatDate(this.values[0]);
      const endDate = this.formatDate(this.values[1]);
      return `${startDate}${this.separatorInterval}${endDate}`;
    } else if (this.values.length === 1) {
      return this.formatDate(this.values[0]);
    }
    
    return '';
  }

  // Navegação do calendário
  previousMonth(): void {
    const currentMonth = this.currentMonth();
    const currentYear = this.currentYear();
    
    if (currentMonth === 0) {
      this.currentMonth.set(11);
      this.currentYear.set(currentYear - 1);
    } else {
      this.currentMonth.set(currentMonth - 1);
    }
  }

  nextMonth(): void {
    const currentMonth = this.currentMonth();
    const currentYear = this.currentYear();
    
    if (currentMonth === 11) {
      this.currentMonth.set(0);
      this.currentYear.set(currentYear + 1);
    } else {
      this.currentMonth.set(currentMonth + 1);
    }
  }

  // Navegação entre visualizações
  setView(view: 'days' | 'months' | 'years'): void {
    this.currentView.set(view);
  }

  // Métodos auxiliares para o template
  isCurrentMonth(monthValue: number): boolean {
    return monthValue === new Date().getMonth() && this.currentYear() === new Date().getFullYear();
  }

  isCurrentYear(year: number): boolean {
    return year === new Date().getFullYear();
  }

  selectMonth(month: number): void {
    this.currentMonth.set(month);
    if (this.showYearMonthView) {
      // Se estamos na visualização de mês/ano, selecionar o primeiro dia do mês
      const date = new Date(this.currentYear(), month, 1);
      this.selectDate(date);
    } else {
      // Voltar para visualização de dias
      this.currentView.set('days');
    }
  }

  selectYear(year: number): void {
    this.currentYear.set(year);
    if (this.showYearMonthView) {
      // Se estamos na visualização de mês/ano, ir para visualização de meses
      this.currentView.set('months');
    } else {
      // Voltar para visualização de dias
      this.currentView.set('days');
    }
  }

  goToMonthView(): void {
    this.currentView.set('months');
  }

  goToYearView(): void {
    this.currentView.set('years');
  }

  goToDaysView(): void {
    this.currentView.set('days');
  }

  // Métodos privados
  private formatDate(date: Date): string {
    const format = this.config.format || 'dd/MM/yyyy';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    switch (format) {
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  }

  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    
    const format = this.config.format || 'dd/MM/yyyy';
    let parts: string[] = [];

    switch (format) {
      case 'dd/MM/yyyy':
        parts = dateString.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        break;
      case 'MM/dd/yyyy':
        parts = dateString.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
        break;
      case 'yyyy-MM-dd':
        parts = dateString.split('-');
        if (parts.length === 3) {
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        break;
    }

    return null;
  }

  private isDateSelected(date: Date): boolean {
    return this.selectedDates().some(selectedDate => 
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear()
    );
  }

  private isDateInPeriod(date: Date): boolean {
    const startDate = this.periodStartDate();
    const endDate = this.periodEndDate();
    
    if (!startDate || !endDate) return false;
    
    const dateTime = date.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    return dateTime >= startTime && dateTime <= endTime;
  }

  private isPeriodStart(date: Date): boolean {
    const startDate = this.periodStartDate();
    if (!startDate) return false;
    
    return date.getDate() === startDate.getDate() &&
           date.getMonth() === startDate.getMonth() &&
           date.getFullYear() === startDate.getFullYear();
  }

  private isPeriodEnd(date: Date): boolean {
    const endDate = this.periodEndDate();
    if (!endDate) return false;
    
    return date.getDate() === endDate.getDate() &&
           date.getMonth() === endDate.getMonth() &&
           date.getFullYear() === endDate.getFullYear();
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  // Métodos para acessibilidade
  onKeyDown(event: KeyboardEvent, action: string): void {
    switch (action) {
      case 'open':
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.openModal();
        }
        break;
      case 'close':
        if (event.key === 'Escape') {
          this.closeModal();
        }
        break;
      case 'prev':
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.previousMonth();
        }
        break;
      case 'next':
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.nextMonth();
        }
        break;
    }
  }

  onDateKeyDown(event: KeyboardEvent, date: Date): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectDate(date);
    }
  }

  // Métodos para acessibilidade e interação
  onInputClick(): void {
    this.openModal();
  }

  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  setMode(isInterval: boolean): void {
    this.withInterval = isInterval;
    this.clearSelection();
  }
}
