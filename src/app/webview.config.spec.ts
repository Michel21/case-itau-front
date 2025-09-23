import {
  WebViewConfig,
  defaultWebViewConfig,
  iOSWebViewConfig,
  androidWebViewConfig,
  detectWebViewType,
  getWebViewConfig,
  WebViewUtils
} from './webview.config';

/**
 * Testes unitários para webview.config.ts
 * Cobertura: configurações, detecção de plataforma e utilitários
 */
describe('WebView Configuration', () => {
  
  beforeEach(() => {
    // Limpar DOM antes de cada teste
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    
    // Mock console para suprimir logs durante testes
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Configurações de WebView', () => {
    
    it('deve ter configuração padrão válida', () => {
      expect(defaultWebViewConfig).toBeDefined();
      expect(defaultWebViewConfig.performance).toBeDefined();
      expect(defaultWebViewConfig.ui).toBeDefined();
      expect(defaultWebViewConfig.responsive).toBeDefined();
      expect(defaultWebViewConfig.accessibility).toBeDefined();
      expect(defaultWebViewConfig.download).toBeDefined();
    });

    it('deve ter configuração padrão com valores corretos', () => {
      expect(defaultWebViewConfig.performance.enableHardwareAcceleration).toBe(true);
      expect(defaultWebViewConfig.performance.reduceAnimations).toBe(true);
      expect(defaultWebViewConfig.performance.optimizeScrolling).toBe(true);
      expect(defaultWebViewConfig.performance.preventZoom).toBe(true);
      
      expect(defaultWebViewConfig.ui.headerHeight).toBe(70);
      expect(defaultWebViewConfig.ui.footerHeight).toBe(80);
      expect(defaultWebViewConfig.ui.scrollbarWidth).toBe(4);
      expect(defaultWebViewConfig.ui.animationDuration).toBe(200);
      expect(defaultWebViewConfig.ui.enableTouchFeedback).toBe(true);
      
      expect(defaultWebViewConfig.responsive.mobileBreakpoint).toBe(480);
      expect(defaultWebViewConfig.responsive.tabletBreakpoint).toBe(768);
      expect(defaultWebViewConfig.responsive.enableMobileOptimizations).toBe(true);
      
      expect(defaultWebViewConfig.accessibility.enableScreenReader).toBe(true);
      expect(defaultWebViewConfig.accessibility.enableKeyboardNavigation).toBe(true);
      expect(defaultWebViewConfig.accessibility.enableVoiceOver).toBe(true);
      
      expect(defaultWebViewConfig.download.enableFileDownload).toBe(true);
      expect(defaultWebViewConfig.download.useWebViewBridge).toBe(false);
      expect(defaultWebViewConfig.download.fallbackToPrint).toBe(true);
      expect(defaultWebViewConfig.download.maxFileSize).toBe(10 * 1024 * 1024);
      expect(defaultWebViewConfig.download.supportedFormats).toEqual(['pdf', 'csv', 'html']);
    });

    it('deve ter configuração iOS com valores específicos', () => {
      expect(iOSWebViewConfig.performance.enableHardwareAcceleration).toBe(true);
      expect(iOSWebViewConfig.performance.optimizeScrolling).toBe(true);
      expect(iOSWebViewConfig.ui.headerHeight).toBe(70);
      expect(iOSWebViewConfig.ui.animationDuration).toBe(150);
      expect(iOSWebViewConfig.download.useWebViewBridge).toBe(true);
      expect(iOSWebViewConfig.download.fallbackToPrint).toBe(true);
    });

    it('deve ter configuração Android com valores específicos', () => {
      expect(androidWebViewConfig.performance.enableHardwareAcceleration).toBe(true);
      expect(androidWebViewConfig.performance.reduceAnimations).toBe(false);
      expect(androidWebViewConfig.ui.headerHeight).toBe(70);
      expect(androidWebViewConfig.ui.animationDuration).toBe(250);
      expect(androidWebViewConfig.download.useWebViewBridge).toBe(true);
      expect(androidWebViewConfig.download.fallbackToPrint).toBe(true);
    });

    it('deve configurações iOS herdar da configuração padrão', () => {
      expect(iOSWebViewConfig.responsive.mobileBreakpoint).toBe(defaultWebViewConfig.responsive.mobileBreakpoint);
      expect(iOSWebViewConfig.accessibility.enableScreenReader).toBe(defaultWebViewConfig.accessibility.enableScreenReader);
    });

    it('deve configurações Android herdar da configuração padrão', () => {
      expect(androidWebViewConfig.responsive.tabletBreakpoint).toBe(defaultWebViewConfig.responsive.tabletBreakpoint);
      expect(androidWebViewConfig.accessibility.enableKeyboardNavigation).toBe(defaultWebViewConfig.accessibility.enableKeyboardNavigation);
    });
  });

  describe('detectWebViewType', () => {
    
    const originalUserAgent = navigator.userAgent;

    afterEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        writable: true
      });
    });

    it('deve detectar iOS quando user agent contém iPhone', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        writable: true
      });
      
      expect(detectWebViewType()).toBe('ios');
    });

    it('deve detectar iOS quando user agent contém iPad', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
        writable: true
      });
      
      expect(detectWebViewType()).toBe('ios');
    });

    it('deve detectar iOS quando user agent contém iPod', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_7_1 like Mac OS X)',
        writable: true
      });
      
      expect(detectWebViewType()).toBe('ios');
    });

    it('deve detectar Android quando user agent contém android', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        writable: true
      });
      
      expect(detectWebViewType()).toBe('android');
    });

    it('deve detectar desktop para outros user agents', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true
      });
      
      expect(detectWebViewType()).toBe('desktop');
    });

    it('deve ser case insensitive para detecção', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (IPHONE; CPU iPhone OS 14_7_1 like Mac OS X)',
        writable: true
      });
      
      expect(detectWebViewType()).toBe('ios');
    });
  });

  describe('getWebViewConfig', () => {
    
    const originalUserAgent = navigator.userAgent;

    afterEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        writable: true
      });
    });

    it('deve retornar configuração iOS para dispositivos iOS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        writable: true
      });
      
      const config = getWebViewConfig();
      expect(config).toEqual(iOSWebViewConfig);
    });

    it('deve retornar configuração Android para dispositivos Android', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        writable: true
      });
      
      const config = getWebViewConfig();
      expect(config).toEqual(androidWebViewConfig);
    });

    it('deve retornar configuração padrão para desktop', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true
      });
      
      const config = getWebViewConfig();
      expect(config).toEqual(defaultWebViewConfig);
    });
  });

  describe('WebViewUtils', () => {
    
    describe('preventZoom', () => {
      
      it('deve adicionar event listeners para prevenir zoom', () => {
        const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
        
        WebViewUtils.preventZoom();

        expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
        const calls = addEventListenerSpy.mock.calls;
        expect(calls[0][0]).toBe('touchstart');
        expect(calls[0][2]).toEqual({ passive: false });
        expect(calls[1][0]).toBe('gesturestart');
        expect(calls[1][2]).toEqual({ passive: false });
      });

      it('deve prevenir evento quando mais de um toque', () => {
        const mockEvent = {
          touches: [{ clientX: 100 }, { clientX: 200 }],
          preventDefault: jest.fn()
        };

        let touchStartHandler: any;
        jest.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
          if (event === 'touchstart') {
            touchStartHandler = handler;
          }
        });

        WebViewUtils.preventZoom();
        touchStartHandler(mockEvent);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
      });

      it('não deve prevenir evento com apenas um toque', () => {
        const mockEvent = {
          touches: [{ clientX: 100 }],
          preventDefault: jest.fn()
        };

        let touchStartHandler: any;
        jest.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
          if (event === 'touchstart') {
            touchStartHandler = handler;
          }
        });

        WebViewUtils.preventZoom();
        touchStartHandler(mockEvent);

        expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      });

      it('deve prevenir evento gesturestart', () => {
        const mockEvent = {
          preventDefault: jest.fn()
        };

        let gestureStartHandler: any;
        jest.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
          if (event === 'gesturestart') {
            gestureStartHandler = handler;
          }
        });

        WebViewUtils.preventZoom();
        gestureStartHandler(mockEvent);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
      });
    });

    describe('optimizeScroll', () => {
      
      it('deve adicionar estilo para otimizar scroll', () => {
        const appendChildSpy = jest.spyOn(document.head, 'appendChild');
        
        WebViewUtils.optimizeScroll();
        
        expect(appendChildSpy).toHaveBeenCalled();
        const styleElement = appendChildSpy.mock.calls[0][0] as HTMLStyleElement;
        expect(styleElement.tagName).toBe('STYLE');
        expect(styleElement.textContent).toContain('-webkit-overflow-scrolling: touch');
      });
    });

    describe('enableTouchFeedback', () => {
      
      it('deve adicionar feedback tátil aos elementos interativos', () => {
        // Criar elementos de teste
        const button = document.createElement('button');
        const link = document.createElement('a');
        const roleButton = document.createElement('div');
        roleButton.setAttribute('role', 'button');
        
        document.body.appendChild(button);
        document.body.appendChild(link);
        document.body.appendChild(roleButton);
        
        WebViewUtils.enableTouchFeedback();
        
        // Simular touchstart
        const touchStartEvent = new Event('touchstart');
        button.dispatchEvent(touchStartEvent);
        expect(button.style.transform).toBe('scale(0.95)');
        
        // Simular touchend
        const touchEndEvent = new Event('touchend');
        button.dispatchEvent(touchEndEvent);
        expect(button.style.transform).toBe('scale(1)');
      });
    });

    describe('setupViewport', () => {
      
      it('deve configurar viewport existente', () => {
        const viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        viewport.setAttribute('content', 'width=device-width');
        document.head.appendChild(viewport);
        
        WebViewUtils.setupViewport();
        
        expect(viewport.getAttribute('content')).toBe(
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      });

      it('não deve fazer nada se viewport não existir', () => {
        expect(() => {
          WebViewUtils.setupViewport();
        }).not.toThrow();
      });
    });

    describe('canDownloadFiles', () => {
      
      const originalUserAgent = navigator.userAgent;

      afterEach(() => {
        Object.defineProperty(navigator, 'userAgent', {
          value: originalUserAgent,
          writable: true
        });
      });

      it('deve retornar true para iOS', () => {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          writable: true
        });
        
        expect(WebViewUtils.canDownloadFiles()).toBe(true);
      });

      it('deve retornar true para Android', () => {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
          writable: true
        });
        
        expect(WebViewUtils.canDownloadFiles()).toBe(true);
      });

      it('deve retornar false para desktop', () => {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          writable: true
        });
        
        expect(WebViewUtils.canDownloadFiles()).toBe(false);
      });
    });

    describe('hasNativeBridge', () => {
      
      const originalUserAgent = navigator.userAgent;

      afterEach(() => {
        Object.defineProperty(navigator, 'userAgent', {
          value: originalUserAgent,
          writable: true
        });
      });

      it('deve retornar true para iOS', () => {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          writable: true
        });
        
        expect(WebViewUtils.hasNativeBridge()).toBe(true);
      });

      it('deve retornar true para Android', () => {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
          writable: true
        });
        
        expect(WebViewUtils.hasNativeBridge()).toBe(true);
      });

      it('deve retornar false para desktop', () => {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          writable: true
        });
        
        expect(WebViewUtils.hasNativeBridge()).toBe(false);
      });
    });

    describe('downloadFile', () => {
      
      let createObjectURLSpy: jest.SpyInstance;
      let revokeObjectURLSpy: jest.SpyInstance;

      beforeEach(() => {
        // Mock global URL object
        global.URL = {
          createObjectURL: jest.fn().mockReturnValue('blob:url'),
          revokeObjectURL: jest.fn()
        } as any;
        
        createObjectURLSpy = jest.spyOn(global.URL, 'createObjectURL');
        revokeObjectURLSpy = jest.spyOn(global.URL, 'revokeObjectURL');
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('deve fazer download com sucesso usando método padrão', () => {
        const content = 'test content';
        const fileName = 'test.txt';
        const mimeType = 'text/plain';
        
        const result = WebViewUtils.downloadFile(content, fileName, mimeType);
        
        expect(result).toBe(true);
        expect(createObjectURLSpy).toHaveBeenCalled();
        
        // Verificar se URL é revogada após timeout
        jest.advanceTimersByTime(1000);
        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');
      });

      it('deve tentar método alternativo se o padrão falhar', () => {
        createObjectURLSpy.mockImplementation(() => {
          throw new Error('Erro simulado');
        });
        
        const content = 'test content';
        const fileName = 'test.txt';
        const mimeType = 'text/plain';
        
        const result = WebViewUtils.downloadFile(content, fileName, mimeType);
        
        expect(result).toBe(true);
      });

      it('deve retornar false se ambos os métodos falharem', () => {
        createObjectURLSpy.mockImplementation(() => {
          throw new Error('Erro simulado');
        });
        
        // Mock global encodeURIComponent para simular falha
        const originalEncodeURIComponent = global.encodeURIComponent;
        global.encodeURIComponent = jest.fn().mockImplementation(() => {
          throw new Error('Erro no método alternativo');
        });
        
        const content = 'test content';
        const fileName = 'test.txt';
        const mimeType = 'text/plain';
        
        const result = WebViewUtils.downloadFile(content, fileName, mimeType);
        
        expect(result).toBe(false);
        
        // Restaurar função original
        global.encodeURIComponent = originalEncodeURIComponent;
      });
    });

    describe('openInNewTab', () => {
      
      let createObjectURLSpy: jest.SpyInstance;
      let revokeObjectURLSpy: jest.SpyInstance;
      let windowOpenSpy: jest.SpyInstance;

      beforeEach(() => {
        // Mock global URL object
        global.URL = {
          createObjectURL: jest.fn().mockReturnValue('blob:url'),
          revokeObjectURL: jest.fn()
        } as any;
        
        createObjectURLSpy = jest.spyOn(global.URL, 'createObjectURL');
        revokeObjectURLSpy = jest.spyOn(global.URL, 'revokeObjectURL');
        windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('deve abrir arquivo em nova aba', () => {
        const content = 'test content';
        const mimeType = 'text/plain';
        
        WebViewUtils.openInNewTab(content, mimeType);
        
        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(windowOpenSpy).toHaveBeenCalledWith('blob:url', '_blank');
        
        // Verificar se URL é revogada após timeout
        jest.advanceTimersByTime(1000);
        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');
      });
    });

    describe('shareFile', () => {
      
      let downloadFileSpy: jest.SpyInstance;

      beforeEach(() => {
        downloadFileSpy = jest.spyOn(WebViewUtils, 'downloadFile').mockReturnValue(true);
      });

      it('deve usar API de compartilhamento quando disponível', async () => {
        const mockShare = jest.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'share', {
          value: mockShare,
          writable: true
        });
        
        const content = 'test content';
        const fileName = 'test.txt';
        const mimeType = 'text/plain';
        
        WebViewUtils.shareFile(content, fileName, mimeType);
        
        expect(mockShare).toHaveBeenCalled();
        const shareCalls = mockShare.mock.calls;
        expect(shareCalls[0][0].title).toBe('Extrato Bancário');
        expect(shareCalls[0][0].text).toBe('Compartilhando extrato bancário');
        expect(Array.isArray(shareCalls[0][0].files)).toBe(true);
      });

      it('deve fazer fallback para download se compartilhamento falhar', async () => {
        const mockShare = jest.fn().mockRejectedValue(new Error('Compartilhamento falhou'));
        Object.defineProperty(navigator, 'share', {
          value: mockShare,
          writable: true
        });
        
        const content = 'test content';
        const fileName = 'test.txt';
        const mimeType = 'text/plain';
        
        WebViewUtils.shareFile(content, fileName, mimeType);
        
        // Aguardar resolução da Promise
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(downloadFileSpy).toHaveBeenCalledWith(content, fileName, mimeType);
      });

      it('deve usar download se API de compartilhamento não existir', () => {
        Object.defineProperty(navigator, 'share', {
          value: undefined,
          writable: true
        });
        
        const content = 'test content';
        const fileName = 'test.txt';
        const mimeType = 'text/plain';
        
        WebViewUtils.shareFile(content, fileName, mimeType);
        
        expect(downloadFileSpy).toHaveBeenCalledWith(content, fileName, mimeType);
      });
    });
  });

  describe('Integração e TypeScript', () => {
    
    it('deve ter interface WebViewConfig bem definida', () => {
      const config: WebViewConfig = {
        performance: {
          enableHardwareAcceleration: true,
          reduceAnimations: false,
          optimizeScrolling: true,
          preventZoom: false
        },
        ui: {
          headerHeight: 100,
          footerHeight: 50,
          scrollbarWidth: 8,
          animationDuration: 300,
          enableTouchFeedback: false
        },
        responsive: {
          mobileBreakpoint: 320,
          tabletBreakpoint: 1024,
          enableMobileOptimizations: false
        },
        accessibility: {
          enableScreenReader: false,
          enableKeyboardNavigation: false,
          enableVoiceOver: false
        },
        download: {
          enableFileDownload: false,
          useWebViewBridge: true,
          fallbackToPrint: false,
          maxFileSize: 5000000,
          supportedFormats: ['json', 'xml']
        }
      };
      
      expect(config).toBeDefined();
      expect(typeof config.performance.enableHardwareAcceleration).toBe('boolean');
      expect(typeof config.ui.headerHeight).toBe('number');
      expect(Array.isArray(config.download.supportedFormats)).toBe(true);
    });

    it('deve permitir extensão das configurações', () => {
      const customConfig: WebViewConfig = {
        ...defaultWebViewConfig,
        ui: {
          ...defaultWebViewConfig.ui,
          headerHeight: 100
        }
      };
      
      expect(customConfig.ui.headerHeight).toBe(100);
      expect(customConfig.ui.footerHeight).toBe(defaultWebViewConfig.ui.footerHeight);
    });
  });
});
