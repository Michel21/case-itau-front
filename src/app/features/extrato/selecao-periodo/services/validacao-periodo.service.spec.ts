import { TestBed } from '@angular/core/testing';
import { ValidacaoPeriodoService } from './validacao-periodo.service';
import { SelecaoPeriodoService } from '../selecao-periodo.service';

describe('ValidacaoPeriodoService', () => {
  let service: ValidacaoPeriodoService;
  let mockSelecaoPeriodoService: jest.Mocked<SelecaoPeriodoService>;

  beforeEach(() => {
    const mockService = {
      validarIntervaloDatas: jest.fn(),
      validarPeriodo: jest.fn(),
      validarLimiteHistorico: jest.fn(),
      formatarPeriodo: jest.fn(),
      formatarIntervalo: jest.fn(),
      obterDataLimiteHistorico: jest.fn(),
      obterDataMaxima: jest.fn(),
      obterPeriodoAtual: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ValidacaoPeriodoService,
        { provide: SelecaoPeriodoService, useValue: mockService }
      ]
    });

    service = TestBed.inject(ValidacaoPeriodoService);
    mockSelecaoPeriodoService = TestBed.inject(SelecaoPeriodoService) as jest.Mocked<SelecaoPeriodoService>;
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
      mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(true);
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.formularioInvalido()).toBe(false);
    });

    it('deve retornar false para formulário inválido com mês', () => {
      mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(false);
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.formularioInvalido()).toBe(true);
    });

    it('deve retornar true para formulário válido com intervalo', () => {
      mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(true);
      
      service.definirTipoSelecao('intervalo');
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.formularioInvalido()).toBe(false);
    });

    it('deve retornar false para formulário inválido com intervalo', () => {
      mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(false);
      
      service.definirTipoSelecao('intervalo');
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.formularioInvalido()).toBe(true);
    });
  });

  describe('Validação de Intervalo', () => {
    it('deve retornar false para intervalo válido', () => {
      mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(true);
      
      service.definirTipoSelecao('intervalo');
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.intervaloInvalido()).toBe(false);
    });

    it('deve retornar true para intervalo inválido', () => {
      mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(false);
      
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
      mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(true);
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.mesInvalido()).toBe(false);
    });

    it('deve retornar true para mês inválido', () => {
      mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(false);
      
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
      mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(true);
      
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.validarCampo('mes')).toBe(true);
    });

    it('deve validar campo ano', () => {
      mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(true);
      
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.validarCampo('ano')).toBe(true);
    });

    it('deve validar campo dataInicio', () => {
      mockSelecaoPeriodoService.validarLimiteHistorico.mockReturnValue(true);
      
      service.definirDataInicio('2024-01-01');
      
      expect(service.validarCampo('dataInicio')).toBe(true);
    });

    it('deve validar campo dataFim', () => {
      mockSelecaoPeriodoService.validarLimiteHistorico.mockReturnValue(true);
      
      service.definirDataFim('2024-01-31');
      
      expect(service.validarCampo('dataFim')).toBe(true);
    });
  });

  describe('Validação de Data', () => {
    it('deve retornar true para data válida', () => {
      mockSelecaoPeriodoService.validarLimiteHistorico.mockReturnValue(true);
      
      const resultado = service.validarData('2024-01-01');
      
      expect(resultado).toBe(true);
    });

    it('deve retornar false para data inválida', () => {
      mockSelecaoPeriodoService.validarLimiteHistorico.mockReturnValue(false);
      
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
      mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(false);
      
      service.definirTipoSelecao('mes');
      service.definirMes('03');
      service.definirAno('2024');
      
      expect(service.mensagemErro()).toBe('O mês selecionado está fora do limite de 12 meses (passado ou futuro)');
    });

    it('deve retornar mensagem de erro para intervalo inválido', () => {
      mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(false);
      
      service.definirTipoSelecao('intervalo');
      service.definirDataInicio('2024-01-01');
      service.definirDataFim('2024-01-31');
      
      expect(service.mensagemErro()).toBe('O intervalo selecionado não pode ser superior a 90 dias');
    });

    it('deve retornar mensagem padrão quando não há erros específicos', () => {
      service.definirTipoSelecao('mes');
      
      expect(service.mensagemErro()).toBe('Por favor, preencha todos os campos obrigatórios');
    });
  });

  describe('Estado Completo', () => {
    it('deve retornar estado completo', () => {
      mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(true);
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
