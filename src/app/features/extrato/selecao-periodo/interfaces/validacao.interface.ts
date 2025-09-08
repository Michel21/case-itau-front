import { ResultadoValidacao, ConfiguracaoPeriodo } from './periodo.interface';

/**
 * Interface para validação de períodos (Interface Segregation Principle)
 * - Segregação: Interface específica apenas para validações
 * - Single Responsibility: Responsável apenas por validações
 */
export interface IValidadorPeriodo {
  /**
   * Valida se um intervalo de datas é válido
   */
  validarIntervaloDatas(dataInicio: Date, dataFim: Date): boolean;
  
  /**
   * Valida se uma data está dentro do limite histórico
   */
  validarLimiteHistorico(data: Date): boolean;
  
  /**
   * Valida um período completo baseado no tipo
   */
  validarPeriodoCompleto(
    tipo: 'mes' | 'intervalo',
    mes?: string,
    ano?: string,
    dataInicio?: Date,
    dataFim?: Date
  ): ResultadoValidacao;
  
  /**
   * Valida se uma data não é futura
   */
  validarDataNaoFutura(data: Date): boolean;
  
  /**
   * Obtém a configuração de validação
   */
  obterConfiguracao(): ConfiguracaoPeriodo;
}

/**
 * Interface para validação de formulários (Interface Segregation Principle)
 */
export interface IValidadorFormulario {
  /**
   * Valida se o formulário está válido
   */
  validarFormulario(dados: any): ResultadoValidacao;
  
  /**
   * Valida um campo específico
   */
  validarCampo(campo: string, valor: any): ResultadoValidacao;
  
  /**
   * Obtém mensagens de erro para um campo
   */
  obterMensagensErro(campo: string, valor: any): string[];
}
