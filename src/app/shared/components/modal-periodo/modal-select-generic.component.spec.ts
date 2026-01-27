/// <reference types="jest" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ModalSelectGenericComponent, ModalSelectOption } from './modal-select-generic.component';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <app-modal-select-generic
      [isOpen]="isOpen"
      [titulo]="titulo"
      [options]="options"
      [selectedValue]="selectedValue"
      (confirmar)="onConfirm($event)"
      (cancelar)="onCancel()"
    ></app-modal-select-generic>
  `,
  standalone: true,
  imports: [ModalSelectGenericComponent]
})
class TestHostComponent {
  isOpen = false;
  titulo = 'Test Modal';
  options: ModalSelectOption[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' }
  ];
  selectedValue: string | null = null;

  onConfirm = jest.fn();
  onCancel = jest.fn();
}

describe('ModalSelectGenericComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let modalComponent: ModalSelectGenericComponent;
  let liveAnnouncerMock: any;

  beforeEach(async () => {
    liveAnnouncerMock = {
      announce: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: LiveAnnouncer, useValue: liveAnnouncerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    
    const modalDebugElement = fixture.debugElement.query(By.directive(ModalSelectGenericComponent));
    modalComponent = modalDebugElement.componentInstance;
    
      fixture.detectChanges();
    });

  it('should create', () => {
    expect(modalComponent).toBeTruthy();
    });

  it('should not display modal content when closed', () => {
    const modalElement = fixture.debugElement.query(By.css('.modal-periodo-host--open'));
    expect(modalElement).toBeFalsy();
    });

  it('should display modal content when open', () => {
    hostComponent.isOpen = true;
      fixture.detectChanges();
      
    const modalElement = fixture.debugElement.query(By.css('.modal-periodo-host--open'));
    expect(modalElement).toBeTruthy();
    });

  it('should display the title', () => {
    hostComponent.isOpen = true;
      fixture.detectChanges();
    
    const titleElement = fixture.debugElement.query(By.css('.modal-title'));
    expect(titleElement.nativeElement.textContent.trim()).toBe('Test Modal');
  });

  it('should render options correctly', () => {
    hostComponent.isOpen = true;
      fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('.modal-label'));
    expect(options.length).toBe(3);
    expect(options[0].nativeElement.textContent.trim()).toContain('Option 1');
    });

  it('should select an option when clicked', () => {
    hostComponent.isOpen = true;
      fixture.detectChanges();
    
    const options = fixture.debugElement.queryAll(By.css('.modal-label'));
    options[1].nativeElement.click();
      fixture.detectChanges();
    
    expect(modalComponent.currentValue()).toBe('2');
    });

  it('should confirm selection', () => {
    hostComponent.isOpen = true;
    hostComponent.selectedValue = '2';
      fixture.detectChanges();

    modalComponent.selectOption('2');
    modalComponent.onConfirmar();
    
    expect(hostComponent.onConfirm).toHaveBeenCalled();
    });

  it('should emit cancel event', () => {
    hostComponent.isOpen = true;
      fixture.detectChanges();
      
    modalComponent.onCancelar();
    
    expect(hostComponent.onCancel).toHaveBeenCalled();
    });

  it('should have LiveAnnouncer injected', () => {
    expect(modalComponent['liveAnnouncer']).toBeDefined();
    });

  it('should handle keyboard navigation with ArrowDown', fakeAsync(() => {
    hostComponent.isOpen = true;
      fixture.detectChanges();
    tick(100);

    modalComponent.focusedIndex.set(0);
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    
    modalComponent.onKeyDown(event, '1', 0);
      fixture.detectChanges();
      
    expect(modalComponent.focusedIndex()).toBe(1);
  }));

  it('should handle keyboard navigation with End key', fakeAsync(() => {
    hostComponent.isOpen = true;
      fixture.detectChanges();
    tick(100);

    const event = new KeyboardEvent('keydown', { key: 'End' });
    
    modalComponent.onKeyDown(event, '1', 0);
      fixture.detectChanges();
      
    expect(modalComponent.focusedIndex()).toBe(2);
  }));

  it('should announce selection changes', fakeAsync(() => {
    hostComponent.isOpen = true;
      fixture.detectChanges();
    tick(1000);
      
    modalComponent.selectOption('2');
      fixture.detectChanges();
    tick(100);
      
    expect(modalComponent.anuncioSelecao()).toContain('2 de 3');
    expect(modalComponent.anuncioSelecao()).toContain('Option 2');
    }));
  });
