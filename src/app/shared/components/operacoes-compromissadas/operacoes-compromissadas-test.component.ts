import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperacoesCompromissadasComponent, CertificadoCompromissadas } from './operacoes-compromissadas.component';

@Component({
  selector: 'app-operacoes-compromissadas-test',
  standalone: true,
  imports: [CommonModule, OperacoesCompromissadasComponent],
  template: `
    <div class="test-container">
      <h1>Teste - Operações Compromissadas</h1>
      
      <!-- Debug Info -->
      <div class="debug-info">
        <p><strong>Certificados carregados:</strong> {{ certificados.length }}</p>
        <p><strong>Valor Bruto Total:</strong> {{ valorBrutoTotal | currency:'BRL' }}</p>
        <p><strong>Valor Líquido Total:</strong> {{ valorLiquidoTotal | currency:'BRL' }}</p>
      </div>
      
      <!-- Componente -->
      <app-operacoes-compromissadas
        [certificados]="certificados"
        [valorBrutoTotal]="valorBrutoTotal"
        [valorLiquidoTotal]="valorLiquidoTotal"
        [totalItens]="totalItens"
        [paginaAtual]="paginaAtual"
        [itensPorPagina]="itensPorPagina"
        (ordenar)="onOrdenar($event)"
        (mudarPagina)="onMudarPagina($event)"
        (ocultarValores)="onOcultarValores()">
      </app-operacoes-compromissadas>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    
    .debug-info {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 20px;
      border: 1px solid #e9ecef;
    }
    
    .debug-info p {
      margin: 8px 0;
      color: #495057;
    }
  `]
})
export class OperacoesCompromissadasTestComponent {
  
  certificados: CertificadoCompromissadas[] = [];
  valorBrutoTotal: number = 0;
  valorLiquidoTotal: number = 0;
  totalItens: number = 0;
  paginaAtual: number = 1;
  itensPorPagina: number = 15;

  constructor() {
    this.carregarDadosTeste();
  }

  /**
   * Carregar dados de teste simples
   */
  private carregarDadosTeste(): void {
    this.certificados = [
      {
        custodia: '1405190840',
        dataEmissao: '18/08/2024',
        valorInicialAplicado: 175997.84,
        valorContabil: 21078.57,
        valorPosicaoLiquida: 21778.0
      },
      {
        custodia: '141058507',
        dataEmissao: '27/05/2025',
        valorInicialAplicado: 2165.54,
        valorContabil: 2181.10,
        valorPosicaoLiquida: 2177.80
      },
      {
        custodia: '142345678',
        dataEmissao: '15/06/2024',
        valorInicialAplicado: 50000.00,
        valorContabil: 51000.00,
        valorPosicaoLiquida: 50800.00
      }
    ];

    // Calcular totais
    this.valorBrutoTotal = this.certificados.reduce((total, cert) => total + cert.valorContabil, 0);
    this.valorLiquidoTotal = this.certificados.reduce((total, cert) => total + cert.valorPosicaoLiquida, 0);
    this.totalItens = this.certificados.length;

    console.log('TestComponent - Dados carregados:', {
      certificados: this.certificados,
      valorBrutoTotal: this.valorBrutoTotal,
      valorLiquidoTotal: this.valorLiquidoTotal,
      totalItens: this.totalItens
    });
  }

  onOrdenar(event: { coluna: string; direcao: 'asc' | 'desc' }): void {
    console.log('TestComponent - Ordenar:', event);
    
    // Exemplo de ordenação global
    this.ordenarDadosGlobais(event.coluna, event.direcao);
  }

  /**
   * Simula ordenação global (backend)
   */
  private ordenarDadosGlobais(coluna: string, direcao: 'asc' | 'desc'): void {
    console.log(`TestComponent - Ordenando globalmente por ${coluna} - ${direcao}`);
    
    // Simular chamada para backend
    setTimeout(() => {
      this.certificados = [...this.certificados].sort((a, b) => {
        const valorA = a[coluna as keyof typeof a];
        const valorB = b[coluna as keyof typeof b];
        
        if (valorA < valorB) {
          return direcao === 'asc' ? -1 : 1;
        }
        if (valorA > valorB) {
          return direcao === 'asc' ? 1 : -1;
        }
        return 0;
      });
      
      // Recalcular totais
      this.valorBrutoTotal = this.certificados.reduce((total, cert) => total + cert.valorContabil, 0);
      this.valorLiquidoTotal = this.certificados.reduce((total, cert) => total + cert.valorPosicaoLiquida, 0);
    }, 100);
  }

  onMudarPagina(pagina: number): void {
    console.log('TestComponent - Mudar página:', pagina);
    this.paginaAtual = pagina;
  }

  onOcultarValores(): void {
    console.log('TestComponent - Ocultar valores');
  }
}
