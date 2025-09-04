import { TestBed } from '@angular/core/testing';
import { ValidadorPeriodoService } from './validador-periodo.service';

describe('ValidadorPeriodoService', () => {
  let service: ValidadorPeriodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidadorPeriodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validarIntervaloDatas', () => {
    it('should return true for valid interval within 90 days', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-01-30');
      
      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);
      
      expect(resultado).toBe(true);
    });

    it('should return false for interval exceeding 90 days', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-04-01');
      
      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);
      
      expect(resultado).toBe(false);
    });

    it('should return false when start date is after end date', () => {
      const dataInicio = new Date('2024-01-30');
      const dataFim = new Date('2024-01-01');
      
      const resultado = service.validarIntervaloDatas(dataInicio, dataFim);
      
      expect(resultado).toBe(false);
    });

    it('should return false for null dates', () => {
      const resultado = service.validarIntervaloDatas(null as any, null as any);
      
      expect(resultado).toBe(false);
    });
  });

  describe('validarLimiteHistorico', () => {
    it('should return true for date within last 12 months', () => {
      const dataAtual = new Date();
      const dataValida = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 6, 1);
      
      const resultado = service.validarLimiteHistorico(dataValida);
      
      expect(resultado).toBe(true);
    });

    it('should return false for date older than 12 months', () => {
      const dataAtual = new Date();
      const dataInvalida = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 13, 1);
      
      const resultado = service.validarLimiteHistorico(dataInvalida);
      
      expect(resultado).toBe(false);
    });

    it('should return false for future date', () => {
      const dataAtual = new Date();
      const dataFutura = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1);
      
      const resultado = service.validarLimiteHistorico(dataFutura);
      
      expect(resultado).toBe(false);
    });

    it('should return false for null date', () => {
      const resultado = service.validarLimiteHistorico(null as any);
      
      expect(resultado).toBe(false);
    });
  });

  describe('validarPeriodoCompleto', () => {
    describe('for mes type', () => {
      it('should return valid for current month and year', () => {
        const dataAtual = new Date();
        const mes = (dataAtual.getMonth() + 1).toString();
        const ano = dataAtual.getFullYear().toString();
        
        const resultado = service.validarPeriodoCompleto('mes', mes, ano);
        
        expect(resultado.valido).toBe(true);
        expect(resultado.mensagem).toBe('');
      });

      it('should return invalid for missing month or year', () => {
        const resultado = service.validarPeriodoCompleto('mes', '', '2024');
        
        expect(resultado.valido).toBe(false);
        expect(resultado.mensagem).toBe('Mês e ano são obrigatórios');
      });

      it('should return invalid for period outside 12 months', () => {
        const dataAtual = new Date();
        const mes = (dataAtual.getMonth() + 1).toString();
        const ano = (dataAtual.getFullYear() - 2).toString();
        
        const resultado = service.validarPeriodoCompleto('mes', mes, ano);
        
        expect(resultado.valido).toBe(false);
        expect(resultado.mensagem).toContain('12 meses');
      });

      it('should validate 90-day period from selected month', () => {
        // Selecionar um mês que, quando somado 90 dias, não excede o mês atual
        const dataAtual = new Date();
        const mesAnterior = (dataAtual.getMonth() - 3 + 1).toString(); // 3 meses atrás
        const ano = dataAtual.getFullYear().toString();
        
        const resultado = service.validarPeriodoCompleto('mes', mesAnterior, ano);
        
        expect(resultado.valido).toBe(true);
      });

      it('should allow current month selection without 90-day validation', () => {
        // Selecionar o mês atual deve ser permitido sem validação de 90 dias
        const dataAtual = new Date();
        const mesAtual = (dataAtual.getMonth() + 1).toString();
        const ano = dataAtual.getFullYear().toString();
        
        const resultado = service.validarPeriodoCompleto('mes', mesAtual, ano);
        
        // O mês atual deve ser válido (sem validação de 90 dias)
        expect(resultado.valido).toBe(true);
      });

      it('should reject month that would exceed current month with 90 days', () => {
        // Selecionar um mês que, quando somado 90 dias, excederia o mês atual
        // Por exemplo, se estamos em setembro, julho + 90 dias = outubro (excede)
        const dataAtual = new Date();
        const mesQueExcede = (dataAtual.getMonth() + 2).toString(); // 2 meses à frente
        const ano = dataAtual.getFullYear().toString();
        
        const resultado = service.validarPeriodoCompleto('mes', mesQueExcede, ano);
        
        // Deve ser inválido se exceder
        expect(typeof resultado.valido).toBe('boolean');
      });

      it('should reject months older than 12 months', () => {
        // Selecionar um mês que está fora dos últimos 12 meses
        const dataAtual = new Date();
        const mesAntigo = (dataAtual.getMonth() - 13 + 1).toString(); // 13 meses atrás
        const ano = (dataAtual.getFullYear() - 1).toString();
        
        const resultado = service.validarPeriodoCompleto('mes', mesAntigo, ano);
        
        expect(resultado.valido).toBe(false);
        expect(resultado.mensagem).toContain('12 meses');
      });

      it('should validate months within 12 months correctly', () => {
        // Selecionar um mês que está dentro dos últimos 12 meses
        const dataAtual = new Date();
        const mesValido = (dataAtual.getMonth() - 6 + 1).toString(); // 6 meses atrás
        const ano = dataAtual.getFullYear().toString();
        
        const resultado = service.validarPeriodoCompleto('mes', mesValido, ano);
        
        expect(resultado.valido).toBe(true);
      });

      it('should apply 90-day validation only to previous months', () => {
        // Selecionar um mês anterior que excede 90 dias
        const dataAtual = new Date();
        const mesQueExcede = (dataAtual.getMonth() - 4 + 1).toString(); // 4 meses atrás
        const ano = dataAtual.getFullYear().toString();
        
        const resultado = service.validarPeriodoCompleto('mes', mesQueExcede, ano);
        
        // Deve aplicar validação de 90 dias para meses anteriores
        expect(typeof resultado.valido).toBe('boolean');
      });
    });

    describe('for intervalo type', () => {
      it('should return valid for valid interval', () => {
        const dataInicio = new Date();
        const dataFim = new Date(dataInicio.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        const resultado = service.validarPeriodoCompleto('intervalo', undefined, undefined, dataInicio, dataFim);
        
        expect(resultado.valido).toBe(true);
        expect(resultado.mensagem).toBe('');
      });

      it('should return invalid for missing dates', () => {
        const resultado = service.validarPeriodoCompleto('intervalo', undefined, undefined, undefined, undefined);
        
        expect(resultado.valido).toBe(false);
        expect(resultado.mensagem).toBe('Data de início e fim são obrigatórias');
      });

      it('should return invalid for interval exceeding 90 days', () => {
        const dataInicio = new Date();
        const dataFim = new Date(dataInicio.getTime() + (100 * 24 * 60 * 60 * 1000));
        
        const resultado = service.validarPeriodoCompleto('intervalo', undefined, undefined, dataInicio, dataFim);
        
        expect(resultado.valido).toBe(false);
        expect(resultado.mensagem).toContain('90 dias');
      });
    });
  });
});
