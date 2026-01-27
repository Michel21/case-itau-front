import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomSheetDownloadComponent, DownloadFormat } from './bottom-sheet-download.component';

/**
 * Componente de Demo do Bottom Sheet Download
 * 
 * Demonstra o uso do componente bottom-sheet-download
 */
@Component({
  selector: 'app-bottom-sheet-download-demo',
  standalone: true,
  imports: [CommonModule, BottomSheetDownloadComponent],
  template: `
    <div class="demo-container">
      <h1>Bottom Sheet Download - Demo</h1>
      
      <div class="demo-actions">
        <button
          type="button"
          class="btn-open"
          (click)="abrirBottomSheet()"
        >
          Abrir Bottom Sheet
        </button>
      </div>

      <div *ngIf="downloadRealizado()" class="demo-result">
        <p>✅ Download confirmado!</p>
        <p><strong>Formato:</strong> {{ formatoBaixado()?.toUpperCase() }}</p>
      </div>

      <!-- Bottom Sheet -->
      <app-bottom-sheet-download
        [isOpen]="isOpen()"
        [formatoInicial]="'pdf'"
        [textoBotao]="'Baixar'"
        [linkUrl]="'/ajuda/downloads'"
        [linkTexto]="'Saiba mais sobre downloads'"
        (downloadConfirmado)="onDownloadConfirmado($event)"
        (fechar)="onFechar()"
        (linkClicado)="onLinkClicado()"
      ></app-bottom-sheet-download>
    </div>
  `,
  styleUrls: ['./bottom-sheet-download-demo.component.scss']
})
export class BottomSheetDownloadDemoComponent {
  readonly isOpen = signal<boolean>(false);
  readonly downloadRealizado = signal<boolean>(false);
  readonly formatoBaixado = signal<DownloadFormat | null>(null);

  abrirBottomSheet(): void {
    this.isOpen.set(true);
  }

  onDownloadConfirmado(formato: DownloadFormat): void {
    console.log('Download confirmado:', formato);
    this.formatoBaixado.set(formato);
    this.downloadRealizado.set(true);
    this.isOpen.set(false);
  }

  onFechar(): void {
    this.isOpen.set(false);
  }

  onLinkClicado(): void {
    console.log('Link clicado');
    alert('Link clicado! Navegaria para a página de ajuda.');
  }
}
