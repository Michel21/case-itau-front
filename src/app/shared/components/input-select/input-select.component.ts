import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  DestroyRef,
  forwardRef,
  viewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule
} from '@angular/forms';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Configuração de estilo do input
 */
export interface InputSelectStyleConfig {
  /** Variante visual do input */
  readonly variant?: 'outline' | 'filled' | 'minimal';
  /** Tamanho do input */
  readonly size?: 'sm' | 'md' | 'lg';
  /** Se deve ocupar largura total do container */
  readonly fullWidth?: boolean;
  /** Se é apenas leitura (não editável) */
  readonly readonly?: boolean;
  /** Se deve exibir ícone de dropdown */
  readonly showIcon?: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Input Select Customizável e Acessível
 * 
 * Componente de input que funciona como botão para abrir modals/dropdowns.
 * Implementa ControlValueAccessor para integração com Angular Forms.
 * Estilo baseado no design system do Itaú.
 * 
 * **Características:**
 * - ✅ Acessível (ARIA, teclado, leitores de tela)
 * - ✅ Integração com ngModel e Reactive Forms
 * - ✅ Estados: disabled, error, required
 * - ✅ Label flutuante quando tem valor
 * - ✅ Customização completa de estilos
 * - ✅ Suporte a hint e error messages
 * 
 * @example Uso básico
 * ```html
 * <app-input-select
 *   label="Mês"
 *   placeholder="Selecione um mês"
 *   [value]="mesAtual"
 *   (inputClick)="abrirModalMes()"
 * />
 * ```
 * 
 * @example Com ngModel
 * ```html
 * <app-input-select
 *   label="Ano"
 *   placeholder="Selecione"
 *   [(ngModel)]="anoSelecionado"
 *   [required]="true"
 *   (inputClick)="abrirModal()"
 * />
 * ```
 * 
 * @example Com customização
 * ```html
 * <app-input-select
 *   label="Categoria"
 *   [value]="categoria"
 *   [styleConfig]="{variant: 'filled', size: 'lg', fullWidth: true}"
 *   [error]="erroCategoria"
 *   hint="Escolha uma categoria disponível"
 *   (inputClick)="abrirSelecao()"
 * />
 * ```
 */
@Component({
  selector: 'app-input-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true
    }
  ]
})
export class InputSelectComponent implements ControlValueAccessor {
  // ============================================================================
  // INPUTS - Configuração do Componente
  // ============================================================================

  /** Label exibida acima/dentro do input */
  readonly label = input.required<string>();
  
  /** Texto placeholder quando vazio */
  readonly placeholder = input<string>('Selecione');
  
  /** Valor atual do input */
  readonly value = input<string>('');
  
  /** Se o input está desabilitado */
  readonly disabled = input<boolean>(false);
  
  /** Se o input é obrigatório */
  readonly required = input<boolean>(false);
  
  /** Mensagem de erro (exibida em vermelho) */
  readonly error = input<string>('');
  
  /** Texto de ajuda (exibido abaixo do input) */
  readonly hint = input<string>('');
  
  /** Configurações de estilo */
  readonly styleConfig = input<InputSelectStyleConfig>({});
  
  /** ARIA label customizado */
  readonly ariaLabel = input<string>('');
  
  /** ID customizado para o input */
  readonly id = input<string>('');

  // ============================================================================
  // OUTPUTS - Eventos Emitidos
  // ============================================================================

  /** Emitido quando o input é clicado */
  readonly inputClick = output<void>();
  
  /** Emitido quando o valor muda */
  readonly valueChange = output<string>();

  // ============================================================================
  // DEPENDÊNCIAS INJETADAS
  // ============================================================================

  /** Referência para cleanup automático */
  private readonly destroyRef = inject(DestroyRef);
  
  /** Referência para o botão interno (usado para foco programático) */
  readonly buttonRef = viewChild<ElementRef<HTMLButtonElement>>('buttonRef');

  // ============================================================================
  // ESTADO INTERNO
  // ============================================================================

  /** Valor interno do input (signal reativo) */
  readonly internalValue = signal<string>('');
  
  /** Callback onChange do ControlValueAccessor */
  private onChange: (value: string) => void = () => {};
  
