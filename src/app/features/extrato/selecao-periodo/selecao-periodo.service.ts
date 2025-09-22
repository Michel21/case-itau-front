import { Injectable, signal, computed, inject } from '@angular/core';
import { IValidadorPeriodo } from './interfaces/validacao.interface';
import { IGeradorPeriodo } from './interfaces/gerador.interface';
import { IFormatadorPeriodo } from './interfaces/formatador.interface';
import { ValidadorPeriodoService } from './services/validador-periodo.service';
import { GeradorPeriodoService } from './services/gerador-periodo.service';
import { FormatadorPeriodoService } from './services/formatador-periodo.service';
import { 
  PeriodoMesAno, 
  Mes, 
  PeriodoAtual, 
  ResultadoValidacao, 
  ConfiguracaoPeriodo,
  EstadoFormulario,
  EventoMudancaPeriodo
} from './interfaces/periodo.interface';

/**
 * Serviço principal que coordena as operações de período (Dependency Inversion Principle)
 * - DIP: Depende de abstrações (interfaces) ao invés de implementações concretas
 * - SRP: Coordena operações entre serviços especializados
 * - Open/Closed: Aberto para extensão através de novas implementações das interfaces
 */
@Injectable({
  providedIn: 'root'
})
export class SelecaoPeriodoService {
  // Injeção de dependências (Dependency Inversion Principle)
  private readonly validador = inject<IValidadorPeriodo>(ValidadorPeriodoService);
  private readonly gerador = inject<IGeradorPeriodo>(GeradorPeriodoService);
  private readonly formatador = inject<IFormatadorPeriodo>(FormatadorPeriodoService);

  // Signals para estado reativo (Clean Code - Nomes descritivos)
  private readonly _periodos = signal<PeriodoMesAno[]>([]);
  private readonly _meses = signal<Mes[]>([]);
  private readonly _anos = signal<string[]>([]);
  private readonly _periodosDropdown = signal<Array<{ valor: string; label: string; mes: string; ano: string }>>([]);
  private readonly _periodoAtual = signal<PeriodoAtual>({ mes: '', ano: '' });
  private readonly _periodoSelecionado = signal<PeriodoMesAno | null>(null);
  private readonly _estadoFormulario = signal<EstadoFormulario>({
    tipoSelecao: 'mes',
    mesSelecionado: '',
    anoSelecionado: '',
    dataInicio: '',
    dataFim: '',
    valido: false,
    erros: []
  });

  // Computed values para dados derivados (Clean Code - Computed properties)
  readonly periodos = this._periodos.asReadonly();
  readonly meses = this._meses.asReadonly();
  readonly anos = this._anos.asReadonly();
  readonly periodosDropdown = this._periodosDropdown.asReadonly();
  readonly periodoAtual = this._periodoAtual.asReadonly();
  readonly periodoSelecionado = this._periodoSelecionado.asReadonly();
  readonly estadoFormulario = this._estadoFormulario.asReadonly();

  // Computed para estatísticas básicas
  readonly totalPeriodos = computed(() => this._periodos().length);
  readonly totalMeses = computed(() => this._meses().length);
  readonly totalAnos = computed(() => this._anos().length);
  readonly periodoAtualFormatado = computed(() => {
    const periodo = this._periodoAtual();
    if (periodo.mes && periodo.ano) {
      return this.formatador.formatarPeriodo(periodo.mes, periodo.ano);
    }
    return '';
  });

  // Computed para validação do estado atual
  readonly formularioValido = computed(() => {
    const estado = this._estadoFormulario();
    return estado.valido && estado.erros.length === 0;
  });

  readonly temPeriodoSelecionado = computed(() => {
    return this._periodoSelecionado() !== null;
  });

  constructor() {
    // Inicializar dados diretamente sem effect
    this.inicializarDados();
  }

  private inicializarDados(): void {
    this.gerarPeriodos();
    this.gerarMeses();
    this.gerarAnos();
    this.gerarPeriodosDropdown();
    this.definirPeriodoAtual();
  }

