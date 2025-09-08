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

    it('should initialize with current period', () => {
      const periodoAtual = service.obterPeriodoAtual();
      expect(periodoAtual.mes).toBeDefined();
      expect(periodoAtual.ano).toBeDefined();
      expect(periodoAtual.mes).not.toBe('');
      expect(periodoAtual.ano).not.toBe('');
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
        { valor: '1', nome: 'Janeiro', ano: 2024 },
        { valor: '2', nome: 'Fevereiro', ano: 2024 }
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

  describe('Business logic coordination', () => {
    it('should coordinate between different services', () => {
      // Simular um fluxo completo
      const mesesMock = [{ valor: '1', nome: 'Janeiro', ano: 2024 }];
      const anosMock = ['2024'];
      const periodosMock = [{ 
        tipo: 'mes' as const, 
        valor: 'Janeiro de 2024',
        mes: '1',
        ano: '2024'
      }];
      
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

    it('should validate period correctly', () => {
      const validadorSpy = jest.spyOn(TestBed.inject(ValidadorPeriodoService), 'validarLimiteHistorico');
      validadorSpy.mockReturnValue(true);
      
      const resultado = service.validarPeriodo('1', '2024');
      
      expect(validadorSpy).toHaveBeenCalled();
      expect(resultado).toBe(true);
    });

    it('should return false for invalid period', () => {
      const resultado = service.validarPeriodo('', '');
      expect(resultado).toBe(false);
    });
  });

  describe('Data management methods', () => {
    it('should get historical limit date', () => {
      const dataLimite = service.obterDataLimiteHistorico();
      expect(dataLimite).toBeInstanceOf(Date);
      
      const dataAtual = new Date();
      const dataEsperada = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 12, 1);
      
      expect(dataLimite.getFullYear()).toBe(dataEsperada.getFullYear());
      expect(dataLimite.getMonth()).toBe(dataEsperada.getMonth());
    });

    it('should get maximum date (today)', () => {
      const dataMaxima = service.obterDataMaxima();
      expect(dataMaxima).toBeInstanceOf(Date);
      
      const hoje = new Date();
      expect(dataMaxima.getDate()).toBe(hoje.getDate());
      expect(dataMaxima.getMonth()).toBe(hoje.getMonth());
      expect(dataMaxima.getFullYear()).toBe(hoje.getFullYear());
    });

    it('should get month name', () => {
      const formatadorSpy = jest.spyOn(TestBed.inject(FormatadorPeriodoService), 'obterNomeMes');
      formatadorSpy.mockReturnValue('Janeiro');
      
      const nomeMes = service.obterNomeMes('1');
      
      expect(formatadorSpy).toHaveBeenCalledWith('1');
      expect(nomeMes).toBe('Janeiro');
    });
  });

  describe('Statistics and utilities', () => {
    it('should provide statistics', () => {
      const estatisticas = service.obterEstatisticas();
      
      expect(estatisticas.totalPeriodos).toBeDefined();
      expect(estatisticas.totalMeses).toBeDefined();
      expect(estatisticas.totalAnos).toBeDefined();
      expect(estatisticas.periodoAtual).toBeDefined();
      expect(estatisticas.limiteDias).toBe(90);
      expect(estatisticas.limiteMeses).toBe(12);
    });

    it('should clear data for testing', () => {
      service.limparDados();
      
      expect(service.periodos()).toEqual([]);
      expect(service.meses()).toEqual([]);
      expect(service.anos()).toEqual([]);
      expect(service.periodoAtual()).toEqual({ mes: '', ano: '' });
    });

    it('should update periods', () => {
      const geradorSpy = jest.spyOn(TestBed.inject(GeradorPeriodoService), 'gerarPeriodos');
      const periodosMock = [{ 
        tipo: 'mes' as const, 
        valor: 'Janeiro de 2024',
        mes: '1',
        ano: '2024'
      }];
      geradorSpy.mockReturnValue(periodosMock);
      
      service.atualizarPeriodos();
      
      expect(geradorSpy).toHaveBeenCalled();
      expect(service.periodos()).toEqual(periodosMock);
    });

    it('should update years', () => {
      const geradorSpy = jest.spyOn(TestBed.inject(GeradorPeriodoService), 'gerarAnos');
      const anosMock = ['2024', '2023'];
      geradorSpy.mockReturnValue(anosMock);
      
      service.atualizarAnos();
      
      expect(geradorSpy).toHaveBeenCalled();
      expect(service.anos()).toEqual(anosMock);
    });
  });

  describe('Period definition', () => {
    it('should define period correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const periodo = {
        tipo: 'mes' as const,
        valor: 'Janeiro de 2024',
        mes: '1',
        ano: '2024'
      };
      
      service.definirPeriodo(periodo);
      
      expect(consoleSpy).toHaveBeenCalledWith('Período definido:', periodo);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Complete period validation', () => {
    it('should validate complete period for month type', () => {
      const validadorSpy = jest.spyOn(TestBed.inject(ValidadorPeriodoService), 'validarPeriodoCompleto');
      const resultadoMock = { valido: true, mensagem: '' };
      validadorSpy.mockReturnValue(resultadoMock);
      
      const resultado = service.validarPeriodoCompleto('mes', '1', '2024');
      
      expect(validadorSpy).toHaveBeenCalledWith('mes', '1', '2024', undefined, undefined);
      expect(resultado).toEqual(resultadoMock);
    });

    it('should validate complete period for interval type', () => {
      const validadorSpy = jest.spyOn(TestBed.inject(ValidadorPeriodoService), 'validarPeriodoCompleto');
      const resultadoMock = { valido: true, mensagem: '' };
      validadorSpy.mockReturnValue(resultadoMock);
      
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-01-30');
      
      const resultado = service.validarPeriodoCompleto('intervalo', undefined, undefined, dataInicio, dataFim);
      
      expect(validadorSpy).toHaveBeenCalledWith('intervalo', undefined, undefined, dataInicio, dataFim);
      expect(resultado).toEqual(resultadoMock);
    });
  });

  describe('Interval formatting', () => {
    it('should format interval correctly', () => {
      const formatadorSpy = jest.spyOn(TestBed.inject(FormatadorPeriodoService), 'formatarIntervalo');
      formatadorSpy.mockReturnValue('01/01/2024 - 30/01/2024');
      
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-01-30');
      
      const resultado = service.formatarIntervalo(dataInicio, dataFim);
      
      expect(formatadorSpy).toHaveBeenCalledWith(dataInicio, dataFim);
      expect(resultado).toBe('01/01/2024 - 30/01/2024');
    });
  });
});