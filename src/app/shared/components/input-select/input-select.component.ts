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
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule
} from '@angular/forms';

/**
 * Configuração de estilo do input
 */
export interface InputSelectStyleConfig {
  readonly variant?: 'outline' | 'filled' | 'minimal';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly fullWidth?: boolean;
  readonly readonly?: boolean;
  readonly showIcon?: boolean;
}

/**
 * Input Select Customizável
 * 
 * Componente de input que abre modal/dropdown para seleção.
 * Estilo baseado no design do Itaú.
 * 
 * @example
 * ```html
 * <app-input-select
 *   label="Mês"
 *   placeholder="Selecione"
 *   [value]="mesAtual"
 *   (click)="abrirModal()"
 *   [styleConfig]="{variant: 'outline'}"
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
  // INPUTS
  // ============================================================================

  readonly label = input.required<string>();
  readonly placeholder = input<string>('Selecione');
  readonly value = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly hint = input<string>('');
  readonly styleConfig = input<InputSelectStyleConfig>({});
  readonly ariaLabel = input<string>('');
  readonly id = input<string>('');

  // ============================================================================
  // OUTPUTS
  // ============================================================================

  readonly inputClick = output<void>();
  readonly valueChange = output<string>();

  // ============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ============================================================================

  private readonly destroyRef = inject(DestroyRef);

  // ============================================================================
  // STATE
  // ============================================================================

  readonly internalValue = signal<string>('');
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // ============================================================================
  // COMPUTED
  // ============================================================================

  readonly computedStyleConfig = computed(() => ({
    variant: 'outline' as const,
    size: 'md' as const,
    fullWidth: false,
    readonly: false,
    showIcon: true,
    ...this.styleConfig()
  }));

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

  readonly displayValue = computed(() => {
    return this.internalValue() || this.value();
  });

  readonly hasValue = computed(() => {
    return !!this.displayValue();
  });

  readonly computedAriaLabel = computed(() => {
    return this.ariaLabel() || `${this.label()} - ${this.placeholder()}`;
  });

  readonly computedId = computed(() => {
    return this.id() || `input-select-${Math.random().toString(36).substr(2, 9)}`;
  });

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor() {
    // Effect: Sincronizar valor interno com input value
    effect(() => {
      const value = this.value();
      if (value !== this.internalValue()) {
        this.internalValue.set(value);
      }
    });

    // Effect: Emitir mudanças
    effect(() => {
      const value = this.internalValue();
      this.valueChange.emit(value);
      this.onChange(value);
    });
  }

  // ============================================================================
  // CONTROL VALUE ACCESSOR
  // ============================================================================

  writeValue(value: string): void {
    this.internalValue.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // O estado disabled é controlado pelo input signal
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Handler do clique no input
   */
  onInputClick(): void {
    if (!this.disabled() && !this.computedStyleConfig().readonly) {
      this.onTouched();
      this.inputClick.emit();
    }
  }

  /**
   * Handler do evento de teclado
   */
  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled() || this.computedStyleConfig().readonly) {
      return;
    }

    // Enter ou Space abre o modal/dropdown
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onInputClick();
    }
  }

  /**
   * Handler do evento de foco
   */
  onFocus(): void {
    // Implementação opcional - pode ser usada para estilos ou lógica
  }

  /**
   * Handler do evento de blur
   */
  onBlur(): void {
    this.onTouched();
  }
}

