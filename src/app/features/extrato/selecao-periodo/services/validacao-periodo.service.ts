import { Injectable, signal, computed } from '@angular/core';
import { SelecaoPeriodoService } from '../selecao-periodo.service';

/**
 * Serviço de validação de período independente
 * 
 * Características:
 * - Pode ser usado sem FormBuilder
 * - Funciona em qualquer lifecycle hook (ngOnInit, AfterViewInit, etc.)
 * - Validações reativas com signals
 * - Interface limpa e simples
 * - Segue princípios SOLID
 */
@Injectable({
  providedIn: 'root'
})
export class ValidacaoPeriodoService {
  private readonly selecaoPeriodoService = new SelecaoPeriodoService();

  // ==================== ESTADO DE VALIDAÇÃO ====================
  private readonly _tipoSelecao = signal<'intervalo' | 'mes'>('mes');
  private readonly _mesSelecionado = signal<string>('');
  private readonly _anoSelecionado = signal<string>('');
  private readonly _dataInicio = signal<string>('');
  private readonly _dataFim = signal<string>('');

  // ==================== COMPUTED VALIDATIONS ====================
  readonly tipoSelecao = this._tipoSelecao.asReadonly();
  readonly mesSelecionado = this._mesSelecionado.asReadonly();
  readonly anoSelecionado = this._anoSelecionado.asReadonly();
  readonly dataInicio = this._dataInicio.asReadonly();
  readonly dataFim = this._dataFim.asReadonly();

  readonly intervaloInvalido = computed(() => this.validarIntervalo());
  readonly mesInvalido = computed(() => this.validarMes());
  readonly formularioInvalido = computed(() => this.validarFormulario());
  readonly temErros = computed(() => this.formularioInvalido());
  readonly mensagemErro = computed(() => this.obterMensagemErro());

  // ==================== COMPUTED DISPLAY VALUES ====================
  readonly periodoFormatado = computed(() => this.formatarPeriodoSelecionado());

  // ==================== MÉTODOS PÚBLICOS ====================
  
  /**
   * Define o tipo de seleção
   */
  definirTipoSelecao(tipo: 'intervalo' | 'mes'): void {
    this._tipoSelecao.set(tipo);
    this.limparValores();
  }

  /**
   * Define o mês selecionado
   */
  definirMes(mes: string): void {
    this._mesSelecionado.set(mes);
  }

  /**
   * Define o ano selecionado
   */
  definirAno(ano: string): void {
    this._anoSelecionado.set(ano);
  }

  /**
   * Define a data de início
   */
  definirDataInicio(data: string): void {
    this._dataInicio.set(data);
    this.validarELimparDataFimSeNecessario();
  }

  /**
   * Define a data de fim
   */
  definirDataFim(data: string): void {
    this._dataFim.set(data);
  }

  /**
   * Limpa todos os valores
   */
  limparValores(): void {
    this._mesSelecionado.set('');
    this._anoSelecionado.set('');
    this._dataInicio.set('');
    this._dataFim.set('');
  }

  /**
   * Define valores em lote
   */
  definirValores(valores: {
    tipoSelecao?: 'intervalo' | 'mes';
    mes?: string;
    ano?: string;
    dataInicio?: string;
    dataFim?: string;
  }): void {
    if (valores.tipoSelecao !== undefined) {
      this._tipoSelecao.set(valores.tipoSelecao);
    }
    if (valores.mes !== undefined) {
      this._mesSelecionado.set(valores.mes);
    }
    if (valores.ano !== undefined) {
      this._anoSelecionado.set(valores.ano);
    }
    if (valores.dataInicio !== undefined) {
      this._dataInicio.set(valores.dataInicio);
    }
    if (valores.dataFim !== undefined) {
      this._dataFim.set(valores.dataFim);
    }
  }

  /**
   * Obtém o estado atual completo
   */
  obterEstado(): {
    tipoSelecao: 'intervalo' | 'mes';
    mesSelecionado: string;
    anoSelecionado: string;
    dataInicio: string;
    dataFim: string;
    valido: boolean;
    erro: string;
    periodoFormatado: string;
  } {
    return {
      tipoSelecao: this.tipoSelecao(),
      mesSelecionado: this.mesSelecionado(),
      anoSelecionado: this.anoSelecionado(),
      dataInicio: this.dataInicio(),
      dataFim: this.dataFim(),
      valido: !this.formularioInvalido(),
      erro: this.mensagemErro(),
      periodoFormatado: this.periodoFormatado()
    };
  }

  // ==================== MÉTODOS DE VALIDAÇÃO ====================
  
  /**
   * Valida se o formulário está válido
   */
  validarFormulario(): boolean {
    if (this.tipoSelecao() === 'mes') {
      return !this.mesSelecionado() || !this.anoSelecionado() || this.mesInvalido();
    } else {
      return !this.dataInicio() || !this.dataFim() || this.intervaloInvalido();
    }
  }

  /**
   * Valida se o intervalo de datas é válido
   */
  validarIntervalo(): boolean {
    if (this.tipoSelecao() !== 'intervalo') return false;

    const inicio = this.dataInicio();
    const fim = this.dataFim();
    if (!inicio || !fim) return false;

    const dataInicio = this.parsearDataString(inicio);
    const dataFim = this.parsearDataString(fim);

    return !this.selecaoPeriodoService.validarIntervaloDatas(dataInicio, dataFim);
  }

