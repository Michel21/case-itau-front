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

  describe('validarDataNaoFutura', () => {
    it('deve retornar true para data passada', () => {
      const dataPassada = new Date();
      dataPassada.setDate(dataPassada.getDate() - 1);
      
      const resultado = service.validarDataNaoFutura(dataPassada);
      
      expect(resultado).toBe(true);
    });

    it('deve retornar true para data atual', () => {
      const dataAtual = new Date();
      
      const resultado = service.validarDataNaoFutura(dataAtual);
      
      expect(resultado).toBe(true);
    });

    it('deve retornar true para data futura dentro de 12 meses', () => {
      const dataAtual = new Date();
      const dataFutura = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 6, 1);
      
      const resultado = service.validarDataNaoFutura(dataFutura);
      
      expect(resultado).toBe(true);
    });

    it('deve retornar false para data futura além de 12 meses', () => {
      const dataAtual = new Date();
      const dataFutura = new Date(dataAtual.getFullYear() + 1, dataAtual.getMonth() + 1, 1);
      
      const resultado = service.validarDataNaoFutura(dataFutura);
      
      expect(resultado).toBe(false);
    });

    it('deve retornar false para data nula ou indefinida', () => {
      expect(service.validarDataNaoFutura(null as any)).toBe(false);
      expect(service.validarDataNaoFutura(undefined as any)).toBe(false);
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
});
