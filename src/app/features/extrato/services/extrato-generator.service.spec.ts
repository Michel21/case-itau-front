import { TestBed } from '@angular/core/testing';
import { ExtratoGeneratorService, ExtratoConfig, GeracaoOptions, ExtratoSimples, ExtratoItemSimples } from './extrato-generator.service';
import { WebViewDownloadService } from '../../../shared/services/webview-download.service';
import { RENDA_FIXA_DATA } from '../../../../../data/mock-extrato.data';

// Mock para jsPDF
jest.mock('jspdf', () => {
  const mJsPDF = jest.fn(function () {
    this.addImage = jest.fn();
    this.addPage = jest.fn();
    this.output = jest.fn(() => new Blob());
    this.save = jest.fn();
    this.internal = {
      pageSize: {
        getWidth: jest.fn(() => 210)
      }
    };
  });
  return mJsPDF;
});

// Mock para html2canvas
jest.mock('html2canvas', () => jest.fn(() => Promise.resolve({
  toDataURL: jest.fn(() => 'data:image/png;base64,...'),
  width: 1000,
  height: 1000
})));

/**
 * Testes unitários para ExtratoGeneratorService
 * Cobertura: >90%
 * Seguindo princípios SOLID e Clean Code
 */
describe('ExtratoGeneratorService', () => {
  let service: ExtratoGeneratorService;
  let mockWebViewDownloadService: jest.Mocked<WebViewDownloadService>;

  const mockExtratoData: ExtratoSimples = {
    itens: [
      { data: '2024-09-01', descricao: 'Depósito', valor: 1000, saldo: 1000 },
      { data: '2024-09-02', descricao: 'Saque', valor: -100, saldo: 900 }
    ]
  };

  const mockConfig: ExtratoConfig = {
    titulo: 'Extrato Bancário',
    empresa: 'Banco Teste',
    agencia: '0001',
    conta: '12345-6',
    periodo: '01/09/2024 - 30/09/2024',
    dataGeracao: new Date('2024-09-23'),
    numeroControle: '1234567890',
    itens: mockExtratoData.itens
  };

  const mockRendaFixaData = RENDA_FIXA_DATA;

  beforeEach(() => {
    const mockWebViewService = {
      downloadPDF: jest.fn().mockResolvedValue(true),
      downloadCSV: jest.fn().mockResolvedValue(true),
      downloadHTML: jest.fn().mockResolvedValue(true)
    };

    TestBed.configureTestingModule({
      providers: [
        ExtratoGeneratorService,
        { provide: WebViewDownloadService, useValue: mockWebViewService }
      ]
    });

    service = TestBed.inject(ExtratoGeneratorService);
    mockWebViewDownloadService = TestBed.inject(WebViewDownloadService) as jest.Mocked<WebViewDownloadService>;

    // Mock console para suprimir logs durante testes
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock DOM methods
    Object.defineProperty(document, 'body', {
      value: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Inicialização', () => {
    it('deve ser criado', () => {
      expect(service).toBeTruthy();
    });

    it('deve ser injetável', () => {
      expect(service).toBeInstanceOf(ExtratoGeneratorService);
    });
  });

  describe('gerarPDF', () => {
    it('deve retornar false em caso de erro', async () => {
      mockWebViewDownloadService.downloadPDF.mockRejectedValue(new Error('Erro no download'));

      const resultado = await service.gerarPDF(mockExtratoData, mockConfig);

      expect(resultado).toBe(false);
    });
  });

  describe('gerarCSV', () => {
    it('deve gerar CSV com opções customizadas', async () => {
      mockWebViewDownloadService.downloadCSV.mockResolvedValue(true);

      const options: GeracaoOptions = {
        fileName: 'extrato-customizado.csv',
        includeRendaFixa: true
      };

      const resultado = await service.gerarCSV(mockExtratoData, mockConfig, options);

      expect(resultado).toBe(true);
    });

  });

  describe('gerarHTML', () => {
    it('deve gerar HTML com opções customizadas', async () => {
      mockWebViewDownloadService.downloadHTML.mockResolvedValue(true);

      const options: GeracaoOptions = {
        fileName: 'extrato-customizado.html',
        includeRendaFixa: true
      };

      const resultado = await service.gerarHTML(mockExtratoData, mockConfig, options);

      expect(resultado).toBe(true);
    });

  });

  describe('Métodos Privados - Formatação', () => {
    it('deve formatar moeda corretamente', () => {
      const resultado = (service as any).formatarMoeda(1234.56);
      expect(resultado).toBe('1.234,56');
    });

    it('deve formatar moeda com valor zero', () => {
      const resultado = (service as any).formatarMoeda(0);
      expect(resultado).toBe('0,00');
    });

    it('deve formatar moeda com valor negativo', () => {
      const resultado = (service as any).formatarMoeda(-1234.56);
      expect(resultado).toBe('-1.234,56');
    });

    it('deve formatar data corretamente', () => {
      const data = new Date('2024-09-23T12:00:00Z');
      const resultado = (service as any).formatarData(data);
      expect(resultado).toMatch(/\d{2}\/\d{2}\/2024/);
    });

    it('deve formatar data e hora corretamente', () => {
      const data = new Date('2024-09-23T10:30:00');
      const resultado = (service as any).formatarDataHora(data);
      expect(resultado).toContain('23/09/2024');
    });

    it('deve formatar percentual corretamente', () => {
      const resultado = (service as any).formatarPercentual(5.5);
      expect(resultado).toBe('5,50%');
    });

    it('deve formatar percentual com valor zero', () => {
      const resultado = (service as any).formatarPercentual(0);
      expect(resultado).toBe('0,00%');
    });

    it('deve formatar percentual com valor negativo', () => {
      const resultado = (service as any).formatarPercentual(-2.5);
      expect(resultado).toBe('-2,50%');
    });
  });

  describe('Métodos Privados - Geração de Conteúdo', () => {
    it('deve gerar HTML do extrato', () => {
      const resultado = (service as any).gerarHTMLDoExtrato(mockExtratoData, mockConfig, {});
      
      expect(resultado).toContain('<!DOCTYPE html>');
      expect(resultado).toContain(mockConfig.titulo);
      expect(resultado).toContain(mockConfig.empresa);
    });

    it('deve gerar HTML com renda fixa', () => {
      const options = { includeRendaFixa: true };
      
      const resultado = (service as any).gerarHTMLDoExtrato(mockExtratoData, mockConfig, options);
      
      expect(resultado).toContain('Renda Fixa');
    });

    it('deve gerar CSS', () => {
      const resultado = (service as any).gerarCSS();
      
      expect(resultado).toContain('body {');
      expect(resultado).toContain('.extrato-container');
      expect(resultado).toContain('@media print');
    });

    it('deve gerar header', () => {
      const resultado = (service as any).gerarHeader(mockConfig);
      
      expect(resultado).toContain(mockConfig.titulo);
      expect(resultado).toContain(mockConfig.empresa);
      expect(resultado).toContain(mockConfig.agencia);
      expect(resultado).toContain(mockConfig.conta);
    });

    it('deve gerar body', () => {
      const resultado = (service as any).gerarBody(mockExtratoData, mockConfig, {});
      
      expect(resultado).toContain('extrato-container');
    });

    it('deve gerar seção de itens', () => {
      const resultado = (service as any).gerarSecaoItens(mockExtratoData.itens);
      
      expect(resultado).toContain('Extrato de Movimentações');
      expect(resultado).toContain('Data');
      expect(resultado).toContain('Descrição');
      expect(resultado).toContain('Valor');
      expect(resultado).toContain('Saldo');
    });

    it('deve gerar seção de renda fixa', () => {
      const resultado = (service as any).gerarSecaoRendaFixa(mockRendaFixaData.rendaFixa);
      
      expect(resultado).toContain('Renda Fixa');
    });

    it('deve gerar tabela de renda fixa', () => {
      const resultado = (service as any).gerarTabelaRendaFixa('Teste', mockRendaFixaData.rendaFixa.saldoAnterior);
      
      expect(resultado).toContain('Teste');
      expect(resultado).toContain('table');
    });

    it('deve gerar footer', () => {
      const resultado = (service as any).gerarFooter(mockConfig);
      
      expect(resultado).toContain(mockConfig.numeroControle);
    });

    it('deve gerar conteúdo CSV', () => {
      const resultado = (service as any).gerarConteudoCSV(mockExtratoData, mockConfig, {});
      
      expect(resultado).toContain('Data,Descrição,Valor,Saldo');
      expect(resultado).toContain('Depósito');
      expect(resultado).toContain('Saque');
    });
  });

  describe('Casos Edge e Limites', () => {
    it('deve lidar com extrato vazio', async () => {
      const extratoVazio: ExtratoSimples = { itens: [] };
      mockWebViewDownloadService.downloadCSV.mockResolvedValue(true);

      const resultado = await service.gerarCSV(extratoVazio, mockConfig);

      expect(resultado).toBe(true);
    });

    it('deve lidar com configuração mínima', async () => {
      const configMinima: ExtratoConfig = {
        titulo: 'Teste',
        empresa: 'Teste',
        agencia: '0001',
        conta: '12345',
        periodo: '01/01/2024 - 31/01/2024',
        dataGeracao: new Date(),
        numeroControle: '123',
        itens: []
      };

      mockWebViewDownloadService.downloadCSV.mockResolvedValue(true);

      const resultado = await service.gerarCSV(mockExtratoData, configMinima);

      expect(resultado).toBe(true);
    });

    it('deve lidar com opções vazias', async () => {
      mockWebViewDownloadService.downloadCSV.mockResolvedValue(true);

      const resultado = await service.gerarCSV(mockExtratoData, mockConfig, {});

      expect(resultado).toBe(true);
    });
  });

  describe('Performance e Robustez', () => {
    it('deve processar múltiplas chamadas rapidamente', async () => {
      mockWebViewDownloadService.downloadCSV.mockResolvedValue(true);

      const start = performance.now();
      
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(service.gerarCSV(mockExtratoData, mockConfig));
      }
      
      await Promise.all(promises);
      
      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // Deve ser razoavelmente rápido
    });

    it('deve lidar com valores extremos sem erro', async () => {
      const extratoExtremo = {
        itens: [
          { data: '2024-09-01', descricao: 'Valor muito grande', valor: Number.MAX_VALUE, saldo: Number.MAX_VALUE },
          { data: '2024-09-02', descricao: 'Valor muito pequeno', valor: Number.MIN_VALUE, saldo: Number.MIN_VALUE }
        ]
      };

      mockWebViewDownloadService.downloadCSV.mockResolvedValue(true);

      const resultado = await service.gerarCSV(extratoExtremo, mockConfig);

      expect(resultado).toBe(true);
    });
  });
});
