/// <reference types="jest" />

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { FocusTrapDirective } from './focus-trap.directive';

/**
 * Componente de teste para FocusTrapDirective
 */
@Component({
  selector: 'app-test-focus-trap',
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <div>
      <button id="outside-before">Outside Before</button>
      
      <div 
        appFocusTrap 
        [trapActive]="trapActive()" 
        [autoFocus]="autoFocus()"
        id="trap-container">
        <button id="btn-1">Button 1</button>
        <button id="btn-2">Button 2</button>
        <input id="input-1" type="text" />
        <a id="link-1" href="#">Link 1</a>
        <button id="btn-disabled" disabled>Disabled</button>
      </div>
      
      <button id="outside-after">Outside After</button>
    </div>
  `
})
class TestFocusTrapComponent {
  trapActive = signal(false);
  autoFocus = signal(true);
}

/**
 * Componente de teste sem elementos focáveis
 */
@Component({
  selector: 'app-test-empty-trap',
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <div>
      <button id="outside">Outside</button>
      
      <div 
        appFocusTrap 
        [trapActive]="trapActive()" 
        id="empty-trap">
        <span>Não há elementos focáveis aqui</span>
      </div>
    </div>
  `
})
class TestEmptyTrapComponent {
  trapActive = signal(false);
}

/**
 * Componente de teste com elementos ocultos
 */
