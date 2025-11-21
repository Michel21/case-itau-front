import { 
  ChangeDetectionStrategy, 
  Component, 
  computed, 
  effect, 
  signal,
  viewChild,
  inject,
  type ElementRef,
  HostListener,
  DestroyRef
} from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators,
  type AbstractControl 
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { LiveAnnouncer } from '@angular/cdk/a11y';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface OpcaoSelect {
  readonly value: string;
  readonly label: string;
}

type TipoPeriodo = 'intervalo' | 'mes';

interface EstadoFiltro {
  readonly tipoPeriodo: TipoPeriodo;
  readonly mes: string;
  readonly ano: string;
  readonly valido: boolean;
}

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

const ANOS_HISTORICO = 6;
const REGEX_ANO = /^\d{4}$/;

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente de filtro de extrato com design do Figma
 * 
 * Features Angular 19:
 * - Signals avançados com `computed()` e `effect()`
 * - `viewChild()` signals
 * - `toSignal()` para conversão de Observables
 * - Control Flow syntax (@if, @for)
 * - ChangeDetection OnPush
 * - Type safety completa
 * - Acessibilidade WCAG AA
 * 
 * @example
 * ```html
 * <app-extrato-filtro-figma />
 * ```
 */
@Component({
  selector: 'app-extrato-filtro-figma',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './extrato-filtro-figma.component.html',
  styleUrls: ['./extrato-filtro-figma.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.filtro-container]': 'true',
    '[attr.data-theme]': 'tema()'
  }
})
export class ExtratoFiltroFigmaComponent {
  // ============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ============================================================================
  
  private readonly fb = inject(FormBuilder);

  // ============================================================================
  // VIEW CHILDREN SIGNALS
  // ============================================================================
  
  readonly campoMes = viewChild<ElementRef<HTMLSelectElement>>('campoMes');
  readonly campoAno = viewChild<ElementRef<HTMLInputElement>>('campoAno');

  // ============================================================================
  // CONSTANTES PÚBLICAS
  // ============================================================================
  
  readonly meses = MESES;
  readonly anos = this.gerarAnosDisponiveis();

