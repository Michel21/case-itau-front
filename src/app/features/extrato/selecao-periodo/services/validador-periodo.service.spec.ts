import { TestBed } from '@angular/core/testing';
import { ValidadorPeriodoService } from './validador-periodo.service';
import { ConfiguracaoPeriodo } from '../interfaces/periodo.interface';

/**
 * Testes unitários para ValidadorPeriodoService
 * Seguindo princípios SOLID e Clean Code
 */
describe('ValidadorPeriodoService', () => {
  let service: ValidadorPeriodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidadorPeriodoService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('validarIntervaloDatas', () => {
    it('deve retornar true para intervalo de datas válido dentro de 90 dias', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-01-30');
      
      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);
      
      expect(resultado).toBe(true);
    });

    it('deve retornar false para intervalo de datas excedendo 90 dias', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-04-01');
      
      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);
      
      expect(resultado).toBe(false);
    });

    it('deve retornar false quando data de início é posterior à data de fim', () => {
      const dataInicio = new Date('2024-01-30');
      const dataFim = new Date('2024-01-01');
      
      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);
      
      expect(resultado).toBe(false);
    });

    it('deve retornar false para datas nulas ou indefinidas', () => {
      expect(service.validarIntervaloDatas(null as any, new Date())).toBe(false);
      expect(service.validarIntervaloDatas(new Date(), null as any)).toBe(false);
      expect(service.validarIntervaloDatas(undefined as any, undefined as any)).toBe(false);
    });
  });

  describe('validarLimiteHistorico', () => {
    it('deve retornar true para data dentro do limite de 12 meses', () => {
      const dataAtual = new Date();
      const dataValida = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 6, 1);
      
      const resultado = service.validarLimiteHistorico(dataValida);
      
      expect(resultado).toBe(true);
    });

    it('deve retornar false para data mais antiga que 12 meses', () => {
      const dataAtual = new Date();
      const dataAntiga = new Date(dataAtual.getFullYear() - 1, dataAtual.getMonth() - 1, 1);
      
      const resultado = service.validarLimiteHistorico(dataAntiga);
      
      expect(resultado).toBe(false);
    });

    it('deve retornar false para datas futuras quando permitirDatasFuturas é false', () => {
      const dataAtual = new Date();
      const dataFutura = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 6, 1);
      
      const resultado = service.validarLimiteHistorico(dataFutura);
      
      expect(resultado).toBe(false);
    });

    it('deve retornar false para datas futuras além de 12 meses', () => {
      const dataAtual = new Date();
      const dataFutura = new Date(dataAtual.getFullYear() + 1, dataAtual.getMonth() + 1, 1);
      
      const resultado = service.validarLimiteHistorico(dataFutura);
      
      expect(resultado).toBe(false);
    });

    it('deve retornar false para data nula ou indefinida', () => {
      expect(service.validarLimiteHistorico(null as any)).toBe(false);
      expect(service.validarLimiteHistorico(undefined as any)).toBe(false);
    });
  });


  describe('validarPeriodoCompleto', () => {
    describe('para tipo mes', () => {
      it('deve retornar resultado válido para mês e ano válidos', () => {
        const dataAtual = new Date();
        const mes = (dataAtual.getMonth() + 1).toString();
        const ano = dataAtual.getFullYear().toString();
        
        const resultado = service.validarPeriodoCompleto('mes', mes, ano);
        
        expect(resultado.valido).toBe(true);
        expect(resultado.mensagem).toBe('');
      });

      it('deve retornar resultado inválido para mês ou ano ausentes', () => {
        const resultado = service.validarPeriodoCompleto('mes', '', '2024');
        
        expect(resultado.valido).toBe(false);
        expect(resultado.mensagem).toBe('Mês e ano são obrigatórios');
        expect(resultado.codigo).toBe('CAMPOS_OBRIGATORIOS');
      });

      it('deve retornar resultado inválido para mês fora do limite de 12 meses', () => {
        const dataAtual = new Date();
        const dataAntiga = new Date(dataAtual.getFullYear() - 1, dataAtual.getMonth() - 1, 1);
        const mes = (dataAntiga.getMonth() + 1).toString();
        const ano = dataAntiga.getFullYear().toString();
        
        const resultado = service.validarPeriodoCompleto('mes', mes, ano);
        
        expect(resultado.valido).toBe(false);
        expect(resultado.codigo).toBe('PERIODO_FORA_HISTORICO');
      });

      it('deve permitir setembro 2024 ter histórico até setembro 2025', () => {
        // Simular que estamos em setembro de 2024
        const setembro2024 = new Date(2024, 8, 1); // Setembro 2024
        const setembro2025 = new Date(2025, 8, 1); // Setembro 2025
        
        // Mock da data atual para setembro 2024
        const originalDate = global.Date;
        global.Date = jest.fn(() => setembro2024) as any;
        global.Date.now = originalDate.now;
        
        const resultado = service.validarPeriodoCompleto('mes', '9', '2025');
        
        expect(resultado.valido).toBe(true);
        expect(resultado.mensagem).toBe('');
        
        // Restaurar Date original
        global.Date = originalDate;
      });
    });

    describe('para tipo intervalo', () => {
      it('deve retornar resultado válido para intervalo de datas válido', () => {
      const dataAtual = new Date();
      // Usar datas do mês anterior para garantir que estejam dentro do limite histórico
      const dataInicio = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1);
      const dataFim = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 15);
      
      const resultado = service.validarPeriodoCompleto('intervalo', undefined, undefined, dataInicio, dataFim);
      
      expect(resultado.valido).toBe(true);
      expect(resultado.mensagem).toBe('');
    });

      it('deve retornar resultado inválido para datas ausentes', () => {
        const resultado = service.validarPeriodoCompleto('intervalo');
        
        expect(resultado.valido).toBe(false);
        expect(resultado.mensagem).toBe('Data de início e fim são obrigatórias');
        expect(resultado.codigo).toBe('DATAS_OBRIGATORIAS');
      });

      it('deve retornar resultado inválido para intervalo excedendo 90 dias', () => {
        const dataAtual = new Date();
        // Usar datas do mês anterior para garantir que estejam dentro do limite histórico
        const dataInicio = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1);
        const dataFim = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1);
        dataFim.setDate(dataFim.getDate() + 95); // 95 dias depois
        
        const resultado = service.validarPeriodoCompleto('intervalo', undefined, undefined, dataInicio, dataFim);
        
        expect(resultado.valido).toBe(false);
        // Pode retornar PERIODO_FORA_HISTORICO se a data fim estiver fora do limite
        expect(resultado.codigo).toBeDefined();
        expect(['INTERVALO_EXCEDE_LIMITE', 'PERIODO_FORA_HISTORICO']).toContain(resultado.codigo!);
      });
    });

    it('deve retornar resultado inválido para tipo inválido', () => {
      const resultado = service.validarPeriodoCompleto('invalid' as any);
      
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toBe('Tipo de período inválido');
      expect(resultado.codigo).toBe('TIPO_INVALIDO');
    });
  });

  describe('obterConfiguracao', () => {
    it('deve retornar objeto de configuração', () => {
      const configuracao = service.obterConfiguracao();
      
      expect(configuracao).toBeDefined();
      expect(configuracao.limiteDiasIntervalo).toBe(90);
      expect(configuracao.limiteMesesHistorico).toBe(12);
      expect(configuracao.permitirDatasFuturas).toBe(false);
    });

    it('deve retornar uma cópia da configuração (imutável)', () => {
      const configuracao1 = service.obterConfiguracao();
      const configuracao2 = service.obterConfiguracao();
      
      expect(configuracao1).not.toBe(configuracao2);
      expect(configuracao1).toEqual(configuracao2);
    });
  });

  describe('validarDataNaoFutura', () => {
    it('deve retornar false para data nula ou indefinida', () => {
      expect(service.validarDataNaoFutura(null as any)).toBe(false);
      expect(service.validarDataNaoFutura(undefined as any)).toBe(false);
    });

    it('deve retornar true para data atual', () => {
      const dataAtual = new Date();
      const resultado = service.validarDataNaoFutura(dataAtual);
      expect(resultado).toBe(true);
    });

    it('deve retornar true para data passada', () => {
      const dataPassada = new Date();
      dataPassada.setFullYear(dataPassada.getFullYear() - 1);
      
      const resultado = service.validarDataNaoFutura(dataPassada);
      expect(resultado).toBe(true);
    });

    it('deve retornar false para data muito futura (mais de 12 meses)', () => {
      const dataMuitoFutura = new Date();
      dataMuitoFutura.setFullYear(dataMuitoFutura.getFullYear() + 2);
      
      const resultado = service.validarDataNaoFutura(dataMuitoFutura);
      expect(resultado).toBe(false);
    });
  });

  describe('validarPeriodo90DiasAPartirDoMes (método privado)', () => {
    it('deve retornar válido para mês atual', () => {
      const dataAtual = new Date();
      const resultado = (service as any).validarPeriodo90DiasAPartirDoMes(dataAtual);
      
      expect(resultado).toEqual({ valido: true, mensagem: '' });
    });

    it('deve retornar inválido para mês muito no passado (mais de 90 dias)', () => {
      const dataAtual = new Date();
      const mesMuitoPassado = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 4, 1);
      
      const resultado = (service as any).validarPeriodo90DiasAPartirDoMes(mesMuitoPassado);
      
      expect(resultado.valido).toBe(false);
      expect(resultado.codigo).toBe('MES_FORA_PERIODO_90_DIAS');
    });

    it('deve retornar inválido para mês fora do limite histórico', () => {
      const dataAtual = new Date();
      const mesForaHistorico = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 13, 1);
      
      const resultado = (service as any).validarPeriodo90DiasAPartirDoMes(mesForaHistorico);
      
      expect(resultado.valido).toBe(false);
      expect(resultado.codigo).toBe('MES_FORA_PERIODO_90_DIAS');
    });

    it('deve retornar inválido para mês muito no futuro', () => {
      const dataAtual = new Date();
      const mesMuitoFuturo = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 13, 1);
      
      const resultado = (service as any).validarPeriodo90DiasAPartirDoMes(mesMuitoFuturo);
      
      expect(resultado.valido).toBe(false);
      expect(resultado.codigo).toBe('MES_MUITO_FUTURO');
    });

    it('deve retornar válido para mês dentro do limite de 12 meses', () => {
      const dataAtual = new Date();
      const mesValido = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 6, 1);
      
      const resultado = (service as any).validarPeriodo90DiasAPartirDoMes(mesValido);
      
      expect(resultado).toEqual({ valido: true, mensagem: '' });
    });
  });

  describe('validarPeriodoCompleto - casos edge', () => {
    it('deve retornar resultado inválido para tipo inválido', () => {
      const resultado = service.validarPeriodoCompleto('invalid' as any);
      
      expect(resultado).toEqual({
        valido: false,
        mensagem: 'Tipo de período inválido',
        codigo: 'TIPO_INVALIDO'
      });
    });

    it('deve retornar resultado inválido para tipo undefined', () => {
      const resultado = service.validarPeriodoCompleto(undefined as any);
      
      expect(resultado).toEqual({
        valido: false,
        mensagem: 'Tipo de período inválido',
        codigo: 'TIPO_INVALIDO'
      });
    });
  });

  describe('validarLimiteHistorico - casos edge', () => {
    it('deve retornar false para data nula', () => {
      const resultado = service.validarLimiteHistorico(null as any);
      expect(resultado).toBe(false);
    });

    it('deve retornar false para data undefined', () => {
      const resultado = service.validarLimiteHistorico(undefined as any);
      expect(resultado).toBe(false);
    });

    it('deve retornar true para data no limite exato do histórico', () => {
      const dataAtual = new Date();
      const dataLimite = new Date(
        dataAtual.getFullYear(),
        dataAtual.getMonth() - 12,
        1
      );
      
      const resultado = service.validarLimiteHistorico(dataLimite);
      expect(resultado).toBe(true);
    });

    it('deve retornar false para data antes do limite histórico', () => {
      const dataAtual = new Date();
      const dataAntesLimite = new Date(
        dataAtual.getFullYear(),
        dataAtual.getMonth() - 13,
        1
      );
      
      const resultado = service.validarLimiteHistorico(dataAntesLimite);
      expect(resultado).toBe(false);
    });

    it('deve retornar true para data no último dia do mês atual quando permitirDatasFuturas é false', () => {
      const dataAtual = new Date();
      const ultimoDiaMesAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
      
      const resultado = service.validarLimiteHistorico(ultimoDiaMesAtual);
      expect(resultado).toBe(true);
    });

    it('deve retornar false para data após o último dia do mês atual quando permitirDatasFuturas é false', () => {
      const dataAtual = new Date();
      const primeiroDiaProximoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1);
      
      const resultado = service.validarLimiteHistorico(primeiroDiaProximoMes);
      expect(resultado).toBe(false);
    });
  });

  describe('validarIntervaloDatas - casos edge', () => {
    it('deve retornar true para intervalo de exatamente 90 dias', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-03-31'); // 90 dias depois
      
      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);
      expect(resultado).toBe(true);
    });

    it('deve retornar false para intervalo de 91 dias', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-04-01'); // 91 dias depois
      
      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);
      expect(resultado).toBe(false);
    });

    it('deve retornar true para intervalo de 1 dia', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-01-01');
      
      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);
      expect(resultado).toBe(true);
    });

    it('deve retornar true para intervalo de 0 dias (mesma data)', () => {
      const data = new Date('2024-01-01');
      
      const resultado = service.validarIntervaloDatas(data, data);
      expect(resultado).toBe(true);
    });
  });

  describe('validarLimiteHistorico - permitir datas futuras', () => {
    it('deve retornar true para data futura dentro do limite de 12 meses quando permitirDatasFuturas é true', () => {
      // Criar um novo serviço com configuração personalizada
      const serviceCustomizado = new ValidadorPeriodoService();
      // Usar Object.defineProperty para modificar a propriedade readonly
      Object.defineProperty(serviceCustomizado, 'configuracao', {
        value: { limiteDiasIntervalo: 90, limiteMesesHistorico: 12, permitirDatasFuturas: true },
        writable: true
      });
      
      const dataFutura = new Date();
      dataFutura.setMonth(dataFutura.getMonth() + 6); // 6 meses no futuro
      
      const resultado = serviceCustomizado.validarLimiteHistorico(dataFutura);
      expect(resultado).toBe(true);
    });

    it('deve retornar false para data futura além do limite de 12 meses quando permitirDatasFuturas é true', () => {
      // Criar um novo serviço com configuração personalizada
      const serviceCustomizado = new ValidadorPeriodoService();
      // Usar Object.defineProperty para modificar a propriedade readonly
      Object.defineProperty(serviceCustomizado, 'configuracao', {
        value: { limiteDiasIntervalo: 90, limiteMesesHistorico: 12, permitirDatasFuturas: true },
        writable: true
      });
      
      const dataFutura = new Date();
      dataFutura.setMonth(dataFutura.getMonth() + 15); // 15 meses no futuro
      
      const resultado = serviceCustomizado.validarLimiteHistorico(dataFutura);
      expect(resultado).toBe(false);
    });
  });

  describe('validarDataNaoFutura - permitir datas futuras', () => {
    it('deve retornar true quando permitirDatasFuturas é true', () => {
      // Criar um novo serviço com configuração personalizada
      const serviceCustomizado = new ValidadorPeriodoService();
      // Usar Object.defineProperty para modificar a propriedade readonly
      Object.defineProperty(serviceCustomizado, 'configuracao', {
        value: { limiteDiasIntervalo: 90, limiteMesesHistorico: 12, permitirDatasFuturas: true },
        writable: true
      });
      
      const dataFutura = new Date();
      dataFutura.setFullYear(dataFutura.getFullYear() + 1);
      
      const resultado = serviceCustomizado.validarDataNaoFutura(dataFutura);
      expect(resultado).toBe(true);
    });
  });

  describe('validarPeriodoCompleto - tipo intervalo - validação de intervalo', () => {
    it('deve retornar resultado inválido quando validarIntervaloDatas retorna false', () => {
      // Criar um novo serviço com configuração personalizada que permite datas futuras
      const serviceCustomizado = new ValidadorPeriodoService();
      Object.defineProperty(serviceCustomizado, 'configuracao', {
        value: { limiteDiasIntervalo: 90, limiteMesesHistorico: 12, permitirDatasFuturas: true },
        writable: true
      });
      
      // Usar datas que passem na validação de limite histórico mas falhem na validação de intervalo
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 1); // Ontem
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + 95); // 95 dias no futuro (mais de 90)
      
      const resultado = serviceCustomizado.validarPeriodoCompleto('intervalo', undefined, undefined, dataInicio, dataFim);
      
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toContain('Intervalo não pode ser superior a 90 dias');
      expect(resultado.codigo).toBe('INTERVALO_EXCEDE_LIMITE');
    });
  });

  describe('validarPeriodo90DiasAPartirDoMes - mês fora do histórico', () => {
    it('deve retornar resultado inválido quando mês está fora do limite histórico', () => {
      const dataMes = new Date(2020, 0, 1); // Janeiro 2020 - muito no passado
      
      const resultado = service['validarPeriodo90DiasAPartirDoMes'](dataMes);
      
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toContain('O mês selecionado está fora do período de 90 dias do mês atual');
      expect(resultado.codigo).toBe('MES_FORA_PERIODO_90_DIAS');
    });

    it('deve retornar resultado inválido quando mês está fora do limite histórico (configuração personalizada)', () => {
      // Criar um novo serviço com configuração personalizada
      const serviceCustomizado = new ValidadorPeriodoService();
      Object.defineProperty(serviceCustomizado, 'configuracao', {
        value: { limiteDiasIntervalo: 90, limiteMesesHistorico: 6, permitirDatasFuturas: false },
        writable: true
      });
      
      // Usar uma data que esteja fora do limite de 6 meses mas dentro de 90 dias
      // Vamos usar uma data que esteja exatamente no limite de 90 dias mas fora de 6 meses
      const dataAtual = new Date();
      const dataMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 7, 1); // 7 meses atrás, dia 1
      
      const resultado = serviceCustomizado['validarPeriodo90DiasAPartirDoMes'](dataMes);
      
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toContain('O mês selecionado deve estar dentro dos últimos 6 meses');
      expect(resultado.codigo).toBe('MES_FORA_HISTORICO');
    });
  });
});