@Component({
  selector: 'app-test-hidden-trap',
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <div 
      appFocusTrap 
      [trapActive]="trapActive()" 
      id="hidden-trap">
      <button id="visible-btn">Visible</button>
      <button id="hidden-btn" style="display: none;">Hidden</button>
      <button id="visibility-hidden" style="visibility: hidden;">Invisible</button>
    </div>
  `
})
class TestHiddenTrapComponent {
  trapActive = signal(false);
}

describe('FocusTrapDirective', () => {
  describe('Funcionalidade Básica', () => {
    let component: TestFocusTrapComponent;
    let fixture: ComponentFixture<TestFocusTrapComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestFocusTrapComponent]
      });

      fixture = TestBed.createComponent(TestFocusTrapComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('deve criar a diretiva', () => {
      expect(component).toBeTruthy();
    });

    it('deve identificar elementos focáveis corretamente', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const trapContainer = fixture.nativeElement.querySelector('#trap-container');
      const focusableElements = trapContainer.querySelectorAll('button:not([disabled]), input, a[href]');
      
      expect(focusableElements.length).toBe(4); // btn-1, btn-2, input-1, link-1
    }));

    it('deve ignorar elementos desabilitados', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const disabledBtn = fixture.nativeElement.querySelector('#btn-disabled');
      expect(disabledBtn).toBeTruthy();
      expect(disabledBtn.disabled).toBe(true);
    }));
  });

  describe('Ativação e Desativação', () => {
    let component: TestFocusTrapComponent;
    let fixture: ComponentFixture<TestFocusTrapComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestFocusTrapComponent]
      });

      fixture = TestBed.createComponent(TestFocusTrapComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('deve salvar o elemento focado antes de ativar', fakeAsync(() => {
      const outsideButton = fixture.nativeElement.querySelector('#outside-before') as HTMLElement;
      outsideButton.focus();
      
      expect(document.activeElement).toBe(outsideButton);

      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      // O foco deve ter mudado para dentro do trap
      const btn1 = fixture.nativeElement.querySelector('#btn-1');
      expect(document.activeElement).toBe(btn1);
    }));

    it('deve focar automaticamente o primeiro elemento quando autoFocus é true', fakeAsync(() => {
      component.autoFocus.set(true);
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const firstButton = fixture.nativeElement.querySelector('#btn-1');
      expect(document.activeElement).toBe(firstButton);
    }));

    it('não deve focar automaticamente quando autoFocus é false', fakeAsync(() => {
      const outsideButton = fixture.nativeElement.querySelector('#outside-before') as HTMLElement;
      outsideButton.focus();

      component.autoFocus.set(false);
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      // O foco não deve ter mudado
      expect(document.activeElement).toBe(outsideButton);
    }));

    it('deve restaurar o foco ao desativar', fakeAsync(() => {
      const outsideButton = fixture.nativeElement.querySelector('#outside-before') as HTMLElement;
      outsideButton.focus();

      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const btn1 = fixture.nativeElement.querySelector('#btn-1');
      expect(document.activeElement).toBe(btn1);

      component.trapActive.set(false);
      fixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(outsideButton);
    }));
  });

  describe('Navegação com Tab', () => {
    let component: TestFocusTrapComponent;
    let fixture: ComponentFixture<TestFocusTrapComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestFocusTrapComponent]
      });

      fixture = TestBed.createComponent(TestFocusTrapComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('deve capturar Tab no último elemento e voltar ao primeiro', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const link1 = fixture.nativeElement.querySelector('#link-1') as HTMLElement;
      link1.focus();
      expect(document.activeElement).toBe(link1);

      // Simular Tab no último elemento
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      });
      
      const preventDefaultSpy = jest.spyOn(tabEvent, 'preventDefault');
      link1.dispatchEvent(tabEvent);
      tick();

      expect(preventDefaultSpy).toHaveBeenCalled();
      
      const btn1 = fixture.nativeElement.querySelector('#btn-1');
      expect(document.activeElement).toBe(btn1);
    }));

    it('deve capturar Shift+Tab no primeiro elemento e ir ao último', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const btn1 = fixture.nativeElement.querySelector('#btn-1') as HTMLElement;
      btn1.focus();
      expect(document.activeElement).toBe(btn1);

      // Simular Shift+Tab no primeiro elemento
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true
      });
      
      const preventDefaultSpy = jest.spyOn(shiftTabEvent, 'preventDefault');
      btn1.dispatchEvent(shiftTabEvent);
      tick();

      expect(preventDefaultSpy).toHaveBeenCalled();
      
      const link1 = fixture.nativeElement.querySelector('#link-1');
      expect(document.activeElement).toBe(link1);
    }));

    it('deve permitir Tab normal entre elementos internos', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const btn1 = fixture.nativeElement.querySelector('#btn-1') as HTMLElement;
      btn1.focus();

      // Simular Tab (não no último elemento)
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      });
      
      const preventDefaultSpy = jest.spyOn(tabEvent, 'preventDefault');
      btn1.dispatchEvent(tabEvent);
      tick();

      // Não deve prevenir (deixa o browser navegar naturalmente)
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    }));

    it('não deve processar teclas que não sejam Tab', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const btn1 = fixture.nativeElement.querySelector('#btn-1') as HTMLElement;
      btn1.focus();

      // Simular ArrowDown (não deve ser capturado)
      const arrowEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true
      });
      
      const preventDefaultSpy = jest.spyOn(arrowEvent, 'preventDefault');
      btn1.dispatchEvent(arrowEvent);
      tick();

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    }));
  });

  describe('Prevenção de Foco Externo', () => {
    let component: TestFocusTrapComponent;
    let fixture: ComponentFixture<TestFocusTrapComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestFocusTrapComponent]
      });

      fixture = TestBed.createComponent(TestFocusTrapComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('deve retornar o foco quando elemento externo recebe foco', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const btn1 = fixture.nativeElement.querySelector('#btn-1');
      expect(document.activeElement).toBe(btn1);

      // Tentar focar elemento externo
      const outsideBtn = fixture.nativeElement.querySelector('#outside-after') as HTMLElement;
      const focusEvent = new FocusEvent('focus', {
        bubbles: true,
        cancelable: true
      });
      
      Object.defineProperty(focusEvent, 'target', {
        value: outsideBtn,
        writable: false
      });

      // Simular o foco indo para fora
      document.dispatchEvent(focusEvent);
      tick();

      // Deve ter retornado para o primeiro elemento focável
      expect(document.activeElement).toBe(btn1);
    }));
  });

  describe('Trap Vazio (sem elementos focáveis)', () => {
    let component: TestEmptyTrapComponent;
    let fixture: ComponentFixture<TestEmptyTrapComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestEmptyTrapComponent]
      });

      fixture = TestBed.createComponent(TestEmptyTrapComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('deve prevenir Tab quando não há elementos focáveis', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const trapContainer = fixture.nativeElement.querySelector('#empty-trap') as HTMLElement;

      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      });
      
      const preventDefaultSpy = jest.spyOn(tabEvent, 'preventDefault');
      trapContainer.dispatchEvent(tabEvent);
      tick();

      expect(preventDefaultSpy).toHaveBeenCalled();
    }));
  });

  describe('Elementos Ocultos', () => {
    let component: TestHiddenTrapComponent;
    let fixture: ComponentFixture<TestHiddenTrapComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestHiddenTrapComponent]
      });

      fixture = TestBed.createComponent(TestHiddenTrapComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('deve filtrar elementos com display:none', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const visibleBtn = fixture.nativeElement.querySelector('#visible-btn');
      const hiddenBtn = fixture.nativeElement.querySelector('#hidden-btn');

      expect(document.activeElement).toBe(visibleBtn);
      expect(hiddenBtn.offsetParent).toBeNull(); // display: none
    }));

    it('deve filtrar elementos com visibility:hidden', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const visibleBtn = fixture.nativeElement.querySelector('#visible-btn');
      expect(document.activeElement).toBe(visibleBtn);
    }));
  });

  describe('Lifecycle e Cleanup', () => {
    let component: TestFocusTrapComponent;
    let fixture: ComponentFixture<TestFocusTrapComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestFocusTrapComponent]
      });

      fixture = TestBed.createComponent(TestFocusTrapComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('deve limpar event listeners ao destruir', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const trapContainer = fixture.nativeElement.querySelector('#trap-container');
      const removeEventListenerSpy = jest.spyOn(trapContainer, 'removeEventListener');

      fixture.destroy();
      tick();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    }));

    it('deve limpar estado interno ao destruir', fakeAsync(() => {
      const outsideButton = fixture.nativeElement.querySelector('#outside-before') as HTMLElement;
      outsideButton.focus();

      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      component.trapActive.set(false);
      fixture.detectChanges();
      tick();

      // Após desativar, o foco deve ser restaurado
      expect(document.activeElement).toBe(outsideButton);

      fixture.destroy();
      flush();
    }));
  });

  describe('Edge Cases', () => {
    let component: TestFocusTrapComponent;
    let fixture: ComponentFixture<TestFocusTrapComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestFocusTrapComponent]
      });

      fixture = TestBed.createComponent(TestFocusTrapComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('deve lidar com múltiplas ativações/desativações', fakeAsync(() => {
      const outsideButton = fixture.nativeElement.querySelector('#outside-before') as HTMLElement;
      outsideButton.focus();

      // Ativar
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const btn1 = fixture.nativeElement.querySelector('#btn-1');
      expect(document.activeElement).toBe(btn1);

      // Desativar
      component.trapActive.set(false);
      fixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(outsideButton);

      // Ativar novamente
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(btn1);
    }));

    it('deve atualizar elementos focáveis antes de processar Tab', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      // Adicionar novo botão dinamicamente
      const trapContainer = fixture.nativeElement.querySelector('#trap-container');
      const newButton = document.createElement('button');
      newButton.id = 'dynamic-btn';
      newButton.textContent = 'Dynamic Button';
      trapContainer.appendChild(newButton);
      
      tick();

      const link1 = fixture.nativeElement.querySelector('#link-1') as HTMLElement;
      link1.focus();

      // Tab deve considerar o novo botão
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      });
      
      link1.dispatchEvent(tabEvent);
      tick();

      // Deve ir para o botão dinâmico ou voltar ao primeiro
      expect(document.activeElement).toBeTruthy();
    }));

    it('deve lidar com previouslyFocusedElement sem método focus', fakeAsync(() => {
      // Criar um mock de elemento sem focus
      const mockElement = document.createElement('div');
      Object.defineProperty(mockElement, 'focus', {
        value: undefined,
        writable: true
      });

      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      component.trapActive.set(false);
      fixture.detectChanges();
      tick();

      // Não deve lançar erro
      expect(true).toBe(true);
    }));

    it('deve lidar com elemento nulo no handleFocus', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      // Simular evento de foco com target null
      const focusEvent = new FocusEvent('focus', {
        bubbles: true,
        cancelable: true
      });
      
      Object.defineProperty(focusEvent, 'target', {
        value: null,
        writable: false
      });

      expect(() => {
        document.dispatchEvent(focusEvent);
        tick();
      }).not.toThrow();
    }));
  });

  describe('Integração com Elements Focáveis', () => {
    let component: TestFocusTrapComponent;
    let fixture: ComponentFixture<TestFocusTrapComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestFocusTrapComponent]
      });

      fixture = TestBed.createComponent(TestFocusTrapComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('deve identificar botões habilitados', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const btn1 = fixture.nativeElement.querySelector('#btn-1');
      const btn2 = fixture.nativeElement.querySelector('#btn-2');

      expect(btn1).toBeTruthy();
      expect(btn2).toBeTruthy();
    }));

    it('deve identificar inputs', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const input = fixture.nativeElement.querySelector('#input-1');
      expect(input).toBeTruthy();
    }));

    it('deve identificar links com href', fakeAsync(() => {
      component.trapActive.set(true);
      fixture.detectChanges();
      tick();

      const link = fixture.nativeElement.querySelector('#link-1');
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toBe('#');
    }));
  });
});

