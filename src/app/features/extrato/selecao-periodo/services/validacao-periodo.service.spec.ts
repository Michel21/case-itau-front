import { TestBed } from '@angular/core/testing';
import { ValidacaoPeriodoService } from './validacao-periodo.service';
import { SelecaoPeriodoService } from '../selecao-periodo.service';
import { ValidadorPeriodoService } from './validador-periodo.service';

describe('ValidacaoPeriodoService', () => {
  let service: ValidacaoPeriodoService;
  let mockSelecaoPeriodoService: jest.Mocked<SelecaoPeriodoService>;
  let mockValidadorPeriodoService: jest.Mocked<ValidadorPeriodoService>;

  beforeEach(() => {
    const mockSelecaoService = {
      validarIntervaloDatas: jest.fn(),
      validarPeriodo: jest.fn(),
      validarLimiteHistorico: jest.fn(),
      formatarPeriodo: jest.fn(),
      formatarIntervalo: jest.fn(),
      obterDataLimiteHistorico: jest.fn(),
      obterDataMaxima: jest.fn(),
      obterPeriodoAtual: jest.fn()
    };

    const mockValidadorService = {
      validarPeriodoCompleto: jest.fn(),
      validarLimiteHistorico: jest.fn(),
      validarIntervaloDatas: jest.fn(),
      validarDataNaoFutura: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ValidacaoPeriodoService,
        { provide: SelecaoPeriodoService, useValue: mockSelecaoService },
        { provide: ValidadorPeriodoService, useValue: mockValidadorService }
      ]
    });

    service = TestBed.inject(ValidacaoPeriodoService);
    mockSelecaoPeriodoService = TestBed.inject(SelecaoPeriodoService) as jest.Mocked<SelecaoPeriodoService>;
    mockValidadorPeriodoService = TestBed.inject(ValidadorPeriodoService) as jest.Mocked<ValidadorPeriodoService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Definir Valores', () => {
    it('deve definir tipo de seleção', () => {
      service.definirTipoSelecao('intervalo');
      expect(service.tipoSelecao()).toBe('intervalo');
    });

    it('deve definir mês e ano', () => {
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.mesSelecionado()).toBe('03');
      expect(service.anoSelecionado()).toBe('2024');
    });

    it('deve definir datas de início e fim', () => {
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.dataInicio()).toBe('2024-01-01');
      expect(service.dataFim()).toBe('2024-01-31');
    });

    it('deve definir valores em lote', () => {
      service.definirValores({
        tipoSelecao: 'intervalo',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31'
      });
      
      expect(service.tipoSelecao()).toBe('intervalo');
      expect(service.dataInicio()).toBe('2024-01-01');
      expect(service.dataFim()).toBe('2024-01-31');
    });

    it('deve limpar todos os valores', () => {
      service.definirMes('03');
      service.definirAno('2024');
      service.definirDataInicio('2024-01-01');
      
      service.limparValores();
      
      expect(service.mesSelecionado()).toBe('');
      expect(service.anoSelecionado()).toBe('');
      expect(service.dataInicio()).toBe('');
      expect(service.dataFim()).toBe('');
    });
  });

  describe('Validação de Formulário', () => {
    it('deve retornar true para formulário válido com mês', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ valido: true, mensagem: '' });
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.formularioInvalido()).toBe(false);
    });

    it('deve retornar false para formulário inválido com mês', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ 
        valido: false, 
        mensagem: 'Período fora do histórico',
        codigo: 'PERIODO_FORA_HISTORICO'
      });
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.formularioInvalido()).toBe(true);
    });

    it('deve retornar true para formulário válido com intervalo', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ valido: true, mensagem: '' });
      
      service.definirTipoSelecao('intervalo');
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.formularioInvalido()).toBe(false);
    });

    it('deve retornar false para formulário inválido com intervalo', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ 
        valido: false, 
        mensagem: 'Intervalo maior que 90 dias',
        codigo: 'INTERVALO_MAIOR_90_DIAS'
      });
      
      service.definirTipoSelecao('intervalo');
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.formularioInvalido()).toBe(true);
    });
  });

  describe('Validação de Intervalo', () => {
    it('deve retornar false para intervalo válido', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ valido: true, mensagem: '' });
      
      service.definirTipoSelecao('intervalo');
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.intervaloInvalido()).toBe(false);
    });

    it('deve retornar true para intervalo inválido', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ 
        valido: false, 
        mensagem: 'Intervalo maior que 90 dias',
        codigo: 'INTERVALO_MAIOR_90_DIAS'
      });
      
      service.definirTipoSelecao('intervalo');
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.intervaloInvalido()).toBe(true);
    });

    it('deve retornar false quando tipo não é intervalo', () => {
      service.definirTipoSelecao('mes');
      
      expect(service.intervaloInvalido()).toBe(false);
    });
  });

  describe('Validação de Mês', () => {
    it('deve retornar false para mês válido', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ valido: true, mensagem: '' });
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.mesInvalido()).toBe(false);
    });

    it('deve retornar true para mês inválido', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ 
        valido: false, 
        mensagem: 'Período fora do histórico',
        codigo: 'PERIODO_FORA_HISTORICO'
      });
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.mesInvalido()).toBe(true);
    });

    it('deve retornar false quando tipo não é mês', () => {
      service.definirTipoSelecao('intervalo');
      
      expect(service.mesInvalido()).toBe(false);
    });
  });

  describe('Validação de Campo', () => {
    it('deve validar campo mês', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ valido: true, mensagem: '' });
      
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.validarCampo('mes')).toBe(true);
    });

    it('deve validar campo ano', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ valido: true, mensagem: '' });
      
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.validarCampo('ano')).toBe(true);
    });

    it('deve validar campo dataInicio', () => {
      mockValidadorPeriodoService.validarLimiteHistorico.mockReturnValue(true);
      
      service.definirDataInicio('2024-01-01');
      
      expect(service.validarCampo('dataInicio')).toBe(true);
    });

    it('deve validar campo dataFim', () => {
      mockValidadorPeriodoService.validarLimiteHistorico.mockReturnValue(true);
      
      service.definirDataFim('2024-01-31');
      
      expect(service.validarCampo('dataFim')).toBe(true);
    });
  });

  describe('Validação de Data', () => {
    it('deve retornar true para data válida', () => {
      mockValidadorPeriodoService.validarLimiteHistorico.mockReturnValue(true);
      
      const resultado = service.validarData('2024-01-01');
      
      expect(resultado).toBe(true);
    });

    it('deve retornar false para data inválida', () => {
      mockValidadorPeriodoService.validarLimiteHistorico.mockReturnValue(false);
      
      const resultado = service.validarData('2024-01-01');
      
      expect(resultado).toBe(false);
    });

    it('deve retornar false para data vazia', () => {
      const resultado = service.validarData('');
      
      expect(resultado).toBe(false);
    });
  });

  describe('Formatação', () => {
    it('deve formatar período de mês', () => {
      mockSelecaoPeriodoService.formatarPeriodo.mockReturnValue('Março/2024');
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.periodoFormatado()).toBe('Março/2024');
    });

    it('deve formatar período de intervalo', () => {
      mockSelecaoPeriodoService.formatarIntervalo.mockReturnValue('01/01/2024 - 31/01/2024');
      
      service.definirTipoSelecao('intervalo');
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.periodoFormatado()).toBe('01/01/2024 - 31/01/2024');
    });

    it('deve retornar string vazia quando não há dados', () => {
      service.definirTipoSelecao('mes');
      
      expect(service.periodoFormatado()).toBe('');
    });
  });

  describe('Mensagens de Erro', () => {
    it('deve retornar mensagem de erro para mês inválido', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ 
        valido: false, 
        mensagem: 'Período deve estar dentro de 12 meses (passado ou futuro)',
        codigo: 'PERIODO_FORA_HISTORICO'
      });
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.mensagemErro()).toBe('Período deve estar dentro de 12 meses (passado ou futuro)');
    });

    it('deve retornar mensagem de erro para intervalo inválido', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ 
        valido: false, 
        mensagem: 'Intervalo não pode ser superior a 90 dias',
        codigo: 'INTERVALO_MAIOR_90_DIAS'
      });
      
      service.definirTipoSelecao('intervalo');
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.mensagemErro()).toBe('Intervalo não pode ser superior a 90 dias');
    });

    it('deve retornar mensagem padrão quando não há erros específicos', () => {
      service.definirTipoSelecao('mes');
      
      expect(service.mensagemErro()).toBe('Por favor, preencha todos os campos obrigatórios');
    });
  });

  describe('Estado Completo', () => {
    it('deve retornar estado completo', () => {
      mockValidadorPeriodoService.validarPeriodoCompleto.mockReturnValue({ valido: true, mensagem: '' });
      mockSelecaoPeriodoService.formatarPeriodo.mockReturnValue('Março/2024');
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      const estado = service.obterEstado();
      
      expect(estado).toEqual({
        tipoSelecao: 'mes',
        mesSelecionado: '03',
        anoSelecionado: '2024',
        dataInicio: '',
        dataFim: '',
        valido: true,
        erro: 'Por favor, preencha todos os campos obrigatórios',
        periodoFormatado: 'Março/2024'
      });
    });
  });

  describe('Datas de Constraint', () => {
    it('deve obter data mínima', () => {
      const dataMinima = new Date('2023-01-01');
      mockSelecaoPeriodoService.obterDataLimiteHistorico.mockReturnValue(dataMinima);
      
      const resultado = service.obterDataMinima();
      
      expect(resultado).toEqual(new Date(2023, 0, 1));
    });

    it('deve obter data máxima', () => {
      const dataMaxima = new Date('2024-12-31');
      mockSelecaoPeriodoService.obterDataMaxima.mockReturnValue(dataMaxima);
      
      const resultado = service.obterDataMaxima();
      
      expect(resultado).toEqual(new Date(2024, 11, 31));
    });

    it('deve calcular data mínima para fim baseada na data de início', () => {
      const dataMinima = new Date('2023-01-01');
      mockSelecaoPeriodoService.obterDataLimiteHistorico.mockReturnValue(dataMinima);
      
      service.definirDataInicio('2024-01-15');
      
      const resultado = service.obterDataMinimaFim();
      
      expect(resultado).toEqual(new Date(2024, 0, 15));
    });

    it('deve calcular data máxima para fim baseada no limite de 90 dias', () => {
      const dataMaxima = new Date('2024-12-31');
      mockSelecaoPeriodoService.obterDataMaxima.mockReturnValue(dataMaxima);
      
      service.definirDataInicio('2024-01-01');
      
      const resultado = service.obterDataMaximaFim();
      
      // 90 dias após 01/01/2024 = 31/03/2024
      expect(resultado).toEqual(new Date(2024, 2, 31));
    });
  });
});
