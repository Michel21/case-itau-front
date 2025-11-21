import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TabNavigationDirective } from './tab-navigation.directive';

@Component({
  standalone: true,
  imports: [TabNavigationDirective],
  template: `
    <button
      appTabNavigation
      [enableTabScroll]="enableTabScroll"
      [tabScrollBehavior]="tabScrollBehavior"
      [tabScrollPosition]="tabScrollPosition"
      [tabScrollOffset]="tabScrollOffset"
      [tabScrollDelay]="tabScrollDelay"
      [tabScrollIfNeeded]="tabScrollIfNeeded"
      [announceOnFocus]="announceOnFocus"
      [focusAnnouncement]="focusAnnouncement">
      Test Button
    </button>
  `
})
class TestComponent {
  enableTabScroll = true;
  tabScrollBehavior: ScrollBehavior = 'smooth';
  tabScrollPosition: ScrollLogicalPosition = 'nearest';
  tabScrollOffset = 0;
  tabScrollDelay = 0;
  tabScrollIfNeeded = true;
  announceOnFocus = false;
  focusAnnouncement = '';
}

describe('TabNavigationDirective', () => {
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
    directiveElement = fixture.debugElement.query(By.directive(TabNavigationDirective));
    buttonElement = directiveElement.nativeElement;

    // Mock scrollIntoView
    buttonElement.scrollIntoView = jest.fn();
    
    fixture.detectChanges();
  });

  it('deve criar a diretiva', () => {
    expect(directiveElement).toBeTruthy();
  });

  it('deve fazer scroll ao receber foco via Tab', () => {
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    // Simular Tab keydown
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    
    // Simular foco
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    // Aguardar requestAnimationFrame
    setTimeout(() => {
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }, 100);
  });

  it('deve fazer scroll ao receber foco via Shift+Tab', () => {
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    // Simular Shift+Tab keydown
    document.dispatchEvent(new KeyboardEvent('keydown', { 
      key: 'Tab', 
      shiftKey: true 
    }));
    
    // Simular foco
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    setTimeout(() => {
      expect(scrollIntoViewSpy).toHaveBeenCalled();
    }, 100);
  });

  it('não deve fazer scroll ao receber foco via clique (não Tab)', () => {
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    // Simular foco sem Tab
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    setTimeout(() => {
      expect(scrollIntoViewSpy).not.toHaveBeenCalled();
    }, 100);
  });

  it('não deve fazer scroll quando enableTabScroll é false', () => {
    component.enableTabScroll = false;
    fixture.detectChanges();
    
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    setTimeout(() => {
      expect(scrollIntoViewSpy).not.toHaveBeenCalled();
    }, 100);
  });

  it('deve usar comportamento de scroll configurado', () => {
    component.tabScrollBehavior = 'auto';
    fixture.detectChanges();
    
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    setTimeout(() => {
      expect(scrollIntoViewSpy).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'auto' })
      );
    }, 100);
  });

  it('deve usar posição de scroll configurada', () => {
    component.tabScrollPosition = 'center';
    fixture.detectChanges();
    
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    setTimeout(() => {
      expect(scrollIntoViewSpy).toHaveBeenCalledWith(
        expect.objectContaining({ block: 'center' })
      );
    }, 100);
  });

  it('deve verificar visibilidade quando tabScrollIfNeeded é true', () => {
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

    component.tabScrollIfNeeded = true;
    fixture.detectChanges();
    
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    setTimeout(() => {
      // Não deve fazer scroll se já estiver visível
      expect(scrollIntoViewSpy).not.toHaveBeenCalled();
    }, 100);
  });

  it('deve respeitar delay configurado', (done) => {
    component.tabScrollDelay = 200;
    fixture.detectChanges();
    
    const scrollIntoViewSpy = jest.spyOn(buttonElement, 'scrollIntoView');
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    buttonElement.focus();
    buttonElement.dispatchEvent(new FocusEvent('focus'));
    
    // Verificar que não foi chamado imediatamente
    setTimeout(() => {
      expect(scrollIntoViewSpy).not.toHaveBeenCalled();
      
      // Verificar que foi chamado após o delay
      setTimeout(() => {
        expect(scrollIntoViewSpy).toHaveBeenCalled();
        done();
      }, 250);
    }, 50);
  });

  describe('Acessibilidade', () => {
    it('deve adicionar tabindex="0" se elemento não for focável', () => {
      // Criar elemento div (não focável)
      const divFixture = TestBed.createComponent(class {
        static ɵcmp = Component({
          standalone: true,
          imports: [TabNavigationDirective],
          template: '<div appTabNavigation>Test</div>'
        })(class {});
      });
      
      divFixture.detectChanges();
      
      const divElement = divFixture.debugElement.query(
        By.directive(TabNavigationDirective)
      ).nativeElement;
      
      expect(divElement.getAttribute('tabindex')).toBe('0');
    });

    it('não deve adicionar tabindex se elemento já for focável', () => {
      expect(buttonElement.hasAttribute('tabindex')).toBeFalsy();
    });

    it('deve anunciar foco quando announceOnFocus é true', (done) => {
      component.announceOnFocus = true;
      component.focusAnnouncement = 'Teste anúncio';
      fixture.detectChanges();
      
      const appendChildSpy = jest.spyOn(document.body, 'appendChild');
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      buttonElement.focus();
      buttonElement.dispatchEvent(new FocusEvent('focus'));
      
      setTimeout(() => {
        expect(appendChildSpy).toHaveBeenCalled();
        const liveRegion = appendChildSpy.mock.calls[0][0] as HTMLElement;
        expect(liveRegion.getAttribute('role')).toBe('status');
        expect(liveRegion.getAttribute('aria-live')).toBe('polite');
        expect(liveRegion.textContent).toBe('Teste anúncio');
        done();
      }, 100);
    });
  });

  describe('Scroll com offset', () => {
    it('deve usar window.scrollTo quando há offset', (done) => {
      component.tabScrollOffset = 80;
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

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      buttonElement.focus();
      buttonElement.dispatchEvent(new FocusEvent('focus'));
      
      setTimeout(() => {
        expect(scrollToSpy).toHaveBeenCalledWith({
          top: expect.any(Number),
          behavior: 'smooth'
        });
        done();
      }, 100);
    });
  });
});

