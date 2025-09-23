import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { SelecaoPeriodoService } from './selecao-periodo.service';
import { PeriodoMesAno } from './interfaces/periodo.interface';
import { ModalSelectComponent } from '../../../shared/components/modal-select/modal-select.component';

/**
 * Componente de seleção de período seguindo princípios SOLID e Clean Code
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Gerencia apenas a UI e coordenação de formulários
 * - Open/Closed: Extensível através de novos tipos de seleção
 * - Liskov Substitution: Implementa interfaces consistentes
 * - Interface Segregation: Métodos específicos para cada responsabilidade
 * - Dependency Inversion: Depende de abstrações (SelecaoPeriodoService)
 * 
 * Clean Code aplicado:
 * - Nomes descritivos e intencionais
 * - Métodos pequenos com responsabilidade única
 * - Separação clara de responsabilidades
 * - Código auto-documentado
 */
@Component({
  selector: 'app-selecao-periodo',
  templateUrl: './selecao-periodo.component.html',
  styleUrls: ['./selecao-periodo.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalSelectComponent],
  animations: []
})
export class SelecaoPeriodoComponent implements OnInit, OnDestroy {
  // ==================== DEPENDENCY INJECTION ====================
  private readonly selecaoPeriodoService = inject(SelecaoPeriodoService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  // ==================== FORM STATE ====================
  periodoForm!: FormGroup;


  // ==================== COMPONENT STATE ====================
  readonly tipoSelecao = signal<'intervalo' | 'mes'>('mes');
  readonly uniqueId = signal<string>(this.gerarIdUnico());

  // ==================== FORM VALUES ====================
  readonly mesSelecionado = signal<string>('');
  readonly anoSelecionado = signal<string>('');
  readonly periodoSelecionado = signal<string>('');
  readonly dataInicio = signal<string>('');
  readonly dataFim = signal<string>('');

  // ==================== SERVICE DATA ====================
  readonly listaPeriodoMesAno = this.selecaoPeriodoService.periodos;
  readonly meses = this.selecaoPeriodoService.meses;
  readonly anos = this.selecaoPeriodoService.anos;
  readonly periodosDropdown = this.selecaoPeriodoService.periodosDropdown;

  // ==================== COMPUTED VALIDATIONS ====================
  readonly intervaloInvalido = computed(() => this.validarIntervalo());
  readonly mesInvalido = computed(() => this.validarMes());
  readonly formularioInvalido = computed(() => this.validarFormulario());
  readonly temErros = computed(() => this.formularioInvalido());
  readonly botaoDesabilitado = computed(() => this.formularioInvalido());

  // ==================== COMPUTED DISPLAY VALUES ====================
  readonly periodoFormatado = computed(() => this.formatarPeriodoSelecionado());
  readonly mensagemErro = computed(() => this.obterMensagemErro());

  // ==================== LIFECYCLE HOOKS ====================
  ngOnInit(): void {
    this.inicializarFormulario();
    this.configurarSubscricoes();
    this.definirValoresPadrao();
  }

  ngOnDestroy(): void {
    // Cleanup automático com signals - não necessário
  }

  // ==================== FORM INITIALIZATION ====================
  private inicializarFormulario(): void {
    this.periodoForm = this.formBuilder.group({
      mes: ['', Validators.required],
      ano: ['', Validators.required],
      periodo: ['', Validators.required],
      dataInicio: ['', [Validators.required, this.criarValidadorDataInicio()]],
      dataFim: ['', [Validators.required, this.criarValidadorDataFim()]]
    }, { validators: this.criarValidadorIntervaloDatas() });
  }

  private configurarSubscricoes(): void {
    this.subscribirCampo('mes', this.mesSelecionado);
    this.subscribirCampo('ano', this.anoSelecionado);
    this.subscribirCampo('periodo', this.periodoSelecionado, () => this.extrairMesEAnoDoPerido());
    this.subscribirCampo('dataInicio', this.dataInicio, () => this.validarELimparDataFimSeNecessario());
    this.subscribirCampo('dataFim', this.dataFim);
  }

  private definirValoresPadrao(): void {
    const periodoAtual = this.selecaoPeriodoService.obterPeriodoAtual();
    const periodoDropdownAtual = `${periodoAtual.mes}/${periodoAtual.ano}`;
    
    this.periodoForm.patchValue({
      mes: periodoAtual.mes,
      ano: periodoAtual.ano,
      periodo: periodoDropdownAtual
    });
  }

  private subscribirCampo(campo: string, signal: any, callback?: () => void): void {
    this.periodoForm.get(campo)?.valueChanges.subscribe(value => {
      signal.set(value || '');
      callback?.();
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

  private extrairMesEAnoDoPerido(): void {
    const periodo = this.periodoSelecionado();
    
    if (!periodo) {
      return;
    }
    
    // Formato esperado: "mes/ano" (ex: "9/2024")
    const [mes, ano] = periodo.split('/');
    
    if (mes && ano) {
      this.periodoForm.patchValue({
        mes,
        ano
      }, { emitEvent: false }); // emitEvent: false para evitar loops
      
      // Atualizar os signals também
      this.mesSelecionado.set(mes);
      this.anoSelecionado.set(ano);
    }
  }

  // ==================== PUBLIC ACTIONS ====================
  voltar(): void {
    this.router.navigate(['/home']);
  }

  alterarTipoSelecao(tipo: 'intervalo' | 'mes'): void {
    this.tipoSelecao.set(tipo);
    this.limparFormulario();
    
    if (tipo === 'mes') {
      this.definirValoresPadrao();
    }
  }

  aplicarFiltro(): void {
    if (this.formularioInvalido()) {
      return;
    }

    const periodo = this.criarPeriodoSelecionado();
    this.selecaoPeriodoService.definirPeriodo(periodo);
    this.navegarParaExtrato();
  }

  // ==================== FORM VALIDATION ====================
  isFieldInvalid(fieldName: string): boolean {
    const field = this.periodoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.periodoForm.get(fieldName);
    if (!field?.errors) return '';

    return this.mapearErroCampo(field.errors);
  }

  // ==================== KEYBOARD NAVIGATION ====================
  onKeyDown(event: KeyboardEvent, action: string): void {
    if (!this.isValidKeyPress(event)) return;
    
    event.preventDefault();
    this.executarAcaoPorTeclado(action);
  }

  // ==================== DATE CONSTRAINTS ====================
  getDataMinima(): Date {
    return this.criarDataSemTimezone(this.selecaoPeriodoService.obterDataLimiteHistorico());
  }

  getDataMaxima(): Date {
    return this.criarDataSemTimezone(this.selecaoPeriodoService.obterDataMaxima());
  }

  getDataMinimaInicio(): Date {
    return this.getDataMinima();
  }

  getDataMaximaInicio(): Date {
    return this.getDataMaxima();
  }

  getDataMinimaFim(): Date {
    const dataInicio = this.dataInicio();
    if (!dataInicio) return this.getDataMinima();
    
    const inicio = this.parsearDataString(dataInicio);
    const dataMinima = this.getDataMinima();
    
    return inicio > dataMinima ? inicio : dataMinima;
  }

  getDataMaximaFim(): Date {
    const dataInicio = this.dataInicio();
    if (!dataInicio) return this.getDataMaxima();
    
    const inicio = this.parsearDataString(dataInicio);
    const dataMaxima = this.getDataMaxima();
    const dataLimite90Dias = this.calcularDataLimite90Dias(inicio);
    
    // Retornar a menor entre a data máxima permitida e o limite de 90 dias
    // Isso garante que não permitimos datas futuras além do período histórico
    return dataLimite90Dias < dataMaxima ? dataLimite90Dias : dataMaxima;
  }

  onDateChange(event: string): void {
    // console.log removido por questões de segurança
  }

  // ==================== PRIVATE HELPER METHODS ====================
  private gerarIdUnico(): string {
    return `selecao-periodo-${Date.now()}`;
  }

  private limparFormulario(): void {
    this.periodoForm.reset();
  }

  private criarPeriodoSelecionado(): PeriodoMesAno {
    return {
      tipo: this.tipoSelecao(),
      valor: this.periodoFormatado(),
      mes: this.mesSelecionado(),
      ano: this.anoSelecionado(),
      dataInicio: this.dataInicio(),
      dataFim: this.dataFim()
    };
  }

  private navegarParaExtrato(): void {
    this.router.navigate(['/extrato/pdf']);
  }

  private isValidKeyPress(event: KeyboardEvent): boolean {
    return event.key === 'Enter' || event.key === ' ';
  }

  private executarAcaoPorTeclado(action: string): void {
    const actions: Record<string, () => void> = {
      'aplicar': () => this.aplicarFiltro(),
      'tipo-mes': () => this.alterarTipoSelecao('mes'),
      'tipo-intervalo': () => this.alterarTipoSelecao('intervalo')
    };

    actions[action]?.();
  }

  private mapearErroCampo(errors: ValidationErrors): string {
    const errorMessages: Record<string, string> = {
      required: 'Este campo é obrigatório',
      dataForaHistorico: 'Data fora do limite de 12 meses de histórico',
      dataFutura: 'Não é possível selecionar uma data futura',
      maxlength: `Máximo de ${errors.maxlength?.requiredLength} caracteres`,
      minlength: `Mínimo de ${errors.minlength?.requiredLength} caracteres`,
      pattern: 'Formato inválido'
    };

    for (const [key, message] of Object.entries(errorMessages)) {
      if (errors[key]) return message;
    }

    return 'Campo inválido';
  }

  // ==================== VALIDATION METHODS ====================
  private validarIntervalo(): boolean {
    if (this.tipoSelecao() !== 'intervalo') return false;

    const inicio = this.dataInicio();
    const fim = this.dataFim();
    if (!inicio || !fim) return false;

    const dataInicio = this.parsearDataString(inicio);
    const dataFim = this.parsearDataString(fim);

    return !this.selecaoPeriodoService.validarIntervaloDatas(dataInicio, dataFim);
  }

  private validarMes(): boolean {
    if (this.tipoSelecao() !== 'mes') return false;

    const mes = this.mesSelecionado();
    const ano = this.anoSelecionado();
    if (!mes || !ano) return false;

    return !this.selecaoPeriodoService.validarPeriodo(mes, ano);
  }

  private validarFormulario(): boolean {
    if (this.tipoSelecao() === 'mes') {
      return !this.mesSelecionado() || !this.anoSelecionado() || this.mesInvalido();
    } else {
      return !this.dataInicio() || !this.dataFim() || this.intervaloInvalido();
    }
  }

  private formatarPeriodoSelecionado(): string {
    if (this.tipoSelecao() === 'mes') {
      return this.formatarPeriodoMes();
    } else {
      return this.formatarPeriodoIntervalo();
    }
  }

  private formatarPeriodoMes(): string {
    const mes = this.mesSelecionado();
    const ano = this.anoSelecionado();
    if (!mes || !ano) return '';

    return this.selecaoPeriodoService.formatarPeriodo(mes, ano);
  }

  private formatarPeriodoIntervalo(): string {
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    if (!inicio || !fim) return '';

    const dataInicio = this.parsearDataString(inicio);
    const dataFim = this.parsearDataString(fim);
    return this.selecaoPeriodoService.formatarIntervalo(dataInicio, dataFim);
  }

  private obterMensagemErro(): string {
    if (this.periodoForm?.errors) {
      return this.mapearErroFormulario(this.periodoForm.errors);
    }

    if (this.tipoSelecao() === 'mes' && this.mesInvalido()) {
      return 'O mês selecionado está fora do limite de 12 meses (passado ou futuro)';
    }
    
    if (this.tipoSelecao() === 'intervalo' && this.intervaloInvalido()) {
      return 'O intervalo selecionado não pode ser superior a 90 dias';
    }
    
    return 'Por favor, preencha todos os campos obrigatórios';
  }

  private mapearErroFormulario(errors: ValidationErrors): string {
    if (errors.dataInicioMaiorQueFim) {
      return 'A data de início deve ser anterior à data de fim';
    }
    
    if (errors.intervaloMaiorQue90Dias) {
      return 'O intervalo selecionado não pode ser superior a 90 dias';
    }

    return 'Erro no formulário';
  }

  // ==================== DATE UTILITIES ====================
  private criarDataSemTimezone(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  private parsearDataString(dataString: string): Date {
    return new Date(dataString + 'T00:00:00');
  }

  private calcularDataLimite90Dias(dataInicio: Date): Date {
    const dataLimite = new Date(dataInicio);
    dataLimite.setDate(dataInicio.getDate() + 90);
    return dataLimite;
  }

  // ==================== CUSTOM VALIDATORS ====================
  private criarValidadorDataInicio(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const dataInicio = this.parsearDataString(control.value);
      
      if (!this.selecaoPeriodoService.validarLimiteHistorico(dataInicio)) {
        return { dataForaHistorico: true };
      }
      
      return null;
    };
  }

  private criarValidadorDataFim(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const dataFim = this.parsearDataString(control.value);
      
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
      
      const inicio = this.parsearDataString(dataInicio);
      const fim = this.parsearDataString(dataFim);
      
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
