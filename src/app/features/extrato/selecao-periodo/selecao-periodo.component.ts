import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { SelecaoPeriodoService } from './selecao-periodo.service';
import { PeriodoMesAno } from './interfaces/periodo.interface';

@Component({
  selector: 'app-selecao-periodo',
  templateUrl: './selecao-periodo.component.html',
  styleUrls: ['./selecao-periodo.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  animations: []
})
export class SelecaoPeriodoComponent implements OnInit, OnDestroy {
  // Inject do serviço usando a nova sintaxe
  private readonly selecaoPeriodoService = inject(SelecaoPeriodoService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // FormGroup para o formulário
  periodoForm!: FormGroup;

  // Signals para estado do componente
  readonly tipoSelecao = signal<'intervalo' | 'mes'>('mes');
  readonly uniqueId = signal<string>(`selecao-periodo-${Date.now()}`);

  // Signals para valores do formulário (reativos)
  readonly mesSelecionado = signal<string>('');
  readonly anoSelecionado = signal<string>('');
  readonly dataInicio = signal<string>('');
  readonly dataFim = signal<string>('');

  // Signals do serviço (readonly)
  readonly listaPeriodoMesAno = this.selecaoPeriodoService.periodos;
  readonly meses = this.selecaoPeriodoService.meses;
  readonly anos = this.selecaoPeriodoService.anos;

  // Computed values para validações
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

    if (dataInicio > dataFim) {
      return true;
    }

    const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 90;
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

    const dataSelecionada = new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, 1);
    const dataAtual = new Date();
    const dataLimite = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 12, 1);

    return dataSelecionada < dataLimite;
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

      const mesObj = this.meses().find(m => m.valor === mes);
      return mesObj ? `${mesObj.nome} de ${ano}` : '';
    } else {
      const inicio = this.dataInicio();
      const fim = this.dataFim();
      if (!inicio || !fim) {
        return '';
      }

      const dataInicio = new Date(inicio);
      const dataFim = new Date(fim);
      return `${dataInicio.toLocaleDateString('pt-BR')} - ${dataFim.toLocaleDateString('pt-BR')}`;
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
        return 'O mês selecionado está fora do limite de 12 meses de histórico';
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
    this.inicializarValoresPadrao();
    this.subscribirMudancasFormulario();
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
  }

  private inicializarFormulario(): void {
    this.periodoForm = this.fb.group({
      mes: ['', Validators.required],
      ano: ['', Validators.required],
      dataInicio: ['', [Validators.required, this.validarDataInicio()]],
      dataFim: ['', [Validators.required, this.validarDataFim()]]
    }, { validators: this.validarIntervaloDatas() });
  }

  private inicializarValoresPadrao(): void {
    const dataAtual = new Date();
    const mesAtual = (dataAtual.getMonth() + 1).toString();
    const anoAtual = dataAtual.getFullYear().toString();

    this.periodoForm.patchValue({
      mes: mesAtual,
      ano: anoAtual
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
    
    // Calcular diferença em dias
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Se exceder 90 dias, limpar a data fim
    if (diffDays > 90) {
      this.periodoForm.get('dataFim')?.setValue('');
    }
  }

  // Métodos públicos
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

  // Métodos de validação
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

  getDataMinima(): string {
    const dataMinima = this.selecaoPeriodoService.obterDataLimiteHistorico();
    return dataMinima.toISOString().split('T')[0];
  }

  getDataMaxima(): string {
    const dataMaxima = this.selecaoPeriodoService.obterDataMaxima();
    return dataMaxima.toISOString().split('T')[0];
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
    
    const inicio = new Date(dataInicio);
    const dataMinima = new Date(this.getDataMinima());
    
    // A data fim não pode ser anterior à data início
    return inicio > dataMinima ? dataInicio : this.getDataMinima();
  }

  getDataMaximaFim(): string {
    const dataInicio = this.dataInicio();
    if (!dataInicio) {
      return this.getDataMaxima();
    }
    
    const inicio = new Date(dataInicio);
    const dataMaxima = new Date(this.getDataMaxima());
    
    // Calcular data máxima baseada no limite de 90 dias
    const dataLimite90Dias = new Date(inicio);
    dataLimite90Dias.setDate(inicio.getDate() + 90);
    
    // Retornar a menor entre a data máxima permitida e o limite de 90 dias
    return dataLimite90Dias < dataMaxima ? dataLimite90Dias.toISOString().split('T')[0] : this.getDataMaxima();
  }

  onDateChange(event: string): void {
    console.log('Data selecionada:', event);
  }

  // Validadores customizados

  private validarDataInicio(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const dataInicio = new Date(control.value);
      const dataAtual = new Date();
      const dataLimite = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 12, 1);
      
      if (dataInicio < dataLimite) {
        return { dataForaHistorico: true };
      }
      
      if (dataInicio > dataAtual) {
        return { dataFutura: true };
      }
      
      return null;
    };
  }

  private validarDataFim(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const dataFim = new Date(control.value);
      const dataAtual = new Date();
      const dataLimite = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 12, 1);
      
      if (dataFim < dataLimite) {
        return { dataForaHistorico: true };
      }
      
      if (dataFim > dataAtual) {
        return { dataFutura: true };
      }
      
      return null;
    };
  }

  private validarIntervaloDatas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const dataInicio = control.get('dataInicio')?.value;
      const dataFim = control.get('dataFim')?.value;
      
      if (!dataInicio || !dataFim) return null;
      
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      
      if (inicio > fim) {
        return { dataInicioMaiorQueFim: true };
      }
      
      const diffTime = Math.abs(fim.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 90) {
        return { intervaloMaiorQue90Dias: true };
      }
      
      return null;
    };
  }
}
