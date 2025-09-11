import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ValidacaoPeriodoService } from '../services/validacao-periodo.service';
import { ValidacaoPeriodoDemoNavComponent } from './validacao-periodo-demo-nav.component';

/**
 * Demo completa do ValidacaoPeriodoService
 * 
 * Esta demo mostra todas as funcionalidades do serviço:
 * - Validações em tempo real
 * - Uso em diferentes lifecycle hooks
 * - Exemplos práticos de uso
 * - Interface interativa
 */
@Component({
  selector: 'app-validacao-periodo-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, ValidacaoPeriodoDemoNavComponent],
  template: `
    <app-validacao-periodo-demo-nav></app-validacao-periodo-demo-nav>
    
    <div class="demo-container">
      <header class="demo-header">
        <h1>🎯 ValidacaoPeriodoService Demo</h1>
        <p>Demonstração completa do serviço de validação de período</p>
      </header>

      <!-- Seção 1: Controles Básicos -->
      <section class="demo-section">
        <h2>📋 Controles Básicos</h2>
        
        <div class="controls-grid">
          <div class="control-group">
            <label>Tipo de Seleção:</label>
            <div class="radio-group">
              <label>
                <input 
                  type="radio" 
                  [checked]="validacao.tipoSelecao() === 'mes'"
                  (change)="validacao.definirTipoSelecao('mes')">
                Por Mês
              </label>
              <label>
                <input 
                  type="radio" 
                  [checked]="validacao.tipoSelecao() === 'intervalo'"
                  (change)="validacao.definirTipoSelecao('intervalo')">
                Por Intervalo
              </label>
            </div>
          </div>

          <!-- Seleção por Mês -->
          @if (validacao.tipoSelecao() === 'mes') {
            <div class="control-group">
              <label>Mês:</label>
              <select 
                [value]="validacao.mesSelecionado()"
                (change)="validacao.definirMes($event.target.value)">
                <option value="">Selecione o mês</option>
                <option value="01">Janeiro</option>
                <option value="02">Fevereiro</option>
                <option value="03">Março</option>
                <option value="04">Abril</option>
                <option value="05">Maio</option>
                <option value="06">Junho</option>
                <option value="07">Julho</option>
                <option value="08">Agosto</option>
                <option value="09">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
            </div>

            <div class="control-group">
              <label>Ano:</label>
              <select 
                [value]="validacao.anoSelecionado()"
                (change)="validacao.definirAno($event.target.value)">
                <option value="">Selecione o ano</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          }

          <!-- Seleção por Intervalo -->
          @if (validacao.tipoSelecao() === 'intervalo') {
            <div class="control-group">
              <label>Data de Início:</label>
              <input 
                type="date"
                [value]="validacao.dataInicio()"
                [min]="validacao.obterDataMinimaInicio() | date:'yyyy-MM-dd'"
                [max]="validacao.obterDataMaximaInicio() | date:'yyyy-MM-dd'"
                (change)="validacao.definirDataInicio($event.target.value)">
            </div>

            <div class="control-group">
              <label>Data de Fim:</label>
              <input 
                type="date"
                [value]="validacao.dataFim()"
                [min]="validacao.obterDataMinimaFim() | date:'yyyy-MM-dd'"
                [max]="validacao.obterDataMaximaFim() | date:'yyyy-MM-dd'"
                (change)="validacao.definirDataFim($event.target.value)">
            </div>
          }
        </div>
      </section>

      <!-- Seção 2: Status da Validação -->
      <section class="demo-section">
        <h2>✅ Status da Validação</h2>
        
        <div class="status-grid">
          <div class="status-card" [class.valid]="!validacao.formularioInvalido()" [class.invalid]="validacao.formularioInvalido()">
            <h3>Formulário</h3>
            <p>{{ !validacao.formularioInvalido() ? '✅ Válido' : '❌ Inválido' }}</p>
          </div>

          <div class="status-card" [class.valid]="!validacao.intervaloInvalido()" [class.invalid]="validacao.intervaloInvalido()">
            <h3>Intervalo</h3>
            <p>{{ !validacao.intervaloInvalido() ? '✅ Válido' : '❌ Inválido' }}</p>
          </div>

          <div class="status-card" [class.valid]="!validacao.mesInvalido()" [class.invalid]="validacao.mesInvalido()">
            <h3>Mês</h3>
            <p>{{ !validacao.mesInvalido() ? '✅ Válido' : '❌ Inválido' }}</p>
          </div>

          <div class="status-card" [class.valid]="!validacao.temErros()" [class.invalid]="validacao.temErros()">
            <h3>Erros</h3>
            <p>{{ !validacao.temErros() ? '✅ Sem Erros' : '❌ Com Erros' }}</p>
          </div>
        </div>

        @if (validacao.temErros()) {
          <div class="error-message">
            <h4>🚨 Erro:</h4>
            <p>{{ validacao.mensagemErro() }}</p>
          </div>
        }
      </section>

      <!-- Seção 3: Período Formatado -->
      <section class="demo-section">
        <h2>📅 Período Selecionado</h2>
        
        <div class="periodo-display">
          <h3>{{ validacao.periodoFormatado() || 'Nenhum período selecionado' }}</h3>
        </div>
      </section>

      <!-- Seção 4: Estado Completo -->
      <section class="demo-section">
        <h2>🔍 Estado Completo</h2>
        
        <div class="state-display">
          <pre>{{ estadoCompleto | json }}</pre>
        </div>
      </section>

      <!-- Seção 5: Ações -->
      <section class="demo-section">
        <h2>🎮 Ações</h2>
        
        <div class="actions-grid">
          <button 
            class="action-btn primary"
            [disabled]="validacao.formularioInvalido()"
            (click)="aplicarFiltro()">
            🚀 Aplicar Filtro
          </button>
          
          <button 
            class="action-btn secondary"
            (click)="limparTudo()">
            🧹 Limpar Tudo
          </button>
          
          <button 
            class="action-btn tertiary"
            (click)="definirValoresExemplo()">
            📝 Valores de Exemplo
          </button>
          
          <button 
            class="action-btn quaternary"
            (click)="validarTempoReal()">
            ⏰ Validação em Tempo Real
          </button>
        </div>
      </section>

      <!-- Seção 6: Exemplos de Uso -->
      <section class="demo-section">
        <h2>💡 Exemplos de Uso</h2>
        
        <div class="examples-grid">
          <div class="example-card">
            <h3>ngOnInit</h3>
            <p>Inicialização de valores padrão</p>
            <button (click)="simularNgOnInit()">Simular</button>
          </div>

          <div class="example-card">
            <h3>AfterViewInit</h3>
            <p>Validações após view inicializada</p>
            <button (click)="simularAfterViewInit()">Simular</button>
          </div>

          <div class="example-card">
            <h3>Validação Customizada</h3>
            <p>Validação com regras específicas</p>
            <button (click)="validarCustomizada()">Validar</button>
          </div>

          <div class="example-card">
            <h3>Dados Externos</h3>
            <p>Processar dados de API</p>
            <button (click)="processarDadosExternos()">Processar</button>
          </div>
        </div>
      </section>

      <!-- Seção 7: Logs -->
      <section class="demo-section">
        <h2>📝 Logs de Debug</h2>
        
        <div class="logs-container">
          <div class="logs-header">
            <button (click)="limparLogs()">Limpar Logs</button>
            <span>Total: {{ logs().length }}</span>
          </div>
          
          <div class="logs-content">
            @for (log of logs(); track log.id) {
              <div class="log-entry" [class]="log.type">
                <span class="log-time">{{ log.timestamp | date:'HH:mm:ss.SSS' }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .demo-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
    }

    .demo-header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .demo-header p {
      margin: 0;
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .demo-section {
      margin-bottom: 40px;
      padding: 30px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .demo-section h2 {
      margin: 0 0 20px 0;
      color: #374151;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-group label {
      font-weight: 500;
      color: #374151;
    }

    .radio-group {
      display: flex;
      gap: 20px;
    }

    .radio-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: normal;
    }

    .control-group select,
    .control-group input {
      padding: 12px;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s;
    }

    .control-group select:focus,
    .control-group input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .status-card {
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #d1d5db;
      transition: all 0.2s;
    }

    .status-card.valid {
      background: #f0fdf4;
      border-color: #22c55e;
      color: #166534;
    }

    .status-card.invalid {
      background: #fef2f2;
      border-color: #ef4444;
      color: #dc2626;
    }

    .status-card h3 {
      margin: 0 0 10px 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .status-card p {
      margin: 0;
      font-size: 1rem;
    }

    .error-message {
      margin-top: 20px;
      padding: 20px;
      background: #fef2f2;
      border: 2px solid #ef4444;
      border-radius: 8px;
      color: #dc2626;
    }

    .error-message h4 {
      margin: 0 0 10px 0;
      font-size: 1.1rem;
    }

    .error-message p {
      margin: 0;
      font-size: 1rem;
    }

    .periodo-display {
      text-align: center;
      padding: 30px;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
    }

    .periodo-display h3 {
      margin: 0;
      font-size: 1.5rem;
      color: #1e293b;
      font-weight: 600;
    }

    .state-display {
      background: #1e293b;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
    }

    .state-display pre {
      margin: 0;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .action-btn {
      padding: 15px 20px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn.primary {
      background: #3b82f6;
      color: white;
    }

    .action-btn.primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .action-btn.secondary {
      background: #6b7280;
      color: white;
    }

    .action-btn.secondary:hover {
      background: #4b5563;
    }

    .action-btn.tertiary {
      background: #10b981;
      color: white;
    }

    .action-btn.tertiary:hover {
      background: #059669;
    }

    .action-btn.quaternary {
      background: #f59e0b;
      color: white;
    }

    .action-btn.quaternary:hover {
      background: #d97706;
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .example-card {
      padding: 20px;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      text-align: center;
    }

    .example-card h3 {
      margin: 0 0 10px 0;
      color: #1e293b;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .example-card p {
      margin: 0 0 15px 0;
      color: #64748b;
      font-size: 0.9rem;
    }

    .example-card button {
      padding: 10px 20px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .example-card button:hover {
      background: #2563eb;
    }

    .logs-container {
      background: #1e293b;
      border-radius: 8px;
      overflow: hidden;
    }

    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: #334155;
      border-bottom: 1px solid #475569;
    }

    .logs-header button {
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
    }

    .logs-header button:hover {
      background: #dc2626;
    }

    .logs-header span {
      color: #e2e8f0;
      font-size: 14px;
      font-weight: 500;
    }

    .logs-content {
      max-height: 300px;
      overflow-y: auto;
      padding: 10px;
    }

    .log-entry {
      display: flex;
      gap: 15px;
      padding: 8px 12px;
      margin-bottom: 4px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
    }

    .log-entry.info {
      background: rgba(59, 130, 246, 0.1);
      color: #60a5fa;
    }

    .log-entry.success {
      background: rgba(34, 197, 94, 0.1);
      color: #4ade80;
    }

    .log-entry.warning {
      background: rgba(245, 158, 11, 0.1);
      color: #fbbf24;
    }

    .log-entry.error {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
    }

    .log-time {
      color: #94a3b8;
      font-weight: 500;
    }

    .log-message {
      flex: 1;
    }

    @media (max-width: 768px) {
      .demo-container {
        padding: 15px;
      }

      .demo-header h1 {
        font-size: 2rem;
      }

      .demo-section {
        padding: 20px;
      }

      .controls-grid,
      .status-grid,
      .actions-grid,
      .examples-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ValidacaoPeriodoDemoComponent implements OnInit, AfterViewInit {
  // Injeção do serviço de validação
  readonly validacao = inject(ValidacaoPeriodoService);

  // Estado para logs
  readonly logs = signal<Array<{ id: number; timestamp: Date; type: string; message: string }>>([]);
  private logId = 0;

  // Estado completo para exibição
  estadoCompleto: any = {};

  ngOnInit(): void {
    this.adicionarLog('info', '🚀 ngOnInit - Inicializando demo');
    
    // Exemplo de uso no ngOnInit
    this.validacao.definirTipoSelecao('mes');
    this.validacao.definirMes('01');
    this.validacao.definirAno('2024');
    
    this.atualizarEstadoCompleto();
    this.adicionarLog('success', '✅ Valores iniciais definidos no ngOnInit');
  }

  ngAfterViewInit(): void {
    this.adicionarLog('info', '🎯 ngAfterViewInit - Demo após view inicializada');
    
    // Exemplo de uso no ngAfterViewInit
    this.validarElementosDOM();
  }

  // ==================== MÉTODOS PÚBLICOS ====================
  
  aplicarFiltro(): void {
    if (this.validacao.formularioInvalido()) {
      this.adicionarLog('error', '❌ Formulário inválido: ' + this.validacao.mensagemErro());
      return;
    }

    const estado = this.validacao.obterEstado();
    this.adicionarLog('success', '✅ Aplicando filtro: ' + JSON.stringify(estado));
    
    // Simular aplicação de filtro
    setTimeout(() => {
      this.adicionarLog('info', '🎉 Filtro aplicado com sucesso!');
    }, 1000);
  }

  limparTudo(): void {
    this.adicionarLog('info', '🧹 Limpando todos os valores');
    this.validacao.limparValores();
    this.atualizarEstadoCompleto();
    this.adicionarLog('success', '✅ Valores limpos com sucesso');
  }

  definirValoresExemplo(): void {
    this.adicionarLog('info', '📝 Definindo valores de exemplo');
    
    // Exemplo 1: Valores por mês
    this.validacao.definirValores({
      tipoSelecao: 'mes',
      mes: '03',
      ano: '2024'
    });
    
    this.atualizarEstadoCompleto();
    this.adicionarLog('success', '✅ Valores de mês definidos');
    
    // Aguardar um pouco e mudar para intervalo
    setTimeout(() => {
      this.validacao.definirValores({
        tipoSelecao: 'intervalo',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31'
      });
      this.atualizarEstadoCompleto();
      this.adicionarLog('success', '✅ Valores de intervalo definidos');
    }, 2000);
  }

  validarTempoReal(): void {
    this.adicionarLog('info', '⏰ Executando validação em tempo real');
    
    const valido = this.validacao.validarFormulario();
    const erro = this.validacao.mensagemErro();
    
    this.adicionarLog(valido ? 'success' : 'warning', 
      `Validação: ${valido ? 'Válido' : 'Inválido'} - ${erro}`);
  }

  simularNgOnInit(): void {
    this.adicionarLog('info', '🔄 Simulando ngOnInit');
    
    this.validacao.definirTipoSelecao('mes');
    this.validacao.definirMes('06');
    this.validacao.definirAno('2024');
    
    this.atualizarEstadoCompleto();
    this.adicionarLog('success', '✅ Simulação do ngOnInit concluída');
  }

  simularAfterViewInit(): void {
    this.adicionarLog('info', '🔄 Simulando AfterViewInit');
    
    this.validarElementosDOM();
    this.adicionarLog('success', '✅ Simulação do AfterViewInit concluída');
  }

  validarCustomizada(): void {
    this.adicionarLog('info', '🔍 Executando validação customizada');
    
    const valido = this.executarValidacaoCustomizada();
    this.adicionarLog(valido ? 'success' : 'warning', 
      `Validação customizada: ${valido ? 'Passou' : 'Falhou'}`);
  }

  processarDadosExternos(): void {
    this.adicionarLog('info', '🌐 Processando dados externos');
    
    const dadosExemplo = {
      tipo: 'intervalo',
      dataInicio: '2024-02-01',
      dataFim: '2024-02-29'
    };
    
    this.validacao.definirValores({
      tipoSelecao: dadosExemplo.tipo as 'intervalo',
      dataInicio: dadosExemplo.dataInicio,
      dataFim: dadosExemplo.dataFim
    });
    
    this.atualizarEstadoCompleto();
    this.adicionarLog('success', '✅ Dados externos processados: ' + JSON.stringify(dadosExemplo));
  }

  limparLogs(): void {
    this.logs.set([]);
    this.logId = 0;
  }

  // ==================== MÉTODOS PRIVADOS ====================
  
  private atualizarEstadoCompleto(): void {
    this.estadoCompleto = this.validacao.obterEstado();
  }

  private validarElementosDOM(): void {
    // Exemplo de validação que depende do DOM
    const inputs = document.querySelectorAll('input, select');
    this.adicionarLog('info', `🔍 Elementos encontrados: ${inputs.length}`);
    
    // Aqui você pode fazer validações específicas do DOM
    inputs.forEach((element, index) => {
      this.adicionarLog('info', `Elemento ${index}: ${element.tagName}`);
    });
  }

  private executarValidacaoCustomizada(): boolean {
    const estado = this.validacao.obterEstado();
    
    // Validação customizada baseada no estado
    if (estado.tipoSelecao === 'mes') {
      return estado.mesSelecionado === '12' && estado.anoSelecionado === '2024';
    }
    
    if (estado.tipoSelecao === 'intervalo') {
      const inicio = new Date(estado.dataInicio);
      const fim = new Date(estado.dataFim);
      const diferenca = fim.getTime() - inicio.getTime();
      const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));
      
      return dias >= 7; // Mínimo de 7 dias
    }
    
    return false;
  }

  private adicionarLog(type: string, message: string): void {
    const log = {
      id: ++this.logId,
      timestamp: new Date(),
      type,
      message
    };
    
    this.logs.update(logs => [...logs, log]);
    
    // Manter apenas os últimos 50 logs
    if (this.logs().length > 50) {
      this.logs.update(logs => logs.slice(-50));
    }
  }
}
