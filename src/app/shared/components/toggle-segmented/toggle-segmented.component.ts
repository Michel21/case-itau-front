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
import { ScrollIntoViewDirective } from '../../directives/scroll-into-view.directive';

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
  imports: [CommonModule, FormsModule, ScrollIntoViewDirective],
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
  readonly styleConfig = input<ToggleStyleConfig>({})

  // Outputs
  readonly valueChange = output<T>();

  // Estado interno
  readonly internalValue = signal<T | null>(null);
  readonly anuncioSelecao = signal<string>('');
  readonly radioGroupName = `toggle-segmented-${Math.random().toString(36).substr(2, 9)}`;

  // Injeções
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

    // Effect: Sincronizar cliques e foco nos elementos visuais e acessíveis
    effect(() => {
      const opts = this.options();
      
      // Aguardar DOM estar completamente pronto
      setTimeout(() => {
        requestAnimationFrame(() => {
        opts.forEach((option, idx) => {
          // Sincronizar cliques visuais
          const visualElement = document.getElementById(`visual-${this.getOptionId(option, idx)}`);
          if (visualElement) {
            // Remover listener anterior se existir
            const oldClickListener = (visualElement as any)._clickListener;
            if (oldClickListener) {
              visualElement.removeEventListener('click', oldClickListener);
            }
            
            // Adicionar novo listener de click
            const newClickListener = () => this.selectOption(option);
            visualElement.addEventListener('click', newClickListener);
            (visualElement as any)._clickListener = newClickListener;
          }

          // Sincronizar dimensões e foco dos elementos acessíveis com visual
          const a11yElement = document.getElementById(this.getOptionId(option, idx)) as HTMLElement;
          if (a11yElement && visualElement) {
            // Sincronizar dimensões do botão acessível com o elemento visual
            const rect = visualElement.getBoundingClientRect();
            const parentRect = visualElement.parentElement?.getBoundingClientRect();
            
            if (parentRect) {
              a11yElement.style.left = `${rect.left - parentRect.left}px`;
              a11yElement.style.width = `${rect.width}px`;
              a11yElement.style.height = `${rect.height}px`;
            }
            
            // Remover listeners anteriores se existirem
            const oldFocusListener = (a11yElement as any)._focusListener;
            const oldBlurListener = (a11yElement as any)._blurListener;
            
            if (oldFocusListener) {
              a11yElement.removeEventListener('focus', oldFocusListener);
            }
            if (oldBlurListener) {
              a11yElement.removeEventListener('blur', oldBlurListener);
            }
            
            // Adicionar novos listeners
            const newFocusListener = () => this.updateVisualFocus(idx);
            const newBlurListener = () => this.clearVisualFocus();
            
            a11yElement.addEventListener('focus', newFocusListener);
            a11yElement.addEventListener('blur', newBlurListener);
            
            (a11yElement as any)._focusListener = newFocusListener;
            (a11yElement as any)._blurListener = newBlurListener;
          }
        });
        });
      }, 0);
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
   * Obtém tabindex para opção (roving tabindex pattern)
   */
  getTabIndex(option: ToggleOption<T>): number {
    if (this.disabled() || option.disabled) return -1;
    
    // Se há uma opção selecionada, apenas ela tem tabindex=0
    if (this.internalValue() !== null) {
      return this.isSelected(option) ? 0 : -1;
    }
    
    // Se nenhuma opção está selecionada, a primeira opção habilitada tem tabindex=0
    const firstEnabledOption = this.options().find(opt => !opt.disabled);
    return option === firstEnabledOption ? 0 : -1;
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

    const previousValue = this.internalValue();
    this.internalValue.set(option.value);
    this.onChange(option.value);
    this.onTouched();

    // Anunciar seleção
    const index = this.options().indexOf(option);
    if (index !== -1) {
      this.announceSelection(option, index);
    }
  }

  /**
   * Anuncia seleção de um item
   * Força narração usando blur/focus e aria-live
   */
  private announceSelection(option: ToggleOption<T>, index: number): void {
    const currentFocusedElement = document.activeElement as HTMLElement;
    const a11yElement = document.getElementById(this.getOptionId(option, index));

    // Verificar se o foco está em um elemento acessível (não no visual)
    const isA11yFocused = currentFocusedElement?.classList.contains('sr-only-option');

    if (isA11yFocused && currentFocusedElement) {
      // Fazer blur temporário para forçar narração
      currentFocusedElement.blur();
    }

    // Limpar aria-live primeiro para forçar nova narração
    this.anuncioSelecao.set('');

    // Preparar mensagem de narração
    const announcement = this.getCustomAnnouncement(option, index);

    setTimeout(() => {
      // Anunciar via aria-live
      this.anuncioSelecao.set(announcement);

      // Restaurar foco após narração
      setTimeout(() => {
        if (a11yElement) {
          a11yElement.focus();
          this.updateVisualFocus(index);
        }
      }, 100);
    }, 50);
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
        const nextElement = document.getElementById(nextId);

        if (nextElement) {
          nextElement.focus();
          this.updateVisualFocus(nextIndex);
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
        const firstElement = document.getElementById(firstId);
        if (firstElement) {
          firstElement.focus();
          this.updateVisualFocus(firstIndex);
        }
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
        const lastElement = document.getElementById(lastId);
        if (lastElement) {
          lastElement.focus();
          this.updateVisualFocus(lastIndex);
        }
      }
      return;
    }

    // Tab - navega normalmente (não preventDefault)
  }

  /**
   * Atualiza o foco visual para sincronizar com elemento acessível
   */
  private updateVisualFocus(index: number): void {
    const option = this.options()[index];
    if (!option) return;

    const visualId = `visual-${this.getOptionId(option, index)}`;
    const visualElement = document.getElementById(visualId);
    
    if (visualElement) {
      // Remover outline de todos os elementos visuais
      this.clearVisualFocus();

      // Adicionar outline no elemento focado
      visualElement.style.outline = '2px solid #0046c0';
      visualElement.style.outlineOffset = '2px';
      visualElement.style.zIndex = '10';
    }
  }

  /**
   * Remove o foco visual de todos os elementos
   */
  private clearVisualFocus(): void {
    document.querySelectorAll('.toggle-segmented__option').forEach(el => {
      (el as HTMLElement).style.outline = '';
      (el as HTMLElement).style.outlineOffset = '';
      (el as HTMLElement).style.zIndex = '';
    });
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

  /**
   * Gera mensagem de narração customizada para um item
   * Segue o mesmo padrão do modal-select-generic.component.ts
   */
  getCustomAnnouncement(option: ToggleOption<T>, index: number): string {
    const position = index + 1;
    const total = this.options().length;
    const status = this.isSelected(option) ? 'selecionado' : 'não selecionado';
    
    // Formato personalizado: "x de x, selecionado" ou "x de x, não selecionado"
    return `${position} de ${total}, ${status} ${option.label}`;
   
  }
}

