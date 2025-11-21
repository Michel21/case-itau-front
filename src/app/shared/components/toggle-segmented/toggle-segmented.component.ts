import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
  DestroyRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule
} from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';

/**
 * Interface para opções do toggle
 */
export interface ToggleOption<T = string> {
  readonly value: T;
  readonly label: string;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
}

/**
 * Configuração de estilo do toggle
 */
export interface ToggleStyleConfig {
  readonly variant?: 'outline' | 'filled' | 'solid' | 'pills' | 'underline' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly color?: 'primary' | 'secondary' | 'success' | 'danger' | 'neutral';
  readonly fullWidth?: boolean;
  readonly rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  readonly spacing?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Toggle Segmentado Acessível
 * 
 * Componente genérico para seleção entre múltiplas opções.
 * Suporta navegação por teclado, leitores de tela e ControlValueAccessor.
 * 
 * @example
 * ```html
 * <app-toggle-segmented
 *   [options]="opcoes"
 *   [(ngModel)]="valorSelecionado"
 *   [styleConfig]="{variant: 'outline', size: 'md'}"
 *   ariaLabel="Selecione o tipo"
 * />
 * ```
 */
@Component({
  selector: 'app-toggle-segmented',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toggle-segmented.component.html',
  styleUrls: ['./toggle-segmented.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleSegmentedComponent),
      multi: true
    }
  ],
  host: {
    '[class.toggle-segmented-host]': 'true',
    '[class.toggle-segmented-host--disabled]': 'disabled()'
  }
})
export class ToggleSegmentedComponent<T = string> implements ControlValueAccessor {
  // Inputs
  readonly options = input.required<readonly ToggleOption<T>[]>();
  readonly ariaLabel = input<string>('Selecione uma opção');
  readonly disabled = input<boolean>(false);
  readonly styleConfig = input<ToggleStyleConfig>({});
  readonly announceDelay = input<number>(600); // Delay para narração (ms)
  readonly announceState = input<boolean>(true); // Se deve anunciar estado

  // Outputs
  readonly valueChange = output<T>();

  // Estado interno
  readonly internalValue = signal<T | null>(null);
  readonly anuncioA11y = signal<string>('');
  readonly radioGroupName = `toggle-segmented-${Math.random().toString(36).substr(2, 9)}`;

  // Injeções
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly destroyRef = inject(DestroyRef);

  // ControlValueAccessor
  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  // Computed
  readonly computedStyleConfig = computed(() => ({
    variant: 'outline' as const,
    size: 'md' as const,
    color: 'primary' as const,
    fullWidth: false,
    rounded: undefined,
    spacing: undefined,
    ...this.styleConfig()
  }));

  readonly hostClasses = computed(() => {
    const config = this.computedStyleConfig();
    const classes: Record<string, boolean> = {
      [`toggle-segmented--variant-${config.variant}`]: true,
      [`toggle-segmented--size-${config.size}`]: true,
      [`toggle-segmented--color-${config.color}`]: true,
      'toggle-segmented--full-width': config.fullWidth
    };

    // Adicionar classes opcionais
    if (config.rounded) {
      classes[`toggle-segmented--rounded-${config.rounded}`] = true;
    }

    if (config.spacing) {
      classes[`toggle-segmented--spacing-${config.spacing}`] = true;
    }

    return classes;
  });

  constructor() {
    // Effect: Emitir mudanças
    effect(() => {
      const value = this.internalValue();
      if (value !== null) {
        this.valueChange.emit(value);
      }
    });
  }

  /**
   * ControlValueAccessor: Escrever valor
   */
  writeValue(value: T | null): void {
    this.internalValue.set(value);
  }

  /**
   * ControlValueAccessor: Registrar callback de mudança
   */
  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  /**
   * ControlValueAccessor: Registrar callback de toque
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * ControlValueAccessor: Definir estado desabilitado
   */
  setDisabledState(isDisabled: boolean): void {
    // Implementado via input signal
  }

