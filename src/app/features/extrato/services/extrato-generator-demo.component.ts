import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtratoGeneratorService, ExtratoConfig, GeracaoOptions, ExtratoSimples } from './extrato-generator.service';
import { RENDA_FIXA_DATA } from '../../../../../data/mock-extrato.data';

/**
 * Demo do ExtratoGeneratorService
 * Demonstra o uso do serviço para gerar PDF, CSV e HTML
 */
@Component({
  selector: 'app-extrato-generator-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-container">
      <h2>🚀 Demo ExtratoGeneratorService</h2>
      
      <div class="demo-section">
        <h3>📊 Dados do Extrato</h3>
        <div class="data-preview">
          <p><strong>Itens:</strong> {{ extratoData.itens.length }}</p>
          <p><strong>Período:</strong> {{ config.periodo }}</p>
          <p><strong>Empresa:</strong> {{ config.empresa }}</p>
        </div>
      </div>

      <div class="demo-section">
        <h3>⚙️ Opções de Geração</h3>
        <div class="options">
          <label>
            <input type="checkbox" [(ngModel)]="options.includeRendaFixa">
            Incluir Renda Fixa
          </label>
          <label>
            Qualidade:
            <select [(ngModel)]="options.quality">
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </label>
        </div>
      </div>

      <div class="demo-section">
        <h3>🎯 Ações</h3>
        <div class="actions">
          <button 
            (click)="gerarPDF()" 
            [disabled]="isLoading"
            class="btn btn-primary">
            📄 Gerar PDF
          </button>
          
          <button 
            (click)="gerarCSV()" 
            [disabled]="isLoading"
            class="btn btn-secondary">
            📊 Gerar CSV
          </button>
          
          <button 
            (click)="gerarHTML()" 
            [disabled]="isLoading"
            class="btn btn-success">
            🌐 Gerar HTML
          </button>
        </div>
      </div>

      <div class="demo-section" *ngIf="isLoading">
        <div class="loading">
          <div class="spinner"></div>
          <p>Gerando arquivo...</p>
        </div>
      </div>

      <div class="demo-section" *ngIf="resultado">
        <h3>✅ Resultado</h3>
        <div class="result" [class.success]="resultado.sucesso" [class.error]="!resultado.sucesso">
          <p><strong>Status:</strong> {{ resultado.sucesso ? 'Sucesso' : 'Erro' }}</p>
          <p><strong>Mensagem:</strong> {{ resultado.mensagem }}</p>
          <p><strong>Tempo:</strong> {{ resultado.tempo }}ms</p>
        </div>
      </div>

      <div class="demo-section">
        <h3>📋 Log de Atividades</h3>
        <div class="log">
          <div *ngFor="let log of logs" class="log-item">
            <span class="timestamp">{{ log.timestamp | date:'HH:mm:ss' }}</span>
            <span class="message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .demo-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .demo-section h3 {
      margin-top: 0;
      color: #333;
    }

    .data-preview {
      background: white;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #eee;
    }

    .options {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .options label {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .actions {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #545b62;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #1e7e34;
    }

    .loading {
      text-align: center;
      padding: 20px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .result {
      padding: 15px;
      border-radius: 5px;
      margin-top: 10px;
    }

    .result.success {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    .result.error {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .log {
      max-height: 200px;
      overflow-y: auto;
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 10px;
    }

    .log-item {
      display: flex;
      gap: 10px;
      padding: 5px 0;
      border-bottom: 1px solid #eee;
    }

    .timestamp {
      color: #666;
      font-size: 0.9em;
      min-width: 80px;
    }

    .message {
      flex: 1;
    }
  `]
})
export class ExtratoGeneratorDemoComponent {
  private readonly extratoGenerator = inject(ExtratoGeneratorService);

  // Dados do extrato
  extratoData: ExtratoSimples = {
    itens: [
      { data: '2024-09-01', descricao: 'Depósito Inicial', valor: 1000, saldo: 1000 },
      { data: '2024-09-02', descricao: 'Saque ATM', valor: -100, saldo: 900 },
      { data: '2024-09-03', descricao: 'Transferência Recebida', valor: 500, saldo: 1400 },
      { data: '2024-09-04', descricao: 'Pagamento PIX', valor: -200, saldo: 1200 },
      { data: '2024-09-05', descricao: 'Depósito', valor: 300, saldo: 1500 }
    ]
  };

  // Configuração do extrato
  config: ExtratoConfig = {
    titulo: 'Extrato Bancário Demo',
    empresa: 'Banco Demo Ltda',
    agencia: '0001',
    conta: '12345-6',
    periodo: '01/09/2024 - 30/09/2024',
    dataGeracao: new Date(),
    numeroControle: this.gerarNumeroControle(),
    itens: this.extratoData.itens
  };

  // Opções de geração
  options: GeracaoOptions = {
    includeRendaFixa: true,
    quality: 'high' as 'low' | 'medium' | 'high'
  };

  // Estado do componente
  isLoading = false;
  resultado: { sucesso: boolean; mensagem: string; tempo: number } | null = null;
  logs: Array<{ timestamp: Date; message: string }> = [];

  /**
   * Gera PDF do extrato
   */
  async gerarPDF(): Promise<void> {
    await this.executarGeracao('PDF', () => 
      this.extratoGenerator.gerarPDF(this.extratoData, this.config, {
        ...this.options,
        fileName: `extrato-demo-${this.formatarData(new Date())}.pdf`
      })
    );
  }

  /**
   * Gera CSV do extrato
   */
  async gerarCSV(): Promise<void> {
    await this.executarGeracao('CSV', () => 
      this.extratoGenerator.gerarCSV(this.extratoData, this.config, {
        ...this.options,
        fileName: `extrato-demo-${this.formatarData(new Date())}.csv`
      })
    );
  }

  /**
   * Gera HTML do extrato
   */
  async gerarHTML(): Promise<void> {
    await this.executarGeracao('HTML', () => 
      this.extratoGenerator.gerarHTML(this.extratoData, this.config, {
        ...this.options,
        fileName: `extrato-demo-${this.formatarData(new Date())}.html`
      })
    );
  }

  /**
   * Executa a geração com logging
   */
  private async executarGeracao(tipo: string, geracaoFn: () => Promise<boolean>): Promise<void> {
    const inicio = performance.now();
    this.isLoading = true;
    this.resultado = null;

    this.adicionarLog(`Iniciando geração de ${tipo}...`);

    try {
      const sucesso = await geracaoFn();
      const tempo = Math.round(performance.now() - inicio);

      if (sucesso) {
        this.resultado = {
          sucesso: true,
          mensagem: `${tipo} gerado com sucesso!`,
          tempo
        };
        this.adicionarLog(`✅ ${tipo} gerado com sucesso em ${tempo}ms`);
      } else {
        this.resultado = {
          sucesso: false,
          mensagem: `Erro ao gerar ${tipo}`,
          tempo
        };
        this.adicionarLog(`❌ Erro ao gerar ${tipo} em ${tempo}ms`);
      }
    } catch (error) {
      const tempo = Math.round(performance.now() - inicio);
      this.resultado = {
        sucesso: false,
        mensagem: `Erro inesperado: ${error}`,
        tempo
      };
      this.adicionarLog(`💥 Erro inesperado ao gerar ${tipo}: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Adiciona log à lista
   */
  private adicionarLog(mensagem: string): void {
    this.logs.unshift({
      timestamp: new Date(),
      message: mensagem
    });

    // Manter apenas os últimos 10 logs
    if (this.logs.length > 10) {
      this.logs = this.logs.slice(0, 10);
    }
  }

  /**
   * Gera número de controle
   */
  private gerarNumeroControle(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Formata data para nome de arquivo
   */
  private formatarData(data: Date): string {
    return data.toISOString().split('T')[0];
  }
}
