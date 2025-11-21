import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ScrollIntoViewDirective } from './scroll-into-view.directive';

@Component({
  standalone: true,
  imports: [ScrollIntoViewDirective],
  template: `
    <button
      appScrollIntoView
      [scrollBehavior]="scrollBehavior"
      [scrollBlock]="scrollBlock"
      [scrollOnFocus]="scrollOnFocus"
      [scrollIfNeeded]="scrollIfNeeded"
      [scrollOffset]="scrollOffset">
      Test Button
    </button>
  `
})
class TestComponent {
  scrollBehavior: ScrollBehavior = 'smooth';
  scrollBlock: ScrollLogicalPosition = 'nearest';
  scrollOnFocus = true;
  scrollIfNeeded = true;
  scrollOffset = 0;
}

describe('ScrollIntoViewDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let buttonElement: HTMLElement;
  let directiveElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent]
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    directiveElement = fixture.debugElement.query(By.directive(ScrollIntoViewDirective));
    buttonElement = directiveElement.nativeElement;

    // Mock scrollIntoView
    buttonElement.scrollIntoView = jest.fn();
    
    fixture.detectChanges();
  });

  it('deve criar a diretiva', () => {
    expect(directiveElement).toBeTruthy();
  });

  it('deve adicionar listener de foco quando scrollOnFocus é true', () => {
    const addEventListenerSpy = jest.spyOn(buttonElement, 'addEventListener');
    
    fixture.detectChanges();
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
  });

  it('deve fazer scroll ao receber foco', () => {
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  });

  it('deve usar comportamento de scroll configurado', () => {
    component.scrollBehavior = 'auto';
    fixture.detectChanges();
    
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    expect(scrollIntoViewSpy).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'auto' })
    );
  });

  it('deve usar posição de scroll configurada', () => {
    component.scrollBlock = 'center';
    fixture.detectChanges();
    
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    expect(scrollIntoViewSpy).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'center' })
    );
  });

  it('não deve fazer scroll quando scrollOnFocus é false', () => {
    component.scrollOnFocus = false;
    fixture.detectChanges();
    
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
  });

  it('deve verificar visibilidade quando scrollIfNeeded é true', () => {
    // Mock getBoundingClientRect para simular elemento visível
    jest.spyOn(buttonElement, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 0,
      bottom: 200,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 100,
      toJSON: () => ({})
    });

    Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });

    component.scrollIfNeeded = true;
    fixture.detectChanges();
    
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    // Não deve fazer scroll se já estiver visível
    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
  });

  it('deve fazer scroll quando elemento não está visível e scrollIfNeeded é true', () => {
    // Mock getBoundingClientRect para simular elemento NÃO visível
    jest.spyOn(buttonElement, 'getBoundingClientRect').mockReturnValue({
      top: -100, // Fora da tela (acima)
      left: 0,
      bottom: -50,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: -100,
      toJSON: () => ({})
    });

    Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });

    component.scrollIfNeeded = true;
    fixture.detectChanges();
    
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    // Deve fazer scroll se não estiver visível
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });

  it('deve remover listener ao destruir componente', () => {
    const removeEventListenerSpy = jest.spyOn(buttonElement, 'removeEventListener');
    
    fixture.destroy();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
  });

  describe('Scroll com offset', () => {
    it('deve usar window.scrollTo quando há offset', () => {
      component.scrollOffset = 80;
      fixture.detectChanges();

      const scrollToSpy = jest.spyOn(window, 'scrollTo');
      
      // Mock getBoundingClientRect e window.scrollY
      jest.spyOn(buttonElement, 'getBoundingClientRect').mockReturnValue({
        top: 500,
        left: 0,
        bottom: 600,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 500,
        toJSON: () => ({})
      });

      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

      buttonElement.focus();
      buttonElement.dispatchEvent(new FocusEvent('focus'));
      
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth'
      });
    });
  });
});

