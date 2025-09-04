import { TestBed } from '@angular/core/testing';
import { SelecaoPeriodoService } from './selecao-periodo.service';
import { ValidadorPeriodoService } from './services/validador-periodo.service';
import { GeradorPeriodoService } from './services/gerador-periodo.service';
import { FormatadorPeriodoService } from './services/formatador-periodo.service';

describe('SelecaoPeriodoService (SOLID Architecture)', () => {
  let service: SelecaoPeriodoService;
  let validadorSpy: jest.SpyInstance;
  let geradorSpy: jest.SpyInstance;
  let formatadorSpy: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SelecaoPeriodoService,
        ValidadorPeriodoService,
        GeradorPeriodoService,
        FormatadorPeriodoService
      ]
    });
    service = TestBed.inject(SelecaoPeriodoService);
    
    // Criar spies para os serviços dependentes
    const validador = TestBed.inject(ValidadorPeriodoService);
    const gerador = TestBed.inject(GeradorPeriodoService);
    const formatador = TestBed.inject(FormatadorPeriodoService);
    
    validadorSpy = jest.spyOn(validador, 'validarIntervaloDatas');
    geradorSpy = jest.spyOn(gerador, 'gerarMeses');
    formatadorSpy = jest.spyOn(formatador, 'formatarPeriodo');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Dependency Injection (Dependency Inversion Principle)', () => {
    it('should inject dependencies correctly', () => {
      expect(service).toBeDefined();
      // Verificar se os serviços dependentes estão sendo injetados
      expect(TestBed.inject(ValidadorPeriodoService)).toBeDefined();
      expect(TestBed.inject(GeradorPeriodoService)).toBeDefined();
      expect(TestBed.inject(FormatadorPeriodoService)).toBeDefined();
    });
  });

  describe('Delegation to specialized services', () => {
    it('should delegate validation to ValidadorPeriodoService', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-01-30');
      
      validadorSpy.mockReturnValue(true);
      
      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);
      
      expect(validadorSpy).toHaveBeenCalledWith(dataInicio, dataFim);
      expect(resultado).toBe(true);
    });

    it('should delegate generation to GeradorPeriodoService', () => {
      const mesesMock = [
        { valor: '1', nome: 'Janeiro' },
        { valor: '2', nome: 'Fevereiro' }
      ];
      
      geradorSpy.mockReturnValue(mesesMock);
      
      service.gerarMeses();
      
      expect(geradorSpy).toHaveBeenCalled();
      expect(service.meses()).toEqual(mesesMock);
    });

    it('should delegate formatting to FormatadorPeriodoService', () => {
      formatadorSpy.mockReturnValue('Janeiro de 2024');
      
      const resultado = service.formatarPeriodo('1', '2024');
      
      expect(formatadorSpy).toHaveBeenCalledWith('1', '2024');
      expect(resultado).toBe('Janeiro de 2024');
    });
  });

  describe('Signal-based state management', () => {
    it('should maintain reactive state with signals', () => {
      expect(service.periodos()).toBeDefined();
      expect(service.meses()).toBeDefined();
      expect(service.anos()).toBeDefined();
      expect(service.periodoAtual()).toBeDefined();
    });

    it('should provide computed values', () => {
      expect(service.totalPeriodos()).toBeDefined();
      expect(service.totalMeses()).toBeDefined();
      expect(service.totalAnos()).toBeDefined();
      expect(service.periodoAtualFormatado()).toBeDefined();
    });
  });

  describe('Business logic coordination', () => {
    it('should coordinate between different services', () => {
      // Simular um fluxo completo
      const mesesMock = [{ valor: '1', nome: 'Janeiro' }];
      const anosMock = ['2024'];
      const periodosMock = [{ tipo: 'Janeiro/2024', valor: '1/2024' }];
      
      jest.spyOn(TestBed.inject(GeradorPeriodoService), 'gerarMeses').mockReturnValue(mesesMock);
      jest.spyOn(TestBed.inject(GeradorPeriodoService), 'gerarAnos').mockReturnValue(anosMock);
      jest.spyOn(TestBed.inject(GeradorPeriodoService), 'gerarPeriodos').mockReturnValue(periodosMock);
      
      service.gerarMeses();
      service.gerarAnos();
      service.gerarPeriodos();
      
      expect(service.meses()).toEqual(mesesMock);
      expect(service.anos()).toEqual(anosMock);
      expect(service.periodos()).toEqual(periodosMock);
    });
  });
});
