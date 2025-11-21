import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ModalSelectGenericComponent, ModalSelectOption } from './modal-select-generic.component';
import { FocusTrapDirective } from '../../directives/focus-trap.directive';

describe('ModalSelectGenericComponent', () => {
  let component: ModalSelectGenericComponent<string>;
  let fixture: ComponentFixture<ModalSelectGenericComponent<string>>;
  let liveAnnouncer: jest.Mocked<LiveAnnouncer>;
  let compiled: HTMLElement;

  const mockOptions: ModalSelectOption[] = [
    { value: 'jan', label: 'Janeiro' },
    { value: 'fev', label: 'Fevereiro' },
    { value: 'mar', label: 'Março' }
  ];

  beforeEach(async () => {
    const liveAnnouncerMock = {
      announce: jest.fn()
    } as unknown as jest.Mocked<LiveAnnouncer>;

    await TestBed.configureTestingModule({
      imports: [ModalSelectGenericComponent, FocusTrapDirective],
      providers: [
        { provide: LiveAnnouncer, useValue: liveAnnouncerMock }
      ]
    }).compileComponents();

    liveAnnouncer = TestBed.inject(LiveAnnouncer) as jest.Mocked<LiveAnnouncer>;
    fixture = TestBed.createComponent(ModalSelectGenericComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  // ============================================================================
  // TESTES BÁSICOS
  // ============================================================================

  describe('Inicialização', () => {
    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve ter currentValue nulo inicialmente', () => {
      expect(component.currentValue()).toBeNull();
    });

    it('canConfirm deve ser false inicialmente', () => {
      expect(component.canConfirm()).toBe(false);
    });

    it('currentOption deve ser null inicialmente', () => {
      expect(component.currentOption()).toBeNull();
    });
  });

  // ============================================================================
  // TESTES DE INPUTS
  // ============================================================================

  describe('Inputs', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', false);
      fixture.componentRef.setInput('titulo', 'Test Title');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve aceitar isOpen via input', () => {
      expect(component.isOpen()).toBe(false);
    });

    it('deve aceitar titulo via input', () => {
      expect(component.titulo()).toBe('Test Title');
    });

    it('deve aceitar options via input', () => {
      expect(component.options()).toEqual(mockOptions);
    });

    it('deve aceitar selectedValue via input', () => {
      fixture.componentRef.setInput('selectedValue', 'fev');
      fixture.detectChanges();
      expect(component.selectedValue()).toBe('fev');
    });

    it('deve aceitar ariaLabel via input', () => {
      fixture.componentRef.setInput('ariaLabel', 'Custom Label');
      fixture.detectChanges();
      expect(component.ariaLabel()).toBe('Custom Label');
    });

    it('deve aceitar cancelText via input', () => {
      fixture.componentRef.setInput('cancelText', 'Fechar');
      fixture.detectChanges();
      expect(component.cancelText()).toBe('Fechar');
    });

    it('deve aceitar confirmText via input', () => {
      fixture.componentRef.setInput('confirmText', 'OK');
      fixture.detectChanges();
      expect(component.confirmText()).toBe('OK');
    });

    it('deve aceitar config via input', () => {
      const config = { showCheckIcon: false, maxHeight: '500px' };
      fixture.componentRef.setInput('config', config);
      fixture.detectChanges();
      expect(component.config()).toEqual(config);
    });

    it('deve aceitar announceTitle via input', () => {
      fixture.componentRef.setInput('announceTitle', false);
      fixture.detectChanges();
      expect(component.announceTitle()).toBe(false);
    });

    it('deve aceitar announceNavigation via input', () => {
      fixture.componentRef.setInput('announceNavigation', false);
      fixture.detectChanges();
      expect(component.announceNavigation()).toBe(false);
    });
  });

  // ============================================================================
  // TESTES DE STATE
  // ============================================================================

  describe('State Management', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', false);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve sincronizar currentValue com selectedValue inicial', fakeAsync(() => {
      fixture.componentRef.setInput('selectedValue', 'mar');
      fixture.detectChanges();
      tick();
      
      expect(component.currentValue()).toBe('mar');
    }));

    it('deve atualizar canConfirm quando currentValue muda', () => {
      expect(component.canConfirm()).toBe(false);
      
      component.currentValue.set('jan');
      expect(component.canConfirm()).toBe(true);
    });

    it('deve computar currentOption corretamente', () => {
      component.currentValue.set('fev');
      
      const current = component.currentOption();
      expect(current).toEqual(mockOptions[1]);
    });

    it('currentOption deve ser null se valor não existe', () => {
      component.currentValue.set('invalid');
      
      const current = component.currentOption();
      expect(current).toBeNull();
    });
  });

  // ============================================================================
  // TESTES DE SELEÇÃO
  // ============================================================================

  describe('Seleção de Opções', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', false);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('announceNavigation', false);
      fixture.detectChanges();
    });

    it('deve verificar se valor está selecionado', () => {
      component.currentValue.set('jan');
      
      expect(component.isSelected('jan')).toBe(true);
      expect(component.isSelected('fev')).toBe(false);
    });

    it('deve selecionar uma opção', () => {
      component.selectOption('fev');
      expect(component.currentValue()).toBe('fev');
    });

    it('não deve anunciar se announceNavigation é false', () => {
      component.selectOption('jan');
      expect(liveAnnouncer.announce).not.toHaveBeenCalled();
    });

    it('deve anunciar seleção se announceNavigation é true', () => {
      fixture.componentRef.setInput('announceNavigation', true);
      fixture.detectChanges();
      
      component.selectOption('jan');
      expect(liveAnnouncer.announce).toHaveBeenCalledWith('Janeiro selecionado', 'polite');
    });
  });

  // ============================================================================
  // TESTES DE NAVEGAÇÃO POR TECLADO
  // ============================================================================

  describe('Navegação por Teclado', () => {
    let event: KeyboardEvent;

    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', false);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('announceNavigation', false);
      fixture.detectChanges();
    });

    describe('Arrow Keys', () => {
      it('deve navegar para baixo com ArrowDown', fakeAsync(() => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        jest.spyOn(event, 'preventDefault');
        
        component.onKeyDown(event, 'jan', 0);
        tick();
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledWith('option-fev');
      }));

      it('deve navegar para cima com ArrowUp', fakeAsync(() => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        jest.spyOn(event, 'preventDefault');
        
        component.onKeyDown(event, 'fev', 1);
        tick();
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledWith('option-jan');
      }));

      it('deve fazer wrap around no final', fakeAsync(() => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        component.onKeyDown(event, 'mar', 2);
        tick();
        
        expect(document.getElementById).toHaveBeenCalledWith('option-jan');
      }));

      it('deve fazer wrap around no início', fakeAsync(() => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        component.onKeyDown(event, 'jan', 0);
        tick();
        
        expect(document.getElementById).toHaveBeenCalledWith('option-mar');
      }));
    });

    describe('Home e End', () => {
      it('deve ir para primeira opção com Home', fakeAsync(() => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'Home' });
        jest.spyOn(event, 'preventDefault');
        
        component.onKeyDown(event, 'mar', 2);
        tick();
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledWith('option-jan');
      }));

      it('deve ir para última opção com End', fakeAsync(() => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'End' });
        jest.spyOn(event, 'preventDefault');
        
        component.onKeyDown(event, 'jan', 0);
        tick();
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledWith('option-mar');
      }));
    });

    describe('Space e Enter', () => {
      it('deve selecionar com Space', () => {
        event = new KeyboardEvent('keydown', { key: ' ' });
        jest.spyOn(event, 'preventDefault');
        jest.spyOn(component, 'selectOption');
        
        component.onKeyDown(event, 'fev', 1);
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(component.selectOption).toHaveBeenCalledWith('fev');
      });

      it('deve selecionar com Enter', () => {
        event = new KeyboardEvent('keydown', { key: 'Enter' });
        jest.spyOn(event, 'preventDefault');
        jest.spyOn(component, 'selectOption');
        
        component.onKeyDown(event, 'fev', 1);
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(component.selectOption).toHaveBeenCalledWith('fev');
      });
    });

    it('não deve processar se announceNavigation é false', () => {
      event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      jest.spyOn(event, 'preventDefault');
      
      component.onKeyDown(event, 'jan', 0);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TESTES DE AÇÕES
  // ============================================================================

  describe('Ações do Modal', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', false);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve emitir confirmar com opção selecionada', (done) => {
      component.currentValue.set('fev');
      
      component.confirmar.subscribe((option) => {
        expect(option).toEqual(mockOptions[1]);
        done();
      });
      
      component.onConfirmar();
    });

    it('não deve emitir confirmar se nenhuma opção selecionada', () => {
      jest.spyOn(component.confirmar, 'emit');
      
      component.onConfirmar();
      
      expect(component.confirmar.emit).not.toHaveBeenCalled();
    });

    it('deve emitir cancelar', (done) => {
      component.cancelar.subscribe(() => {
        expect(true).toBe(true);
        done();
      });
      
      component.onCancelar();
    });

    it('deve cancelar ao pressionar Escape', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      
      jest.spyOn(component, 'onCancelar');
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onEscapeKey(event);
      
      expect(component.onCancelar).toHaveBeenCalled();
    });

    it('não deve cancelar com Escape se modal fechada', () => {
      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      
      jest.spyOn(component, 'onCancelar');
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onEscapeKey(event);
      
      expect(component.onCancelar).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TESTES DE EVENTOS DE CLIQUE
  // ============================================================================

  describe('Eventos de Clique', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve cancelar ao clicar no backdrop', () => {
      jest.spyOn(component, 'onCancelar');
      
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: event.currentTarget, writable: false });
      Object.defineProperty(event, 'currentTarget', { value: {}, writable: false });
      
      component.onBackdropClick(event);
      
      expect(component.onCancelar).toHaveBeenCalled();
    });

    it('não deve cancelar ao clicar no conteúdo do modal', () => {
      jest.spyOn(component, 'onCancelar');
      
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: {}, writable: false });
      Object.defineProperty(event, 'currentTarget', { value: {}, writable: false });
      
      component.onBackdropClick(event);
      
      expect(component.onCancelar).not.toHaveBeenCalled();
    });

    it('deve parar propagação ao clicar no modal', () => {
      const event = new MouseEvent('click');
      jest.spyOn(event, 'stopPropagation');
      
      component.onModalClick(event);
      
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TESTES DE HELPER METHODS
  // ============================================================================

  describe('Helper Methods', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', false);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve gerar ID único para opção', () => {
      const id = component.getOptionId('jan');
      expect(id).toBe('jan');
    });

    it('deve gerar ID com conversão para string', () => {
      const id = component.getOptionId(123 as any);
      expect(id).toBe('123');
    });
  });

  // ============================================================================
  // TESTES DE ACESSIBILIDADE
  // ============================================================================

  describe('Acessibilidade', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Select Month');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('ariaLabel', 'Month List');
      fixture.detectChanges();
    });

    it('deve ter role="dialog" no modal', () => {
      const dialog = compiled.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });

    it('deve ter aria-modal="true"', () => {
      const dialog = compiled.querySelector('[aria-modal="true"]');
      expect(dialog).toBeTruthy();
    });

    it('deve ter aria-labelledby apontando para o título', () => {
      const dialog = compiled.querySelector('[role="dialog"]');
      expect(dialog?.getAttribute('aria-labelledby')).toBe('modal-title');
    });

    it('deve ter título com id correto', () => {
      const title = compiled.querySelector('#modal-title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toContain('Select Month');
    });

    it('título deve ter role="heading"', () => {
      const title = compiled.querySelector('#modal-title');
      expect(title?.getAttribute('role')).toBe('heading');
    });

    it('título deve ter aria-level="1"', () => {
      const title = compiled.querySelector('#modal-title');
      expect(title?.getAttribute('aria-level')).toBe('1');
    });

    it('título deve ter tabindex="-1"', () => {
      const title = compiled.querySelector('#modal-title');
      expect(title?.getAttribute('tabindex')).toBe('-1');
    });

    it('lista deve ter role="radiogroup"', () => {
      const list = compiled.querySelector('[role="radiogroup"]');
      expect(list).toBeTruthy();
    });

    it('lista deve ter aria-label correto', () => {
      const list = compiled.querySelector('[role="radiogroup"]');
      expect(list?.getAttribute('aria-label')).toBe('Month List');
    });

    it('botões devem ter role="radio"', () => {
      const buttons = compiled.querySelectorAll('[role="radio"]');
      expect(buttons.length).toBe(3);
    });

    it('botões devem ter aria-checked', () => {
      component.currentValue.set('fev');
      fixture.detectChanges();
      
      const buttons = compiled.querySelectorAll('[role="radio"]');
      expect(buttons[1].getAttribute('aria-checked')).toBe('true');
      expect(buttons[0].getAttribute('aria-checked')).toBe('false');
    });

    it('botões devem ter aria-posinset e aria-setsize', () => {
      const firstButton = compiled.querySelector('[role="radio"]');
      expect(firstButton?.getAttribute('aria-posinset')).toBe('1');
      expect(firstButton?.getAttribute('aria-setsize')).toBe('3');
    });

    it('deve ter FocusTrap ativo quando aberto', () => {
      const modal = compiled.querySelector('[appFocusTrap]');
      expect(modal).toBeTruthy();
    });
  });

  // ============================================================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================================================

  describe('Renderização', () => {
    it('não deve renderizar quando isOpen é false', () => {
      fixture.componentRef.setInput('isOpen', false);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
      
      const backdrop = compiled.querySelector('.modal-backdrop');
      expect(backdrop).toBeFalsy();
    });

    it('deve renderizar quando isOpen é true', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
      
      const backdrop = compiled.querySelector('.modal-backdrop');
      expect(backdrop).toBeTruthy();
    });

    it('deve renderizar todas as opções', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
      
      const items = compiled.querySelectorAll('.modal-item');
      expect(items.length).toBe(3);
    });

    it('deve renderizar labels corretos', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
      
      const texts = compiled.querySelectorAll('.modal-text');
      expect(texts[0].textContent).toBe('Janeiro');
      expect(texts[1].textContent).toBe('Fevereiro');
      expect(texts[2].textContent).toBe('Março');
    });

    it('deve renderizar ícone de check quando showCheckIcon é true', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('config', { showCheckIcon: true });
      fixture.detectChanges();
      
      const checks = compiled.querySelectorAll('.modal-check');
      expect(checks.length).toBe(3);
    });

    it('não deve renderizar ícone de check quando showCheckIcon é false', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('config', { showCheckIcon: false });
      fixture.detectChanges();
      
      const checks = compiled.querySelectorAll('.modal-check');
      expect(checks.length).toBe(0);
    });

    it('deve renderizar botões com textos corretos', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('cancelText', 'Fechar');
      fixture.componentRef.setInput('confirmText', 'OK');
      fixture.detectChanges();
      
      const cancelBtn = compiled.querySelector('.modal-btn--cancel');
      const confirmBtn = compiled.querySelector('.modal-btn--confirm');
      
      expect(cancelBtn?.textContent?.trim()).toBe('Fechar');
      expect(confirmBtn?.textContent?.trim()).toBe('OK');
    });

    it('botão confirmar deve estar desabilitado quando nada selecionado', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
      
      const confirmBtn = compiled.querySelector('.modal-btn--confirm') as HTMLButtonElement;
      expect(confirmBtn.disabled).toBe(true);
    });

    it('botão confirmar deve estar habilitado quando algo selecionado', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
      
      component.currentValue.set('jan');
      fixture.detectChanges();
      
      const confirmBtn = compiled.querySelector('.modal-btn--confirm') as HTMLButtonElement;
      expect(confirmBtn.disabled).toBe(false);
    });

    it('deve aplicar classe selected na opção selecionada', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
      
      component.currentValue.set('fev');
      fixture.detectChanges();
      
      const selected = compiled.querySelectorAll('.modal-label--selected');
      expect(selected.length).toBe(1);
      expect(selected[0].textContent).toContain('Fevereiro');
    });
  });

  // ============================================================================
  // TESTES DE INTEGRAÇÃO
  // ============================================================================

  describe('Integração', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('titulo', 'Test');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve atualizar UI ao selecionar opção via click', () => {
      const button = compiled.querySelectorAll('[role="radio"]')[1] as HTMLElement;
      button.click();
      fixture.detectChanges();
      
      expect(component.currentValue()).toBe('fev');
      expect(component.canConfirm()).toBe(true);
    });

    it('deve confirmar e emitir evento', (done) => {
      component.currentValue.set('mar');
      
      component.confirmar.subscribe((option) => {
        expect(option.value).toBe('mar');
        expect(option.label).toBe('Março');
        done();
      });
      
      const confirmBtn = compiled.querySelector('.modal-btn--confirm') as HTMLElement;
      confirmBtn.click();
    });

    it('deve cancelar e emitir evento', (done) => {
      component.cancelar.subscribe(() => {
        expect(true).toBe(true);
        done();
      });
      
      const cancelBtn = compiled.querySelector('.modal-btn--cancel') as HTMLElement;
      cancelBtn.click();
    });
  });

  // ============================================================================
  // TESTES DE NARRAÇÃO
  // ============================================================================

  describe('Narração com LiveAnnouncer', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('titulo', 'Select Month');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('announceTitle', true);
      fixture.detectChanges();
    });

    it('deve anunciar título ao abrir modal', fakeAsync(() => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      tick(600); // Aguardar delays (150ms + 400ms)
      
      expect(liveAnnouncer.announce).toHaveBeenCalledWith('Select Month', 'assertive');
    }));

    it('não deve anunciar título se announceTitle é false', fakeAsync(() => {
      fixture.componentRef.setInput('announceTitle', false);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      tick(600);
      
      expect(liveAnnouncer.announce).not.toHaveBeenCalled();
    }));

    it('não deve anunciar título se modal já está aberta', fakeAsync(() => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      tick(600);
      
      liveAnnouncer.announce.calls.reset();
      fixture.detectChanges();
      tick(600);
      
      expect(liveAnnouncer.announce).not.toHaveBeenCalled();
    }));
  });
});

