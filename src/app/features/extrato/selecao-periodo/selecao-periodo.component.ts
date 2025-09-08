import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { SelecaoPeriodoService } from './selecao-periodo.service';
import { PeriodoMesAno } from './interfaces/periodo.interface';

/**
 * Componente de seleção de período seguindo princípios SOLID e Clean Code
 * - Single Responsibility: Gerencia apenas a UI e coordenação
 * - Dependency Inversion: Depende de abstrações (SelecaoPeriodoService)
 * - Clean Code: Nomes descritivos, métodos pequenos, responsabilidades claras
 */
@Component({
  selector: 'app-selecao-periodo',
  templateUrl: './selecao-periodo.component.html',
  styleUrls: ['./selecao-periodo.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  animations: []
})
export class SelecaoPeriodoComponent implements OnInit, OnDestroy {
  // Dependency Injection (Dependency Inversion Principle)
  private readonly selecaoPeriodoService = inject(SelecaoPeriodoService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  // FormGroup para o formulário (Clean Code - Nome descritivo)
  periodoForm!: FormGroup;

  // Signals para estado do componente (Clean Code - Nomes descritivos)
  readonly tipoSelecao = signal<'intervalo' | 'mes'>('mes');
  readonly uniqueId = signal<string>(this.gerarIdUnico());

  // Signals para valores do formulário (Clean Code - Estado reativo)
  readonly mesSelecionado = signal<string>('');
  readonly anoSelecionado = signal<string>('');
  readonly dataInicio = signal<string>('');
  readonly dataFim = signal<string>('');

  // Signals do serviço (readonly - Interface Segregation)
  readonly listaPeriodoMesAno = this.selecaoPeriodoService.periodos;
  readonly meses = this.selecaoPeriodoService.meses;
  readonly anos = this.selecaoPeriodoService.anos;

  // Computed values para validações (delegando para o serviço)
  readonly intervaloInvalido = computed(() => {
    if (this.tipoSelecao() !== 'intervalo') {
      return false;
    }

    const inicio = this.dataInicio();
    const fim = this.dataFim();

    if (!inicio || !fim) {
      return false;
    }

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    return !this.selecaoPeriodoService.validarIntervaloDatas(dataInicio, dataFim);
  });

  readonly mesInvalido = computed(() => {
    if (this.tipoSelecao() !== 'mes') {
      return false;
    }

    const mes = this.mesSelecionado();
    const ano = this.anoSelecionado();

    if (!mes || !ano) {
      return false;
    }

    return !this.selecaoPeriodoService.validarPeriodo(mes, ano);
  });

  readonly formularioInvalido = computed(() => {
    if (this.tipoSelecao() === 'mes') {
      return !this.mesSelecionado() || !this.anoSelecionado() || this.mesInvalido();
    } else {
      return !this.dataInicio() || !this.dataFim() || this.intervaloInvalido();
    }
  });

  readonly periodoFormatado = computed(() => {
    if (this.tipoSelecao() === 'mes') {
      const mes = this.mesSelecionado();
      const ano = this.anoSelecionado();
      if (!mes || !ano) {
        return '';
      }
      return this.selecaoPeriodoService.formatarPeriodo(mes, ano);
    } else {
      const inicio = this.dataInicio();
      const fim = this.dataFim();
      if (!inicio || !fim) {
        return '';
      }

      const dataInicio = new Date(inicio);
      const dataFim = new Date(fim);
      return this.selecaoPeriodoService.formatarIntervalo(dataInicio, dataFim);
    }
  });

  readonly temErros = computed(() => {
    return this.formularioInvalido();
  });

  readonly mensagemErro = computed(() => {
    // Verificar erros de formulário
    if (this.periodoForm?.errors) {
      const formErrors = this.periodoForm.errors;
      
      if (formErrors.dataInicioMaiorQueFim) {
        return 'A data de início deve ser anterior à data de fim';
      }
      
      if (formErrors.intervaloMaiorQue90Dias) {
        return 'O intervalo selecionado excede 90 dias';
      }
    }

    // Verificar erros específicos por tipo de seleção
    if (this.tipoSelecao() === 'mes') {
      if (this.mesInvalido()) {
        return 'O mês selecionado está fora do limite de 12 meses (passado ou futuro)';
      }
    }
    
    if (this.tipoSelecao() === 'intervalo') {
      if (this.intervaloInvalido()) {
        return 'O intervalo selecionado excede 90 dias ou é inválido';
      }
    }
    
    return 'Por favor, preencha todos os campos obrigatórios';
  });

  readonly botaoDesabilitado = computed(() => {
    return this.formularioInvalido();
  });

  ngOnInit(): void {
    this.inicializarFormulario();
    this.subscribirMudancasFormulario();
    this.inicializarValoresPadrao();
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
  }

  private inicializarFormulario(): void {
    this.periodoForm = this.formBuilder.group({
      mes: ['', Validators.required],
      ano: ['', Validators.required],
      dataInicio: ['', [Validators.required, this.criarValidadorDataInicio()]],
      dataFim: ['', [Validators.required, this.criarValidadorDataFim()]]
    }, { validators: this.criarValidadorIntervaloDatas() });
  }

  private inicializarValoresPadrao(): void {
    const periodoAtual = this.selecaoPeriodoService.obterPeriodoAtual();
    
    this.periodoForm.patchValue({
      mes: periodoAtual.mes,
      ano: periodoAtual.ano
    });
  }

  private subscribirMudancasFormulario(): void {
    // Atualizar signals quando o formulário muda
    this.periodoForm.get('mes')?.valueChanges.subscribe(value => {
      this.mesSelecionado.set(value || '');
    });

    this.periodoForm.get('ano')?.valueChanges.subscribe(value => {
      this.anoSelecionado.set(value || '');
    });

    this.periodoForm.get('dataInicio')?.valueChanges.subscribe(value => {
      this.dataInicio.set(value || '');
      this.validarELimparDataFimSeNecessario();
    });

    this.periodoForm.get('dataFim')?.valueChanges.subscribe(value => {
      this.dataFim.set(value || '');
    });
  }

  private validarELimparDataFimSeNecessario(): void {
    const dataInicio = this.dataInicio();
    const dataFim = this.dataFim();
    
    if (!dataInicio || !dataFim) {
      return;
    }
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    // Usar o serviço para validar o intervalo
    if (!this.selecaoPeriodoService.validarIntervaloDatas(inicio, fim)) {
      this.periodoForm.get('dataFim')?.setValue('');
    }
  }

  // Métodos públicos (Interface Segregation)
  voltar(): void {
    this.router.navigate(['/home']);
  }

  alterarTipoSelecao(tipo: 'intervalo' | 'mes'): void {
    this.tipoSelecao.set(tipo);

    // Limpar formulário ao trocar tipo
    this.periodoForm.reset();

    if (tipo === 'mes') {
      this.inicializarValoresPadrao();
    }
  }

  aplicarFiltro(): void {
    if (this.formularioInvalido()) {
      return;
    }

    const periodo: PeriodoMesAno = {
      tipo: this.tipoSelecao(),
      valor: this.periodoFormatado(),
      mes: this.mesSelecionado(),
      ano: this.anoSelecionado(),
      dataInicio: this.dataInicio(),
      dataFim: this.dataFim()
    };

    this.selecaoPeriodoService.definirPeriodo(periodo);
    this.router.navigate(['/extrato/pdf']);
  }

  // Métodos de validação (delegando para o serviço)
  isFieldInvalid(fieldName: string): boolean {
    const field = this.periodoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.periodoForm.get(fieldName);
    if (!field || !field.errors) {
      return '';
    }

    const errors = field.errors;

    if (errors.required) {
      return 'Este campo é obrigatório';
    }

    if (errors.dataForaHistorico) {
      return 'Data fora do limite de 12 meses de histórico';
    }

    if (errors.dataFutura) {
      return 'Não é possível selecionar uma data futura';
    }

    if (errors.maxlength) {
      return `Máximo de ${errors.maxlength.requiredLength} caracteres`;
    }

    if (errors.minlength) {
      return `Mínimo de ${errors.minlength.requiredLength} caracteres`;
    }

    if (errors.email) {
      return 'Email inválido';
    }

    if (errors.pattern) {
      return 'Formato inválido';
    }

    return 'Campo inválido';
  }

  // Métodos de navegação por teclado
  onKeyDown(event: KeyboardEvent, action: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      switch (action) {
        case 'aplicar':
          this.aplicarFiltro();
          break;
        case 'tipo-mes':
          this.alterarTipoSelecao('mes');
          break;
        case 'tipo-intervalo':
          this.alterarTipoSelecao('intervalo');
          break;
      }
    }
  }

  // Métodos para obter datas (delegando para o serviço)
  getDataMinima(): string {
    const dataMinima = this.selecaoPeriodoService.obterDataLimiteHistorico();
    // Parse evitando problemas de timezone
    const data = new Date(dataMinima.getFullYear(), dataMinima.getMonth(), dataMinima.getDate());
    return data.toISOString().split('T')[0];
  }

  getDataMaxima(): string {
    const dataMaxima = this.selecaoPeriodoService.obterDataMaxima();
    // Parse evitando problemas de timezone
    const data = new Date(dataMaxima.getFullYear(), dataMaxima.getMonth(), dataMaxima.getDate());
    return data.toISOString().split('T')[0];
  }

  // Métodos para validação dinâmica de datas
  getDataMinimaInicio(): string {
    return this.getDataMinima();
  }

  getDataMaximaInicio(): string {
    return this.getDataMaxima();
  }

  getDataMinimaFim(): string {
    const dataInicio = this.dataInicio();
    if (!dataInicio) {
      return this.getDataMinima();
    }
    
    // Parse da data de início evitando problemas de timezone
    const inicio = new Date(dataInicio + 'T00:00:00');
    const dataMinima = new Date(this.getDataMinima() + 'T00:00:00');
    
    // A data fim não pode ser anterior à data início
    return inicio > dataMinima ? dataInicio : this.getDataMinima();
  }

  getDataMaximaFim(): string {
    const dataInicio = this.dataInicio();
    if (!dataInicio) {
      return this.getDataMaxima();
    }
    
    // Parse da data de início evitando problemas de timezone
    const inicio = new Date(dataInicio + 'T00:00:00');
    const dataMaxima = new Date(this.getDataMaxima() + 'T00:00:00');
    
    // Calcular data máxima baseada no limite de 90 dias
    const dataLimite90Dias = new Date(inicio);
    dataLimite90Dias.setDate(inicio.getDate() + 90);
    
    // Retornar a menor entre a data máxima permitida e o limite de 90 dias
    // Isso garante que não permitimos datas futuras além do período histórico
    const dataFinal = dataLimite90Dias < dataMaxima ? dataLimite90Dias : dataMaxima;
    return dataFinal.toISOString().split('T')[0];
  }

  onDateChange(event: string): void {
    console.log('Data selecionada:', event);
  }

  // Métodos auxiliares (Clean Code - Métodos pequenos e específicos)
  private gerarIdUnico(): string {
    return `selecao-periodo-${Date.now()}`;
  }

  // Validadores customizados (Clean Code - Nomes descritivos, delegando para o serviço)
  private criarValidadorDataInicio(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Parse da data evitando problemas de timezone
      const dataInicio = new Date(control.value + 'T00:00:00');
      
      if (!this.selecaoPeriodoService.validarLimiteHistorico(dataInicio)) {
        return { dataForaHistorico: true };
      }
      
      return null;
    };
  }

  private criarValidadorDataFim(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Parse da data evitando problemas de timezone
      const dataFim = new Date(control.value + 'T00:00:00');
      
      if (!this.selecaoPeriodoService.validarLimiteHistorico(dataFim)) {
        return { dataForaHistorico: true };
      }
      
      return null;
    };
  }

  private criarValidadorIntervaloDatas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const dataInicio = control.get('dataInicio')?.value;
      const dataFim = control.get('dataFim')?.value;
      
      if (!dataInicio || !dataFim) return null;
      
      // Parse das datas evitando problemas de timezone
      const inicio = new Date(dataInicio + 'T00:00:00');
      const fim = new Date(dataFim + 'T00:00:00');
      
      if (inicio > fim) {
        return { dataInicioMaiorQueFim: true };
      }
      
      if (!this.selecaoPeriodoService.validarIntervaloDatas(inicio, fim)) {
        return { intervaloMaiorQue90Dias: true };
      }
      
      return null;
    };
  }
}
