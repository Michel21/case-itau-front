import { TestBed } from '@angular/core/testing';
import { WebViewDownloadService, DownloadOptions } from './webview-download.service';
import { WebViewUtils, detectWebViewType } from '../../webview.config';

// Mock das dependências
jest.mock('../../webview.config', () => ({
  WebViewUtils: {
    downloadFile: jest.fn(),
    openInNewTab: jest.fn(),
    canDownloadFiles: jest.fn(),
    hasNativeBridge: jest.fn()
  },
  detectWebViewType: jest.fn()
}));

describe('WebViewDownloadService', () => {
  let service: WebViewDownloadService;
  let mockWebViewUtils: jest.Mocked<typeof WebViewUtils>;
  let mockDetectWebViewType: jest.MockedFunction<typeof detectWebViewType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebViewDownloadService]
    });
    
    service = TestBed.inject(WebViewDownloadService);
    mockWebViewUtils = WebViewUtils as jest.Mocked<typeof WebViewUtils>;
    mockDetectWebViewType = detectWebViewType as jest.MockedFunction<typeof detectWebViewType>;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Console methods não são mockados - removidos conforme solicitado
    
    // Mock global objects
    global.URL = {
      createObjectURL: jest.fn().mockReturnValue('blob:url'),
      revokeObjectURL: jest.fn()
    } as any;
    
    global.window = {
      open: jest.fn().mockReturnValue({
        document: {
          write: jest.fn(),
          close: jest.fn()
        },
        print: jest.fn()
      })
    } as any;
    
    global.alert = jest.fn();
    global.navigator = {
      share: jest.fn()
    } as any;
    
    global.document = {
      createElement: jest.fn().mockReturnValue({
        href: '',
        download: '',
        style: { display: '' },
        click: jest.fn()
      }),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      }
    } as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('downloadFile', () => {
    
    const mockOptions: DownloadOptions = {
      fileName: 'test.txt',
      mimeType: 'text/plain',
      useWebViewBridge: false,
      fallbackToPrint: false,
      openInNewTab: false,
      shareFile: false
    };

    it('deve fazer download com sucesso em desktop', async () => {
      mockDetectWebViewType.mockReturnValue('desktop');
      mockWebViewUtils.downloadFile.mockReturnValue(true);

      const result = await service.downloadFile('test content', mockOptions);

      expect(result).toBe(true);
      expect(mockWebViewUtils.downloadFile).toHaveBeenCalledWith('test content', 'test.txt', 'text/plain');
    });

    it('deve usar compartilhamento em WebView quando disponível', async () => {
      mockDetectWebViewType.mockReturnValue('ios');
      const mockShare = jest.fn().mockResolvedValue(undefined);
      global.navigator.share = mockShare;

      const optionsWithShare: DownloadOptions = {
        ...mockOptions,
        shareFile: true
      };

      const result = await service.downloadFile('test content', optionsWithShare);

      expect(result).toBe(true);
      expect(mockShare).toHaveBeenCalled();
    });

    it('deve usar fallback para nova aba quando download falhar', async () => {
      mockDetectWebViewType.mockReturnValue('desktop');
      mockWebViewUtils.downloadFile.mockReturnValue(false);
      mockWebViewUtils.openInNewTab.mockImplementation(() => {});

      const optionsWithNewTab: DownloadOptions = {
        ...mockOptions,
        openInNewTab: true
      };

      const result = await service.downloadFile('test content', optionsWithNewTab);

      expect(result).toBe(true);
      expect(mockWebViewUtils.openInNewTab).toHaveBeenCalledWith('test content', 'text/plain');
    });

    it('deve usar fallback para impressão quando for PDF', async () => {
      mockDetectWebViewType.mockReturnValue('desktop');
      mockWebViewUtils.downloadFile.mockReturnValue(false);

      const optionsWithPrint: DownloadOptions = {
        ...mockOptions,
        mimeType: 'application/pdf',
        fallbackToPrint: true
      };

      const result = await service.downloadFile('pdf content', optionsWithPrint);

      expect(result).toBe(true);
    });

    it('deve mostrar erro quando todos os métodos falharem', async () => {
      mockDetectWebViewType.mockReturnValue('desktop');
      mockWebViewUtils.downloadFile.mockReturnValue(false);

      const result = await service.downloadFile('test content', mockOptions);

      expect(result).toBe(false);
      expect(global.alert).toHaveBeenCalledWith('Erro ao baixar test.txt. Tente novamente.');
    });

    it('deve tratar erros e retornar false', async () => {
      // Simular erro no try/catch do downloadFile
      mockDetectWebViewType.mockReturnValue('desktop');
      mockWebViewUtils.downloadFile.mockImplementation(() => {
        throw new Error('Erro simulado');
      });

      const result = await service.downloadFile('test content', mockOptions);

      expect(result).toBe(false);
    });
  });

  describe('downloadPDF', () => {
    
    const mockPdfBlob = new Blob(['pdf content'], { type: 'application/pdf' });

    it('deve compartilhar PDF em WebView quando possível', async () => {
      mockDetectWebViewType.mockReturnValue('ios');
      const mockShare = jest.fn().mockResolvedValue(undefined);
      global.navigator.share = mockShare;

      const result = await service.downloadPDF(mockPdfBlob, 'test.pdf');

      expect(result).toBe(true);
      expect(mockShare).toHaveBeenCalled();
      const shareCalls = mockShare.mock.calls;
      expect(shareCalls[0][0].title).toBe('Extrato Bancário PDF');
      expect(shareCalls[0][0].text).toBe('Compartilhando extrato bancário em PDF');
      expect(Array.isArray(shareCalls[0][0].files)).toBe(true);
    });

    it('deve fazer fallback para download quando compartilhamento falhar', async () => {
      mockDetectWebViewType.mockReturnValue('ios');
      const mockShare = jest.fn().mockRejectedValue(new Error('Compartilhamento falhou'));
      global.navigator.share = mockShare;

      const result = await service.downloadPDF(mockPdfBlob, 'test.pdf');

      expect(result).toBe(true);
    });

    it('deve fazer download padrão em desktop', async () => {
      mockDetectWebViewType.mockReturnValue('desktop');

      const result = await service.downloadPDF(mockPdfBlob, 'test.pdf');

      expect(result).toBe(true);
    });

    it('deve tratar erros e retornar false', async () => {
      // Simular erro no try/catch do downloadPDF
      mockDetectWebViewType.mockReturnValue('desktop');
      const originalNavigator = global.navigator;
      global.navigator = {} as any; // Remover share para forçar erro
      
      // Mock downloadBlob para simular erro
      const downloadBlobSpy = jest.spyOn(service as any, 'downloadBlob').mockImplementation(() => {
        throw new Error('Erro simulado');
      });

      const result = await service.downloadPDF(mockPdfBlob, 'test.pdf');

      expect(result).toBe(false);
      
      // Restaurar navigator original
      global.navigator = originalNavigator;
      downloadBlobSpy.mockRestore();
    });
  });

  describe('downloadCSV', () => {
    
    it('deve chamar downloadFile com opções corretas para CSV', async () => {
      const downloadFileSpy = jest.spyOn(service, 'downloadFile').mockResolvedValue(true);

      const result = await service.downloadCSV('csv,content', 'test.csv');

      expect(result).toBe(true);
      expect(downloadFileSpy).toHaveBeenCalledWith('csv,content', {
        fileName: 'test.csv',
        mimeType: 'text/csv;charset=utf-8',
        useWebViewBridge: true,
        fallbackToPrint: false,
        openInNewTab: true,
        shareFile: true
      });
    });
  });

  describe('downloadHTML', () => {
    
    it('deve chamar downloadFile com opções corretas para HTML', async () => {
      const downloadFileSpy = jest.spyOn(service, 'downloadFile').mockResolvedValue(true);

      const result = await service.downloadHTML('<html>content</html>', 'test.html');

      expect(result).toBe(true);
      expect(downloadFileSpy).toHaveBeenCalledWith('<html>content</html>', {
        fileName: 'test.html',
        mimeType: 'text/html;charset=utf-8',
        useWebViewBridge: true,
        fallbackToPrint: false,
        openInNewTab: true,
        shareFile: true
      });
    });
  });

  describe('Métodos de verificação', () => {
    
    it('deve verificar se pode fazer download', () => {
      mockWebViewUtils.canDownloadFiles.mockReturnValue(true);

      const result = service.canDownload();

      expect(result).toBe(true);
      expect(mockWebViewUtils.canDownloadFiles).toHaveBeenCalled();
    });

    it('deve verificar se tem bridge nativo', () => {
      mockWebViewUtils.hasNativeBridge.mockReturnValue(true);

      const result = service.hasNativeBridge();

      expect(result).toBe(true);
      expect(mockWebViewUtils.hasNativeBridge).toHaveBeenCalled();
    });

    it('deve verificar se pode compartilhar', () => {
      const result = service.canShare();

      expect(result).toBe(true);
    });

    it('deve retornar false quando navigator.share não existir', () => {
      const originalNavigator = global.navigator;
      delete (global.navigator as any).share;

      const result = service.canShare();

      expect(result).toBe(false);
      
      // Restaurar navigator original
      global.navigator = originalNavigator;
    });
  });

  describe('Métodos privados', () => {
    
    describe('shareFile', () => {
      
      it('deve compartilhar arquivo com sucesso', () => {
        const mockShare = jest.fn().mockResolvedValue(undefined);
        global.navigator.share = mockShare;

        const options: DownloadOptions = {
          fileName: 'test.txt',
          mimeType: 'text/plain'
        };

        // Acessar método privado via any
        (service as any).shareFile('test content', options);

        expect(mockShare).toHaveBeenCalled();
        const shareCalls = mockShare.mock.calls;
        expect(shareCalls[0][0].title).toBe('Extrato Bancário');
        expect(shareCalls[0][0].text).toBe('Compartilhando test.txt');
        expect(Array.isArray(shareCalls[0][0].files)).toBe(true);
      });

      it('deve fazer fallback para download quando compartilhamento falhar', () => {
        const mockShare = jest.fn().mockRejectedValue(new Error('Compartilhamento falhou'));
        global.navigator.share = mockShare;
        mockWebViewUtils.downloadFile.mockReturnValue(true);

        const options: DownloadOptions = {
          fileName: 'test.txt',
          mimeType: 'text/plain'
        };

        (service as any).shareFile('test content', options);

        // Aguardar resolução da Promise
        setTimeout(() => {
          expect(mockWebViewUtils.downloadFile).toHaveBeenCalledWith('test content', 'test.txt', 'text/plain');
        }, 0);
      });
    });

    describe('downloadBlob', () => {
      
      it('deve fazer download de blob com sucesso', () => {
        const mockBlob = new Blob(['content'], { type: 'text/plain' });
        
        // Mock document.createElement corretamente
        const createElementSpy = jest.spyOn(global.document, 'createElement').mockReturnValue({
          href: '',
          download: '',
          style: { display: '' },
          click: jest.fn()
        } as any);
        jest.useFakeTimers();

        (service as any).downloadBlob(mockBlob, 'test.txt');

        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
        expect(createElementSpy).toHaveBeenCalledWith('a');

        // Avançar timer para verificar revokeObjectURL
        jest.advanceTimersByTime(1000);
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');

        jest.useRealTimers();
        createElementSpy.mockRestore();
      });

      it('deve fazer fallback para nova aba quando download falhar', () => {
        const mockBlob = new Blob(['content'], { type: 'text/plain' });
        const createElementSpy = jest.spyOn(global.document, 'createElement').mockImplementation(() => {
          throw new Error('Erro simulado');
        });
        const windowOpenSpy = jest.spyOn(global.window, 'open');

        (service as any).downloadBlob(mockBlob, 'test.txt');

        expect(windowOpenSpy).toHaveBeenCalledWith('blob:url', '_blank');
        
        createElementSpy.mockRestore();
        windowOpenSpy.mockRestore();
      });
    });

    describe('printContent', () => {
      
      it('deve imprimir conteúdo com sucesso', () => {
        const mockPrintWindow = {
          document: {
            write: jest.fn(),
            close: jest.fn()
          },
          print: jest.fn()
        };
        
        const windowOpenSpy = jest.spyOn(global.window, 'open').mockReturnValue(mockPrintWindow as any);

        (service as any).printContent('<html>content</html>');

        expect(windowOpenSpy).toHaveBeenCalledWith('', '_blank');
        expect(mockPrintWindow.document.write).toHaveBeenCalledWith('<html>content</html>');
        expect(mockPrintWindow.document.close).toHaveBeenCalled();
        expect(mockPrintWindow.print).toHaveBeenCalled();
        
        windowOpenSpy.mockRestore();
      });

      it('deve tratar erro quando window.open falhar', () => {
        const windowOpenSpy = jest.spyOn(global.window, 'open').mockReturnValue(null);

        expect(() => {
          (service as any).printContent('<html>content</html>');
        }).not.toThrow();
        
        windowOpenSpy.mockRestore();
      });
    });

    describe('showDownloadError', () => {
      
      it('deve mostrar erro específico para iOS', () => {
        mockDetectWebViewType.mockReturnValue('ios');

        (service as any).showDownloadError('test.txt');

        expect(global.alert).toHaveBeenCalledWith('Para baixar test.txt no iOS, use o botão de compartilhar do navegador.');
      });

      it('deve mostrar erro específico para Android', () => {
        mockDetectWebViewType.mockReturnValue('android');

        (service as any).showDownloadError('test.pdf');

        expect(global.alert).toHaveBeenCalledWith('Para baixar test.pdf no Android, use o botão de compartilhar do navegador.');
      });

      it('deve mostrar erro genérico para desktop', () => {
        mockDetectWebViewType.mockReturnValue('desktop');

        (service as any).showDownloadError('test.csv');

        expect(global.alert).toHaveBeenCalledWith('Erro ao baixar test.csv. Tente novamente.');
      });
    });
  });

  describe('Integração e Edge Cases', () => {
    
    it('deve funcionar com diferentes tipos de WebView', async () => {
      const testCases = [
        { type: 'ios', expected: true },
        { type: 'android', expected: true },
        { type: 'desktop', expected: true }
      ];

      for (const testCase of testCases) {
        mockDetectWebViewType.mockReturnValue(testCase.type as any);
        mockWebViewUtils.downloadFile.mockReturnValue(true);

        const result = await service.downloadFile('content', {
          fileName: 'test.txt',
          mimeType: 'text/plain'
        });

        expect(result).toBe(testCase.expected);
      }
    });

    it('deve lidar com diferentes tipos de MIME', async () => {
      const mimeTypes = [
        'text/plain',
        'text/csv',
        'text/html',
        'application/pdf',
        'application/json'
      ];

      for (const mimeType of mimeTypes) {
        mockDetectWebViewType.mockReturnValue('desktop');
        mockWebViewUtils.downloadFile.mockReturnValue(true);

        const result = await service.downloadFile('content', {
          fileName: 'test',
          mimeType
        });

        expect(result).toBe(true);
        expect(mockWebViewUtils.downloadFile).toHaveBeenCalledWith('content', 'test', mimeType);
      }
    });

    it('deve ser injetável como serviço', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(WebViewDownloadService);
    });
  });
});
