/**
 * Interfaces para o domínio de período seguindo princípios SOLID
 * - Interface Segregation: Interfaces específicas e coesas
 * - Single Responsibility: Cada interface tem uma responsabilidade única
 */

// ===== INTERFACES DE DOMÍNIO =====

/**
 * Representa um período selecionado pelo usuário
 */
export interface PeriodoMesAno {
  readonly tipo: 'mes' | 'intervalo';
  readonly valor: string;
  readonly mes?: string;
  readonly ano?: string;
  readonly dataInicio?: string;
  readonly dataFim?: string;
}

/**
 * Representa um intervalo de datas com informações calculadas
 */
export interface PeriodoIntervalo {
  readonly dataInicio: Date;
  readonly dataFim: Date;
  readonly dias: number;
}

/**
 * Representa um mês com suas informações
 */
export interface Mes {
  readonly valor: string;
  readonly nome: string;
  readonly ano: number;
}

/**
 * Representa um ano
 */
export interface Ano {
  readonly valor: string;
}

/**
 * Representa o período atual (mês e ano)
 */
export interface PeriodoAtual {
  readonly mes: string;
  readonly ano: string;
}

// ===== INTERFACES DE VALIDAÇÃO =====

/**
 * Resultado de uma validação
 */
export interface ResultadoValidacao {
  readonly valido: boolean;
  readonly mensagem: string;
  readonly codigo?: string;
}

/**
 * Configuração para validações de período
 */
export interface ConfiguracaoPeriodo {
  readonly limiteDiasIntervalo: number;
  readonly limiteMesesHistorico: number;
  readonly permitirDatasFuturas: boolean;
}

// ===== INTERFACES DE ESTADO =====

/**
 * Estado do formulário de seleção de período
 */
export interface EstadoFormulario {
  readonly tipoSelecao: 'mes' | 'intervalo';
  readonly mesSelecionado: string;
  readonly anoSelecionado: string;
  readonly dataInicio: string;
  readonly dataFim: string;
  readonly valido: boolean;
  readonly erros: string[];
}

// ===== INTERFACES DE EVENTOS =====

/**
 * Evento de mudança de período
 */
export interface EventoMudancaPeriodo {
  readonly tipo: 'selecao' | 'validacao' | 'formato';
  readonly dados: PeriodoMesAno;
  readonly timestamp: Date;
}

// ===== INTERFACES DE CONFIGURAÇÃO =====

/**
 * Configuração do serviço de período
 */
export interface ConfiguracaoServico {
  readonly validacao: ConfiguracaoPeriodo;
  readonly formatacao: {
    readonly locale: string;
    readonly formatoData: string;
    readonly formatoMes: string;
  };
  readonly debug: boolean;
}
