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
    headerHeight: 60,
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
    headerHeight: 60,
    animationDuration: 150,
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
    headerHeight: 56,
    animationDuration: 250,
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
  }
};
