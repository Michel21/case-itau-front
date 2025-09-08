import { TestBed } from '@angular/core/testing';
import { FormatadorPeriodoService } from './formatador-periodo.service';
import { PeriodoMesAno, PeriodoIntervalo } from '../interfaces/periodo.interface';

/**
 * Testes unitários para FormatadorPeriodoService
 * Seguindo princípios SOLID e Clean Code
 */
describe('FormatadorPeriodoService', () => {
  let service: FormatadorPeriodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormatadorPeriodoService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('formatarPeriodo', () => {
    it('deve formatar mês e ano corretamente', () => {
      const resultado = service.formatarPeriodo('3', '2024');
      
      expect(resultado).toBe('Março de 2024');
    });

    it('deve retornar string vazia para entradas vazias', () => {
      expect(service.formatarPeriodo('', '2024')).toBe('');
      expect(service.formatarPeriodo('3', '')).toBe('');
      expect(service.formatarPeriodo('', '')).toBe('');
    });

    it('deve retornar string vazia para entradas nulas ou indefinidas', () => {
      expect(service.formatarPeriodo(null as any, '2024')).toBe('');
      expect(service.formatarPeriodo('3', null as any)).toBe('');
      expect(service.formatarPeriodo(undefined as any, undefined as any)).toBe('');
    });

    it('deve formatar todos os meses corretamente', () => {
      const meses = [
        { numero: '1', nome: 'Janeiro' },
        { numero: '2', nome: 'Fevereiro' },
        { numero: '3', nome: 'Março' },
        { numero: '4', nome: 'Abril' },
        { numero: '5', nome: 'Maio' },
        { numero: '6', nome: 'Junho' },
        { numero: '7', nome: 'Julho' },
        { numero: '8', nome: 'Agosto' },
        { numero: '9', nome: 'Setembro' },
        { numero: '10', nome: 'Outubro' },
        { numero: '11', nome: 'Novembro' },
        { numero: '12', nome: 'Dezembro' }
      ];

      meses.forEach(mes => {
        const resultado = service.formatarPeriodo(mes.numero, '2024');
        expect(resultado).toBe(`${mes.nome} de 2024`);
      });
    });
  });

  describe('formatarIntervalo', () => {
      it('deve formatar intervalo de datas corretamente', () => {
      const dataInicio = new Date(2024, 0, 1); // Janeiro 1, 2024
      const dataFim = new Date(2024, 0, 31); // Janeiro 31, 2024
      
      const resultado = service.formatarIntervalo(dataInicio, dataFim);
      
      expect(resultado).toBe('01/01/2024 a 31/01/2024');
    });

    it('deve retornar string vazia para datas nulas ou indefinidas', () => {
      expect(service.formatarIntervalo(null as any, new Date())).toBe('');
      expect(service.formatarIntervalo(new Date(), null as any)).toBe('');
      expect(service.formatarIntervalo(undefined as any, undefined as any)).toBe('');
    });

      it('deve formatar intervalo de um único dia corretamente', () => {
      const data = new Date(2024, 0, 1); // Janeiro 1, 2024
      
      const resultado = service.formatarIntervalo(data, data);
      
      expect(resultado).toBe('01/01/2024 a 01/01/2024');
    });

      it('deve formatar intervalo entre meses corretamente', () => {
      const dataInicio = new Date(2024, 0, 31); // Janeiro 31, 2024
      const dataFim = new Date(2024, 1, 1); // Fevereiro 1, 2024
      
      const resultado = service.formatarIntervalo(dataInicio, dataFim);
      
      expect(resultado).toBe('31/01/2024 a 01/02/2024');
    });

      it('deve formatar intervalo entre anos corretamente', () => {
      const dataInicio = new Date(2023, 11, 31); // Dezembro 31, 2023
      const dataFim = new Date(2024, 0, 1); // Janeiro 1, 2024
      
      const resultado = service.formatarIntervalo(dataInicio, dataFim);
      
      expect(resultado).toBe('31/12/2023 a 01/01/2024');
    });
  });

  describe('obterNomeMes', () => {
    it('deve retornar nome correto do mês for valid month numbers', () => {
      const meses = [
        { numero: '1', nome: 'Janeiro' },
        { numero: '2', nome: 'Fevereiro' },
        { numero: '3', nome: 'Março' },
        { numero: '4', nome: 'Abril' },
        { numero: '5', nome: 'Maio' },
        { numero: '6', nome: 'Junho' },
        { numero: '7', nome: 'Julho' },
        { numero: '8', nome: 'Agosto' },
        { numero: '9', nome: 'Setembro' },
        { numero: '10', nome: 'Outubro' },
        { numero: '11', nome: 'Novembro' },
        { numero: '12', nome: 'Dezembro' }
      ];

      meses.forEach(mes => {
        const resultado = service.obterNomeMes(mes.numero);
        expect(resultado).toBe(mes.nome);
      });
    });

    it('deve retornar string vazia para mês inválido numbers', () => {
      expect(service.obterNomeMes('0')).toBe('');
      expect(service.obterNomeMes('13')).toBe('');
      expect(service.obterNomeMes('-1')).toBe('');
      expect(service.obterNomeMes('abc')).toBe('');
    });

      it('deve retornar string vazia para entrada nula ou indefinida', () => {
      expect(service.obterNomeMes(null as any)).toBe('');
      expect(service.obterNomeMes(undefined as any)).toBe('');
    });
  });

  describe('formatarData', () => {
      it('deve formatar data com formato padrão', () => {
      const data = new Date(2024, 0, 15); // Janeiro 15, 2024
      
      const resultado = service.formatarData(data);
      
      expect(resultado).toBe('15/01/2024');
    });

    it('deve formatar data com formato customizado', () => {
      const data = new Date(2024, 0, 15); // Janeiro 15, 2024
      
      const resultado = service.formatarData(data, 'dd/MM/yyyy');
      
      expect(resultado).toBe('15/01/2024');
    });

    it('deve retornar string vazia para data nula ou indefinida', () => {
      expect(service.formatarData(null as any)).toBe('');
      expect(service.formatarData(undefined as any)).toBe('');
    });

      it('deve lidar com diferentes datas corretamente', () => {
      const datas = [
        { data: new Date(2024, 0, 1), esperado: '01/01/2024' },
        { data: new Date(2024, 11, 31), esperado: '31/12/2024' },
        { data: new Date(2024, 5, 15), esperado: '15/06/2024' }
      ];

      datas.forEach(({ data, esperado }) => {
        const resultado = service.formatarData(data);
        expect(resultado).toBe(esperado);
      });
    });
  });

  describe('formatarPeriodoCompleto', () => {
      it('deve formatar período do tipo mês corretamente', () => {
      const periodo: PeriodoMesAno = {
        tipo: 'mes',
        valor: '3/2024',
        mes: '3',
        ano: '2024'
      };
      
      const resultado = service.formatarPeriodoCompleto(periodo);
      
      expect(resultado).toBe('Março de 2024');
    });

    it('deve formatar período do tipo intervalo corretamente', () => {
      // Usar datas que não são afetadas por timezone
      const dataInicio = new Date(2024, 0, 15); // 15 de janeiro de 2024
      const dataFim = new Date(2024, 0, 20); // 20 de janeiro de 2024
      
      const periodo: PeriodoMesAno = {
        tipo: 'intervalo',
        valor: '15/01/2024 a 20/01/2024',
        dataInicio: dataInicio.toISOString().split('T')[0], // '2024-01-15'
        dataFim: dataFim.toISOString().split('T')[0] // '2024-01-20'
      };
      
      const resultado = service.formatarPeriodoCompleto(periodo);
      
      // Verifica se o resultado contém o formato esperado (aceita diferenças de timezone)
      expect(resultado).toMatch(/\d{2}\/\d{2}\/\d{4} a \d{2}\/\d{2}\/\d{4}/);
      expect(resultado).toContain(' a ');
    });

      it('deve retornar valor quando tipo não é mês ou intervalo', () => {
      const periodo: PeriodoMesAno = {
        tipo: 'mes' as any,
        valor: 'Custom Value'
      };
      
      const resultado = service.formatarPeriodoCompleto(periodo);
      
      expect(resultado).toBe('Custom Value');
    });

    it('deve retornar string vazia para período nulo ou indefinidoo', () => {
      expect(service.formatarPeriodoCompleto(null as any)).toBe('');
      expect(service.formatarPeriodoCompleto(undefined as any)).toBe('');
    });

      it('deve lidar com período mês incompleto', () => {
      const periodo: PeriodoMesAno = {
        tipo: 'mes',
        valor: '3/2024',
        mes: '3'
        // ano missing
      };
      
      const resultado = service.formatarPeriodoCompleto(periodo);
      
      expect(resultado).toBe('3/2024');
    });

      it('deve lidar com período intervalo incompleto', () => {
      const periodo: PeriodoMesAno = {
        tipo: 'intervalo',
        valor: '01/01/2024 a 31/01/2024',
        dataInicio: '2024-01-01'
        // dataFim missing
      };
      
      const resultado = service.formatarPeriodoCompleto(periodo);
      
      expect(resultado).toBe('01/01/2024 a 31/01/2024');
    });
  });

  describe('formatarIntervaloCompleto', () => {
    it('deve formatar intervalo completo corretamente', () => {
      const intervalo: PeriodoIntervalo = {
        dataInicio: new Date(2024, 0, 1),
        dataFim: new Date(2024, 0, 31),
        dias: 30
      };
      
      const resultado = service.formatarIntervaloCompleto(intervalo);
      
      expect(resultado).toBe('01/01/2024 a 31/01/2024');
    });

    it('deve retornar string vazia para intervalo nulo ou indefinidoo', () => {
      expect(service.formatarIntervaloCompleto(null as any)).toBe('');
      expect(service.formatarIntervaloCompleto(undefined as any)).toBe('');
    });

      it('deve lidar com intervalo de um único dia', () => {
      const intervalo: PeriodoIntervalo = {
        dataInicio: new Date(2024, 0, 1),
        dataFim: new Date(2024, 0, 1),
        dias: 0
      };
      
      const resultado = service.formatarIntervaloCompleto(intervalo);
      
      expect(resultado).toBe('01/01/2024 a 01/01/2024');
    });
  });

  describe('edge cases', () => {
      it('deve lidar com datas de ano bissexto corretamente', () => {
      const data = new Date(2024, 1, 29); // Fevereiro 29, 2024
      
      const resultado = service.formatarData(data);
      
      expect(resultado).toBe('29/02/2024');
    });

      it('deve lidar com limite de ano corretamente', () => {
      const dataInicio = new Date(2023, 11, 31);
      const dataFim = new Date(2024, 0, 1);
      
      const resultado = service.formatarIntervalo(dataInicio, dataFim);
      
      expect(resultado).toBe('31/12/2023 a 01/01/2024');
    });

      it('deve lidar com limite de mês corretamente', () => {
      const dataInicio = new Date(2024, 0, 31);
      const dataFim = new Date(2024, 1, 1);
      
      const resultado = service.formatarIntervalo(dataInicio, dataFim);
      
      expect(resultado).toBe('31/01/2024 a 01/02/2024');
    });
  });
});