  /**
   * Verifica se opção está selecionada
   */
  isSelected(option: ToggleOption<T>): boolean {
    return this.internalValue() === option.value;
  }

  /**
   * Obtém tabindex para opção
   */
  getTabIndex(option: ToggleOption<T>): number {
    if (this.disabled() || option.disabled) return -1;
    return this.isSelected(option) ? 0 : -1;
  }

  /**
   * Obtém ID único para opção
   */
  getOptionId(option: ToggleOption<T>, index: number): string {
    return `toggle-option-${index}`;
  }

  /**
   * Seleciona uma opção
   */
  selectOption(option: ToggleOption<T>): void {
    if (this.disabled() || option.disabled) return;

    this.internalValue.set(option.value);
    this.onChange(option.value);
    this.onTouched();
  }

  /**
   * Handler de teclado para navegação
   */
  onKeyDown(event: KeyboardEvent, currentOption: ToggleOption<T>, currentIndex: number): void {
    if (this.disabled()) return;

    // Arrow keys - navega sem marcar
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();

      const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
      let nextIndex = currentIndex + direction;

      // Wrap around
      if (nextIndex < 0) nextIndex = this.options().length - 1;
      if (nextIndex >= this.options().length) nextIndex = 0;

      // Pular opções desabilitadas
      while (this.options()[nextIndex]?.disabled && nextIndex !== currentIndex) {
        nextIndex += direction;
        if (nextIndex < 0) nextIndex = this.options().length - 1;
        if (nextIndex >= this.options().length) nextIndex = 0;
      }

      const nextOption = this.options()[nextIndex];
      if (nextOption && !nextOption.disabled) {
        const nextId = this.getOptionId(nextOption, nextIndex);
        const nextInput = document.getElementById(nextId) as HTMLInputElement;

        if (nextInput) {
          nextInput.focus();

          // Anunciar estado se habilitado
          if (this.announceState()) {
            this.announceOptionState(nextOption);
          }
        }
      }
      return;
    }

    // Space/Enter - marca
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.selectOption(currentOption);
      return;
    }

    // Home - primeira opção
    if (event.key === 'Home') {
      event.preventDefault();
      const firstEnabled = this.options().find(opt => !opt.disabled);
      if (firstEnabled) {
        const firstIndex = this.options().indexOf(firstEnabled);
        const firstId = this.getOptionId(firstEnabled, firstIndex);
        document.getElementById(firstId)?.focus();
      }
      return;
    }

    // End - última opção
    if (event.key === 'End') {
      event.preventDefault();
      const reversed = [...this.options()].reverse();
      const lastEnabled = reversed.find(opt => !opt.disabled);
      if (lastEnabled) {
        const lastIndex = this.options().indexOf(lastEnabled);
        const lastId = this.getOptionId(lastEnabled, lastIndex);
        document.getElementById(lastId)?.focus();
      }
      return;
    }

    // Tab - navega normalmente (não preventDefault)
  }

  /**
   * Anuncia estado da opção para leitores de tela
   */
  private announceOptionState(option: ToggleOption<T>): void {
    setTimeout(() => {
      const selecionado = this.isSelected(option);
      const estado = selecionado ? 'selecionado' : 'não selecionado';

      // Limpar aria-live primeiro
      this.anuncioA11y.set('');

      // Aguardar leitor terminar narração nativa
      setTimeout(() => {
        this.anuncioA11y.set(estado);
      }, this.announceDelay());

    }, 100);
  }

  /**
   * Obtém classes CSS para opção
   */
  getOptionClasses(option: ToggleOption<T>, index: number): Record<string, boolean> {
    return {
      'toggle-segmented__option': true,
      'toggle-segmented__option--selected': this.isSelected(option),
      'toggle-segmented__option--disabled': option.disabled || false,
      'toggle-segmented__option--first': index === 0,
      'toggle-segmented__option--last': index === this.options().length - 1
    };
  }

  /**
   * Obtém aria-label para opção
   */
  getOptionAriaLabel(option: ToggleOption<T>): string {
    return option.ariaLabel || option.label;
  }
}