  // ============================================================================
  // FORMULÁRIO REATIVO
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
      validators: [Validators.required, Validators.pattern(REGEX_ANO)],
      updateOn: 'change'
    })
  });

  // ============================================================================
  // SIGNALS COMPUTED
  // ============================================================================
  
  /**
   * Tipo de período selecionado (intervalo ou mês)
   * Converte Observable do formulário para Signal
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
   * Indica se o filtro pode ser aplicado
   */
  readonly filtroHabilitado = computed(() => 
    this.formularioValido() && this.tipoPeriodo() === 'mes'
  );

  /**
   * Mensagem de status dinâmica baseada no estado do formulário
   */
  readonly mensagemStatus = computed(() => {
    const tipo = this.tipoPeriodo();
    
    if (tipo === 'intervalo') {
      return 'Seleção por intervalo não implementada nesta demonstração.';
    }

    const valido = this.filtroHabilitado();
    if (valido) {
      const mes = this.obterNomeMes(this.mesSelecionado());
      const ano = this.anoSelecionado();
      return `✅ Período válido: ${mes} de ${ano}. Clique em Aplicar filtro.`;
    }

    return 'Informe mês e ano para habilitar o botão Aplicar filtro.';
  });

  /**
   * Estado completo do filtro
   */
  readonly estadoFiltro = computed((): EstadoFiltro => ({
    tipoPeriodo: this.tipoPeriodo(),
    mes: this.mesSelecionado(),
    ano: this.anoSelecionado(),
    valido: this.filtroHabilitado()
  }));

  /**
   * Tema da interface
   */
  readonly tema = signal<'light' | 'dark'>('light');

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // ============================================================================
  // SERVIÇOS INJETADOS (Angular CDK A11y)
  // ============================================================================
  
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Registrar cleanup automático ao destruir componente
    this.destroyRef.onDestroy(() => {
      // LiveAnnouncer é automaticamente limpo
      if (!this.isProduction()) {
        console.log('🧹 Componente destruído - cleanup executado');
      }
    });

    // Effect: Log mudanças de estado do filtro (apenas em dev)
    effect(() => {
      if (!this.isProduction()) {
        console.log('📊 Estado do filtro:', this.estadoFiltro());
      }
    });

    // Effect: Resetar campos quando mudar tipo de período
    effect(() => {
      const tipo = this.tipoPeriodo();
      
      if (tipo === 'intervalo') {
        this.filtroForm.patchValue({ mes: '', ano: '' }, { emitEvent: false });
        // Não anunciar aqui - aria-label já narra automaticamente
      }
      // else: Não precisa anunciar 'Mês selecionado' - aria-label cuida disso
    });

    // Effect: Focar no primeiro campo quando mês for selecionado
    effect(() => {
      const tipo = this.tipoPeriodo();
      const mes = this.mesSelecionado();
      
      if (tipo === 'mes' && mes && !this.anoSelecionado()) {
        const campoAnoEl = this.campoAno();
        if (campoAnoEl) {
          // Usar queueMicrotask para garantir que o DOM está atualizado
          queueMicrotask(() => this.focarElemento(campoAnoEl.nativeElement));
        }
      }
    });

    // Effect: Anunciar quando estado do botão muda
    effect(() => {
      const valido = this.filtroHabilitado();
      const mes = this.mesSelecionado();
      const ano = this.anoSelecionado();
      
      queueMicrotask(() => {
        if (valido && mes && ano) {
          // Botão habilitado
          const nomeMes = this.obterNomeMes(mes);
          this.anunciarComLiveAnnouncer(
            `Formulário válido. Período selecionado: ${nomeMes} de ${ano}. Botão aplicar filtro habilitado`,
            'polite'
          );
        } else if (mes || ano) {
          // Formulário parcialmente preenchido
          this.anunciarComLiveAnnouncer(
            'Botão aplicar filtro desabilitado. Preencha todos os campos obrigatórios',
            'polite'
          );
        }
      });
    });
  }

  // ============================================================================
  // LISTENERS DE TECLADO (Acessibilidade)
  // ============================================================================

  /**
   * Suporte para ESC - Limpar formulário
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.filtroForm.dirty) {
      event.preventDefault();
      this.limparFormulario();
      this.anunciarComLiveAnnouncer('Formulário limpo', 'polite');
    }
  }

  /**
   * Suporte para Ctrl/Cmd + Enter - Submeter formulário
   */
  @HostListener('document:keydown.control.enter', ['$event'])
  @HostListener('document:keydown.meta.enter', ['$event'])
  onCtrlEnter(event: KeyboardEvent): void {
    if (this.filtroHabilitado()) {
      event.preventDefault();
      this.aplicarFiltro();
    }
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Seleciona o tipo de período (intervalo ou mês)
   * @param tipo - Tipo de período a ser selecionado
   */
  selecionarPeriodo(tipo: TipoPeriodo): void {
    this.filtroForm.patchValue({ tipoPeriodo: tipo });
  }

  /**
   * Aplica o filtro selecionado
   * Emite evento e mostra mensagem de sucesso
   */
  aplicarFiltro(): void {
    if (!this.filtroForm.valid) {
      this.filtroForm.markAllAsTouched();
      this.anunciarParaLeitoresDeTelaViaAria('Formulário inválido. Preencha todos os campos obrigatórios.');
      return;
    }

    const estado = this.estadoFiltro();
    const mes = this.obterNomeMes(estado.mes);
    
    // Anunciar sucesso para leitores de tela
    this.anunciarParaLeitoresDeTelaViaAria(`Filtro aplicado com sucesso para ${mes} de ${estado.ano}`);
    
    // Log para desenvolvimento
    if (!this.isProduction()) {
      console.log('🎯 Filtro aplicado:', estado);
    }
  }

  /**
   * Retorna a mensagem de erro para um campo específico
   * @param controlName - Nome do campo
   * @returns Mensagem de erro ou null
   */
  getMensagemErro(controlName: 'mes' | 'ano'): string | null {
    const control = this.filtroForm.get(controlName);

    if (!control || !control.touched || !control.errors) {
      return null;
    }

    const errors = control.errors;

    if (errors['required']) {
      return controlName === 'mes'
        ? 'Selecione um mês válido.'
        : 'Informe um ano com quatro dígitos.';
    }

    if (errors['pattern']) {
      return 'Informe um ano no formato correto (4 dígitos).';
    }

    return 'Campo inválido.';
  }

  /**
   * Alterna o tema da interface
   */
  toggleTema(): void {
    this.tema.update(atual => atual === 'light' ? 'dark' : 'light');
  }

  /**
   * Limpa o formulário (atalho ESC)
   */
  limparFormulario(): void {
    this.filtroForm.reset({
      tipoPeriodo: 'mes',
      mes: '',
      ano: ''
    });
    
    // Focar no primeiro campo
    const campoMes = this.campoMes();
    if (campoMes) {
      queueMicrotask(() => this.focarElemento(campoMes.nativeElement));
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS (Acessibilidade com Angular CDK)
  // ============================================================================

  /**
   * Anuncia mensagem usando Angular CDK LiveAnnouncer
   * Preferível ao método manual, pois gerencia melhor o timing e cleanup
   * 
   * @param mensagem - Mensagem para anunciar
   * @param politeness - Nível de prioridade ('polite' | 'assertive')
   */
  private anunciarComLiveAnnouncer(
    mensagem: string, 
    politeness: 'polite' | 'assertive' = 'polite'
  ): void {
    // LiveAnnouncer do Angular CDK é mais confiável que aria-live manual
    this.liveAnnouncer.announce(mensagem, politeness);
    
    if (!this.isProduction()) {
      console.log(`📣 [${politeness.toUpperCase()}] ${mensagem}`);
    }
  }

  /**
   * Foca um elemento de forma segura
   * @param elemento - Elemento HTML para focar
   */
  private focarElemento(elemento: HTMLElement): void {
    try {
      elemento.focus({ preventScroll: false });
      
      if (!this.isProduction()) {
        console.log('🎯 Foco movido para:', elemento.id || elemento.tagName);
      }
    } catch (error) {
      console.error('❌ Erro ao focar elemento:', error);
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS (Existentes)
  // ============================================================================

  /**
   * Gera lista de anos disponíveis para seleção
   * @returns Array de opções de anos
   */
  private gerarAnosDisponiveis(): readonly OpcaoSelect[] {
    const anoAtual = new Date().getFullYear();
    
    return Array.from({ length: ANOS_HISTORICO }, (_, index) => {
      const ano = anoAtual - index;
      return { 
        value: String(ano), 
        label: String(ano) 
      } as const;
    });
  }

  /**
   * Retorna o nome do mês baseado no valor
   * @param valor - Valor numérico do mês (01-12)
   * @returns Nome do mês ou fallback
   */
  private obterNomeMes(valor: string): string {
    if (!valor) return 'mês selecionado';
    
    const mesSelecionado = this.meses.find(mes => mes.value === valor);
    return mesSelecionado?.label ?? 'mês selecionado';
  }

  /**
   * Verifica se está em ambiente de produção
   * @returns true se estiver em produção
   */
  private isProduction(): boolean {
    return false; // Pode ser configurado via environment
  }

  /**
   * Anuncia mensagem para leitores de tela via aria-live
   * @param mensagem - Mensagem a ser anunciada
   */
  private anunciarParaLeitoresDeTelaViaAria(mensagem: string): void {
    const liveRegion = document.getElementById('status-message');
    if (liveRegion) {
      liveRegion.textContent = mensagem;
    }
  }
}
