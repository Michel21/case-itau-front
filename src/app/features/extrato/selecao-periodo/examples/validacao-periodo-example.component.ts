import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { ValidacaoPeriodoService } from '../services/validacao-periodo.service';

/**
 * Exemplo de como usar o ValidacaoPeriodoService
 * 
 * Este componente demonstra como usar o serviço de validação
 * sem FormBuilder e em diferentes lifecycle hooks
 */
@Component({
  selector: 'app-validacao-periodo-example',
  template: `
    <div class="validacao-example">
      <h2>Exemplo de Validação de Período</h2>
      
      <!-- Tipo de Seleção -->
      <div class="tipo-selecao">
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

      <!-- Seleção por Mês -->
      @if (validacao.tipoSelecao() === 'mes') {
        <div class="selecao-mes">
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
        <div class="selecao-intervalo">
          <input 
            type="date"
            [value]="validacao.dataInicio()"
            [min]="validacao.obterDataMinimaInicio() | date:'yyyy-MM-dd'"
            [max]="validacao.obterDataMaximaInicio() | date:'yyyy-MM-dd'"
            (change)="validacao.definirDataInicio($event.target.value)">
          
          <input 
            type="date"
            [value]="validacao.dataFim()"
            [min]="validacao.obterDataMinimaFim() | date:'yyyy-MM-dd'"
            [max]="validacao.obterDataMaximaFim() | date:'yyyy-MM-dd'"
            (change)="validacao.definirDataFim($event.target.value)">
        </div>
      }

      <!-- Status da Validação -->
      <div class="status-validacao">
        <h3>Status da Validação:</h3>
        <p><strong>Válido:</strong> {{ !validacao.formularioInvalido() ? 'Sim' : 'Não' }}</p>
        <p><strong>Período:</strong> {{ validacao.periodoFormatado() || 'Não selecionado' }}</p>
        
        @if (validacao.temErros()) {
          <div class="erro">
            <strong>Erro:</strong> {{ validacao.mensagemErro() }}
          </div>
        }
      </div>

      <!-- Estado Completo -->
      <div class="estado-completo">
        <h3>Estado Completo:</h3>
        <pre>{{ estadoCompleto | json }}</pre>
      </div>

      <!-- Botões de Ação -->
      <div class="acoes">
        <button 
          [disabled]="validacao.formularioInvalido()"
          (click)="aplicarFiltro()">
          Aplicar Filtro
        </button>
        
        <button (click)="limparTudo()">
          Limpar Tudo
        </button>
        
        <button (click)="definirValoresExemplo()">
          Valores de Exemplo
        </button>
      </div>
    </div>
  `,
  styles: [`
    .validacao-example {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    .tipo-selecao {
      margin-bottom: 20px;
    }
    
    .tipo-selecao label {
      margin-right: 20px;
    }
    
    .selecao-mes, .selecao-intervalo {
      margin-bottom: 20px;
    }
    
    .selecao-mes select, .selecao-intervalo input {
      margin-right: 10px;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .status-validacao {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .erro {
      color: #d32f2f;
      background: #ffebee;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }
    
    .estado-completo {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .estado-completo pre {
      background: #fff;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    .acoes button {
      margin-right: 10px;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .acoes button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .acoes button:not(:disabled) {
      background: #1976d2;
      color: white;
    }
    
    .acoes button:not(:disabled):hover {
      background: #1565c0;
    }
  `],
  standalone: true
})
export class ValidacaoPeriodoExampleComponent implements OnInit, AfterViewInit {
  // Injeção do serviço de validação
  private readonly validacao = inject(ValidacaoPeriodoService);

  // Estado completo para exibição
  estadoCompleto: any = {};

  ngOnInit(): void {
    console.log('🚀 ngOnInit - Inicializando validação');
    
    // Exemplo de uso no ngOnInit
    this.validacao.definirTipoSelecao('mes');
    this.validacao.definirMes('01');
    this.validacao.definirAno('2024');
    
    // Atualizar estado para exibição
    this.atualizarEstadoCompleto();
  }

  ngAfterViewInit(): void {
    console.log('🎯 ngAfterViewInit - Validação após view inicializada');
    
    // Exemplo de uso no ngAfterViewInit
    // Aqui você pode fazer validações que dependem do DOM
    this.validarElementosDOM();
  }

  // ==================== MÉTODOS PÚBLICOS ====================
  
  aplicarFiltro(): void {
    if (this.validacao.formularioInvalido()) {
      console.log('❌ Formulário inválido:', this.validacao.mensagemErro());
      return;
    }

    const estado = this.validacao.obterEstado();
    console.log('✅ Aplicando filtro:', estado);
    
    // Aqui você faria a navegação ou chamada de API
    // this.router.navigate(['/extrato/pdf']);
  }

  limparTudo(): void {
    console.log('🧹 Limpando todos os valores');
    this.validacao.limparValores();
    this.atualizarEstadoCompleto();
  }

  definirValoresExemplo(): void {
    console.log('📝 Definindo valores de exemplo');
    
    // Exemplo 1: Valores por mês
    this.validacao.definirValores({
      tipoSelecao: 'mes',
      mes: '03',
      ano: '2024'
    });
    
    // Aguardar um pouco e mudar para intervalo
    setTimeout(() => {
      this.validacao.definirValores({
        tipoSelecao: 'intervalo',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31'
      });
      this.atualizarEstadoCompleto();
    }, 2000);
    
    this.atualizarEstadoCompleto();
  }

  // ==================== MÉTODOS PRIVADOS ====================
  
  private atualizarEstadoCompleto(): void {
    this.estadoCompleto = this.validacao.obterEstado();
  }

  private validarElementosDOM(): void {
    // Exemplo de validação que depende do DOM
    const inputs = document.querySelectorAll('input, select');
    console.log('🔍 Elementos encontrados:', inputs.length);
    
    // Aqui você pode fazer validações específicas do DOM
    inputs.forEach((element, index) => {
      console.log(`Elemento ${index}:`, element);
    });
  }

  // ==================== EXEMPLOS DE USO AVANÇADO ====================
  
  /**
   * Exemplo de validação customizada
   */
  validarCustomizada(): boolean {
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

  /**
   * Exemplo de validação em tempo real
   */
  validarTempoReal(): void {
    // Esta função pode ser chamada a qualquer momento
    const valido = this.validacao.validarFormulario();
    const erro = this.validacao.mensagemErro();
    
    console.log('⏰ Validação em tempo real:', { valido, erro });
  }

  /**
   * Exemplo de uso com dados externos
   */
  processarDadosExternos(dados: any): void {
    // Processar dados vindos de uma API ou outro serviço
    this.validacao.definirValores({
      tipoSelecao: dados.tipo || 'mes',
      mes: dados.mes || '',
      ano: dados.ano || '',
      dataInicio: dados.dataInicio || '',
      dataFim: dados.dataFim || ''
    });
    
    this.atualizarEstadoCompleto();
  }
}
