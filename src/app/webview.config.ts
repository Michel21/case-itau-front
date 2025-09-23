/**
 * Configurações específicas para WebView Customizada
 * Este arquivo contém configurações otimizadas para aplicações
 * que rodam dentro de WebViews nativas (iOS/Android)
 */

export interface WebViewConfig {
  // Configurações de performance
  performance: {
    enableHardwareAcceleration: boolean;
    reduceAnimations: boolean;
    optimizeScrolling: boolean;
    preventZoom: boolean;
  };
  
  // Configurações de UI/UX
  ui: {
    headerHeight: number;
    footerHeight: number;
    scrollbarWidth: number;
    animationDuration: number;
    enableTouchFeedback: boolean;
  };
  
  // Configurações de responsividade
  responsive: {
    mobileBreakpoint: number;
    tabletBreakpoint: number;
    enableMobileOptimizations: boolean;
  };
  
  // Configurações de acessibilidade
  accessibility: {
    enableScreenReader: boolean;
    enableKeyboardNavigation: boolean;
    enableVoiceOver: boolean;
  };
  
  // Configurações de download para WebView
  download: {
    enableFileDownload: boolean;
    useWebViewBridge: boolean;
    fallbackToPrint: boolean;
    maxFileSize: number; // em bytes
    supportedFormats: string[];
  };
}

// Configuração padrão para WebView
export const defaultWebViewConfig: WebViewConfig = {
  performance: {
    enableHardwareAcceleration: true,
    reduceAnimations: true,
    optimizeScrolling: true,
    preventZoom: true,
  },
  
  ui: {
    headerHeight: 70,
    footerHeight: 80,
    scrollbarWidth: 4,
    animationDuration: 200,
    enableTouchFeedback: true,
  },
  
  responsive: {
    mobileBreakpoint: 480,
    tabletBreakpoint: 768,
    enableMobileOptimizations: true,
  },
  
  accessibility: {
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableVoiceOver: true,
  },
  
  download: {
    enableFileDownload: true,
    useWebViewBridge: false,
    fallbackToPrint: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['pdf', 'csv', 'html'],
  },
};

// Configuração para WebView iOS
export const iOSWebViewConfig: WebViewConfig = {
  ...defaultWebViewConfig,
  performance: {
    ...defaultWebViewConfig.performance,
    enableHardwareAcceleration: true,
    optimizeScrolling: true,
  },
  ui: {
    ...defaultWebViewConfig.ui,
    headerHeight: 70,
    animationDuration: 150,
  },
  download: {
    ...defaultWebViewConfig.download,
    enableFileDownload: true,
    useWebViewBridge: true, // iOS suporta bridge nativo
    fallbackToPrint: true,
  },
};

// Configuração para WebView Android
export const androidWebViewConfig: WebViewConfig = {
  ...defaultWebViewConfig,
  performance: {
    ...defaultWebViewConfig.performance,
    enableHardwareAcceleration: true,
    reduceAnimations: false,
  },
  ui: {
    ...defaultWebViewConfig.ui,
    headerHeight: 70,
    animationDuration: 250,
  },
  download: {
    ...defaultWebViewConfig.download,
    enableFileDownload: true,
    useWebViewBridge: true, // Android suporta bridge nativo
    fallbackToPrint: true,
  },
};

// Detectar tipo de WebView
export function detectWebViewType(): 'ios' | 'android' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/android/.test(userAgent)) {
    return 'android';
  } else {
    return 'desktop';
  }
}

// Obter configuração baseada no tipo de WebView
export function getWebViewConfig(): WebViewConfig {
  const webViewType = detectWebViewType();
  
  switch (webViewType) {
    case 'ios':
      return iOSWebViewConfig;
    case 'android':
      return androidWebViewConfig;
    default:
      return defaultWebViewConfig;
  }
}

// Utilitários para WebView
export const WebViewUtils = {
  // Prevenir zoom em dispositivos touch
  preventZoom: () => {
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    }, { passive: false });
  },
  
  // Otimizar scroll para WebView
  optimizeScroll: () => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-overflow-scrolling: touch !important;
        overflow-scrolling: touch !important;
      }
    `;
    document.head.appendChild(style);
  },
  
  // Habilitar feedback tátil
  enableTouchFeedback: () => {
    const elements = document.querySelectorAll('button, a, [role="button"]');
    elements.forEach(element => {
      element.addEventListener('touchstart', () => {
        (element as HTMLElement).style.transform = 'scale(0.95)';
      });
      
      element.addEventListener('touchend', () => {
        (element as HTMLElement).style.transform = 'scale(1)';
      });
    });
  },
  
  // Configurar viewport para WebView
  setupViewport: () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  },
  
  // Verificar se WebView suporta download de arquivos
  canDownloadFiles: (): boolean => {
    const webViewType = detectWebViewType();
    return webViewType === 'ios' || webViewType === 'android';
  },
  
  // Verificar se WebView tem bridge nativo
  hasNativeBridge: (): boolean => {
    const webViewType = detectWebViewType();
    return webViewType === 'ios' || webViewType === 'android';
  },
  
  // Método alternativo para download em WebView
  downloadFile: (content: string, fileName: string, mimeType: string): boolean => {
    try {
      // Tentar método padrão primeiro
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpar URL após um tempo
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      return true;
    } catch (error) {
      // console.warn removido por questões de segurança
      
      // Método alternativo para WebView
      try {
        const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        return true;
      } catch (fallbackError) {

        return false;
      }
    }
  },
  
  // Método para abrir arquivo em nova aba (fallback)
  openInNewTab: (content: string, mimeType: string): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Limpar URL após um tempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  },
  
  // Método para compartilhar arquivo (WebView nativo)
  shareFile: (content: string, fileName: string, mimeType: string): void => {
    if (navigator.share) {
      const blob = new Blob([content], { type: mimeType });
      const file = new File([blob], fileName, { type: mimeType });
      
      navigator.share({
        title: 'Extrato Bancário',
        text: 'Compartilhando extrato bancário',
        files: [file]
      }).catch(error => {
        // console.warn removido por questões de segurança
        WebViewUtils.downloadFile(content, fileName, mimeType);
      });
    } else {
      // Fallback para download
      WebViewUtils.downloadFile(content, fileName, mimeType);
    }
  }
};
