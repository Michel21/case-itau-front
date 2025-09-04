import { Mes, PeriodoMesAno } from './periodo.interface';

/**
 * Interface para geração de dados de período (Interface Segregation Principle)
 */
export interface IGeradorPeriodo {
  gerarPeriodos(): PeriodoMesAno[];
  gerarMeses(): Mes[];
  gerarAnos(): string[];
}
