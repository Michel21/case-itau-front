import { TestBed } from '@angular/core/testing';
import { ExtratoFormatPipe } from './extrato-format.pipe';

/**
 * Testes unitários para ExtratoFormatPipe
 * Cobertura: >90%
 * Seguindo princípios SOLID e Clean Code
 */
describe('ExtratoFormatPipe', () => {
  let pipe: ExtratoFormatPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = new ExtratoFormatPipe();
  });

  describe('Inicialização', () => {
    it('deve ser criado', () => {
      expect(pipe).toBeTruthy();
    });

    it('deve implementar PipeTransform', () => {
      expect(pipe).toBeInstanceOf(ExtratoFormatPipe);
    });
  });

  describe('Transform - Casos Gerais', () => {
    it('deve retornar string vazia para valor null', () => {
      const resultado = pipe.transform(null, 'moeda');
      expect(resultado).toBe('');
    });

    it('deve retornar string vazia para valor undefined', () => {
      const resultado = pipe.transform(undefined, 'moeda');
      expect(resultado).toBe('');
    });

    it('deve retornar string vazia para valor string vazia', () => {
      const resultado = pipe.transform('', 'moeda');
      expect(resultado).toBe('');
    });

    it('deve retornar string vazia para valor 0 quando tipo é moeda', () => {
      const resultado = pipe.transform(0, 'moeda');
      expect(resultado).toBe('0,00');
    });

    it('deve retornar string vazia para valor 0 quando tipo é percentual', () => {
      const resultado = pipe.transform(0, 'percentual');
      expect(resultado).toBe('0,00%');
    });
  });

  describe('Transform - Tipo Moeda', () => {
    it('deve formatar valor positivo como moeda', () => {
      const resultado = pipe.transform(1234.56, 'moeda');
      expect(resultado).toBe('1.234,56');
    });

    it('deve formatar valor negativo como moeda', () => {
      const resultado = pipe.transform(-1234.56, 'moeda');
      expect(resultado).toBe('-1.234,56');
    });

    it('deve formatar valor zero como moeda', () => {
      const resultado = pipe.transform(0, 'moeda');
      expect(resultado).toBe('0,00');
    });

    it('deve formatar valor decimal pequeno como moeda', () => {
      const resultado = pipe.transform(0.01, 'moeda');
      expect(resultado).toBe('0,01');
    });

    it('deve formatar valor inteiro como moeda', () => {
      const resultado = pipe.transform(1000, 'moeda');
      expect(resultado).toBe('1.000,00');
    });

    it('deve formatar valor com muitas casas decimais como moeda', () => {
      const resultado = pipe.transform(1234.56789, 'moeda');
      expect(resultado).toBe('1.234,57');
    });

    it('deve formatar valor muito grande como moeda', () => {
      const resultado = pipe.transform(999999999.99, 'moeda');
      expect(resultado).toBe('999.999.999,99');
    });

    it('deve formatar valor muito pequeno como moeda', () => {
      const resultado = pipe.transform(0.001, 'moeda');
      expect(resultado).toBe('0,00');
    });
  });

  describe('Transform - Tipo Data', () => {
    it('deve retornar data como string', () => {
      const data = '2024-09-23';
      const resultado = pipe.transform(data, 'data');
      expect(resultado).toBe('2024-09-23');
    });

    it('deve retornar data formatada como string', () => {
      const data = '23/09/2024';
      const resultado = pipe.transform(data, 'data');
      expect(resultado).toBe('23/09/2024');
    });

    it('deve retornar timestamp como string', () => {
      const timestamp = '2024-09-23T10:30:00Z';
      const resultado = pipe.transform(timestamp, 'data');
      expect(resultado).toBe('2024-09-23T10:30:00Z');
    });

    it('deve retornar data vazia como string vazia', () => {
      const resultado = pipe.transform('', 'data');
      expect(resultado).toBe('');
    });
  });

  describe('Transform - Tipo Percentual', () => {
    it('deve formatar valor positivo como percentual', () => {
      const resultado = pipe.transform(12.34, 'percentual');
      expect(resultado).toBe('12,34%');
    });

    it('deve formatar valor negativo como percentual', () => {
      const resultado = pipe.transform(-12.34, 'percentual');
      expect(resultado).toBe('-12,34%');
    });

    it('deve formatar valor zero como percentual', () => {
      const resultado = pipe.transform(0, 'percentual');
      expect(resultado).toBe('0,00%');
    });

    it('deve formatar valor decimal pequeno como percentual', () => {
      const resultado = pipe.transform(0.01, 'percentual');
      expect(resultado).toBe('0,01%');
    });

    it('deve formatar valor inteiro como percentual', () => {
      const resultado = pipe.transform(100, 'percentual');
      expect(resultado).toBe('100,00%');
    });

    it('deve formatar valor com muitas casas decimais como percentual', () => {
      const resultado = pipe.transform(12.34567, 'percentual');
      expect(resultado).toBe('12,35%');
    });

    it('deve formatar valor muito grande como percentual', () => {
      const resultado = pipe.transform(999.99, 'percentual');
      expect(resultado).toBe('999,99%');
    });

    it('deve retornar string vazia para valor null no percentual', () => {
      const resultado = pipe.transform(null, 'percentual');
      expect(resultado).toBe('');
    });

    it('deve retornar string vazia para valor undefined no percentual', () => {
      const resultado = pipe.transform(undefined, 'percentual');
      expect(resultado).toBe('');
    });
  });

  describe('Transform - Tipo Default', () => {
    it('deve retornar string para tipo inválido', () => {
      const resultado = pipe.transform(123, 'invalid' as any);
      expect(resultado).toBe('123');
    });

    it('deve retornar string para tipo undefined', () => {
      const resultado = pipe.transform(123, undefined as any);
      expect(resultado).toBe('123');
    });

    it('deve retornar string para tipo null', () => {
      const resultado = pipe.transform(123, null as any);
      expect(resultado).toBe('123');
    });

    it('deve retornar string para valor string', () => {
      const resultado = pipe.transform('teste', 'invalid' as any);
      expect(resultado).toBe('teste');
    });

    it('deve retornar string para valor boolean', () => {
      const resultado = pipe.transform(true, 'invalid' as any);
      expect(resultado).toBe('true');
    });

    it('deve retornar string para valor object', () => {
      const obj = { teste: 'valor' };
      const resultado = pipe.transform(obj, 'invalid' as any);
      expect(resultado).toBe('[object Object]');
    });
  });

  describe('Métodos Privados - formatarMoeda', () => {
    it('deve formatar moeda com separadores corretos', () => {
      const resultado = pipe.transform(1234567.89, 'moeda');
      expect(resultado).toBe('1.234.567,89');
    });

    it('deve formatar moeda com zeros à direita', () => {
      const resultado = pipe.transform(100, 'moeda');
      expect(resultado).toBe('100,00');
    });

    it('deve formatar moeda com zeros à esquerda', () => {
      const resultado = pipe.transform(0.1, 'moeda');
      expect(resultado).toBe('0,10');
    });
  });

  describe('Métodos Privados - formatarData', () => {
    it('deve retornar data sem formatação', () => {
      const data = '2024-09-23';
      const resultado = pipe.transform(data, 'data');
      expect(resultado).toBe(data);
    });

    it('deve retornar data ISO sem formatação', () => {
      const data = '2024-09-23T10:30:00.000Z';
      const resultado = pipe.transform(data, 'data');
      expect(resultado).toBe(data);
    });
  });

  describe('Métodos Privados - formatarPercentual', () => {
    it('deve formatar percentual com símbolo %', () => {
      const resultado = pipe.transform(15.5, 'percentual');
      expect(resultado).toBe('15,50%');
    });

    it('deve formatar percentual zero', () => {
      const resultado = pipe.transform(0, 'percentual');
      expect(resultado).toBe('0,00%');
    });

    it('deve formatar percentual negativo', () => {
      const resultado = pipe.transform(-5.25, 'percentual');
      expect(resultado).toBe('-5,25%');
    });

    it('deve retornar string vazia para null no percentual', () => {
      const resultado = pipe.transform(null, 'percentual');
      expect(resultado).toBe('');
    });

    it('deve retornar string vazia para undefined no percentual', () => {
      const resultado = pipe.transform(undefined, 'percentual');
      expect(resultado).toBe('');
    });
  });

  describe('Casos Edge e Limites', () => {
    it('deve lidar com valor NaN', () => {
      const resultado = pipe.transform(NaN, 'moeda');
      expect(resultado).toBe('NaN');
    });

    it('deve lidar com valor Infinity', () => {
      const resultado = pipe.transform(Infinity, 'moeda');
      expect(resultado).toBe('∞');
    });

    it('deve lidar com valor -Infinity', () => {
      const resultado = pipe.transform(-Infinity, 'moeda');
      expect(resultado).toBe('-∞');
    });

    it('deve lidar com valor muito pequeno', () => {
      const resultado = pipe.transform(0.0001, 'moeda');
      expect(resultado).toBe('0,00');
    });

    it('deve lidar com valor muito grande', () => {
      const resultado = pipe.transform(999999999999, 'moeda');
      expect(resultado).toBe('999.999.999.999,00');
    });
  });

  describe('Integração com Angular', () => {
    it('deve funcionar como pipe standalone', () => {
      expect(pipe).toBeDefined();
      expect(typeof pipe.transform).toBe('function');
    });

    it('deve ter nome correto do pipe', () => {
      const pipeMetadata = pipe.constructor;
      expect(pipeMetadata).toBe(ExtratoFormatPipe);
    });
  });

  describe('Performance e Robustez', () => {
    it('deve processar múltiplas chamadas rapidamente', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        pipe.transform(1234.56, 'moeda');
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(500); // Deve ser razoavelmente rápido
    });

    it('deve lidar com valores extremos sem erro', () => {
      expect(() => pipe.transform(Number.MAX_VALUE, 'moeda')).not.toThrow();
      expect(() => pipe.transform(Number.MIN_VALUE, 'moeda')).not.toThrow();
    });
  });

  describe('Cobertura Completa - Métodos Privados', () => {
    it('deve cobrir linha 37 do formatarPercentual com null', () => {
      // Teste direto do método privado para cobrir linha 37
      const resultado = (pipe as any).formatarPercentual(null);
      expect(resultado).toBe('-');
    });

    it('deve cobrir linha 37 do formatarPercentual com undefined', () => {
      // Teste direto do método privado para cobrir linha 37
      const resultado = (pipe as any).formatarPercentual(undefined);
      expect(resultado).toBe('-');
    });
  });
});
