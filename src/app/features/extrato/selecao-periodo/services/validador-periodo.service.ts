import { Injectable } from '@angular/core';
import { IValidadorPeriodo } from '../interfaces/validacao.interface';
import { ConfiguracaoPeriodo, ResultadoValidacao } from '../interfaces/periodo.interface';

/**
 * Serviço responsável apenas pela validação de períodos (Single Responsibility Principle)
 * - SRP: Responsável exclusivamente por validações de período
 * - Open/Closed: Aberto para extensão, fechado para modificação
 * - Liskov Substitution: Pode ser substituído por outras implementações de IValidadorPeriodo
 */
@Injectable({
  providedIn: 'root'
})
export class ValidadorPeriodoService implements IValidadorPeriodo {
  private readonly configuracao: ConfiguracaoPeriodo;

  constructor() {
    this.configuracao = {
      limiteDiasIntervalo: 90,
      limiteMesesHistorico: 12,
      permitirDatasFuturas: false
    };
  }

  validarIntervaloDatas(dataInicio: Date, dataFim: Date): boolean {
    if (!dataInicio || !dataFim) return false;
    if (dataInicio > dataFim) return false;
    
    // Normalizar datas para evitar problemas de timezone
    const inicio = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), dataInicio.getDate());
    const fim = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate());
    
    const diferencaDias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return diferencaDias <= this.configuracao.limiteDiasIntervalo;
  }

  validarLimiteHistorico(data: Date): boolean {
    if (!data) return false;
    
    const dataAtual = new Date();
    
    // Calcular limite histórico (12 meses para trás)
    const limiteHistorico = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth() - this.configuracao.limiteMesesHistorico,
      1
    );
    
    // Verificar se a data está dentro do limite histórico
    if (data < limiteHistorico) {
      return false;
    }
    
    // Se não permitir datas futuras, verificar se a data não é futura
    if (!this.configuracao.permitirDatasFuturas) {
      const ultimoDiaMesAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
      return data <= ultimoDiaMesAtual;
    }
    
    // Se permitir datas futuras, verificar limite de 12 meses à frente
    const limiteFuturo = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth() + this.configuracao.limiteMesesHistorico,
      1
    );
    
    return data <= limiteFuturo;
  }

  validarPeriodoCompleto(
    tipo: 'mes' | 'intervalo',
    mes?: string,
    ano?: string,
    dataInicio?: Date,
    dataFim?: Date
  ): ResultadoValidacao {
    if (tipo === 'mes') {
      return this.validarPeriodoMesAno(mes, ano);
    }
    
    if (tipo === 'intervalo') {
      return this.validarPeriodoIntervalo(dataInicio, dataFim);
    }
    
    return { 
      valido: false, 
      mensagem: 'Tipo de período inválido',
      codigo: 'TIPO_INVALIDO'
    };
  }

  validarDataNaoFutura(data: Date): boolean {
    if (!data) return false;
    
    if (this.configuracao.permitirDatasFuturas) {
      return true;
    }
    
    const dataAtual = new Date();
    
    // Permitir datas futuras até 12 meses à frente
    const limiteFuturo = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth() + this.configuracao.limiteMesesHistorico,
      dataAtual.getDate()
    );
    
    return data <= limiteFuturo;
  }

  obterConfiguracao(): ConfiguracaoPeriodo {
    return { ...this.configuracao };
  }

  private validarPeriodoMesAno(mes?: string, ano?: string): ResultadoValidacao {
    if (!mes || !ano) {
      return { 
        valido: false, 
        mensagem: 'Mês e ano são obrigatórios',
        codigo: 'CAMPOS_OBRIGATORIOS'
      };
    }

    const dataPeriodo = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    
    // Validar apenas o limite de 12 meses (passado ou futuro)
    if (!this.validarLimiteHistorico(dataPeriodo)) {
      return { 
        valido: false, 
        mensagem: `Período deve estar dentro de ${this.configuracao.limiteMesesHistorico} meses (passado ou futuro)`,
        codigo: 'PERIODO_FORA_HISTORICO'
      };
    }

    return { valido: true, mensagem: '' };
  }

  private validarPeriodoIntervalo(dataInicio?: Date, dataFim?: Date): ResultadoValidacao {
    if (!dataInicio || !dataFim) {
      return { 
        valido: false, 
        mensagem: 'Data de início e fim são obrigatórias',
        codigo: 'DATAS_OBRIGATORIAS'
      };
    }

    if (!this.validarLimiteHistorico(dataInicio) || !this.validarLimiteHistorico(dataFim)) {
      return { 
        valido: false, 
        mensagem: `Período deve estar dentro dos últimos ${this.configuracao.limiteMesesHistorico} meses`,
        codigo: 'PERIODO_FORA_HISTORICO'
      };
    }

    if (!this.validarIntervaloDatas(dataInicio, dataFim)) {
      return { 
        valido: false, 
        mensagem: `Intervalo não pode ser superior a ${this.configuracao.limiteDiasIntervalo} dias`,
        codigo: 'INTERVALO_EXCEDE_LIMITE'
      };
    }

    return { valido: true, mensagem: '' };
  }

  /**
   * Valida se o mês selecionado está dentro do período de 90 dias do mês atual
   * Regra: O mês selecionado não pode estar a mais de 90 dias do mês atual
   * Exemplo: Se estamos em setembro, maio está a mais de 90 dias → inválido
   * NOVA REGRA: Permitir histórico até 12 meses à frente (ex: setembro 2024 → setembro 2025)
   */
  private validarPeriodo90DiasAPartirDoMes(dataMes: Date): ResultadoValidacao {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    // Se o mês selecionado for o mês atual, não aplicar validação de 90 dias
    if (dataMes.getMonth() === mesAtual && dataMes.getFullYear() === anoAtual) {
      return { valido: true, mensagem: '' };
    }
    
    // Calcular o primeiro dia do mês atual
    const primeiroDiaMesAtual = new Date(anoAtual, mesAtual, 1);
    
    // Calcular o último dia do mês selecionado
    const ultimoDiaMesSelecionado = new Date(dataMes.getFullYear(), dataMes.getMonth() + 1, 0);
    
    // Calcular a diferença em dias entre o último dia do mês selecionado e o primeiro dia do mês atual
    const diferencaEmDias = Math.abs(ultimoDiaMesSelecionado.getTime() - primeiroDiaMesAtual.getTime()) / (1000 * 60 * 60 * 24);
    
    // Verificar se a diferença excede 90 dias (apenas para meses passados)
    if (dataMes < primeiroDiaMesAtual && diferencaEmDias > 90) {
      return {
        valido: false,
        mensagem: `O mês selecionado está fora do período de 90 dias do mês atual.`,
        codigo: 'MES_FORA_PERIODO_90_DIAS'
      };
    }
    
    // Verificar se o mês selecionado está dentro do limite histórico (12 meses para trás)
    const primeiroDiaDoMes = new Date(dataMes.getFullYear(), dataMes.getMonth(), 1);
    const dataLimiteHistorico = new Date(anoAtual, mesAtual - this.configuracao.limiteMesesHistorico, 1);
    
    if (primeiroDiaDoMes < dataLimiteHistorico) {
      return {
        valido: false,
        mensagem: `O mês selecionado deve estar dentro dos últimos ${this.configuracao.limiteMesesHistorico} meses.`,
        codigo: 'MES_FORA_HISTORICO'
      };
    }
    
    // Verificar se o mês selecionado não está muito no futuro (12 meses para frente)
    const dataLimiteFuturo = new Date(anoAtual, mesAtual + this.configuracao.limiteMesesHistorico, 1);
    
    if (primeiroDiaDoMes > dataLimiteFuturo) {
      return {
        valido: false,
        mensagem: `O mês selecionado não pode estar mais de ${this.configuracao.limiteMesesHistorico} meses no futuro.`,
        codigo: 'MES_MUITO_FUTURO'
      };
    }
    
    return { valido: true, mensagem: '' };
  }
}
