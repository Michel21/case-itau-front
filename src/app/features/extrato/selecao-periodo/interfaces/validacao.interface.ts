/**
 * Interface para validação de períodos (Interface Segregation Principle)
 */
export interface IValidadorPeriodo {
  validarIntervaloDatas(dataInicio: Date, dataFim: Date): boolean;
  validarLimiteHistorico(data: Date): boolean;
  validarPeriodoCompleto(
    tipo: 'mes' | 'intervalo',
    mes?: string,
    ano?: string,
    dataInicio?: Date,
    dataFim?: Date
  ): { valido: boolean; mensagem: string };
}
