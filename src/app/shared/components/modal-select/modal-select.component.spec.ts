import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalSelectComponent, SelectOption } from './modal-select.component';

describe('ModalSelectComponent', () => {
  let component: ModalSelectComponent;
  let fixture: ComponentFixture<ModalSelectComponent>;

  const opcoesMock: SelectOption[] = [
    { valor: '1', nome: 'Janeiro' },
    { valor: '2', nome: 'Fevereiro' },
    { valor: '3', nome: 'Março' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSelectComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalSelectComponent);
    component = fixture.componentInstance;
    
    // Configurar inputs padrão
    component.id = 'teste-select';
    component.label = 'Teste';
    component.placeholder = 'Selecione uma opção';
    component.optionsSelect = opcoesMock;
    component.helperText = 'Texto de ajuda';
    
    fixture.detectChanges();
  });

  describe('Inicialização', () => {
    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve inicializar com valores padrão', () => {
      expect(component.value).toBe('');
      expect(component.disabled).toBe(false);
      expect(component.invalid).toBe(false);
    });

    it('deve renderizar o label corretamente', () => {
      const elementoLabel = fixture.nativeElement.querySelector('.modal-select-label');
      expect(elementoLabel.textContent.trim()).toBe('Teste');
    });

    it('deve renderizar o placeholder corretamente', () => {
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      const primeiraOpcao = elementoSelect.querySelector('option');
      expect(primeiraOpcao.textContent.trim()).toBe('Selecione uma opção');
    });

    it('deve renderizar as opções corretamente', () => {
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      const opcoes = elementoSelect.querySelectorAll('option');
      
      expect(opcoes.length).toBe(4); // 1 placeholder + 3 opções
      expect(opcoes[1].value).toBe('1');
      expect(opcoes[1].textContent.trim()).toBe('Janeiro');
      expect(opcoes[2].value).toBe('2');
      expect(opcoes[2].textContent.trim()).toBe('Fevereiro');
    });

    it('deve renderizar o texto de ajuda', () => {
      const elementoHelper = fixture.nativeElement.querySelector('.modal-select-helper');
      expect(elementoHelper.textContent.trim()).toBe('Texto de ajuda');
    });
  });

  describe('ControlValueAccessor - writeValue', () => {
    it('deve definir o valor do select', () => {
      component.writeValue('2');
      expect(component.value).toBe('2');
    });

    it('deve definir valor vazio quando receber null', () => {
      component.writeValue(null as any);
      expect(component.value).toBe('');
    });

    it('deve definir valor vazio quando receber undefined', () => {
      component.writeValue(undefined as any);
      expect(component.value).toBe('');
    });
  });

  describe('ControlValueAccessor - registerOnChange', () => {
    it('deve registrar função de callback para mudanças', () => {
      const callbackMock = jest.fn();
      component.registerOnChange(callbackMock);
      
      component.onSelectChange({ target: { value: '3' } } as any);
      
      expect(callbackMock).toHaveBeenCalledWith('3');
    });

    it('deve atualizar o valor interno quando mudança ocorre', () => {
      const callbackMock = jest.fn();
      component.registerOnChange(callbackMock);
      
      component.onSelectChange({ target: { value: '1' } } as any);
      
      expect(component.value).toBe('1');
    });
  });

  describe('ControlValueAccessor - registerOnTouched', () => {
    it('deve registrar função de callback para touched', () => {
      const callbackMock = jest.fn();
      component.registerOnTouched(callbackMock);
      
      component.onTouched();
      
      expect(callbackMock).toHaveBeenCalled();
    });
  });

  describe('ControlValueAccessor - setDisabledState', () => {
    it('deve definir estado desabilitado como true', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
    });

    it('deve definir estado desabilitado como false', () => {
      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
    });
  });

  describe('Integração com FormControl', () => {
    it('deve funcionar com FormControl', () => {
      const controleFormulario = new FormControl('2');
      
      // Simular integração com FormControl
      component.writeValue(controleFormulario.value || '');
      expect(component.value).toBe('2');
      
      // Simular mudança no componente
      const callbackMock = jest.fn();
      component.registerOnChange(callbackMock);
      component.onSelectChange({ target: { value: '3' } } as any);
      
      expect(callbackMock).toHaveBeenCalledWith('3');
    });

    it('deve refletir mudanças do FormControl', () => {
      const controleFormulario = new FormControl('1');
      
      // Simular mudança no FormControl
      controleFormulario.setValue('2');
      component.writeValue(controleFormulario.value || '');
      
      expect(component.value).toBe('2');
    });
  });

  describe('Estados visuais', () => {
    it('deve aplicar classe de inválido quando invalid é true', () => {
      component.invalid = true;
      fixture.detectChanges();
      
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      expect(elementoSelect.classList.contains('modal-select-invalid')).toBe(true);
    });

    it('deve aplicar atributo disabled quando disabled é true', () => {
      component.disabled = true;
      fixture.detectChanges();
      
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      expect(elementoSelect.disabled).toBe(true);
    });

    it('deve aplicar id correto no select', () => {
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      expect(elementoSelect.id).toBe('teste-select');
    });

    it('deve aplicar for correto no label', () => {
      const elementoLabel = fixture.nativeElement.querySelector('.modal-select-label');
      expect(elementoLabel.getAttribute('for')).toBe('teste-select');
    });
  });

  describe('Eventos', () => {
    it('deve chamar onTouched quando select perde foco', () => {
      const callbackMock = jest.fn();
      component.registerOnTouched(callbackMock);
      
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      elementoSelect.dispatchEvent(new Event('blur'));
      
      expect(callbackMock).toHaveBeenCalled();
    });

    it('deve chamar onChange quando valor muda', () => {
      const callbackMock = jest.fn();
      component.registerOnChange(callbackMock);
      
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      elementoSelect.value = '2';
      elementoSelect.dispatchEvent(new Event('change'));
      
      expect(callbackMock).toHaveBeenCalledWith('2');
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com opções vazias', () => {
      component.optionsSelect = [];
      fixture.detectChanges();
      
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      const opcoes = elementoSelect.querySelectorAll('option');
      
      expect(opcoes.length).toBe(1); // Apenas o placeholder
    });

    it('deve lidar com opções undefined', () => {
      component.optionsSelect = undefined as any;
      fixture.detectChanges();
      
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      const opcoes = elementoSelect.querySelectorAll('option');
      
      expect(opcoes.length).toBe(1); // Apenas o placeholder
    });

    it('deve lidar com label vazio', () => {
      component.label = '';
      fixture.detectChanges();
      
      const elementoLabel = fixture.nativeElement.querySelector('.modal-select-label');
      expect(elementoLabel.textContent.trim()).toBe('');
    });

    it('deve lidar com placeholder vazio', () => {
      component.placeholder = '';
      fixture.detectChanges();
      
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      const primeiraOpcao = elementoSelect.querySelector('option');
      expect(primeiraOpcao.textContent.trim()).toBe('');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter associação correta entre label e select', () => {
      const elementoLabel = fixture.nativeElement.querySelector('.modal-select-label');
      const elementoSelect = fixture.nativeElement.querySelector('.modal-select');
      
      expect(elementoLabel.getAttribute('for')).toBe(elementoSelect.getAttribute('id'));
    });

    it('deve ter estrutura HTML semântica correta', () => {
      const container = fixture.nativeElement.querySelector('.modal-select-container');
      const label = fixture.nativeElement.querySelector('.modal-select-label');
      const wrapper = fixture.nativeElement.querySelector('.modal-select-wrapper');
      const select = fixture.nativeElement.querySelector('.modal-select');
      
      expect(container).toBeTruthy();
      expect(label).toBeTruthy();
      expect(wrapper).toBeTruthy();
      expect(select).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('deve executar ngOnInit sem erros', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('métodos adicionais', () => {
    it('deve lidar com writeValue com valor string vazia', () => {
      component.writeValue('');
      expect(component.value).toBe('');
    });

    it('deve lidar com writeValue com valor string válida', () => {
      component.writeValue('teste');
      expect(component.value).toBe('teste');
    });

    it('deve lidar com writeValue com valor 0', () => {
      component.writeValue('0');
      expect(component.value).toBe('0');
    });

    it('deve lidar com writeValue com valor false', () => {
      component.writeValue('false');
      expect(component.value).toBe('false');
    });

    it('deve lidar com onSelectChange com evento válido', () => {
      const mockCallback = jest.fn();
      component.registerOnChange(mockCallback);
      
      const mockEvent = {
        target: { value: 'opcao1' }
      } as any;
      
      component.onSelectChange(mockEvent);
      
      expect(component.value).toBe('opcao1');
      expect(mockCallback).toHaveBeenCalledWith('opcao1');
    });

    it('deve lidar com onSelectChange com valor vazio', () => {
      const mockCallback = jest.fn();
      component.registerOnChange(mockCallback);
      
      const mockEvent = {
        target: { value: '' }
      } as any;
      
      component.onSelectChange(mockEvent);
      
      expect(component.value).toBe('');
      expect(mockCallback).toHaveBeenCalledWith('');
    });

    it('deve lidar com setDisabledState true', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
    });

    it('deve lidar com setDisabledState false', () => {
      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
    });

    it('deve lidar com onChange callback', () => {
      const mockCallback = jest.fn();
      component.registerOnChange(mockCallback);
      
      // Simular chamada direta do onChange
      component['onChange']('teste');
      expect(mockCallback).toHaveBeenCalledWith('teste');
    });

    it('deve lidar com onTouched callback', () => {
      const mockCallback = jest.fn();
      component.registerOnTouched(mockCallback);
      
      // Simular chamada direta do onTouched
      component.onTouched();
      expect(mockCallback).toHaveBeenCalled();
    });

    it('deve lidar com onChange callback vazio', () => {
      // Testar o comportamento padrão do onChange
      expect(() => component['onChange']('teste')).not.toThrow();
    });

    it('deve lidar com onTouched callback vazio', () => {
      // Testar o comportamento padrão do onTouched
      expect(() => component.onTouched()).not.toThrow();
    });
  });
});
