import { Injectable, signal, computed, inject } from '@angular/core';
import { IValidadorPeriodo } from './interfaces/validacao.interface';
import { IGeradorPeriodo } from './interfaces/gerador.interface';
import { IFormatadorPeriodo } from './interfaces/formatador.interface';
import { ValidadorPeriodoService } from './services/validador-periodo.service';
import { GeradorPeriodoService } from './services/gerador-periodo.service';
import { FormatadorPeriodoService } from './services/formatador-periodo.service';
import { PeriodoMesAno, Mes, PeriodoAtual, ResultadoValidacao } from './interfaces/periodo.interface';

/**
 * Serviço principal que coordena as operações de período (Dependency Inversion Principle)
 * Depende de abstrações (interfaces) ao invés de implementações concretas
 */
@Injectable({
  providedIn: 'root'
})
export class SelecaoPeriodoService {
  // Injeção de dependências (Dependency Inversion Principle)
  private readonly validador = inject<IValidadorPeriodo>(ValidadorPeriodoService);
  private readonly gerador = inject<IGeradorPeriodo>(GeradorPeriodoService);
  private readonly formatador = inject<IFormatadorPeriodo>(FormatadorPeriodoService);

  // Signals para estado reativo
  private readonly _periodos = signal<PeriodoMesAno[]>([]);
  private readonly _meses = signal<Mes[]>([]);
  private readonly _anos = signal<string[]>([]);
  private readonly _periodoAtual = signal<PeriodoAtual>({ mes: '', ano: '' });

  // Computed values para dados derivados
  readonly periodos = this._periodos.asReadonly();
  readonly meses = this._meses.asReadonly();
  readonly anos = this._anos.asReadonly();
  readonly periodoAtual = this._periodoAtual.asReadonly();

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

  constructor() {
    // Inicializar dados diretamente sem effect
    this.inicializarDados();
  }

  private inicializarDados(): void {
    this.gerarPeriodos();
    this.gerarMeses();
    this.gerarAnos();
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
   * Define um período selecionado
   */
  definirPeriodo(periodo: PeriodoMesAno): void {
    // Aqui você pode implementar a lógica para salvar o período selecionado
    console.log('Período definido:', periodo);
  }

  /**
   * Valida se um período é válido
   */
  validarPeriodo(mes: string, ano: string): boolean {
    if (!mes || !ano) return false;
    
    const dataPeriodo = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    return this.validador.validarLimiteHistorico(dataPeriodo);
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
   * Obtém a data máxima permitida (hoje)
   */
  obterDataMaxima(): Date {
    return new Date();
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
   * Obtém estatísticas básicas dos dados
   */
  obterEstatisticas() {
    return {
      totalPeriodos: this.totalPeriodos(),
      totalMeses: this.totalMeses(),
      totalAnos: this.totalAnos(),
      periodoAtual: this.periodoAtualFormatado(),
      limiteDias: 90,
      limiteMeses: 12
    };
  }

  /**
   * Limpa todos os dados (útil para testes)
   */
  limparDados(): void {
    this._periodos.set([]);
    this._meses.set([]);
    this._anos.set([]);
    this._periodoAtual.set({ mes: '', ano: '' });
  }
}
