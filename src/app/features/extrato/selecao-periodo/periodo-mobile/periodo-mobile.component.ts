import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  type ElementRef,
  viewChild,
  DestroyRef,
  AfterViewInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { 
  ModalSelectGenericComponent, 
  type ModalSelectOption 
} from '../../../../shared/components/modal-periodo/modal-select-generic.component';
import { 
  ToggleSegmentedComponent, 
  type ToggleOption 
} from '../../../../shared/components/toggle-segmented/toggle-segmented.component';
import { InputSelectComponent } from '../../../../shared/components/input-select/input-select.component';

// ============================================================================
// INTERFACES
// ============================================================================

interface OpcaoSelect {
  readonly value: string;
  readonly label: string;
}

type TipoPeriodo = 'intervalo' | 'mes';

// ============================================================================
// CONSTANTES
// ============================================================================

const MESES: readonly OpcaoSelect[] = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
] as const;

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente de Seleção de Período - Layout Mobile Itaú
 * 
 * Reproduz fielmente o design do app mobile do Itaú Investimentos
 * 
 * Features:
 * - Design mobile-first idêntico ao app
 * - Toggle Intervalo/Mês
 * - Selects de Mês e Ano
 * - Botão "Aplicar filtro"
 * - Acessibilidade completa
 * - Signals API Angular 19
 */
