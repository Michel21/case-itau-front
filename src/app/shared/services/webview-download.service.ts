import { Injectable } from '@angular/core';
import { WebViewUtils, detectWebViewType } from '../../webview.config';

export interface DownloadOptions {
  fileName: string;
  mimeType: string;
  useWebViewBridge?: boolean;
  fallbackToPrint?: boolean;
  openInNewTab?: boolean;
  shareFile?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WebViewDownloadService {

  constructor() { }

  /**
   * Download de arquivo otimizado para WebView
   */
  downloadFile(content: string, options: DownloadOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const webViewType = detectWebViewType();
      const isWebView = webViewType !== 'desktop';

      try {
        // Em WebView, tentar métodos nativos primeiro
        if (isWebView && options.shareFile && 'share' in navigator) {
          this.shareFile(content, options);
          resolve(true);
          return;
        }

        // Tentar download padrão
        if (WebViewUtils.downloadFile(content, options.fileName, options.mimeType)) {
          resolve(true);
          return;
        }

        // Fallback: abrir em nova aba
        if (options.openInNewTab) {
          WebViewUtils.openInNewTab(content, options.mimeType);
          resolve(true);
          return;
        }

        // Fallback: impressão (para PDF)
        if (options.fallbackToPrint && options.mimeType === 'application/pdf') {
          this.printContent(content);
          resolve(true);
          return;
        }

        // Último recurso: mostrar mensagem de erro
        this.showDownloadError(options.fileName);
        resolve(false);

      } catch (error) {
        console.error('Erro no download:', error);
        resolve(false);
      }
    });
  }

  /**
   * Download de PDF otimizado para WebView
   */
  downloadPDF(pdfBlob: Blob, fileName: string): Promise<boolean> {
    return new Promise((resolve) => {
      const webViewType = detectWebViewType();
      const isWebView = webViewType !== 'desktop';

      try {
        if (isWebView) {
          // Em WebView, tentar compartilhar primeiro
          if (navigator.share) {
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
            navigator.share({
              title: 'Extrato Bancário PDF',
              text: 'Compartilhando extrato bancário em PDF',
              files: [file]
            }).then(() => {
              resolve(true);
            }).catch(() => {
              // Se compartilhamento falhar, tentar download
              this.downloadBlob(pdfBlob, fileName);
              resolve(true);
            });
            return;
          }
        }

        // Download padrão
        this.downloadBlob(pdfBlob, fileName);
        resolve(true);

      } catch (error) {
        console.error('Erro no download do PDF:', error);
        resolve(false);
      }
    });
  }

  /**
   * Download de CSV otimizado para WebView
   */
  downloadCSV(csvContent: string, fileName: string): Promise<boolean> {
    const options: DownloadOptions = {
      fileName,
      mimeType: 'text/csv;charset=utf-8',
      useWebViewBridge: true,
      fallbackToPrint: false,
      openInNewTab: true,
      shareFile: true
    };

    return this.downloadFile(csvContent, options);
  }

  /**
   * Download de HTML otimizado para WebView
   */
  downloadHTML(htmlContent: string, fileName: string): Promise<boolean> {
    const options: DownloadOptions = {
      fileName,
      mimeType: 'text/html;charset=utf-8',
      useWebViewBridge: true,
      fallbackToPrint: false,
      openInNewTab: true,
      shareFile: true
    };

    return this.downloadFile(htmlContent, options);
  }

  /**
   * Método privado para compartilhar arquivo
   */
  private shareFile(content: string, options: DownloadOptions): void {
    try {
      const blob = new Blob([content], { type: options.mimeType });
      const file = new File([blob], options.fileName, { type: options.mimeType });
      
      navigator.share({
        title: 'Extrato Bancário',
        text: `Compartilhando ${options.fileName}`,
        files: [file]
      }).catch(error => {
        console.warn('Compartilhamento falhou, usando download:', error);
        WebViewUtils.downloadFile(content, options.fileName, options.mimeType);
      });
    } catch (error) {
      console.error('Erro ao compartilhar arquivo:', error);
      // Fallback para download
      WebViewUtils.downloadFile(content, options.fileName, options.mimeType);
    }
  }

  /**
   * Método privado para download de blob
   */
  private downloadBlob(blob: Blob, fileName: string): void {
    try {
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
    } catch (error) {
      console.error('Erro ao fazer download do blob:', error);
      // Fallback: abrir em nova aba
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    }
  }

  /**
   * Método privado para impressão de conteúdo
   */
  private printContent(content: string): void {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Erro ao imprimir conteúdo:', error);
    }
  }

  /**
   * Método privado para mostrar erro de download
   */
  private showDownloadError(fileName: string): void {
    const webViewType = detectWebViewType();
    
    if (webViewType === 'ios') {
      alert(`Para baixar ${fileName} no iOS, use o botão de compartilhar do navegador.`);
    } else if (webViewType === 'android') {
      alert(`Para baixar ${fileName} no Android, use o botão de compartilhar do navegador.`);
    } else {
      alert(`Erro ao baixar ${fileName}. Tente novamente.`);
    }
  }

  /**
   * Verificar se o dispositivo suporta download
   */
  canDownload(): boolean {
    return WebViewUtils.canDownloadFiles();
  }

  /**
   * Verificar se o dispositivo tem bridge nativo
   */
  hasNativeBridge(): boolean {
    return WebViewUtils.hasNativeBridge();
  }

  /**
   * Verificar se o dispositivo suporta compartilhamento
   */
  canShare(): boolean {
    return 'share' in navigator;
  }
}
