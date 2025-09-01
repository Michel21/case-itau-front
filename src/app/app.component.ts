import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { getWebViewConfig, WebViewUtils, detectWebViewType } from './webview.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private readonly webViewConfig = getWebViewConfig();
  
  // Signals para configurações de webview
  public readonly isWebView = signal(false);
  public readonly webViewType = signal<'ios' | 'android' | 'desktop'>('desktop');
  public readonly headerHeight = signal(this.webViewConfig.ui.headerHeight);
  public readonly animationDuration = signal(this.webViewConfig.ui.animationDuration);

  ngOnInit(): void {
    this.initializeWebView();
  }

  private initializeWebView(): void {
    // Detectar tipo de webview
    const detectedType = detectWebViewType();
    this.webViewType.set(detectedType);
    this.isWebView.set(detectedType !== 'desktop');

    if (this.isWebView()) {
      this.setupWebViewOptimizations();
    }
  }

  private setupWebViewOptimizations(): void {
    // Aplicar otimizações específicas para webview
    if (this.webViewConfig.performance.preventZoom) {
      WebViewUtils.preventZoom();
    }

    if (this.webViewConfig.performance.optimizeScrolling) {
      WebViewUtils.optimizeScroll();
    }

    if (this.webViewConfig.ui.enableTouchFeedback) {
      WebViewUtils.enableTouchFeedback();
    }

    // Configurar viewport
    WebViewUtils.setupViewport();

    // Aplicar estilos dinâmicos baseados na configuração
    this.applyWebViewStyles();
  }

  private applyWebViewStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .app-header {
        height: ${this.webViewConfig.ui.headerHeight}px !important;
      }
      
      .app-content {
        margin-top: ${this.webViewConfig.ui.headerHeight}px !important;
        min-height: calc(100vh - ${this.webViewConfig.ui.headerHeight}px) !important;
      }
      
      .app-content::-webkit-scrollbar {
        width: ${this.webViewConfig.ui.scrollbarWidth}px !important;
      }
      
      * {
        animation-duration: ${this.webViewConfig.ui.animationDuration}ms !important;
        transition-duration: ${this.webViewConfig.ui.animationDuration}ms !important;
      }
    `;
    document.head.appendChild(style);
  }
}