  /**
   * Gera lista de períodos dos últimos 12 meses
   */
  gerarPeriodos(): void {
    const periodos = this.gerador.gerarPeriodos();
    this._periodos.set(periodos);
  }

  /**
   * Gera lista de meses dos últimos 12 meses
   */
  gerarMeses(): void {
    const meses = this.gerador.gerarMeses();
    this._meses.set(meses);
  }

  /**
   * Gera lista de anos dos últimos 12 meses
   */
  gerarAnos(): void {
    const anos = this.gerador.gerarAnos();
    this._anos.set(anos);
  }

  /**
   * Gera períodos no formato "Ano | Mês" para dropdown único
   */
  gerarPeriodosDropdown(): void {
    const periodosDropdown = this.gerador.gerarPeriodosDropdown();
    this._periodosDropdown.set(periodosDropdown);
  }

  /**
   * Define o período atual (mês e ano)
   */
  private definirPeriodoAtual(): void {
    const dataAtual = new Date();
    const mes = (dataAtual.getMonth() + 1).toString();
    const ano = dataAtual.getFullYear().toString();
    
    this._periodoAtual.set({ mes, ano });
  }

  /**
   * Obtém o período atual
   */
  obterPeriodoAtual(): PeriodoAtual {
    return this._periodoAtual();
  }

  /**
   * Define um período selecionado (Clean Code - Método com responsabilidade única)
   */
  definirPeriodo(periodo: PeriodoMesAno): void {
    this._periodoSelecionado.set(periodo);
    this.emitirEventoMudanca('selecao', periodo);
  }

  /**
   * Atualiza o estado do formulário (Clean Code - Método específico)
   */
  atualizarEstadoFormulario(estado: Partial<EstadoFormulario>): void {
    const estadoAtual = this._estadoFormulario();
    const novoEstado: EstadoFormulario = {
      ...estadoAtual,
      ...estado
    };
    
    this._estadoFormulario.set(novoEstado);
  }

  /**
   * Valida e atualiza o estado do formulário (Clean Code - Método com responsabilidade única)
   */
  validarEAtualizarEstado(): void {
    const estado = this._estadoFormulario();
    const erros: string[] = [];
    
    if (estado.tipoSelecao === 'mes') {
      if (!estado.mesSelecionado || !estado.anoSelecionado) {
        erros.push('Mês e ano são obrigatórios');
      } else {
        const validacao = this.validador.validarPeriodoCompleto(
          'mes',
          estado.mesSelecionado,
          estado.anoSelecionado
        );
        if (!validacao.valido) {
          erros.push(validacao.mensagem);
        }
      }
    } else {
      if (!estado.dataInicio || !estado.dataFim) {
        erros.push('Data de início e fim são obrigatórias');
      } else {
        const dataInicio = new Date(estado.dataInicio);
        const dataFim = new Date(estado.dataFim);
        const validacao = this.validador.validarPeriodoCompleto(
          'intervalo',
          undefined,
          undefined,
          dataInicio,
          dataFim
        );
        if (!validacao.valido) {
          erros.push(validacao.mensagem);
        }
      }
    }
    
    this.atualizarEstadoFormulario({
      valido: erros.length === 0,
      erros
    });
  }

  /**
   * Emite evento de mudança (Clean Code - Método auxiliar)
   */
  private emitirEventoMudanca(tipo: EventoMudancaPeriodo['tipo'], dados: PeriodoMesAno): void {
    const evento: EventoMudancaPeriodo = {
      tipo,
      dados,
      timestamp: new Date()
    };
    
    // Aqui você pode implementar um sistema de eventos se necessário
    console.log('Evento de mudança:', evento);
  }

  /**
   * Valida se um período é válido
   */
  validarPeriodo(mes: string, ano: string): boolean {
    if (!mes || !ano) return false;
    
    const validacao = this.validador.validarPeriodoCompleto('mes', mes, ano);
    return validacao.valido;
  }

