import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageNavigationDirective } from './page-navigation.directive';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <div appPageNavigation [pageSize]="3" class="container">
      <button id="btn-0">Item 0</button>
      <button id="btn-1">Item 1</button>
      <button id="btn-2">Item 2</button>
      <button id="btn-3">Item 3</button>
      <button id="btn-4">Item 4</button>
      <button id="btn-5">Item 5</button>
    </div>
  `,
  standalone: true,
  imports: [PageNavigationDirective]
})
class TestComponent {}

describe('PageNavigationDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let container: HTMLElement;
  let buttons: HTMLButtonElement[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent, PageNavigationDirective]
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    container = fixture.debugElement.query(By.css('.container')).nativeElement;
    buttons = Array.from(container.querySelectorAll('button'));
  });

  it('deve criar a diretiva', () => {
    const directive = fixture.debugElement.query(By.directive(PageNavigationDirective));
    expect(directive).toBeTruthy();
  });

  it('deve navegar para frente com PageDown (pula pageSize)', () => {
    // Foca no item 0
    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);

    // Simula PageDown (pageSize = 3)
    // 0 -> 3
    const event = new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    
    container.dispatchEvent(event);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(buttons[3]);
  });

  it('deve navegar para trás com PageUp (recua pageSize)', () => {
    // Foca no item 5
    buttons[5].focus();
    expect(document.activeElement).toBe(buttons[5]);

    // Simula PageUp (pageSize = 3)
    // 5 -> 2
    const event = new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true, cancelable: true });
    
    container.dispatchEvent(event);
    
    expect(document.activeElement).toBe(buttons[2]);
  });

  it('não deve ultrapassar o último item com PageDown', () => {
    // Foca no item 4
    buttons[4].focus();

    // PageDown (pageSize = 3) -> 4 + 3 = 7 (max 5)
    const event = new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true });
    container.dispatchEvent(event);

    expect(document.activeElement).toBe(buttons[5]);
  });

  it('não deve ultrapassar o primeiro item com PageUp', () => {
    // Foca no item 1
    buttons[1].focus();

    // PageUp (pageSize = 3) -> 1 - 3 = -2 (min 0)
    const event = new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true, cancelable: true });
    container.dispatchEvent(event);

    expect(document.activeElement).toBe(buttons[0]);
  });

  it('deve ignorar outras teclas', () => {
    buttons[0].focus();
    
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    
    container.dispatchEvent(event);
    
    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(buttons[0]);
  });
});

