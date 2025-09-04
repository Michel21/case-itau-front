/**
 * Interface para formatação de períodos (Interface Segregation Principle)
 */
export interface IFormatadorPeriodo {
  formatarPeriodo(mes: string, ano: string): string;
  formatarIntervalo(dataInicio: Date, dataFim: Date): string;
  obterNomeMes(numeroMes: string): string;
}
