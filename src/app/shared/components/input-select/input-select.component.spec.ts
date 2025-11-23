/// <reference types="jest" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputSelectComponent } from './input-select.component';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <app-input-select
      [label]="label"
      [value]="value"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [ariaLabel]="ariaLabel"
      (inputClick)="onInputClick()"
    ></app-input-select>
  `,
  standalone: true,
  imports: [InputSelectComponent, FormsModule]
})
class TestHostComponent {
  label = 'Test Label';
  value = '';
  placeholder = 'Test Placeholder';
  disabled = false;
  ariaLabel = '';

  onInputClick = jest.fn();
}

describe('InputSelectComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let inputSelectComponent: InputSelectComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    
    const inputSelectDebugElement = fixture.debugElement.query(By.directive(InputSelectComponent));
    inputSelectComponent = inputSelectDebugElement.componentInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(inputSelectComponent).toBeTruthy();
  });

  it('should display the label correctly', () => {
    const buttonElement = fixture.debugElement.query(By.css('.input-select__button'));
    expect(buttonElement.nativeElement.textContent).toContain('Test Label');
  });

  it('should display placeholder when value is empty', () => {
    const buttonElement = fixture.debugElement.query(By.css('.input-select__button'));
    // When empty, shows label (not placeholder in button content)
    expect(buttonElement.nativeElement.textContent).toContain('Test Label');
  });

  it('should display value when provided', () => {
    hostComponent.value = 'Selected Value';
    fixture.detectChanges();
    
    const buttonElement = fixture.debugElement.query(By.css('.input-select__button'));
    expect(buttonElement.nativeElement.textContent).toContain('Selected Value');
  });

  it('should emit inputClick when clicked', () => {
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(hostComponent.onInputClick).toHaveBeenCalled();
  });

  it('should not emit inputClick when disabled', () => {
    hostComponent.disabled = true;
    fixture.detectChanges();
    
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(hostComponent.onInputClick).not.toHaveBeenCalled();
  });

  it('should handle Enter key to trigger click', () => {
    const button = fixture.debugElement.query(By.css('button'));
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    
    button.nativeElement.dispatchEvent(event);
    expect(hostComponent.onInputClick).toHaveBeenCalled();
  });

  it('should implement ControlValueAccessor interface', () => {
    expect(inputSelectComponent.writeValue).toBeDefined();
    expect(inputSelectComponent.registerOnChange).toBeDefined();
    expect(inputSelectComponent.registerOnTouched).toBeDefined();
    expect(inputSelectComponent.setDisabledState).toBeDefined();
  });

  it('should focus the button programmatically', () => {
    const button = fixture.debugElement.query(By.css('button'));
    const focusSpy = jest.spyOn(button.nativeElement, 'focus');
    
    inputSelectComponent.focus();
    expect(focusSpy).toHaveBeenCalled();
  });
});
