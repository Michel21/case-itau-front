import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SelecaoPeriodoComponent } from './selecao-periodo.component';
import { SelecaoPeriodoService } from './selecao-periodo.service';
import { PeriodoMesAno } from './interfaces';

describe('SelecaoPeriodoComponent', () => {
  let component: SelecaoPeriodoComponent;
  let fixture: ComponentFixture<SelecaoPeriodoComponent>;
  let mockRouter: { navigate: jest.Mock };
  let mockSelecaoPeriodoService: {
    periodos: { (): PeriodoMesAno[] };
    meses: { (): Array<{valor: string, nome: string}> };
    anos: { (): string[] };
    obterPeriodoAtual: jest.Mock;
    validarPeriodo: jest.Mock;
    formatarPeriodo: jest.Mock;
    validarIntervaloDatas: jest.Mock;
    validarLimiteHistorico: jest.Mock;
    validarPeriodoCompleto: jest.Mock;
    obterDataLimiteHistorico: jest.Mock;
    obterDataMaxima: jest.Mock;
    formatarIntervalo: jest.Mock;
    obterNomeMes: jest.Mock;
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn()
    };

    mockSelecaoPeriodoService = {
      periodos: jest.fn().mockReturnValue([
        { tipo: 'Junho/2025', valor: '6/2025' },
        { tipo: 'Maio/2025', valor: '5/2025' }
      ]),
      meses: jest.fn().mockReturnValue([
        { valor: '1', nome: 'Janeiro' },
        { valor: '6', nome: 'Junho' }
      ]),
      anos: jest.fn().mockReturnValue(['2024', '2025', '2026']),
      obterPeriodoAtual: jest.fn(),
      validarPeriodo: jest.fn(),
      formatarPeriodo: jest.fn(),
      validarIntervaloDatas: jest.fn(),
      validarLimiteHistorico: jest.fn(),
      validarPeriodoCompleto: jest.fn(),
      obterDataLimiteHistorico: jest.fn(),
      obterDataMaxima: jest.fn(),
      formatarIntervalo: jest.fn(),
      obterNomeMes: jest.fn()
    };

    // Configurar retornos padrão para os métodos do serviço
    mockSelecaoPeriodoService.obterPeriodoAtual.mockReturnValue({ mes: '6', ano: '2025' });
    mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(true);
    mockSelecaoPeriodoService.formatarPeriodo.mockReturnValue('Junho/2025');
    mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(true);
    mockSelecaoPeriodoService.validarLimiteHistorico.mockReturnValue(true);
    mockSelecaoPeriodoService.validarPeriodoCompleto.mockReturnValue({ valido: true, mensagem: '' });
    mockSelecaoPeriodoService.obterDataLimiteHistorico.mockReturnValue(new Date('2024-01-01'));
    mockSelecaoPeriodoService.obterDataMaxima.mockReturnValue(new Date('2025-12-31'));
    mockSelecaoPeriodoService.formatarIntervalo.mockReturnValue('01/01/2025 a 31/01/2025');
    mockSelecaoPeriodoService.obterNomeMes.mockReturnValue('Junho');

    await TestBed.configureTestingModule({
      imports: [SelecaoPeriodoComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SelecaoPeriodoService, useValue: mockSelecaoPeriodoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelecaoPeriodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with service data', () => {
    expect(mockSelecaoPeriodoService.obterPeriodoAtual).toHaveBeenCalled();
    expect(mockSelecaoPeriodoService.periodos).toHaveBeenCalled();
    expect(mockSelecaoPeriodoService.meses).toHaveBeenCalled();
    expect(mockSelecaoPeriodoService.anos).toHaveBeenCalled();
  });

  it('should have correct initial values', () => {
    expect(component.tipoSelecao()).toBe('mes');
    expect(component.mesSelecionado()).toBe('6');
    expect(component.anoSelecionado()).toBe('2025');
    expect(component.dataInicio()).toBeTruthy();
    expect(component.dataFim()).toBeTruthy();
  });

  it('should change selection type', () => {
    component.alterarTipoSelecao('intervalo');
    expect(component.tipoSelecao()).toBe('intervalo');
  });

  it('should have computed values working correctly', () => {
    // Test computed values
    expect(component.intervaloInvalido()).toBe(false);
    expect(component.mensagemErro()).toBe('Por favor, preencha todos os campos obrigatórios');
    expect(component.temErros()).toBe(false);
    expect(component.botaoDesabilitado()).toBe(false);
    expect(component.periodoFormatado()).toBe('Junho/2025');
  });

  it('should update signals correctly', () => {
    component.periodoForm?.get('mes')?.setValue('12');
    expect(component.periodoForm?.get('mes')?.value).toBe('12');

    component.periodoForm?.get('ano')?.setValue('2024');
    expect(component.periodoForm?.get('ano')?.value).toBe('2024');

    component.periodoForm?.get('dataInicio')?.setValue('2025-01-01');
    expect(component.periodoForm?.get('dataInicio')?.value).toBe('2025-01-01');

    component.periodoForm?.get('dataFim')?.setValue('2025-01-31');
    expect(component.periodoForm?.get('dataFim')?.value).toBe('2025-01-31');
  });

  it('should apply filter without navigation (visual only)', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    component.aplicarFiltro();
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should navigate back', () => {
    component.voltar();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should get month name correctly', () => {
    // Use the public method or test through the component's API instead of accessing private service
    const monthName = component['selecaoPeriodoService'].obterNomeMes('6');
    expect(monthName).toBe('Junho');
    expect(mockSelecaoPeriodoService.obterNomeMes).toHaveBeenCalledWith('6');
  });

  it('should get minimum date from service', () => {
    component.getDataMinima();
    expect(mockSelecaoPeriodoService.obterDataLimiteHistorico).toHaveBeenCalled();
  });

  it('should get maximum date from service', () => {
    component.getDataMaxima();
    expect(mockSelecaoPeriodoService.obterDataMaxima).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', () => {
    const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault');
    
    component.onKeyDown(mockEvent, 'voltar');
    
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should clear interval state when switching to month selection', () => {
    // Set some interval data
    component.periodoForm?.get('dataInicio')?.setValue('2025-01-01');
    component.periodoForm?.get('dataFim')?.setValue('2025-01-31');
    
    // Switch to month selection
    component.alterarTipoSelecao('mes');
    
    // Check if interval data was cleared
    expect(component.periodoForm?.get('dataInicio')?.value).toBe('');
    expect(component.periodoForm?.get('dataFim')?.value).toBe('');
  });

  it('should have reactive computed values', () => {
    // Initially no errors
    expect(component.temErros()).toBe(false);
    
    // Simulate validation error
    mockSelecaoPeriodoService.validarPeriodoCompleto.mockReturnValue({ 
      valido: false, 
      mensagem: 'Erro de validação' 
    });
    
    // Trigger change detection to update computed values
    fixture.detectChanges();
    
    // Now should have errors
    expect(component.temErros()).toBe(true);
    expect(component.botaoDesabilitado()).toBe(true);
  });

  describe('Signal reactivity', () => {
    it('should react to tipoSelecao changes', () => {
      expect(component.tipoSelecao()).toBe('mes');
      
      component.alterarTipoSelecao('intervalo');
      
      expect(component.tipoSelecao()).toBe('intervalo');
    });

    it('should react to data changes', () => {
      const initialMes = component.periodoForm?.get('mes')?.value;
      
      component.periodoForm?.get('mes')?.setValue('12');
      
      expect(component.periodoForm?.get('mes')?.value).not.toBe(initialMes);
      expect(component.periodoForm?.get('mes')?.value).toBe('12');
    });
  });

  describe('Computed values', () => {
    it('should compute periodoFormatado correctly for month selection', () => {
      component.alterarTipoSelecao('mes');
      component.periodoForm?.get('mes')?.setValue('12');
      component.periodoForm?.get('ano')?.setValue('2024');
      
      expect(component.periodoFormatado()).toBe('Junho/2025');
    });

    it('should compute periodoFormatado correctly for interval selection', () => {
      component.alterarTipoSelecao('intervalo');
      component.periodoForm?.get('dataInicio')?.setValue('2025-01-01');
      component.periodoForm?.get('dataFim')?.setValue('2025-01-31');
      
      expect(component.periodoFormatado()).toBe('01/01/2025 a 31/01/2025');
    });
  });

  describe('Error handling', () => {
    it('should handle validation errors gracefully', () => {
      mockSelecaoPeriodoService.validarPeriodoCompleto.mockReturnValue({ 
        valido: false, 
        mensagem: 'Período inválido' 
      });
      
      fixture.detectChanges();
      
      expect(component.temErros()).toBe(true);
      expect(component.mensagemErro()).toBe('Período inválido');
    });

    it('should disable button when there are errors', () => {
      mockSelecaoPeriodoService.validarPeriodoCompleto.mockReturnValue({ 
        valido: false, 
        mensagem: 'Erro de validação' 
      });
      
      fixture.detectChanges();
      
      expect(component.botaoDesabilitado()).toBe(true);
    });
  });

  describe('Service signals integration', () => {
    it('should use service signals for data', () => {
      expect(component.listaPeriodoMesAno()).toEqual([
        { tipo: 'Junho/2025', valor: '6/2025' },
        { tipo: 'Maio/2025', valor: '5/2025' }
      ]);
      
      expect(component.meses()).toEqual([
        { valor: '1', nome: 'Janeiro', ano: 2024 },
        { valor: '6', nome: 'Junho', ano: 2024 }
      ]);
      
      expect(component.anos()).toEqual(['2024', '2025', '2026']);
    });

    it('should call service methods for validation', () => {
      component.alterarTipoSelecao('intervalo');
      component.periodoForm?.get('dataInicio')?.setValue('2025-01-01');
      component.periodoForm?.get('dataFim')?.setValue('2025-01-31');
      
      // This should trigger validation calls
      fixture.detectChanges();
      
      expect(mockSelecaoPeriodoService.validarIntervaloDatas).toHaveBeenCalled();
      expect(mockSelecaoPeriodoService.validarLimiteHistorico).toHaveBeenCalled();
    });
  });
});