  /**
   * Valida se um intervalo de datas é válido (máximo 90 dias)
   */
  validarIntervaloDatas(dataInicio: Date, dataFim: Date): boolean {
    return this.validador.validarIntervaloDatas(dataInicio, dataFim);
  }

  /**
   * Valida se uma data está dentro do limite histórico (12 meses)
   */
  validarLimiteHistorico(data: Date): boolean {
    return this.validador.validarLimiteHistorico(data);
  }

  /**
   * Valida um período completo baseado no tipo
   */
  validarPeriodoCompleto(
    tipo: 'intervalo' | 'mes',
    mes?: string,
    ano?: string,
    dataInicio?: Date,
    dataFim?: Date
  ): ResultadoValidacao {
    return this.validador.validarPeriodoCompleto(tipo, mes, ano, dataInicio, dataFim);
  }

  /**
   * Formata um período para exibição
   */
  formatarPeriodo(mes: string, ano: string): string {
    return this.formatador.formatarPeriodo(mes, ano);
  }

  /**
   * Formata um intervalo de datas para exibição
   */
  formatarIntervalo(dataInicio: Date, dataFim: Date): string {
    return this.formatador.formatarIntervalo(dataInicio, dataFim);
  }

  /**
   * Obtém a data limite para histórico (12 meses atrás)
   */
  obterDataLimiteHistorico(): Date {
    const dataAtual = new Date();
    return new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 12, 1);
  }

  /**
   * Obtém a data máxima permitida
   */
  obterDataMaxima(): Date {
    const dataAtual = new Date();
    const configuracao = this.validador.obterConfiguracao();
    
    // Se não permitir datas futuras, retornar apenas a data atual
    if (!configuracao.permitirDatasFuturas) {
      return dataAtual;
    }
    
    // Se permitir datas futuras, retornar 12 meses no futuro
    return new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 12, dataAtual.getDate());
  }

  /**
   * Obtém o nome de um mês pelo número (método auxiliar)
   */
  obterNomeMes(mes: string): string {
    return this.formatador.obterNomeMes(mes);
  }

  /**
   * Atualiza a lista de períodos
   */
  atualizarPeriodos(): void {
    this.gerarPeriodos();
  }

  /**
   * Atualiza a lista de anos
   */
  atualizarAnos(): void {
    this.gerarAnos();
  }

  /**
   * Obtém estatísticas básicas dos dados (Clean Code - Método com responsabilidade única)
   */
  obterEstatisticas() {
    const configuracao = this.validador.obterConfiguracao();
    
    return {
      totalPeriodos: this.totalPeriodos(),
      totalMeses: this.totalMeses(),
      totalAnos: this.totalAnos(),
      periodoAtual: this.periodoAtualFormatado(),
      limiteDias: configuracao.limiteDiasIntervalo,
      limiteMeses: configuracao.limiteMesesHistorico,
      permitirDatasFuturas: configuracao.permitirDatasFuturas,
      temPeriodoSelecionado: this.temPeriodoSelecionado(),
      formularioValido: this.formularioValido()
    };
  }

  /**
   * Limpa todos os dados (útil para testes) (Clean Code - Método específico)
   */
  limparDados(): void {
    this._periodos.set([]);
    this._meses.set([]);
    this._anos.set([]);
    this._periodoAtual.set({ mes: '', ano: '' });
    this._periodoSelecionado.set(null);
    this._estadoFormulario.set({
      tipoSelecao: 'mes',
      mesSelecionado: '',
      anoSelecionado: '',
      dataInicio: '',
      dataFim: '',
      valido: false,
      erros: []
    });
  }

  /**
   * Obtém configuração atual (Clean Code - Método de acesso)
   */
  obterConfiguracao(): ConfiguracaoPeriodo {
    return this.validador.obterConfiguracao();
  }

  /**
   * Reinicializa o serviço (Clean Code - Método de reset)
   */
  reinicializar(): void {
    this.limparDados();
    this.inicializarDados();
  }
}
