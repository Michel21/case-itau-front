import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { signal } from '@angular/core';
import { ToggleSegmentedComponent, ToggleOption } from './toggle-segmented.component';

describe('ToggleSegmentedComponent', () => {
  let component: ToggleSegmentedComponent<string>;
  let fixture: ComponentFixture<ToggleSegmentedComponent<string>>;
  let liveAnnouncer: jest.Mocked<LiveAnnouncer>;
  let compiled: HTMLElement;

  const mockOptions: ToggleOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true }
  ];

  beforeEach(async () => {
    const liveAnnouncerMock = {
      announce: jest.fn()
    } as unknown as jest.Mocked<LiveAnnouncer>;

    await TestBed.configureTestingModule({
      imports: [ToggleSegmentedComponent, FormsModule],
      providers: [
        { provide: LiveAnnouncer, useValue: liveAnnouncerMock }
      ]
    }).compileComponents();

    liveAnnouncer = TestBed.inject(LiveAnnouncer) as jest.Mocked<LiveAnnouncer>;
    fixture = TestBed.createComponent(ToggleSegmentedComponent);
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

    it('deve ter valor interno nulo inicialmente', () => {
      expect(component.internalValue()).toBeNull();
    });

    it('deve ter anúncio de a11y vazio inicialmente', () => {
      expect(component.anuncioA11y()).toBe('');
    });
  });

  // ============================================================================
  // TESTES DE INPUTS
  // ============================================================================

  describe('Inputs', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('ariaLabel', 'Test Label');
      fixture.detectChanges();
    });

    it('deve aceitar options via input', () => {
      expect(component.options()).toEqual(mockOptions);
    });

    it('deve aceitar ariaLabel via input', () => {
      expect(component.ariaLabel()).toBe('Test Label');
    });

    it('deve aceitar disabled via input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.disabled()).toBe(true);
    });

    it('deve aceitar styleConfig via input', () => {
      const config = { variant: 'filled' as const, size: 'lg' as const };
      fixture.componentRef.setInput('styleConfig', config);
      fixture.detectChanges();
      expect(component.styleConfig()).toEqual(config);
    });

    it('deve aceitar announceDelay via input', () => {
      fixture.componentRef.setInput('announceDelay', 800);
      fixture.detectChanges();
      expect(component.announceDelay()).toBe(800);
    });

    it('deve aceitar announceState via input', () => {
      fixture.componentRef.setInput('announceState', false);
      fixture.detectChanges();
      expect(component.announceState()).toBe(false);
    });
  });

  // ============================================================================
  // TESTES DE COMPUTEDS
  // ============================================================================

  describe('Computed Properties', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve computar styleConfig com defaults', () => {
      const computed = component.computedStyleConfig();
      expect(computed.variant).toBe('outline');
      expect(computed.size).toBe('md');
      expect(computed.color).toBe('primary');
      expect(computed.fullWidth).toBe(false);
    });

    it('deve mesclar styleConfig customizado com defaults', () => {
      fixture.componentRef.setInput('styleConfig', { variant: 'solid' as const });
      fixture.detectChanges();
      
      const computed = component.computedStyleConfig();
      expect(computed.variant).toBe('solid');
      expect(computed.size).toBe('md'); // default
    });

    it('deve computar hostClasses corretamente', () => {
      fixture.componentRef.setInput('styleConfig', {
        variant: 'filled' as const,
        size: 'lg' as const,
        color: 'success' as const,
        fullWidth: true
      });
      fixture.detectChanges();

      const classes = component.hostClasses();
      expect(classes['toggle-segmented--filled']).toBe(true);
      expect(classes['toggle-segmented--lg']).toBe(true);
      expect(classes['toggle-segmented--success']).toBe(true);
      expect(classes['toggle-segmented--full-width']).toBe(true);
    });
  });

  // ============================================================================
  // TESTES DE SELEÇÃO
  // ============================================================================

  describe('Seleção de Opções', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve verificar se opção está selecionada', () => {
      component.internalValue.set('option1');
      expect(component.isSelected(mockOptions[0])).toBe(true);
      expect(component.isSelected(mockOptions[1])).toBe(false);
    });

    it('deve selecionar uma opção', () => {
      component.selectOption(mockOptions[0]);
      expect(component.internalValue()).toBe('option1');
    });

    it('não deve selecionar opção se componente desabilitado', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      
      component.selectOption(mockOptions[0]);
      expect(component.internalValue()).toBeNull();
    });

    it('não deve selecionar opção se opção desabilitada', () => {
      component.selectOption(mockOptions[2]); // disabled: true
      expect(component.internalValue()).toBeNull();
    });

    it('deve emitir valueChange ao selecionar', (done) => {
      component.valueChange.subscribe((value) => {
        expect(value).toBe('option1');
        done();
      });

      component.selectOption(mockOptions[0]);
    });
  });

  // ============================================================================
  // TESTES DE TABINDEX
  // ============================================================================

  describe('TabIndex', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve retornar 0 para opção selecionada', () => {
      component.internalValue.set('option1');
      expect(component.getTabIndex(mockOptions[0])).toBe(0);
    });

    it('deve retornar -1 para opção não selecionada', () => {
      component.internalValue.set('option1');
      expect(component.getTabIndex(mockOptions[1])).toBe(-1);
    });

    it('deve retornar -1 se componente desabilitado', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      
      component.internalValue.set('option1');
      expect(component.getTabIndex(mockOptions[0])).toBe(-1);
    });

    it('deve retornar -1 se opção desabilitada', () => {
      expect(component.getTabIndex(mockOptions[2])).toBe(-1);
    });
  });

  // ============================================================================
  // TESTES DE NAVEGAÇÃO POR TECLADO
  // ============================================================================

  describe('Navegação por Teclado', () => {
    let event: KeyboardEvent;

    beforeEach(() => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('announceState', false); // Desabilitar anúncios nos testes
      fixture.detectChanges();
    });

    describe('Arrow Keys', () => {
      it('deve navegar para direita com ArrowRight', () => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        jest.spyOn(event, 'preventDefault');
        
        component.onKeyDown(event, mockOptions[0], 0);
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledWith('toggle-option-1');
      });

      it('deve navegar para esquerda com ArrowLeft', () => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        jest.spyOn(event, 'preventDefault');
        
        component.onKeyDown(event, mockOptions[1], 1);
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledWith('toggle-option-0');
      });

      it('deve fazer wrap around no final com ArrowRight', () => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        component.onKeyDown(event, mockOptions[1], 1);
        
        // Deve pular option2 (disabled) e voltar para option0
        expect(document.getElementById).toHaveBeenCalledWith('toggle-option-0');
      });

      it('deve fazer wrap around no início com ArrowLeft', () => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        component.onKeyDown(event, mockOptions[0], 0);
        
        // Deve ir para última opção não desabilitada
        expect(document.getElementById).toHaveBeenCalledWith('toggle-option-1');
      });

      it('deve pular opções desabilitadas ao navegar', () => {
        const options: ToggleOption[] = [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B', disabled: true },
          { value: 'c', label: 'C' }
        ];
        fixture.componentRef.setInput('options', options);
        fixture.detectChanges();

        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        component.onKeyDown(event, options[0], 0);
        
        // Deve pular B (disabled) e ir para C
        expect(document.getElementById).toHaveBeenCalledWith('toggle-option-2');
      });
    });

    describe('Space e Enter', () => {
      it('deve selecionar com Space', () => {
        event = new KeyboardEvent('keydown', { key: ' ' });
        jest.spyOn(event, 'preventDefault');
        jest.spyOn(component, 'selectOption');
        
        component.onKeyDown(event, mockOptions[0], 0);
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(component.selectOption).toHaveBeenCalledWith(mockOptions[0]);
      });

      it('deve selecionar com Enter', () => {
        event = new KeyboardEvent('keydown', { key: 'Enter' });
        jest.spyOn(event, 'preventDefault');
        jest.spyOn(component, 'selectOption');
        
        component.onKeyDown(event, mockOptions[0], 0);
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(component.selectOption).toHaveBeenCalledWith(mockOptions[0]);
      });
    });

    describe('Home e End', () => {
      it('deve ir para primeira opção com Home', () => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'Home' });
        jest.spyOn(event, 'preventDefault');
        
        component.onKeyDown(event, mockOptions[1], 1);
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledWith('toggle-option-0');
      });

      it('deve ir para última opção com End', () => {
        jest.spyOn(document, 'getElementById').mockReturnValue({
          focus: jest.fn()
        } as any);

        event = new KeyboardEvent('keydown', { key: 'End' });
        jest.spyOn(event, 'preventDefault');
        
        component.onKeyDown(event, mockOptions[0], 0);
        
        expect(event.preventDefault).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledWith('toggle-option-1');
      });
    });

    it('não deve processar teclas se desabilitado', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      jest.spyOn(event, 'preventDefault');
      
      component.onKeyDown(event, mockOptions[0], 0);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TESTES DE CONTROLVALUEACCESSOR
  // ============================================================================

  describe('ControlValueAccessor', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve escrever valor', () => {
      component.writeValue('option2');
      expect(component.internalValue()).toBe('option2');
    });

    it('deve escrever null', () => {
      component.writeValue('option1');
      component.writeValue(null);
      expect(component.internalValue()).toBeNull();
    });

    it('deve registrar callback onChange', () => {
      const onChangeFn = jest.fn();
      component.registerOnChange(onChangeFn);
      
      component.selectOption(mockOptions[0]);
      
      expect(onChangeFn).toHaveBeenCalledWith('option1');
    });

    it('deve registrar callback onTouched', () => {
      const onTouchedFn = jest.fn();
      component.registerOnTouched(onTouchedFn);
      
      component.selectOption(mockOptions[0]);
      
      expect(onTouchedFn).toHaveBeenCalled();
    });

    it('deve chamar onChange e onTouched ao selecionar', () => {
      const onChangeFn = jest.fn();
      const onTouchedFn = jest.fn();
      
      component.registerOnChange(onChangeFn);
      component.registerOnTouched(onTouchedFn);
      component.selectOption(mockOptions[1]);
      
      expect(onChangeFn).toHaveBeenCalledWith('option2');
      expect(onTouchedFn).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TESTES DE HELPERS
  // ============================================================================

  describe('Helper Methods', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve gerar ID único para opção', () => {
      const id = component.getOptionId(mockOptions[0], 0);
      expect(id).toBe('toggle-option-0');
    });

    it('deve obter classes CSS para opção', () => {
      component.internalValue.set('option1');
      
      const classes = component.getOptionClasses(mockOptions[0], 0);
      expect(classes['toggle-segmented__option']).toBe(true);
      expect(classes['toggle-segmented__option--selected']).toBe(true);
      expect(classes['toggle-segmented__option--first']).toBe(true);
      expect(classes['toggle-segmented__option--last']).toBe(false);
    });

    it('deve identificar última opção', () => {
      const classes = component.getOptionClasses(mockOptions[2], 2);
      expect(classes['toggle-segmented__option--last']).toBe(true);
    });

    it('deve identificar opção desabilitada', () => {
      const classes = component.getOptionClasses(mockOptions[2], 2);
      expect(classes['toggle-segmented__option--disabled']).toBe(true);
    });

    it('deve obter aria-label correto', () => {
      const label = component.getOptionAriaLabel(mockOptions[0]);
      expect(label).toBe('Option 1');
    });

    it('deve usar ariaLabel customizado se fornecido', () => {
      const optionWithCustomLabel: ToggleOption = {
        value: 'custom',
        label: 'Custom',
        ariaLabel: 'Custom Aria Label'
      };
      
      const label = component.getOptionAriaLabel(optionWithCustomLabel);
      expect(label).toBe('Custom Aria Label');
    });
  });

  // ============================================================================
  // TESTES DE ACESSIBILIDADE
  // ============================================================================

  describe('Acessibilidade', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('ariaLabel', 'Test Label');
      fixture.detectChanges();
    });

    it('deve ter role="radiogroup" no container', () => {
      const container = compiled.querySelector('[role="radiogroup"]');
      expect(container).toBeTruthy();
    });

    it('deve ter aria-label no radiogroup', () => {
      const container = compiled.querySelector('[role="radiogroup"]');
      expect(container?.getAttribute('aria-label')).toBe('Test Label');
    });

    it('deve ter inputs com role="radio" (implícito via type)', () => {
      const inputs = compiled.querySelectorAll('input[type="radio"]');
      expect(inputs.length).toBe(3);
    });

    it('deve ter aria-posinset e aria-setsize', () => {
      const firstInput = compiled.querySelector('input[type="radio"]');
      expect(firstInput?.getAttribute('aria-posinset')).toBe('1');
      expect(firstInput?.getAttribute('aria-setsize')).toBe('3');
    });

    it('deve renderizar região aria-live quando announceState é true', () => {
      fixture.componentRef.setInput('announceState', true);
      fixture.detectChanges();
      
      const liveRegion = compiled.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
    });

    it('não deve renderizar região aria-live quando announceState é false', () => {
      fixture.componentRef.setInput('announceState', false);
      fixture.detectChanges();
      
      const liveRegion = compiled.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeFalsy();
    });
  });

  // ============================================================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================================================

  describe('Renderização', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve renderizar todas as opções', () => {
      const labels = compiled.querySelectorAll('.toggle-segmented__option');
      expect(labels.length).toBe(3);
    });

    it('deve renderizar labels corretos', () => {
      const labels = compiled.querySelectorAll('.toggle-segmented__label-text');
      expect(labels[0].textContent?.trim()).toBe('Option 1');
      expect(labels[1].textContent?.trim()).toBe('Option 2');
      expect(labels[2].textContent?.trim()).toBe('Option 3');
    });

    it('deve aplicar classes de estilo', () => {
      fixture.componentRef.setInput('styleConfig', { variant: 'filled' as const });
      fixture.detectChanges();
      
      const container = compiled.querySelector('.toggle-segmented--filled');
      expect(container).toBeTruthy();
    });

    it('deve aplicar classe disabled no host quando desabilitado', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      
      const host = compiled;
      expect(host.classList.contains('toggle-segmented-host--disabled')).toBe(true);
    });
  });

  // ============================================================================
  // TESTES DE INTEGRAÇÃO
  // ============================================================================

  describe('Integração', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('deve atualizar UI quando valor muda programaticamente', () => {
      component.writeValue('option2');
      fixture.detectChanges();
      
      const selectedLabel = compiled.querySelector('.toggle-segmented__option--selected');
      expect(selectedLabel?.textContent).toContain('Option 2');
    });

    it('deve emitir eventos e atualizar estado ao clicar', (done) => {
      component.valueChange.subscribe((value) => {
        expect(value).toBe('option1');
        expect(component.internalValue()).toBe('option1');
        done();
      });

      const input = compiled.querySelector('input[type="radio"]') as HTMLInputElement;
      input.click();
    });
  });
});