  /** Callback onTouched do ControlValueAccessor */
  private onTouched: () => void = () => {};

  // ============================================================================
  // COMPUTED - Valores Derivados
  // ============================================================================

  /**
   * Configuração de estilo computada (com valores padrão)
   */
  readonly computedStyleConfig = computed(() => ({
    variant: 'outline' as const,
    size: 'md' as const,
    fullWidth: false,
    readonly: false,
    showIcon: true,
    ...this.styleConfig()
  }));

  /**
   * Classes CSS do host baseadas no estado atual
   */
  readonly hostClasses = computed(() => {
    const config = this.computedStyleConfig();
    return {
      [`input-select--variant-${config.variant}`]: true,
      [`input-select--size-${config.size}`]: true,
      'input-select--full-width': config.fullWidth,
      'input-select--disabled': this.disabled(),
      'input-select--error': !!this.error(),
      'input-select--has-value': !!this.displayValue()
    };
  });

  /**
   * Valor para exibição (interno ou do input)
   */
  readonly displayValue = computed(() => {
    return this.internalValue() || this.value();
  });

  /**
   * Se o input tem algum valor
   */
  readonly hasValue = computed(() => {
    return !!this.displayValue();
  });

  /**
   * ARIA label computado (customizado ou gerado)
   */
  readonly computedAriaLabel = computed(() => {
    return this.ariaLabel() || `${this.label()} - ${this.placeholder()}`;
  });

  /**
   * ID computado (customizado ou gerado aleatoriamente)
   */
  readonly computedId = computed(() => {
    return this.id() || `input-select-${Math.random().toString(36).substr(2, 9)}`;
  });

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor() {
    // Sincronizar valor interno com input value
    effect(() => {
      const value = this.value();
      if (value !== this.internalValue()) {
        this.internalValue.set(value);
      }
    });

    // Emitir mudanças de valor
    effect(() => {
      const value = this.internalValue();
      this.valueChange.emit(value);
      this.onChange(value);
    });
  }

  // ============================================================================
  // CONTROL VALUE ACCESSOR - Integração com Angular Forms
  // ============================================================================

  /**
   * Escreve um novo valor no componente
   * Chamado pelo Angular Forms quando o valor externo muda
   */
  writeValue(value: string): void {
    this.internalValue.set(value || '');
  }

  /**
   * Registra callback para notificar mudanças de valor
   * Chamado pelo Angular Forms durante inicialização
   */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Registra callback para notificar quando componente foi tocado
   * Chamado pelo Angular Forms durante inicialização
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Define estado desabilitado do componente
   * Chamado pelo Angular Forms quando disabled muda
   */
  setDisabledState(isDisabled: boolean): void {
    // Estado disabled é controlado pelo input signal
    // Não é necessário fazer nada aqui
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS - Handlers de Eventos
  // ============================================================================

  /**
   * Handler do clique no input
   * Emite evento inputClick se não estiver desabilitado ou readonly
   */
  onInputClick(): void {
    if (!this.disabled() && !this.computedStyleConfig().readonly) {
      this.onTouched();
      this.inputClick.emit();
    }
  }

  /**
   * Handler do evento de teclado
   * Enter ou Space abre o modal/dropdown
   */
  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled() || this.computedStyleConfig().readonly) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onInputClick();
    }
  }

  /**
   * Handler do evento de foco
   * Pode ser usado para adicionar estilos ou lógica customizada
   */
  onFocus(): void {
    // Reservado para futuras implementações
  }

  /**
   * Handler do evento de blur
   * Notifica o Angular Forms que o componente foi tocado
   */
  onBlur(): void {
    this.onTouched();
  }

  /**
   * Foca programaticamente no botão do input
   * Útil para gerenciamento de foco após fechamento de modais
   * 
   * @example
   * ```typescript
   * // No componente pai
   * readonly campoMes = viewChild<InputSelectComponent>('campoMes');
   * 
   * aoFecharModal() {
   *   this.campoMes()?.focus();
   * }
   * ```
   */
  focus(): void {
    this.buttonRef()?.nativeElement.focus();
  }
}
