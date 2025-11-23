/// <reference types="jest" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToggleSegmentedComponent, ToggleOption } from './toggle-segmented.component';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <app-toggle-segmented
      [options]="options"
      [(ngModel)]="value"
      [disabled]="disabled"
    ></app-toggle-segmented>
  `,
  standalone: true,
  imports: [ToggleSegmentedComponent, FormsModule]
})
class TestHostComponent {
  options: ToggleOption[] = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
    { value: 'opt3', label: 'Option 3', disabled: true }
  ];
  value: string | null = 'opt1';
  disabled = false;
}

describe('ToggleSegmentedComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let toggleComponent: ToggleSegmentedComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    
    const toggleDebugElement = fixture.debugElement.query(By.directive(ToggleSegmentedComponent));
    toggleComponent = toggleDebugElement.componentInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(toggleComponent).toBeTruthy();
  });

  it('should render all options', () => {
    const labels = fixture.debugElement.queryAll(By.css('.toggle-segmented__label-text'));
    expect(labels.length).toBe(3);
    expect(labels[0].nativeElement.textContent.trim()).toBe('Option 1');
  });

  it('should have first option selected by default', () => {
    expect(toggleComponent.internalValue()).toBe('opt1');
  });

  it('should select option on click', fakeAsync(() => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons[1].nativeElement.click();
    fixture.detectChanges();
    tick();

    expect(hostComponent.value).toBe('opt2');
    expect(toggleComponent.internalValue()).toBe('opt2');
  }));

  it('should not select disabled option', () => {
    const initialValue = hostComponent.value;
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons[2].nativeElement.click();
    fixture.detectChanges();

    expect(hostComponent.value).toBe(initialValue);
  });

  it('should reflect disabled state from host', () => {
    hostComponent.disabled = true;
    fixture.detectChanges();
    
    const initialValue = hostComponent.value;
    
    toggleComponent.selectOption(hostComponent.options[1]);
    fixture.detectChanges();
    
    expect(hostComponent.value).toBe(initialValue);
  });

  it('should handle keyboard navigation with ArrowRight', fakeAsync(() => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    
    buttons[0].nativeElement.dispatchEvent(event);
    tick();
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  }));

  it('should handle keyboard navigation with ArrowLeft', fakeAsync(() => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    
    buttons[1].nativeElement.dispatchEvent(event);
    tick();
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  }));

  it('should update value via ControlValueAccessor', fakeAsync(() => {
    toggleComponent.writeValue('opt2');
    fixture.detectChanges();
    tick();
    
    expect(toggleComponent.internalValue()).toBe('opt2');
  }));

  it('should call onChange when value changes', () => {
    const onChangeSpy = jest.fn();
    toggleComponent.registerOnChange(onChangeSpy);
    
    toggleComponent.selectOption(hostComponent.options[1]);
    fixture.detectChanges();
    
    expect(onChangeSpy).toHaveBeenCalledWith('opt2');
  });

  it('should register onChange and onTouched callbacks', () => {
    const onChangeSpy = jest.fn();
    const onTouchedSpy = jest.fn();
    
    toggleComponent.registerOnChange(onChangeSpy);
    toggleComponent.registerOnTouched(onTouchedSpy);
    
    expect(toggleComponent.registerOnChange).toBeDefined();
    expect(toggleComponent.registerOnTouched).toBeDefined();
  });

  it('should apply correct tabindex for roving tabindex pattern', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    
    // First enabled button should have tabindex 0
    expect(buttons[0].nativeElement.getAttribute('tabindex')).toBe('0');
    
    // Other buttons should have tabindex -1
    expect(buttons[1].nativeElement.getAttribute('tabindex')).toBe('-1');
  });
});
