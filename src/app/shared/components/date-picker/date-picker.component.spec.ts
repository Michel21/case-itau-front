import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePickerComponent, DatePickerConfig } from './date-picker.component';

describe('DatePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    component.control = new FormControl('');
    component.config = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isModalOpen()).toBe(false);
    expect(component.selectedDate()).toBeNull();
    expect(component.currentMonth()).toBe(new Date().getMonth());
    expect(component.currentYear()).toBe(new Date().getFullYear());
  });

  it('should open modal when openModal is called', () => {
    component.openModal();
    expect(component.isModalOpen()).toBe(true);
  });

  it('should close modal when closeModal is called', () => {
    component.openModal();
    component.closeModal();
    expect(component.isModalOpen()).toBe(false);
  });

  it('should select date and emit dateChange event', () => {
    const testDate = new Date(2024, 0, 15); // 15 de janeiro de 2024
    spyOn(component.dateChange, 'emit');
    
    component.selectDate(testDate);
    
    expect(component.selectedDate()).toEqual(testDate);
    expect(component.dateChange.emit).toHaveBeenCalledWith('15/01/2024');
  });

  it('should clear selection when clearSelection is called', () => {
    const testDate = new Date(2024, 0, 15);
    component.selectDate(testDate);
    spyOn(component.dateChange, 'emit');
    
    component.clearSelection();
    
    expect(component.selectedDate()).toBeNull();
    expect(component.dateChange.emit).toHaveBeenCalledWith('');
  });

  it('should navigate to previous month', () => {
    const initialMonth = component.currentMonth();
    const initialYear = component.currentYear();
    
    component.previousMonth();
    
    if (initialMonth === 0) {
      expect(component.currentMonth()).toBe(11);
      expect(component.currentYear()).toBe(initialYear - 1);
    } else {
      expect(component.currentMonth()).toBe(initialMonth - 1);
      expect(component.currentYear()).toBe(initialYear);
    }
  });

  it('should navigate to next month', () => {
    const initialMonth = component.currentMonth();
    const initialYear = component.currentYear();
    
    component.nextMonth();
    
    if (initialMonth === 11) {
      expect(component.currentMonth()).toBe(0);
      expect(component.currentYear()).toBe(initialYear + 1);
    } else {
      expect(component.currentMonth()).toBe(initialMonth + 1);
      expect(component.currentYear()).toBe(initialYear);
    }
  });

  it('should format date correctly for dd/MM/yyyy format', () => {
    const testDate = new Date(2024, 0, 15);
    component.config = { format: 'dd/MM/yyyy' };
    
    const formatted = component['formatDate'](testDate);
    expect(formatted).toBe('15/01/2024');
  });

  it('should format date correctly for MM/dd/yyyy format', () => {
    const testDate = new Date(2024, 0, 15);
    component.config = { format: 'MM/dd/yyyy' };
    
    const formatted = component['formatDate'](testDate);
    expect(formatted).toBe('01/15/2024');
  });

  it('should format date correctly for yyyy-MM-dd format', () => {
    const testDate = new Date(2024, 0, 15);
    component.config = { format: 'yyyy-MM-dd' };
    
    const formatted = component['formatDate'](testDate);
    expect(formatted).toBe('2024-01-15');
  });

  it('should parse date correctly for dd/MM/yyyy format', () => {
    component.config = { format: 'dd/MM/yyyy' };
    
    const parsed = component['parseDate']('15/01/2024');
    expect(parsed).toEqual(new Date(2024, 0, 15));
  });

  it('should return null for invalid date string', () => {
    const parsed = component['parseDate']('invalid-date');
    expect(parsed).toBeNull();
  });

  it('should detect today correctly', () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    expect(component['isToday'](today)).toBe(true);
    expect(component['isToday'](yesterday)).toBe(false);
  });

  it('should detect selected date correctly', () => {
    const testDate = new Date(2024, 0, 15);
    component.selectDate(testDate);
    
    expect(component['isDateSelected'](testDate)).toBe(true);
    expect(component['isDateSelected'](new Date(2024, 0, 16))).toBe(false);
  });

  it('should handle keyboard navigation', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(component, 'openModal');
    
    component.onKeyDown(event, 'open');
    
    expect(component.openModal).toHaveBeenCalled();
  });

  it('should close modal on Escape key', () => {
    component.openModal();
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    
    component.onKeyDown(event, 'close');
    
    expect(component.isModalOpen()).toBe(false);
  });

  it('should emit modalOpen event when opening modal', () => {
    spyOn(component.modalOpen, 'emit');
    
    component.openModal();
    
    expect(component.modalOpen.emit).toHaveBeenCalledWith(true);
  });

  it('should emit modalOpen event when closing modal', () => {
    component.openModal();
    spyOn(component.modalOpen, 'emit');
    
    component.closeModal();
    
    expect(component.modalOpen.emit).toHaveBeenCalledWith(false);
  });

  it('should update control value when date is selected', () => {
    const testDate = new Date(2024, 0, 15);
    const control = new FormControl('');
    component.control = control;
    
    component.selectDate(testDate);
    
    expect(control.value).toBe('15/01/2024');
  });

  it('should clear control value when selection is cleared', () => {
    const control = new FormControl('15/01/2024');
    component.control = control;
    
    component.clearSelection();
    
    expect(control.value).toBe('');
  });
});
