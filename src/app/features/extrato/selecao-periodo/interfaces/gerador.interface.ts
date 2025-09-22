import { Mes, PeriodoMesAno, ConfiguracaoPeriodo } from './periodo.interface';

/**
 * Interface para geração de dados de período (Interface Segregation Principle)
 * - Segregação: Interface específica apenas para geração de dados
 * - Single Responsibility: Responsável apenas por gerar dados
 */
export interface IGeradorPeriodo {
  /**
   * Gera lista de períodos dos últimos N meses
   */
  gerarPeriodos(): PeriodoMesAno[];
  
  /**
   * Gera lista de meses dos últimos N meses
   */
  gerarMeses(): Mes[];
  
  /**
   * Gera lista de anos dos últimos N meses
   */
  gerarAnos(): string[];
  
  /**
   * Gera período atual (mês e ano)
   */
  gerarPeriodoAtual(): { mes: string; ano: string };
  
  /**
   * Gera lista de períodos baseada em configuração
   */
  gerarPeriodosComConfiguracao(configuracao: ConfiguracaoPeriodo): PeriodoMesAno[];
  
  /**
   * Gera períodos no formato "Ano | Mês" para dropdown único
   */
  gerarPeriodosDropdown(): Array<{ valor: string; nome: string; mes: string; ano: string }>;
}

/**
 * Interface para geração de dados de configuração (Interface Segregation Principle)
 */
export interface IGeradorConfiguracao {
  /**
   * Gera configuração padrão
   */
  gerarConfiguracaoPadrao(): ConfiguracaoPeriodo;
  
  /**
   * Gera configuração customizada
   */
  gerarConfiguracaoCustomizada(
    limiteDias: number,
    limiteMeses: number,
    permitirFuturas: boolean
  ): ConfiguracaoPeriodo;
}
