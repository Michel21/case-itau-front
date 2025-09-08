import { PeriodoMesAno, PeriodoIntervalo } from './periodo.interface';

/**
 * Interface para formatação de períodos (Interface Segregation Principle)
 * - Segregação: Interface específica apenas para formatação
 * - Single Responsibility: Responsável apenas por formatar dados
 */
export interface IFormatadorPeriodo {
  /**
   * Formata um período (mês/ano) para exibição
   */
  formatarPeriodo(mes: string, ano: string): string;
  
  /**
   * Formata um intervalo de datas para exibição
   */
  formatarIntervalo(dataInicio: Date, dataFim: Date): string;
  
  /**
   * Obtém o nome de um mês pelo número
   */
  obterNomeMes(numeroMes: string): string;
  
  /**
   * Formata uma data para exibição
   */
  formatarData(data: Date, formato?: string): string;
  
  /**
   * Formata um período completo para exibição
   */
  formatarPeriodoCompleto(periodo: PeriodoMesAno): string;
  
  /**
   * Formata um intervalo completo para exibição
   */
  formatarIntervaloCompleto(intervalo: PeriodoIntervalo): string;
}

/**
 * Interface para formatação de mensagens (Interface Segregation Principle)
 */
export interface IFormatadorMensagem {
  /**
   * Formata mensagem de erro
   */
  formatarMensagemErro(codigo: string, parametros?: Record<string, any>): string;
  
  /**
   * Formata mensagem de sucesso
   */
  formatarMensagemSucesso(acao: string): string;
  
  /**
   * Formata mensagem de validação
   */
  formatarMensagemValidacao(erro: string): string;
}
