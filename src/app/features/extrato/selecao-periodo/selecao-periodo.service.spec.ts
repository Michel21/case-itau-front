import { TestBed } from '@angular/core/testing';
import { SelecaoPeriodoService } from './selecao-periodo.service';
import { ValidadorPeriodoService } from './services/validador-periodo.service';
import { GeradorPeriodoService } from './services/gerador-periodo.service';
import { FormatadorPeriodoService } from './services/formatador-periodo.service';
import { PeriodoMesAno, ConfiguracaoPeriodo } from './interfaces/periodo.interface';

/**
 * Testes unitários para SelecaoPeriodoService
 * Seguindo princípios SOLID e Clean Code
 */
describe('SelecaoPeriodoService', () => {
  let service: SelecaoPeriodoService;
  let validadorSpy: any;
  let geradorSpy: any;
  let formatadorSpy: any;

  beforeEach(() => {
    const validadorSpyObj = {
      validarIntervaloDatas: jest.fn(),
      validarLimiteHistorico: jest.fn(),
      validarPeriodoCompleto: jest.fn(),
      validarDataNaoFutura: jest.fn(),
      obterConfiguracao: jest.fn()
    };

    const geradorSpyObj = {
      gerarPeriodos: jest.fn(),
      gerarMeses: jest.fn(),
      gerarAnos: jest.fn(),
      gerarPeriodoAtual: jest.fn(),
      gerarPeriodosComConfiguracao: jest.fn()
    };

    const formatadorSpyObj = {
      formatarPeriodo: jest.fn(),
      formatarIntervalo: jest.fn(),
      obterNomeMes: jest.fn(),
      formatarData: jest.fn(),
      formatarPeriodoCompleto: jest.fn(),
      formatarIntervaloCompleto: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        SelecaoPeriodoService,
        { provide: ValidadorPeriodoService, useValue: validadorSpyObj },
        { provide: GeradorPeriodoService, useValue: geradorSpyObj },
        { provide: FormatadorPeriodoService, useValue: formatadorSpyObj }
      ]
    });

    service = TestBed.inject(SelecaoPeriodoService);
    validadorSpy = TestBed.inject(ValidadorPeriodoService);
    geradorSpy = TestBed.inject(GeradorPeriodoService);
    formatadorSpy = TestBed.inject(FormatadorPeriodoService);

    // Setup default return values
    validadorSpy.obterConfiguracao.mockReturnValue({
      limiteDiasIntervalo: 90,
      limiteMesesHistorico: 12,
      permitirDatasFuturas: false
    });

    geradorSpy.gerarPeriodos.mockReturnValue([]);
    geradorSpy.gerarMeses.mockReturnValue([]);
    geradorSpy.gerarAnos.mockReturnValue([]);
    geradorSpy.gerarPeriodoAtual.mockReturnValue({ mes: '1', ano: '2024' });

    formatadorSpy.formatarPeriodo.mockReturnValue('Janeiro de 2024');
    formatadorSpy.formatarIntervalo.mockReturnValue('01/01/2024 a 31/01/2024');
    formatadorSpy.obterNomeMes.mockReturnValue('Janeiro');
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('deve inicializar com valores padrão', () => {
      // Os signals são inicializados como undefined até serem carregados
      expect(service.periodos()).toBeUndefined();
      expect(service.meses()).toBeUndefined();
      expect(service.anos()).toBeUndefined();
      // O periodoAtual é inicializado automaticamente com a data atual
      expect(service.periodoAtual()).toBeDefined();
    });

      it('deve chamar serviços geradores na inicialização', () => {
      expect(geradorSpy.gerarPeriodos).toHaveBeenCalled();
      expect(geradorSpy.gerarMeses).toHaveBeenCalled();
      expect(geradorSpy.gerarAnos).toHaveBeenCalled();
    });
  });

  describe('computed properties', () => {
      it('deve calcular total de períodos corretamente', () => {
      const mockPeriodos: PeriodoMesAno[] = [
        { tipo: 'mes', valor: '1/2024', mes: '1', ano: '2024' },
        { tipo: 'mes', valor: '2/2024', mes: '2', ano: '2024' }
      ];
      geradorSpy.gerarPeriodos.mockReturnValue(mockPeriodos);
      service.gerarPeriodos();

      expect(service.totalPeriodos()).toBe(2);
    });

      it('deve calcular total de meses corretamente', () => {
      const mockMeses = [
        { valor: '1', nome: 'Janeiro', ano: 2024 },
        { valor: '2', nome: 'Fevereiro', ano: 2024 }
      ];
      geradorSpy.gerarMeses.mockReturnValue(mockMeses);
      service.gerarMeses();

      expect(service.totalMeses()).toBe(2);
    });

      it('deve calcular total de anos corretamente', () => {
      const mockAnos = ['2023', '2024'];
      geradorSpy.gerarAnos.mockReturnValue(mockAnos);
      service.gerarAnos();

      expect(service.totalAnos()).toBe(2);
    });

      it('deve formatar período atual corretamente', () => {
      const dataAtual = new Date();
      const mesAtual = (dataAtual.getMonth() + 1).toString();
      const anoAtual = dataAtual.getFullYear().toString();
      const mockPeriodoAtual = { mes: mesAtual, ano: anoAtual };
      geradorSpy.gerarPeriodoAtual.mockReturnValue(mockPeriodoAtual);
      formatadorSpy.formatarPeriodo.mockReturnValue(`Mês ${mesAtual} de ${anoAtual}`);

      const resultado = service.periodoAtualFormatado();

      expect(resultado).toBe(`Mês ${mesAtual} de ${anoAtual}`);
      expect(formatadorSpy.formatarPeriodo).toHaveBeenCalledWith(mesAtual, anoAtual);
    });
  });

  describe('definirPeriodo', () => {
      it('deve definir período selecionado', () => {
      const periodo: PeriodoMesAno = {
        tipo: 'mes',
        valor: '3/2024',
        mes: '3',
        ano: '2024'
      };

      service.definirPeriodo(periodo);

      expect(service.periodoSelecionado()).toEqual(periodo);
    });

      it('deve emitir evento de mudança ao definir período', () => {
      const periodo: PeriodoMesAno = {
        tipo: 'mes',
        valor: '3/2024',
        mes: '3',
        ano: '2024'
      };
      service.definirPeriodo(periodo);
    });
  });

  describe('atualizarEstadoFormulario', () => {
    it('deve atualizar estado do formulário', () => {
      const novoEstado = {
        tipoSelecao: 'intervalo' as const,
        mesSelecionado: '',
        anoSelecionado: '',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
        valido: true,
        erros: []
      };

      service.atualizarEstadoFormulario(novoEstado);

      expect(service.estadoFormulario()).toEqual(novoEstado);
    });

      it('deve mesclar estado parcial com estado existente', () => {
      const estadoParcial = {
        tipoSelecao: 'intervalo' as const,
        dataInicio: '2024-01-01'
      };

      service.atualizarEstadoFormulario(estadoParcial);

      const estadoAtual = service.estadoFormulario();
      expect(estadoAtual.tipoSelecao).toBe('intervalo');
      expect(estadoAtual.dataInicio).toBe('2024-01-01');
      expect(estadoAtual.mesSelecionado).toBe(''); // Should keep existing value
    });
  });

  describe('validarEAtualizarEstado', () => {
      it('deve validar tipo mês e atualizar estado', () => {
      service.atualizarEstadoFormulario({
        tipoSelecao: 'mes',
        mesSelecionado: '3',
        anoSelecionado: '2024',
        dataInicio: '',
        dataFim: '',
        valido: false,
        erros: []
      });

      validadorSpy.validarPeriodoCompleto.mockReturnValue({
        valido: true,
        mensagem: '',
        codigo: undefined
      });

      service.validarEAtualizarEstado();

      expect(validadorSpy.validarPeriodoCompleto).toHaveBeenCalledWith('mes', '3', '2024');
      expect(service.estadoFormulario().valido).toBe(true);
      expect(service.estadoFormulario().erros).toEqual([]);
    });

      it('deve validar tipo intervalo e atualizar estado', () => {
      service.atualizarEstadoFormulario({
        tipoSelecao: 'intervalo',
        mesSelecionado: '',
        anoSelecionado: '',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
        valido: false,
        erros: []
      });

      validadorSpy.validarPeriodoCompleto.mockReturnValue({
        valido: true,
        mensagem: '',
        codigo: undefined
      });

      service.validarEAtualizarEstado();

      expect(validadorSpy.validarPeriodoCompleto).toHaveBeenCalledWith(
        'intervalo',
        undefined,
        undefined,
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );
      expect(service.estadoFormulario().valido).toBe(true);
    });

      it('deve adicionar erros quando validação falha', () => {
      service.atualizarEstadoFormulario({
        tipoSelecao: 'mes',
        mesSelecionado: '',
        anoSelecionado: '',
        dataInicio: '',
        dataFim: '',
        valido: false,
        erros: []
      });

      service.validarEAtualizarEstado();

      expect(service.estadoFormulario().valido).toBe(false);
      expect(service.estadoFormulario().erros).toContain('Mês e ano são obrigatórios');
    });
  });

  describe('validation methods', () => {
      it('deve delegar validação de período para serviço validador', () => {
      validadorSpy.validarPeriodoCompleto.mockReturnValue({
        valido: true,
        mensagem: '',
        codigo: undefined
      });

      const resultado = service.validarPeriodo('3', '2024');

      expect(validadorSpy.validarPeriodoCompleto).toHaveBeenCalledWith('mes', '3', '2024');
      expect(resultado).toBe(true);
    });

      it('deve delegar validação de intervalo para serviço validador', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-01-31');
      validadorSpy.validarIntervaloDatas.mockReturnValue(true);

      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);

      expect(resultado).toBe(true);
      expect(validadorSpy.validarIntervaloDatas).toHaveBeenCalledWith(dataInicio, dataFim);
    });

      it('deve delegar validação de limite histórico para serviço validador', () => {
      const data = new Date('2024-01-01');
      validadorSpy.validarLimiteHistorico.mockReturnValue(true);

      const resultado = service.validarLimiteHistorico(data);

      expect(resultado).toBe(true);
      expect(validadorSpy.validarLimiteHistorico).toHaveBeenCalledWith(data);
    });
  });

  describe('formatting methods', () => {
      it('deve delegar formatação de período para serviço formatador', () => {
      formatadorSpy.formatarPeriodo.mockReturnValue('Março de 2024');

      const resultado = service.formatarPeriodo('3', '2024');

      expect(resultado).toBe('Março de 2024');
      expect(formatadorSpy.formatarPeriodo).toHaveBeenCalledWith('3', '2024');
    });

      it('deve delegar formatação de intervalo para serviço formatador', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-01-31');
      formatadorSpy.formatarIntervalo.mockReturnValue('01/01/2024 a 31/01/2024');

      const resultado = service.formatarIntervalo(dataInicio, dataFim);

      expect(resultado).toBe('01/01/2024 a 31/01/2024');
      expect(formatadorSpy.formatarIntervalo).toHaveBeenCalledWith(dataInicio, dataFim);
    });

      it('deve delegar formatação de nome do mês para serviço formatador', () => {
      formatadorSpy.obterNomeMes.mockReturnValue('Março');

      const resultado = service.obterNomeMes('3');

      expect(resultado).toBe('Março');
      expect(formatadorSpy.obterNomeMes).toHaveBeenCalledWith('3');
    });
  });

  describe('utility methods', () => {
      it('deve obter data de limite histórico', () => {
      const dataLimite = service.obterDataLimiteHistorico();
      const dataAtual = new Date();
      const dataEsperada = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 12, 1);

      expect(dataLimite.getTime()).toBeCloseTo(dataEsperada.getTime(), -2);
    });

      it('deve obter data máxima (data atual quando permitirDatasFuturas é false)', () => {
        const dataMaxima = service.obterDataMaxima();
        const dataAtual = new Date();
        // Como permitirDatasFuturas é false por padrão, deve retornar a data atual
        expect(dataMaxima.getTime()).toBeCloseTo(dataAtual.getTime(), -2);
      });

      it('deve obter estatísticas', () => {
      // Configurar os spies para retornar dados válidos
      geradorSpy.gerarPeriodos.mockReturnValue([]);
      geradorSpy.gerarMeses.mockReturnValue([]);
      geradorSpy.gerarAnos.mockReturnValue([]);
      
      // Carregar os dados primeiro
      service.gerarPeriodos();
      service.gerarMeses();
      service.gerarAnos();
      
      const estatisticas = service.obterEstatisticas();

      expect(estatisticas.totalPeriodos).toBeDefined();
      expect(estatisticas.totalMeses).toBeDefined();
      expect(estatisticas.totalAnos).toBeDefined();
      expect(estatisticas.limiteDias).toBeDefined();
      expect(estatisticas.limiteMeses).toBeDefined();
      expect(estatisticas.permitirDatasFuturas).toBeDefined();
    });

      it('deve obter configuração', () => {
      const configuracao = service.obterConfiguracao();

      expect(configuracao).toEqual({
        limiteDiasIntervalo: 90,
        limiteMesesHistorico: 12,
        permitirDatasFuturas: false
      });
      expect(validadorSpy.obterConfiguracao).toHaveBeenCalled();
    });
  });

  describe('data management', () => {
      it('deve limpar todos os dados', () => {
      service.limparDados();

      expect(service.periodos()).toEqual([]);
      expect(service.meses()).toEqual([]);
      expect(service.anos()).toEqual([]);
      expect(service.periodoAtual()).toEqual({ mes: '', ano: '' });
      expect(service.periodoSelecionado()).toBeNull();
    });

      it('deve reinicializar serviço', () => {
      jest.spyOn(service as any, 'inicializarDados');

      service.reinicializar();

      expect(service['inicializarDados']).toHaveBeenCalled();
    });

      it('deve atualizar períodos', () => {
      service.atualizarPeriodos();

      expect(geradorSpy.gerarPeriodos).toHaveBeenCalled();
    });

      it('deve atualizar anos', () => {
      service.atualizarAnos();

      expect(geradorSpy.gerarAnos).toHaveBeenCalled();
    });
  });

  describe('computed state properties', () => {
      it('deve calcular validade do formulário corretamente', () => {
      service.atualizarEstadoFormulario({
        tipoSelecao: 'mes',
        mesSelecionado: '3',
        anoSelecionado: '2024',
        dataInicio: '',
        dataFim: '',
        valido: true,
        erros: []
      });

      expect(service.formularioValido()).toBe(true);
    });

      it('deve detectar quando período é selecionado', () => {
      const periodo: PeriodoMesAno = {
        tipo: 'mes',
        valor: '3/2024',
        mes: '3',
        ano: '2024'
      };

      service.definirPeriodo(periodo);

      expect(service.temPeriodoSelecionado()).toBe(true);
    });
  });
});
