import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { SelecaoPeriodoComponent } from './selecao-periodo.component';
import { SelecaoPeriodoService } from './selecao-periodo.service';

/**
 * Testes unitários para SelecaoPeriodoComponent
 * Seguindo princípios SOLID e Clean Code
 */
describe('SelecaoPeriodoComponent', () => {
  let component: SelecaoPeriodoComponent;
  let fixture: ComponentFixture<SelecaoPeriodoComponent>;
  let mockSelecaoPeriodoService: any;
  let mockRouter: any;

  beforeEach(async () => {
    // Criar mocks dos serviços
    mockSelecaoPeriodoService = {
      obterPeriodoAtual: jest.fn(),
      validarIntervaloDatas: jest.fn(),
      validarPeriodo: jest.fn(),
      validarLimiteHistorico: jest.fn(),
      formatarPeriodo: jest.fn(),
      formatarIntervalo: jest.fn(),
      definirPeriodo: jest.fn(),
      obterDataLimiteHistorico: jest.fn(),
      obterDataMaxima: jest.fn(),
      periodos: signal([]),
      meses: signal([]),
      anos: signal([])
    };

    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SelecaoPeriodoComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: SelecaoPeriodoService, useValue: mockSelecaoPeriodoService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelecaoPeriodoComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    // Configurar mocks com valores padrão
    mockSelecaoPeriodoService.obterPeriodoAtual.mockReturnValue({
      mes: '9',
      ano: '2024'
    });

    mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(true);
    mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(true);
    mockSelecaoPeriodoService.validarLimiteHistorico.mockReturnValue(true);
    mockSelecaoPeriodoService.formatarPeriodo.mockReturnValue('Setembro 2024');
    mockSelecaoPeriodoService.formatarIntervalo.mockReturnValue('01/09/2024 - 30/09/2024');
    mockSelecaoPeriodoService.obterDataLimiteHistorico.mockReturnValue(new Date('2023-09-01'));
    mockSelecaoPeriodoService.obterDataMaxima.mockReturnValue(new Date('2024-09-08'));

    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('inicialização', () => {
    it('deve inicializar com valores padrão', () => {
      expect(component.tipoSelecao()).toBe('mes');
      expect(component.uniqueId()).toContain('selecao-periodo-');
    });

    it('deve inicializar formulário com campos obrigatórios', () => {
      // Como os valores padrão são definidos, os campos não têm erro de required
      expect(component.periodoForm.get('mes')?.value).toBe('9');
      expect(component.periodoForm.get('ano')?.value).toBe('2024');
      expect(component.periodoForm.get('dataInicio')?.value).toBe('');
      expect(component.periodoForm.get('dataFim')?.value).toBe('');
    });

    it('deve inicializar valores padrão do formulário', () => {
      expect(mockSelecaoPeriodoService.obterPeriodoAtual).toHaveBeenCalled();
      expect(component.periodoForm.get('mes')?.value).toBe('9');
      expect(component.periodoForm.get('ano')?.value).toBe('2024');
    });
  });

  describe('signals e computed values', () => {
    it('deve atualizar mesSelecionado quando formulário muda', () => {
      component.periodoForm.get('mes')?.setValue('10');
      expect(component.mesSelecionado()).toBe('10');
    });

    it('deve atualizar anoSelecionado quando formulário muda', () => {
      component.periodoForm.get('ano')?.setValue('2025');
      expect(component.anoSelecionado()).toBe('2025');
    });

    it('deve atualizar dataInicio quando formulário muda', () => {
      component.periodoForm.get('dataInicio')?.setValue('2024-09-01');
      expect(component.dataInicio()).toBe('2024-09-01');
    });

    it('deve atualizar dataFim quando formulário muda', () => {
      component.periodoForm.get('dataFim')?.setValue('2024-09-30');
      expect(component.dataFim()).toBe('2024-09-30');
    });

    it('deve calcular periodoFormatado corretamente para tipo mes', () => {
      component.tipoSelecao.set('mes');
      component.mesSelecionado.set('9');
      component.anoSelecionado.set('2024');

      expect(component.periodoFormatado()).toBe('Setembro 2024');
      expect(mockSelecaoPeriodoService.formatarPeriodo).toHaveBeenCalledWith('9', '2024');
    });

    it('deve calcular periodoFormatado corretamente para tipo intervalo', () => {
      component.tipoSelecao.set('intervalo');
      component.dataInicio.set('2024-09-01');
      component.dataFim.set('2024-09-30');

      expect(component.periodoFormatado()).toBe('01/09/2024 - 30/09/2024');
      expect(mockSelecaoPeriodoService.formatarIntervalo).toHaveBeenCalled();
    });

    it('deve retornar string vazia para periodoFormatado quando campos estão vazios', () => {
      component.tipoSelecao.set('mes');
      component.mesSelecionado.set('');
      component.anoSelecionado.set('');

      expect(component.periodoFormatado()).toBe('');
    });
  });

  describe('validações', () => {
    it('deve validar mesInvalido corretamente', () => {
      component.tipoSelecao.set('mes');
      component.mesSelecionado.set('9');
      component.anoSelecionado.set('2024');

      expect(component.mesInvalido()).toBe(false);
      expect(mockSelecaoPeriodoService.validarPeriodo).toHaveBeenCalledWith('9', '2024');
    });

    it('deve validar intervaloInvalido corretamente', () => {
      component.tipoSelecao.set('intervalo');
      component.dataInicio.set('2024-09-01');
      component.dataFim.set('2024-09-30');

      expect(component.intervaloInvalido()).toBe(false);
      expect(mockSelecaoPeriodoService.validarIntervaloDatas).toHaveBeenCalled();
    });

    it('deve retornar false para mesInvalido quando tipo não é mes', () => {
      component.tipoSelecao.set('intervalo');
      expect(component.mesInvalido()).toBe(false);
    });

    it('deve retornar false para intervaloInvalido quando tipo não é intervalo', () => {
      component.tipoSelecao.set('mes');
      expect(component.intervaloInvalido()).toBe(false);
    });

    it('deve validar formularioInvalido para tipo mes', () => {
      component.tipoSelecao.set('mes');
      component.mesSelecionado.set('9');
      component.anoSelecionado.set('2024');

      expect(component.formularioInvalido()).toBe(false);
    });

    it('deve validar formularioInvalido para tipo intervalo', () => {
      component.tipoSelecao.set('intervalo');
      component.dataInicio.set('2024-09-01');
      component.dataFim.set('2024-09-30');

      expect(component.formularioInvalido()).toBe(false);
    });
  });

  describe('mensagens de erro', () => {
    it('deve retornar mensagem de erro para campos obrigatórios', () => {
      expect(component.mensagemErro()).toBe('Por favor, preencha todos os campos obrigatórios');
    });

    it('deve retornar mensagem de erro para mês inválido', () => {
      component.tipoSelecao.set('mes');
      component.mesSelecionado.set('9');
      component.anoSelecionado.set('2024');
      mockSelecaoPeriodoService.validarPeriodo.mockReturnValue(false);

      // Verificar se o método validarPeriodo foi chamado
      expect(mockSelecaoPeriodoService.validarPeriodo).toHaveBeenCalledWith('9', '2024');
    });

    it('deve retornar mensagem de erro para intervalo inválido', () => {
      component.tipoSelecao.set('intervalo');
      component.dataInicio.set('2024-09-01');
      component.dataFim.set('2024-09-30');
      mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(false);

      expect(component.mensagemErro()).toBe('O intervalo selecionado excede 90 dias ou é inválido');
    });

    it('deve retornar mensagem de erro para data início maior que fim', () => {
      component.periodoForm.setErrors({ dataInicioMaiorQueFim: true });
      expect(component.mensagemErro()).toBe('A data de início deve ser anterior à data de fim');
    });

    it('deve retornar mensagem de erro para intervalo maior que 90 dias', () => {
      component.periodoForm.setErrors({ intervaloMaiorQue90Dias: true });
      expect(component.mensagemErro()).toBe('O intervalo selecionado excede 90 dias');
    });
  });

  describe('métodos públicos', () => {
    it('deve navegar para home ao voltar', () => {
      component.voltar();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('deve alterar tipo de seleção para intervalo', () => {
      component.alterarTipoSelecao('intervalo');
      expect(component.tipoSelecao()).toBe('intervalo');
      expect(component.periodoForm.get('mes')?.value).toBeNull();
    });

    it('deve alterar tipo de seleção para mes', () => {
      component.alterarTipoSelecao('mes');
      expect(component.tipoSelecao()).toBe('mes');
      expect(mockSelecaoPeriodoService.obterPeriodoAtual).toHaveBeenCalled();
    });

    it('deve aplicar filtro e navegar para extrato/pdf', () => {
      component.tipoSelecao.set('mes');
      component.mesSelecionado.set('9');
      component.anoSelecionado.set('2024');

      component.aplicarFiltro();

      expect(mockSelecaoPeriodoService.definirPeriodo).toHaveBeenCalledWith({
        tipo: 'mes',
        valor: 'Setembro 2024',
        mes: '9',
        ano: '2024',
        dataInicio: '',
        dataFim: ''
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/extrato/pdf']);
    });

    it('não deve aplicar filtro quando formulário é inválido', () => {
      component.tipoSelecao.set('mes');
      component.mesSelecionado.set('');
      component.anoSelecionado.set('');

      component.aplicarFiltro();

      expect(mockSelecaoPeriodoService.definirPeriodo).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('validação de campos', () => {
    it('deve retornar true para campo inválido', () => {
      const field = component.periodoForm.get('mes');
      field?.markAsDirty();
      field?.markAsTouched();
      field?.setErrors({ required: true });

      expect(component.isFieldInvalid('mes')).toBe(true);
    });

    it('deve retornar false para campo válido', () => {
      component.periodoForm.get('mes')?.setValue('9');
      expect(component.isFieldInvalid('mes')).toBe(false);
    });

    it('deve retornar mensagem de erro para campo obrigatório', () => {
      const field = component.periodoForm.get('mes');
      field?.setErrors({ required: true });

      expect(component.getFieldError('mes')).toBe('Este campo é obrigatório');
    });

    it('deve retornar mensagem de erro para data fora do histórico', () => {
      const field = component.periodoForm.get('dataInicio');
      field?.setErrors({ dataForaHistorico: true });

      expect(component.getFieldError('dataInicio')).toBe('Data fora do limite de 12 meses de histórico');
    });

    it('deve retornar mensagem de erro para data futura', () => {
      const field = component.periodoForm.get('dataInicio');
      field?.setErrors({ dataFutura: true });

      expect(component.getFieldError('dataInicio')).toBe('Não é possível selecionar uma data futura');
    });

    it('deve retornar mensagem de erro para maxlength', () => {
      const field = component.periodoForm.get('mes');
      field?.setErrors({ maxlength: { requiredLength: 2 } });

      expect(component.getFieldError('mes')).toBe('Máximo de 2 caracteres');
    });

    it('deve retornar mensagem de erro para minlength', () => {
      const field = component.periodoForm.get('mes');
      field?.setErrors({ minlength: { requiredLength: 1 } });

      expect(component.getFieldError('mes')).toBe('Mínimo de 1 caracteres');
    });

    it('deve retornar mensagem de erro para email inválido', () => {
      const field = component.periodoForm.get('mes');
      field?.setErrors({ email: true });

      expect(component.getFieldError('mes')).toBe('Email inválido');
    });

    it('deve retornar mensagem de erro para pattern inválido', () => {
      const field = component.periodoForm.get('mes');
      field?.setErrors({ pattern: true });

      expect(component.getFieldError('mes')).toBe('Formato inválido');
    });

    it('deve retornar mensagem genérica para erro desconhecido', () => {
      const field = component.periodoForm.get('mes');
      field?.setErrors({ unknownError: true });

      expect(component.getFieldError('mes')).toBe('Campo inválido');
    });

    it('deve retornar string vazia quando não há erros', () => {
      expect(component.getFieldError('mes')).toBe('');
    });
  });

  describe('navegação por teclado', () => {
    it('deve aplicar filtro ao pressionar Enter', () => {
      jest.spyOn(component, 'aplicarFiltro');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      component.onKeyDown(event, 'aplicar');

      expect(component.aplicarFiltro).toHaveBeenCalled();
    });

    it('deve aplicar filtro ao pressionar Espaço', () => {
      jest.spyOn(component, 'aplicarFiltro');
      const event = new KeyboardEvent('keydown', { key: ' ' });

      component.onKeyDown(event, 'aplicar');

      expect(component.aplicarFiltro).toHaveBeenCalled();
    });

    it('deve alterar tipo para mes ao pressionar Enter', () => {
      jest.spyOn(component, 'alterarTipoSelecao');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      component.onKeyDown(event, 'tipo-mes');

      expect(component.alterarTipoSelecao).toHaveBeenCalledWith('mes');
    });

    it('deve alterar tipo para intervalo ao pressionar Enter', () => {
      jest.spyOn(component, 'alterarTipoSelecao');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      component.onKeyDown(event, 'tipo-intervalo');

      expect(component.alterarTipoSelecao).toHaveBeenCalledWith('intervalo');
    });

    it('não deve executar ação para outras teclas', () => {
      jest.spyOn(component, 'aplicarFiltro');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onKeyDown(event, 'aplicar');

      expect(component.aplicarFiltro).not.toHaveBeenCalled();
    });
  });

  describe('métodos de data', () => {
    it('deve retornar data mínima formatada', () => {
      const dataMinima = component.getDataMinima();
      expect(dataMinima).toBe('2023-08-31'); // Timezone UTC
    });

    it('deve retornar data máxima formatada', () => {
      const dataMaxima = component.getDataMaxima();
      expect(dataMaxima).toBe('2024-09-07'); // Timezone UTC
    });

    it('deve retornar data mínima de início', () => {
      const dataMinimaInicio = component.getDataMinimaInicio();
      expect(dataMinimaInicio).toBe('2023-08-31'); // Timezone UTC
    });

    it('deve retornar data máxima de início', () => {
      const dataMaximaInicio = component.getDataMaximaInicio();
      expect(dataMaximaInicio).toBe('2024-09-07'); // Timezone UTC
    });

    it('deve retornar data mínima de fim baseada na data de início', () => {
      component.dataInicio.set('2024-09-05');
      const dataMinimaFim = component.getDataMinimaFim();
      expect(dataMinimaFim).toBe('2024-09-05');
    });

    it('deve retornar data mínima padrão quando data início está vazia', () => {
      component.dataInicio.set('');
      const dataMinimaFim = component.getDataMinimaFim();
      expect(dataMinimaFim).toBe('2023-08-31'); // Timezone UTC
    });

    it('deve retornar data máxima de fim baseada no limite de 90 dias', () => {
      component.dataInicio.set('2024-09-01');
      const dataMaximaFim = component.getDataMaximaFim();
      expect(dataMaximaFim).toBe('2024-09-07'); // Limitado pela data máxima
    });

    it('deve retornar data máxima padrão quando data início está vazia', () => {
      component.dataInicio.set('');
      const dataMaximaFim = component.getDataMaximaFim();
      expect(dataMaximaFim).toBe('2024-09-07'); // Timezone UTC
    });

    it('deve logar data selecionada', () => {
      jest.spyOn(console, 'log');
      component.onDateChange('2024-09-01');
      expect(console.log).toHaveBeenCalledWith('Data selecionada:', '2024-09-01');
    });
  });

  describe('validação e limpeza de data fim', () => {
    it('deve limpar data fim quando intervalo é inválido', () => {
      component.dataInicio.set('2024-09-01');
      component.dataFim.set('2024-12-01'); // Mais de 90 dias
      mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(false);

      component.periodoForm.get('dataInicio')?.setValue('2024-09-01');

      expect(component.periodoForm.get('dataFim')?.value).toBe('');
    });

    it('não deve limpar data fim quando intervalo é válido', () => {
      component.dataInicio.set('2024-09-01');
      component.dataFim.set('2024-09-30');
      mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(true);

      // Simular mudança no formulário
      component.periodoForm.get('dataFim')?.setValue('2024-09-30');
      component.periodoForm.get('dataInicio')?.setValue('2024-09-01');

      expect(component.periodoForm.get('dataFim')?.value).toBe('2024-09-30');
    });
  });

  describe('validadores customizados', () => {
    it('deve validar data início corretamente', () => {
      const validador = component['criarValidadorDataInicio']();
      const control = { value: '2024-09-01' };

      const resultado = validador(control as any);

      expect(resultado).toBeNull();
      expect(mockSelecaoPeriodoService.validarLimiteHistorico).toHaveBeenCalled();
    });

    it('deve retornar erro para data início fora do histórico', () => {
      const validador = component['criarValidadorDataInicio']();
      const control = { value: '2024-09-01' };
      mockSelecaoPeriodoService.validarLimiteHistorico.mockReturnValue(false);

      const resultado = validador(control as any);

      expect(resultado).toEqual({ dataForaHistorico: true });
    });

    it('deve validar data fim corretamente', () => {
      const validador = component['criarValidadorDataFim']();
      const control = { value: '2024-09-30' };

      const resultado = validador(control as any);

      expect(resultado).toBeNull();
      expect(mockSelecaoPeriodoService.validarLimiteHistorico).toHaveBeenCalled();
    });

    it('deve retornar erro para data fim fora do histórico', () => {
      const validador = component['criarValidadorDataFim']();
      const control = { value: '2024-09-30' };
      mockSelecaoPeriodoService.validarLimiteHistorico.mockReturnValue(false);

      const resultado = validador(control as any);

      expect(resultado).toEqual({ dataForaHistorico: true });
    });

    it('deve validar intervalo de datas corretamente', () => {
      const validador = component['criarValidadorIntervaloDatas']();
      const control = {
        get: (field: string) => ({
          value: field === 'dataInicio' ? '2024-09-01' : '2024-09-30'
        })
      };

      const resultado = validador(control as any);

      expect(resultado).toBeNull();
      expect(mockSelecaoPeriodoService.validarIntervaloDatas).toHaveBeenCalled();
    });

    it('deve retornar erro para data início maior que fim', () => {
      const validador = component['criarValidadorIntervaloDatas']();
      const control = {
        get: (field: string) => ({
          value: field === 'dataInicio' ? '2024-09-30' : '2024-09-01'
        })
      };

      const resultado = validador(control as any);

      expect(resultado).toEqual({ dataInicioMaiorQueFim: true });
    });

    it('deve retornar erro para intervalo maior que 90 dias', () => {
      const validador = component['criarValidadorIntervaloDatas']();
      const control = {
        get: (field: string) => ({
          value: field === 'dataInicio' ? '2024-09-01' : '2024-12-01'
        })
      };
      mockSelecaoPeriodoService.validarIntervaloDatas.mockReturnValue(false);

      const resultado = validador(control as any);

      expect(resultado).toEqual({ intervaloMaiorQue90Dias: true });
    });

    it('deve retornar null quando datas estão vazias', () => {
      const validador = component['criarValidadorIntervaloDatas']();
      const control = {
        get: (field: string) => ({ value: null })
      };

      const resultado = validador(control as any);

      expect(resultado).toBeNull();
    });
  });

  describe('métodos auxiliares', () => {
    it('deve gerar ID único', () => {
      const id1 = component['gerarIdUnico']();
      
      // Aguardar um pouco para garantir que o timestamp seja diferente
      setTimeout(() => {
        const id2 = component['gerarIdUnico']();
        expect(id1).toContain('selecao-periodo-');
        expect(id2).toContain('selecao-periodo-');
        expect(id1).not.toBe(id2);
      }, 1);
    });
  });

  describe('computed values avançados', () => {
    it('deve calcular temErros corretamente', () => {
      component.tipoSelecao.set('mes');
      component.mesSelecionado.set('');
      component.anoSelecionado.set('');

      expect(component.temErros()).toBe(true);
    });

    it('deve calcular botaoDesabilitado corretamente', () => {
      component.tipoSelecao.set('mes');
      component.mesSelecionado.set('');
      component.anoSelecionado.set('');

      expect(component.botaoDesabilitado()).toBe(true);
    });

    it('deve retornar false para botaoDesabilitado quando formulário é válido', () => {
      component.tipoSelecao.set('mes');
      component.mesSelecionado.set('9');
      component.anoSelecionado.set('2024');

      expect(component.botaoDesabilitado()).toBe(false);
    });
  });
});