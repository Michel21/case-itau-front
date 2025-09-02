import { Injectable, signal, computed } from '@angular/core';

export interface PeriodoMesAno {
  tipo: string;
  valor: string;
}

export interface PeriodoIntervalo {
  dataInicio: Date;
  dataFim: Date;
  dias: number;
}

export interface Mes {
  valor: string;
  nome: string;
}

export interface Ano {
  valor: string;
}

export interface PeriodoAtual {
  mes: string;
  ano: string;
}

export interface ResultadoValidacao {
  valido: boolean;
  mensagem: string;
}

@Injectable({
  providedIn: 'root'
})
export class SelecaoPeriodoService {
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
      return this.formatarPeriodo(periodo.mes, periodo.ano);
    }
    return '';
  });

  // Constantes de validação
  readonly LIMITE_DIAS_INTERVALO = 90;
  readonly LIMITE_MESES_HISTORICO = 12;

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
    const periodos: PeriodoMesAno[] = [];
    const dataAtual = new Date();
    
    for (let i = 0; i < this.LIMITE_MESES_HISTORICO; i++) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      
      periodos.push({
        tipo: this.obterNomeMesPorNumero(mes) + '/' + ano,
        valor: `${mes}/${ano}`
      });
    }
    
    this._periodos.set(periodos);
  }

  /**
   * Gera lista de meses dos últimos 12 meses
   */
  gerarMeses(): void {
    const meses: Mes[] = [];
    const dataAtual = new Date();
    
    // Gerar apenas os meses dos últimos 12 meses, mas manter ordem padrão (Janeiro a Dezembro)
    for (let i = 0; i < this.LIMITE_MESES_HISTORICO; i++) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
      const mes = data.getMonth() + 1;
      
      meses.push({
        valor: mes.toString(),
        nome: this.obterNomeMesPorNumero(mes)
      });
    }
    
    // Ordenar por valor do mês (1 a 12) para manter ordem padrão
    meses.sort((a, b) => parseInt(a.valor) - parseInt(b.valor));
    
    this._meses.set(meses);
  }

  /**
   * Gera lista de anos dos últimos 12 meses
   */
  gerarAnos(): void {
    const anos: string[] = [];
    const dataAtual = new Date();
    
    // Gerar anos dos últimos 12 meses
    for (let i = 0; i < this.LIMITE_MESES_HISTORICO; i++) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
      const ano = data.getFullYear();
      
      // Adicionar ano apenas se não existir na lista
      if (!anos.includes(ano.toString())) {
        anos.push(ano.toString());
      }
    }
    
    // Ordenar anos em ordem crescente
    // anos.sort((a, b) => parseInt(a) - parseInt(b));
    
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
   * Valida se um período é válido
   */
  validarPeriodo(mes: string, ano: string): boolean {
    const mesNum = parseInt(mes, 10);
    const anoNum = parseInt(ano, 10);
    
    // Validações básicas
    if (mesNum < 1 || mesNum > 12) return false;
    
    // Verificar se o período está dentro dos últimos 12 meses
    const dataAtual = new Date();
    const dataLimite = this.obterDataLimiteHistorico();
    const dataSelecionada = new Date(anoNum, mesNum - 1, 1);
    
    return dataSelecionada >= dataLimite && dataSelecionada <= dataAtual;
  }

  /**
   * Valida se um intervalo de datas é válido (máximo 90 dias)
   */
  validarIntervaloDatas(dataInicio: Date, dataFim: Date): boolean {
    if (!dataInicio || !dataFim) return false;
    if (dataInicio > dataFim) return false;
    
    const dias = this.calcularDiasEntreDatas(dataInicio, dataFim);
    return dias <= this.LIMITE_DIAS_INTERVALO;
  }

  /**
   * Valida se uma data está dentro do limite histórico (12 meses)
   */
  validarLimiteHistorico(data: Date): boolean {
    if (!data) return false;
    
    const dataLimite = this.obterDataLimiteHistorico();
    return data >= dataLimite;
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
    if (tipo === 'mes') {
      if (!mes || !ano) {
        return { valido: false, mensagem: 'Mês e ano são obrigatórios' };
      }
      
      if (!this.validarPeriodo(mes, ano)) {
        return { valido: false, mensagem: 'Período inválido' };
      }
      
      return { valido: true, mensagem: '' };
    }
    
    if (tipo === 'intervalo') {
      if (!dataInicio || !dataFim) {
        return { valido: false, mensagem: 'Data início e fim são obrigatórias' };
      }
      
      if (!this.validarIntervaloDatas(dataInicio, dataFim)) {
        return { 
          valido: false, 
          mensagem: `Intervalo não pode exceder ${this.LIMITE_DIAS_INTERVALO} dias` 
        };
      }
      
      if (!this.validarLimiteHistorico(dataInicio) || !this.validarLimiteHistorico(dataFim)) {
        return { 
          valido: false, 
          mensagem: `Período não pode ser anterior a ${this.LIMITE_MESES_HISTORICO} meses` 
        };
      }
      
      return { valido: true, mensagem: '' };
    }
    
    return { valido: false, mensagem: 'Tipo de período inválido' };
  }

  /**
   * Formata um período para exibição
   */
  formatarPeriodo(mes: string, ano: string): string {
    if (!this.validarPeriodo(mes, ano)) return '';
    
    const nomeMes = this.obterNomeMes(mes);
    return `${nomeMes}/${ano}`;
  }

  /**
   * Formata um intervalo de datas para exibição
   */
  formatarIntervalo(dataInicio: Date, dataFim: Date): string {
    if (!dataInicio || !dataFim) return '';
    
    const formatoData = (data: Date): string => {
      return data.toLocaleDateString('pt-BR');
    };
    
    return `${formatoData(dataInicio)} a ${formatoData(dataFim)}`;
  }

  /**
   * Calcula o número de dias entre duas datas
   */
  calcularDiasEntreDatas(dataInicio: Date, dataFim: Date): number {
    const umDia = 24 * 60 * 60 * 1000; // milissegundos em um dia
    const diferenca = Math.abs(dataFim.getTime() - dataInicio.getTime());
    return Math.ceil(diferenca / umDia);
  }

  /**
   * Obtém a data limite para histórico (12 meses atrás)
   */
  obterDataLimiteHistorico(): Date {
    const dataAtual = new Date();
    return new Date(dataAtual.getFullYear(), dataAtual.getMonth() - this.LIMITE_MESES_HISTORICO, 1);
  }

  /**
   * Obtém a data máxima permitida (hoje)
   */
  obterDataMaxima(): Date {
    return new Date();
  }

  /**
   * Obtém o nome de um mês pelo número
   */
  obterNomeMes(mes: string): string {
    const mesNum = parseInt(mes, 10);
    if (mesNum < 1 || mesNum > 12) return '';
    
    return this.obterNomeMesPorNumero(mesNum);
  }

  /**
   * Obtém o nome de um mês pelo número (método auxiliar)
   */
  private obterNomeMesPorNumero(mes: number): string {
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return nomesMeses[mes - 1] || '';
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
      limiteDias: this.LIMITE_DIAS_INTERVALO,
      limiteMeses: this.LIMITE_MESES_HISTORICO
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
