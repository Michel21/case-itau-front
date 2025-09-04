/**
 * Interfaces para o domínio de período seguindo princípios SOLID
 */

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
  ano: number;
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

export interface ConfiguracaoPeriodo {
  limiteDiasIntervalo: number;
  limiteMesesHistorico: number;
}
