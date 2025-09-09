import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerComponent, DatePickerConfig } from './date-picker.component';

describe('DatePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialização', () => {
    it('deve inicializar com valores padrão', () => {
      expect(component.config).toEqual({});
      expect(component.selectedDate).toBeNull();
    });

    it('deve inicializar com data selecionada', () => {
      const testDate = new Date(2024, 9, 9); // 9 de outubro de 2024
      component.selectedDate = testDate;
      component.ngOnInit();

      expect(component.selectedDateSignal()).toEqual(testDate);
      expect(component.currentMonth()).toBe(9); // Outubro
      expect(component.currentYear()).toBe(2024);
    });
  });

  describe('Seleção de data', () => {
    it('deve selecionar uma data válida', () => {
      const day = 15;
      component.selectDate(day);

      const selectedDate = component.selectedDateSignal();
      expect(selectedDate).toBeTruthy();
      expect(selectedDate?.getDate()).toBe(day);
      expect(selectedDate?.getMonth()).toBe(component.currentMonth());
      expect(selectedDate?.getFullYear()).toBe(component.currentYear());
    });

    it('não deve selecionar dia nulo', () => {
      const initialDate = component.selectedDateSignal();
      component.selectDate(null as any);
      
      expect(component.selectedDateSignal()).toBe(initialDate);
    });

    it('deve verificar se data está selecionada', () => {
      component.selectDate(15);
      
      expect(component.isSelectedDate(15)).toBe(true);
      expect(component.isSelectedDate(20)).toBe(false);
    });

    it('deve verificar se é hoje', () => {
      const today = new Date();
      component.currentMonth.set(today.getMonth());
      component.currentYear.set(today.getFullYear());
      
      expect(component.isToday(today.getDate())).toBe(true);
      expect(component.isToday(today.getDate() + 1)).toBe(false);
    });
  });

  describe('Navegação do calendário', () => {
    it('deve navegar para o mês anterior', () => {
      component.currentMonth.set(5); // Junho
      component.currentYear.set(2024);
      
      component.previousMonth();
      
      expect(component.currentMonth()).toBe(4); // Maio
      expect(component.currentYear()).toBe(2024);
    });

    it('deve navegar para o mês anterior no início do ano', () => {
      component.currentMonth.set(0); // Janeiro
      component.currentYear.set(2024);
      
      component.previousMonth();
      
      expect(component.currentMonth()).toBe(11); // Dezembro
      expect(component.currentYear()).toBe(2023);
    });

    it('deve navegar para o próximo mês', () => {
      component.currentMonth.set(5); // Junho
      component.currentYear.set(2024);
      
      component.nextMonth();
      
      expect(component.currentMonth()).toBe(6); // Julho
      expect(component.currentYear()).toBe(2024);
    });

    it('deve navegar para o próximo mês no final do ano', () => {
      component.currentMonth.set(11); // Dezembro
      component.currentYear.set(2024);
      
      component.nextMonth();
      
      expect(component.currentMonth()).toBe(0); // Janeiro
      expect(component.currentYear()).toBe(2025);
    });
  });

  describe('Seletores de mês e ano', () => {
    it('deve alternar seletor de mês', () => {
      expect(component.showMonthPicker()).toBe(false);
      
      component.toggleMonthPicker();
      expect(component.showMonthPicker()).toBe(true);
      
      component.toggleMonthPicker();
      expect(component.showMonthPicker()).toBe(false);
    });

    it('deve alternar seletor de ano', () => {
      expect(component.showYearPicker()).toBe(false);
      
      component.toggleYearPicker();
      expect(component.showYearPicker()).toBe(true);
      
      component.toggleYearPicker();
      expect(component.showYearPicker()).toBe(false);
    });

    it('deve fechar seletor de ano ao abrir seletor de mês', () => {
      component.showYearPicker.set(true);
      
      component.toggleMonthPicker();
      
      expect(component.showMonthPicker()).toBe(true);
      expect(component.showYearPicker()).toBe(false);
    });

    it('deve fechar seletor de mês ao abrir seletor de ano', () => {
      component.showMonthPicker.set(true);
      
      component.toggleYearPicker();
      
      expect(component.showYearPicker()).toBe(true);
      expect(component.showMonthPicker()).toBe(false);
    });

    it('deve selecionar mês', () => {
      component.selectMonth(5); // Junho
      
      expect(component.currentMonth()).toBe(5);
      expect(component.showMonthPicker()).toBe(false);
    });

    it('deve selecionar ano', () => {
      component.selectYear(2025);
      
      expect(component.currentYear()).toBe(2025);
      expect(component.showYearPicker()).toBe(false);
    });
  });

  describe('Validação de datas', () => {
    it('deve verificar se data está desabilitada por data mínima', () => {
      const minDate = new Date(2024, 9, 10); // 10 de outubro de 2024
      component.config = { minDate };
      component.currentMonth.set(9); // Outubro
      component.currentYear.set(2024);
      
      expect(component.isDisabled(5)).toBe(true); // Antes da data mínima
      expect(component.isDisabled(15)).toBe(false); // Depois da data mínima
    });

    it('deve verificar se data está desabilitada por data máxima', () => {
      const maxDate = new Date(2024, 9, 20); // 20 de outubro de 2024
      component.config = { maxDate };
      component.currentMonth.set(9); // Outubro
      component.currentYear.set(2024);
      
      expect(component.isDisabled(15)).toBe(false); // Antes da data máxima
      expect(component.isDisabled(25)).toBe(true); // Depois da data máxima
    });
  });

  describe('Formatação de data', () => {
    it('deve formatar data selecionada corretamente', () => {
      const testDate = new Date(2024, 9, 9); // 9 de outubro de 2024
      component.selectedDateSignal.set(testDate);
      
      expect(component.selectedDateFormatted()).toBe('9 de outubro de 2024');
    });

    it('deve retornar string vazia quando não há data selecionada', () => {
      component.selectedDateSignal.set(null);
      
      expect(component.selectedDateFormatted()).toBe('');
    });
  });

  describe('Anos disponíveis', () => {
    it('deve gerar lista de anos corretamente', () => {
      const currentYear = new Date().getFullYear();
      const years = component.availableYears();
      
      expect(years).toContain(currentYear - 10);
      expect(years).toContain(currentYear);
      expect(years).toContain(currentYear + 10);
      expect(years.length).toBe(21); // 10 anos antes + ano atual + 10 anos depois
    });
  });

  describe('Eventos', () => {
    it('deve emitir evento de confirmação com data selecionada', () => {
      jest.spyOn(component.dateSelected, 'emit');
      const testDate = new Date(2024, 9, 9);
      component.selectedDateSignal.set(testDate);
      
      component.confirmSelection();
      
      expect(component.dateSelected.emit).toHaveBeenCalledWith(testDate);
    });

    it('não deve emitir evento de confirmação sem data selecionada', () => {
      jest.spyOn(component.dateSelected, 'emit');
      component.selectedDateSignal.set(null);
      
      component.confirmSelection();
      
      expect(component.dateSelected.emit).not.toHaveBeenCalled();
    });

    it('deve emitir evento de cancelamento', () => {
      jest.spyOn(component.cancelled, 'emit');
      
      component.cancelSelection();
      
      expect(component.cancelled.emit).toHaveBeenCalled();
    });

    it('deve emitir evento de cancelamento ao fechar', () => {
      jest.spyOn(component.cancelled, 'emit');
      
      component.closeDialog();
      
      expect(component.cancelled.emit).toHaveBeenCalled();
    });
  });

  describe('Dias do calendário', () => {
    it('deve gerar dias do calendário corretamente', () => {
      component.currentMonth.set(9); // Outubro de 2024
      component.currentYear.set(2024);
      
      const days = component.calendarDays();
      
      // Outubro de 2024 começa numa terça-feira (índice 2)
      expect(days[0]).toBeNull(); // Domingo
      expect(days[1]).toBeNull(); // Segunda
      expect(days[2]).toBe(1); // Terça - primeiro dia
      expect(days[31]).toBe(30); // Último dia de outubro
    });
  });

  describe('Nomes dos meses e dias', () => {
    it('deve retornar nomes dos meses em português', () => {
      const monthNames = component.monthNames();
      
      expect(monthNames[0]).toBe('Janeiro');
      expect(monthNames[9]).toBe('Outubro');
      expect(monthNames[11]).toBe('Dezembro');
    });

    it('deve retornar abreviações dos dias da semana', () => {
      const dayNames = component.dayNames();
      
      expect(dayNames).toEqual(['D', 'S', 'T', 'Q', 'Q', 'S', 'S']);
    });
  });
});
