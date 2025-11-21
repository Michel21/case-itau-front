import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent - Standalone', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent] // Import standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default signal values', () => {
    expect(component.value()).toBe(false);
    expect(component.disabled()).toBe(false);
    expect(component.enableMixed()).toBe(false);
  });

  it('should toggle value on click', () => {
    expect(component.value()).toBe(false);
    
    component.changeCheckbox();
    expect(component.value()).toBe(true);
    
    component.changeCheckbox();
    expect(component.value()).toBe(false);
  });

  it('should not change value when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    
    component.value.set(false);
    component.changeCheckbox();
    
    expect(component.value()).toBe(false);
  });

  it('should cycle through mixed states', () => {
    fixture.componentRef.setInput('enableMixed', true);
    component.value.set(false);
    
    component.changeCheckbox();
    expect(component.value()).toBe(true);
    
    component.changeCheckbox();
    expect(component.value()).toBe(undefined);
    
    component.changeCheckbox();
    expect(component.value()).toBe(false);
  });

  it('should emit valueChange event', (done) => {
    component.valueChange.subscribe((value) => {
      expect(value).toBe(true);
      done();
    });
    
    component.changeCheckbox();
  });

  it('should compute aria-checked correctly', () => {
    component.value.set(true);
    expect(component.ariaChecked()).toBe(true);
    
    component.value.set(false);
    expect(component.ariaChecked()).toBe(false);
    
    component.value.set(undefined);
    expect(component.ariaChecked()).toBe('mixed');
  });

  it('should compute label classes correctly', () => {
    const classes = component.labelClasses();
    expect(classes.bradCheckbox).toBe(true);
    expect(classes.noselect).toBe(true);
  });

  it('should handle writeValue from Forms API', () => {
    component.writeValue(true);
    expect(component.value()).toBe(true);
    
    component.writeValue(false);
    expect(component.value()).toBe(false);
  });

  it('should handle mixed state in writeValue', () => {
    fixture.componentRef.setInput('enableMixed', true);
    
    component.writeValue(undefined);
    expect(component.value()).toBe(undefined);
  });

  it('should work with input signals', () => {
    fixture.componentRef.setInput('titulo', 'Teste');
    fixture.componentRef.setInput('small', true);
    
    expect(component.titulo()).toBe('Teste');
    expect(component.small()).toBe(true);
    expect(component.labelClasses().bradCheckboxSmall).toBe(true);
  });
});