@Component({
  selector: 'app-periodo-mobile',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    ModalSelectGenericComponent,
    ToggleSegmentedComponent,
    InputSelectComponent
  ],
  templateUrl: './periodo-mobile.component.html',
  styleUrls: ['./periodo-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeriodoMobileComponent implements AfterViewInit {
  // ============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ============================================================================
  
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // ============================================================================
  // VIEW CHILDREN
  // ============================================================================
  
  readonly campoMes = viewChild<ElementRef<HTMLSelectElement>>('campoMes');
  readonly campoAno = viewChild<ElementRef<HTMLSelectElement>>('campoAno');
  readonly modalMes = viewChild<ModalSelectGenericComponent<string>>('modalMes');
  readonly modalAno = viewChild<ModalSelectGenericComponent<string>>('modalAno');

  // ============================================================================
  // CONSTANTES PÚBLICAS
  // ============================================================================
  
  readonly periodos: readonly ToggleOption<TipoPeriodo>[] = [
    { value: 'intervalo', label: 'Intervalo' },
    { value: 'mes', label: 'Mês' }
  ] as const;
  
  readonly meses = MESES;
  readonly anos = this.gerarAnosDisponiveis();

  // ============================================================================
  // FORMULÁRIO
  // ============================================================================
  
  readonly filtroForm: FormGroup = this.fb.group({
    tipoPeriodo: this.fb.control<TipoPeriodo>('mes', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    mes: this.fb.control('', {
      validators: [Validators.required],
      updateOn: 'change'
    }),
    ano: this.fb.control('', {
      validators: [Validators.required],
      updateOn: 'change'
    })
  });

  // ============================================================================
  // SIGNALS
  // ============================================================================
  
  /**
   * Tipo de período selecionado
   */
  readonly tipoPeriodo = toSignal(
    this.filtroForm.get('tipoPeriodo')!.valueChanges.pipe(
      startWith(this.filtroForm.get('tipoPeriodo')!.value),
      distinctUntilChanged(),
      map((value): TipoPeriodo => value ?? 'mes')
    ),
    { initialValue: 'mes' as TipoPeriodo }
  );

  /**
   * Valor do mês selecionado
   */
  readonly mesSelecionado = toSignal(
    this.filtroForm.get('mes')!.valueChanges.pipe(
      startWith(this.filtroForm.get('mes')!.value),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  /**
   * Valor do ano selecionado
   */
  readonly anoSelecionado = toSignal(
    this.filtroForm.get('ano')!.valueChanges.pipe(
      startWith(this.filtroForm.get('ano')!.value),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );


  /**
   * Indica se o formulário está válido
   */
  readonly formularioValido = toSignal(
    this.filtroForm.statusChanges.pipe(
      startWith(this.filtroForm.status),
      map(status => status === 'VALID'),
      distinctUntilChanged()
    ),
    { initialValue: false }
  );

  /**
   * Indica se o botão está habilitado
   */
  readonly botaoHabilitado = computed(() => 
    this.formularioValido() && this.tipoPeriodo() === 'mes'
  );

  /**
   * Estado dos modais
   */
  readonly modalMesAberto = signal(false);
  readonly modalAnoAberto = signal(false);

  /**
   * Nome do mês selecionado (para exibição)
   */
  readonly nomeMesSelecionado = computed(() => {
    const mes = this.mesSelecionado();
    return this.obterNomeMes(mes);
  });

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================
  
  constructor() {
    this.destroyRef.onDestroy(() => {
      console.log('🧹 Componente destruído');
    });

    // Debug: Log mudanças do tipoPeriodo
    effect(() => {
      const tipo = this.tipoPeriodo();
      console.log('🔘 Tipo de período mudou para:', tipo);
    });
  }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  /**
   * Customiza narrações dos modais após view inicializar
   * Exemplo de controle personalizado via JavaScript/Angular
   */
  ngAfterViewInit(): void {
    // Customizar narração do modal de mês
    const modalMes = this.modalMes();
    if (modalMes) {
      // Narração minimalista ao abrir - apenas o título
      modalMes.setCustomOpeningMessage((titulo) => titulo);
      
      // Narração ao selecionar - apenas o nome do mês
      modalMes.setSelectionMessageFormatter((option) => option.label);
    }

    // Customizar narração do modal de ano
    const modalAno = this.modalAno();
    if (modalAno) {
      // Narração ao abrir - apenas o título
      modalAno.setCustomOpeningMessage((titulo) => titulo);
      
      // Narração ao selecionar - apenas o ano
      modalAno.setSelectionMessageFormatter((option) => option.label);
    }
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  // Métodos de navegação do toggle removidos - agora gerenciados pelo app-toggle-segmented

  /**
   * Aplica o filtro
   */
  aplicarFiltro(): void {
    if (!this.filtroForm.valid) {
      this.filtroForm.markAllAsTouched();
      return;
    }

    const { mes, ano } = this.filtroForm.value;
    const nomeMes = this.obterNomeMes(mes);
    
    console.log('🎯 Filtro aplicado:', { mes: nomeMes, ano });
    
    // Aqui você pode emitir um evento ou navegar para a próxima tela
  }

  /**
   * Volta para a tela anterior
   */
  voltar(): void {
    console.log('← Voltando');
    window.history.back();
  }

  /**
   * Abre o modal de seleção de mês
   */
  abrirModalMes(): void {
    console.log('🔵 Abrindo modal de mês');
    this.modalMesAberto.set(true);
    console.log('Modal mês aberto?', this.modalMesAberto());
  }

  /**
   * Abre o modal de seleção de ano
   */
  abrirModalAno(): void {
    this.modalAnoAberto.set(true);
  }

  /**
   * Confirma seleção de mês
   */
  confirmarMes(option: ModalSelectOption): void {
    this.filtroForm.patchValue({ mes: option.value });
    this.modalMesAberto.set(false);
    console.log('✅ Mês selecionado:', option.label);
  }

  /**
   * Confirma seleção de ano
   */
  confirmarAno(option: ModalSelectOption): void {
    this.filtroForm.patchValue({ ano: option.value });
    this.modalAnoAberto.set(false);
    console.log('✅ Ano selecionado:', option.label);
  }

  /**
   * Cancela seleção de mês
   */
  cancelarMes(): void {
    this.modalMesAberto.set(false);
  }

  /**
   * Cancela seleção de ano
   */
  cancelarAno(): void {
    this.modalAnoAberto.set(false);
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  /**
   * Gera lista de anos disponíveis (últimos 12 meses)
   */
  private gerarAnosDisponiveis(): readonly OpcaoSelect[] {
    const anoAtual = new Date().getFullYear();
    const anos: OpcaoSelect[] = [];
    
    // Ano atual e anterior
    for (let i = 0; i <= 1; i++) {
      const ano = anoAtual - i;
      anos.push({
        value: String(ano),
        label: String(ano)
      });
    }
    
    return anos;
  }

  /**
   * Retorna o nome do mês
   */
  private obterNomeMes(valor: string): string {
    if (!valor) return '';
    const mes = this.meses.find(m => m.value === valor);
    return mes?.label ?? '';
  }
}

