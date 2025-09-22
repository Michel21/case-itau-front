import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ExtratoPdfComponent } from './extrato-pdf.component';
import { WebViewDownloadService } from '../../shared/services/webview-download.service';
import { detectWebViewType } from '../../webview.config';
import { MOCK_EXTRATO_DATA, RENDA_FIXA_DATA } from '../../../../data/mock-extrato.data';
import { ExtratoDados, RendaFixaData } from '../../../../types/extrato.types';

// Mock das dependências
jest.mock('../../webview.config', () => ({
  detectWebViewType: jest.fn()
}));

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    addPage: jest.fn(),
    output: jest.fn(() => 'mock-pdf-data'),
    save: jest.fn(),
    internal: {
      pageSize: {
        getWidth: jest.fn(() => 210)
      }
    }
  }));
});

jest.mock('html2canvas', () => {
  return jest.fn(() => Promise.resolve({
    toDataURL: jest.fn(() => 'data:image/png;base64,mock-image-data'),
    height: 1000,
    width: 1000
  }));
});

describe('ExtratoPdfComponent', () => {
  let component: ExtratoPdfComponent;
  let fixture: ComponentFixture<ExtratoPdfComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockWebViewDownloadService: jest.Mocked<WebViewDownloadService>;

  beforeAll(async () => {
    const mockRouterSpy = {
      navigate: jest.fn()
    };

    const mockWebViewDownloadServiceSpy = {
      canDownload: jest.fn(),
      canShare: jest.fn(),
      downloadPDF: jest.fn(),
      downloadCSV: jest.fn(),
      downloadHTML: jest.fn()
    };

    // Configurar DOM para testes
    document.body.innerHTML = '<div id="root"></div>';

    await TestBed.configureTestingModule({
      imports: [ExtratoPdfComponent],
      providers: [
        { provide: Router, useValue: mockRouterSpy },
        { provide: WebViewDownloadService, useValue: mockWebViewDownloadServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ExtratoPdfComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jest.Mocked<Router>;
    mockWebViewDownloadService = TestBed.inject(WebViewDownloadService) as jest.Mocked<WebViewDownloadService>;
  });

  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Limpar DOM após todos os testes
    document.body.innerHTML = '';
  });

  describe('Inicialização', () => {
    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve inicializar com dados mock quando ngOnInit é chamado', () => {
      component.ngOnInit();
      
      expect(component.dadosAtuais()).toEqual(MOCK_EXTRATO_DATA);
      expect(component.rendaFixaData()).toEqual(RENDA_FIXA_DATA);
      expect(component.config()).toBeTruthy();
    });

    it('deve inicializar com dados de entrada quando extratoData é fornecido', () => {
      const mockExtratoData: ExtratoDados = {
        ...MOCK_EXTRATO_DATA,
        empresa: 'Teste Empresa'
      };
      
      component.extratoData = mockExtratoData;
      component.ngOnInit();
      
      expect(component.dadosAtuais()).toEqual(mockExtratoData);
    });

    it('deve detectar capacidades do WebView', () => {
      (detectWebViewType as jest.Mock).mockReturnValue('ios');
      mockWebViewDownloadService.canDownload.mockReturnValue(true);
      mockWebViewDownloadService.canShare.mockReturnValue(false);

      component.ngOnInit();

      expect(component.webViewType()).toBe('ios');
      expect(component.isWebView()).toBe(true);
      expect(component.canDownload()).toBe(true);
      expect(component.canShare()).toBe(false);
    });
  });

  describe('Signals e Computed', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('deve calcular temSaldoAnterior corretamente', () => {
      expect(component.temSaldoAnterior()).toBe(true);
    });

    it('deve calcular temAplicacoes corretamente', () => {
      expect(component.temAplicacoes()).toBe(true);
    });

    it('deve calcular temResgates corretamente', () => {
      expect(component.temResgates()).toBe(true);
    });

    it('deve calcular temSaldoFinal corretamente', () => {
      expect(component.temSaldoFinal()).toBe(true);
    });
  });

  describe('Métodos de Formatação', () => {
    it('deve formatar moeda corretamente', () => {
      expect(component.formatarMoeda(1234.56)).toBe('1.234,56');
      expect(component.formatarMoeda(0)).toBe('0,00');
      expect(component.formatarMoeda(undefined)).toBe('0,00');
      expect(component.formatarMoeda(null as any)).toBe('0,00');
    });

    it('deve obter data de geração', () => {
      const data = component.getDataGeracao();
      expect(data).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve obter hora de geração', () => {
      const hora = component.getHoraGeracao();
      expect(hora).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('deve obter número de controle', () => {
      const numero = component.getNumeroControle();
      expect(numero).toMatch(/CTRL\d{8}/);
    });
  });

  describe('Métodos de Geração de PDF', () => {
    beforeEach(() => {
      // Mock do window.print
      window.print = jest.fn();
    });

    it('deve gerar PDF simples', async () => {
      await component.gerarPDF();
      
      expect(window.print).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });

    it('deve gerar PDF corporativo com sucesso', async () => {
      // Mock do DOM
      const mockElement = document.createElement('div');
      mockElement.className = 'extrato-container';
      Object.defineProperty(mockElement, 'offsetHeight', { value: 1000, writable: true });
      
      const mockClone = document.createElement('div');
      mockClone.style.position = 'absolute';
      Object.defineProperty(mockClone, 'offsetHeight', { value: 1000, writable: true });
      
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);
      jest.spyOn(mockElement, 'cloneNode').mockReturnValue(mockClone);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockClone);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockClone);
      
      mockWebViewDownloadService.downloadPDF.mockResolvedValue(true);

      await component.gerarPDFCorporativo();

      expect(component.isLoading()).toBe(false);
      expect(mockWebViewDownloadService.downloadPDF).toHaveBeenCalled();
    });

    it('deve lidar com erro ao gerar PDF corporativo quando elemento não é encontrado', async () => {
      jest.spyOn(document, 'querySelector').mockReturnValue(null);

      await component.gerarPDFCorporativo();

      expect(component.error()).toBe('Erro ao gerar PDF corporativo. Tente novamente.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Métodos de Geração de CSV', () => {
    it('deve gerar CSV com sucesso', async () => {
      mockWebViewDownloadService.downloadCSV.mockResolvedValue(true);

      await component.converterParaCSV();

      expect(component.isLoading()).toBe(false);
      expect(mockWebViewDownloadService.downloadCSV).toHaveBeenCalled();
    });

    it('deve usar fallback quando download CSV via WebView falha', async () => {
      // Mock do DOM para fallback
      const mockLink = document.createElement('a');
      mockLink.click = jest.fn();
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      // Mock URL global
      (global as any).URL = {
        createObjectURL: jest.fn(() => 'mock-url'),
        revokeObjectURL: jest.fn()
      };
      
      mockWebViewDownloadService.downloadCSV.mockResolvedValue(false);

      await component.converterParaCSV();

      expect(component.isLoading()).toBe(false);
    });

    it('deve lidar com erro ao gerar CSV', async () => {
      mockWebViewDownloadService.downloadCSV.mockRejectedValue(new Error('CSV Error'));

      await component.converterParaCSV();

      expect(component.error()).toBe('Erro ao gerar CSV. Tente novamente.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Métodos de Geração de HTML', () => {
    it('deve gerar HTML com sucesso', async () => {
      const mockElement = document.createElement('div');
      mockElement.className = 'extrato-container';
      mockElement.outerHTML = '<div class="extrato-container">Test</div>';
      
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);
      mockWebViewDownloadService.downloadHTML.mockResolvedValue(true);

      await component.gerarHTML();

      expect(component.isLoading()).toBe(false);
      expect(mockWebViewDownloadService.downloadHTML).toHaveBeenCalled();
    });

    it('deve lidar com erro quando elemento não é encontrado', async () => {
      jest.spyOn(document, 'querySelector').mockReturnValue(null);

      await component.gerarHTML();

      expect(component.error()).toBe('Erro ao gerar HTML. Tente novamente.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Métodos Privados', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('deve verificar se há itens corretamente', () => {
      expect(component['temItens']([])).toBe(false);
      expect(component['temItens']([1, 2, 3])).toBe(true);
      expect(component['temItens'](null as any)).toBe(null); // null && ... retorna null
      expect(component['temItens'](undefined as any)).toBe(undefined); // undefined && ... retorna undefined
    });

    it('deve gerar número de controle', () => {
      const numero = component['gerarNumeroControle']();
      expect(numero).toMatch(/CTRL\d{8}/);
    });

    it('deve obter largura da coluna corretamente', () => {
      expect(component['getColumnWidth'](0)).toBe('80px');
      expect(component['getColumnWidth'](1)).toBe('80px');
      expect(component['getColumnWidth'](2)).toBe('80px');
      expect(component['getColumnWidth'](3)).toBe('60px');
      expect(component['getColumnWidth'](4)).toBe('70px');
      expect(component['getColumnWidth'](10)).toBe('70px');
      expect(component['getColumnWidth'](15)).toBe('70px');
    });
  });

  describe('Métodos de CSV', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('deve gerar conteúdo CSV corretamente', () => {
      const csvContent = component['gerarConteudoCSV']();
      
      expect(csvContent).toContain('Seção');
      expect(csvContent).toContain('Data aplic.');
      expect(csvContent).toContain('Valor princ. (BRL)');
    });

    it('deve converter item para CSV', () => {
      const item = {
        dataAplicacao: '01/01/2024',
        dataVencimento: '31/01/2024',
        dataResgate: '31/01/2024',
        taxa: 5.5,
        valorPrincipal: 1000,
        valorBruto: 1050,
        rendaTotal: 50,
        iof: 0,
        irrf: 0,
        valorLiquido: 1050,
        rendaBruta: 50
      };
      
      const csv = component['itemParaCSV'](item, 'Teste');
      expect(csv).toContain('Teste');
      expect(csv).toContain('01/01/2024');
      expect(csv).toContain('1.000,00');
    });

    it('deve converter totais para CSV', () => {
      const total = {
        valorPrincipal: 1000,
        valorBruto: 1050,
        rendaTotal: 50,
        iof: 0,
        irrf: 0,
        valorLiquido: 1050,
        rendaBruta: 50
      };
      
      const csv = component['totaisParaCSV'](total, 'Teste');
      expect(csv).toContain('Teste - Total');
      expect(csv).toContain('1.000,00');
    });
  });

  describe('Métodos de Navegação', () => {
    it('deve voltar para home', () => {
      component.voltarParaHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Lifecycle', () => {
    it('deve limpar recursos no ngOnDestroy', () => {
      const destroySpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Métodos de CSS', () => {
    it('deve retornar estilos CSS', () => {
      const styles = component['getCSSStyles']();
      
      expect(styles).toContain('body {');
      expect(styles).toContain('.extrato-container {');
      expect(styles).toContain('.btn {');
      expect(styles).toContain('font-family: Arial, sans-serif;');
    });
  });

  describe('Cenários de Erro', () => {
    it('deve lidar com erro ao gerar PDF simples', async () => {
      window.print = jest.fn(() => {
        throw new Error('Print error');
      });

      await component.gerarPDF();

      expect(component.error()).toBe('Erro ao gerar PDF. Tente novamente.');
      expect(component.isLoading()).toBe(false);
    });

    it('deve lidar com erro ao gerar PDF corporativo', async () => {
      jest.spyOn(document, 'querySelector').mockReturnValue(null);

      await component.gerarPDFCorporativo();

      expect(component.error()).toBe('Erro ao gerar PDF corporativo. Tente novamente.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Configuração do Componente', () => {
    it('deve configurar dados corretamente no ngOnInit', () => {
      component.ngOnInit();
      
      const config = component.config();
      expect(config).toBeTruthy();
      expect(config.titulo).toBe('Extrato Bancário');
      expect(config.empresa).toBe('Teste Empresa');
      expect(config.agencia).toBe(MOCK_EXTRATO_DATA.agencia);
    });
  });

  describe('Métodos de Estado', () => {
    it('deve definir estado de loading corretamente', async () => {
      expect(component.isLoading()).toBe(false);
      
      component.gerarPDF();
      
      expect(component.isLoading()).toBe(false);
    });

    it('deve definir estado de erro corretamente', async () => {
      // Limpar estado de erro anterior se houver
      component.error.set(null);
      expect(component.error()).toBe(null);
      
      window.print = jest.fn(() => {
        throw new Error('Print error');
      });
      
      await component.gerarPDF();
      
      expect(component.error()).toBe('Erro ao gerar PDF. Tente novamente.');
    });
  });
});