  /**
   * Valida se o mês é válido
   */
  validarMes(): boolean {
    if (this.tipoSelecao() !== 'mes') return false;

    const mes = this.mesSelecionado();
    const ano = this.anoSelecionado();
    if (!mes || !ano) return false;

    return !this.selecaoPeriodoService.validarPeriodo(mes, ano);
  }

  /**
   * Valida um campo específico
   */
  validarCampo(campo: 'mes' | 'ano' | 'dataInicio' | 'dataFim'): boolean {
    switch (campo) {
      case 'mes':
        return !this.mesSelecionado() || this.validarMes();
      case 'ano':
        return !this.anoSelecionado() || this.validarMes();
      case 'dataInicio':
        return !this.dataInicio() || this.validarDataInicio();
      case 'dataFim':
        return !this.dataFim() || this.validarDataFim();
      default:
        return false;
    }
  }

  /**
   * Valida se uma data específica é válida
   */
  validarData(data: string): boolean {
    if (!data) return false;
    const dataObj = this.parsearDataString(data);
    return this.selecaoPeriodoService.validarLimiteHistorico(dataObj);
  }

  // ==================== MÉTODOS DE FORMATAÇÃO ====================
  
  /**
   * Formata o período selecionado
   */
  formatarPeriodoSelecionado(): string {
    if (this.tipoSelecao() === 'mes') {
      return this.formatarPeriodoMes();
    } else {
      return this.formatarPeriodoIntervalo();
    }
  }

  /**
   * Formata período de mês
   */
  formatarPeriodoMes(): string {
    const mes = this.mesSelecionado();
    const ano = this.anoSelecionado();
    if (!mes || !ano) return '';

    return this.selecaoPeriodoService.formatarPeriodo(mes, ano);
  }

  /**
   * Formata período de intervalo
   */
  formatarPeriodoIntervalo(): string {
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    if (!inicio || !fim) return '';

    const dataInicio = this.parsearDataString(inicio);
    const dataFim = this.parsearDataString(fim);
    return this.selecaoPeriodoService.formatarIntervalo(dataInicio, dataFim);
  }

  // ==================== MÉTODOS DE DATA ====================
  
  /**
   * Obtém a data mínima permitida
   */
  obterDataMinima(): Date {
    return this.criarDataSemTimezone(this.selecaoPeriodoService.obterDataLimiteHistorico());
  }

  /**
   * Obtém a data máxima permitida
   */
  obterDataMaxima(): Date {
    return this.criarDataSemTimezone(this.selecaoPeriodoService.obterDataMaxima());
  }

  /**
   * Obtém a data mínima para início
   */
  obterDataMinimaInicio(): Date {
    return this.obterDataMinima();
  }

  /**
   * Obtém a data máxima para início
   */
  obterDataMaximaInicio(): Date {
    return this.obterDataMaxima();
  }

  /**
   * Obtém a data mínima para fim
   */
  obterDataMinimaFim(): Date {
    const dataInicio = this.dataInicio();
    if (!dataInicio) return this.obterDataMinima();
    
    const inicio = this.parsearDataString(dataInicio);
    const dataMinima = this.obterDataMinima();
    
    return inicio > dataMinima ? inicio : dataMinima;
  }

  /**
   * Obtém a data máxima para fim
   */
  obterDataMaximaFim(): Date {
    const dataInicio = this.dataInicio();
    if (!dataInicio) return this.obterDataMaxima();
    
    const inicio = this.parsearDataString(dataInicio);
    const dataMaxima = this.obterDataMaxima();
    const dataLimite90Dias = this.calcularDataLimite90Dias(inicio);
    
    return dataLimite90Dias < dataMaxima ? dataLimite90Dias : dataMaxima;
  }

  // ==================== MÉTODOS PRIVADOS ====================
  
  private validarELimparDataFimSeNecessario(): void {
    const dataInicio = this.dataInicio();
    const dataFim = this.dataFim();
    
    if (!dataInicio || !dataFim) return;
    
    const inicio = this.parsearDataString(dataInicio);
    const fim = this.parsearDataString(dataFim);
    
    if (!this.selecaoPeriodoService.validarIntervaloDatas(inicio, fim)) {
      this._dataFim.set('');
    }
  }

  private validarDataInicio(): boolean {
    const dataInicio = this.dataInicio();
    if (!dataInicio) return false;
    
    const data = this.parsearDataString(dataInicio);
    return this.selecaoPeriodoService.validarLimiteHistorico(data);
  }

  private validarDataFim(): boolean {
    const dataFim = this.dataFim();
    if (!dataFim) return false;
    
    const data = this.parsearDataString(dataFim);
    return this.selecaoPeriodoService.validarLimiteHistorico(data);
  }

  private obterMensagemErro(): string {
    if (this.tipoSelecao() === 'mes' && this.mesInvalido()) {
      return 'O mês selecionado está fora do limite de 12 meses (passado ou futuro)';
    }
    
    if (this.tipoSelecao() === 'intervalo' && this.intervaloInvalido()) {
      return 'O intervalo selecionado não pode ser superior a 90 dias';
    }
    
    return 'Por favor, preencha todos os campos obrigatórios';
  }

  private parsearDataString(dataString: string): Date {
    return new Date(dataString + 'T00:00:00');
  }

  private criarDataSemTimezone(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  private calcularDataLimite90Dias(dataInicio: Date): Date {
    const dataLimite = new Date(dataInicio);
    dataLimite.setDate(dataInicio.getDate() + 90);
    return dataLimite;
  }
}
