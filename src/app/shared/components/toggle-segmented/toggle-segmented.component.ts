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

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Opção do toggle segmentado
 * 
 * @template T - Tipo do valor (padrão: string)
 */
export interface ToggleOption<T = string> {
  /** Valor único que identifica a opção */
  readonly value: T;
  /** Texto exibido para o usuário */
  readonly label: string;
  /** ARIA label customizado (opcional) */
  readonly ariaLabel?: string;
  /** Se a opção está desabilitada */
  readonly disabled?: boolean;
}

/**
 * Configuração de estilo do toggle
 */
export interface ToggleStyleConfig {
  /** Variante visual do toggle */
  readonly variant?: 'outline' | 'filled' | 'solid' | 'pills' | 'underline' | 'ghost';
  /** Tamanho do toggle */
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Esquema de cor */
  readonly color?: 'primary' | 'secondary' | 'success' | 'danger' | 'neutral';
  /** Se deve ocupar largura total */
  readonly fullWidth?: boolean;
  /** Arredondamento das bordas */
  readonly rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Espaçamento entre opções */
  readonly spacing?: 'none' | 'sm' | 'md' | 'lg';
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Toggle Segmentado Acessível e Customizável
 * 
 * Componente profissional para seleção entre múltiplas opções em formato de toggle/pills.
 * Implementa padrões de acessibilidade WCAG 2.1 AA e integração com Angular Forms.
 * 
 * **Características:**
 * - ✅ Navegação por teclado (setas, Home, End, Tab)
 * - ✅ Roving tabindex pattern (apenas uma opção focável por vez)
 * - ✅ Anúncios para leitores de tela
 * - ✅ ControlValueAccessor (ngModel, Reactive Forms)
 * - ✅ Estados: disabled, selected
 * - ✅ Altamente customizável (6 variantes, 4 tamanhos, 5 cores)
 * - ✅ Sincronização visual-acessível perfeita
 * - ✅ Tipagem genérica TypeScript
 * 
 * @template T - Tipo do valor das opções (padrão: string)
 * 
 * @example Uso básico
 * ```html
 * <app-toggle-segmented
 *   [options]="opcoes"
 *   [(ngModel)]="valorSelecionado"
 * />
 * ```
 * 
 * @example Com customização
 * ```html
 * <app-toggle-segmented
 *   [options]="tipos"
 *   [(ngModel)]="tipoSelecionado"
 *   [styleConfig]="{
 *     variant: 'pills',
 *     size: 'lg',
 *     color: 'primary',
 *     fullWidth: true
 *   }"
 *   ariaLabel="Selecione o tipo de investimento"
 *   [disabled]="false"
 * />
 * ```
 * 
 * @example Com opções tipadas
 * ```typescript
 * interface Produto {
 *   id: number;
 *   nome: string;
 * }
 * 
 * opcoes: ToggleOption<number>[] = [
 *   { value: 1, label: 'Opção 1' },
 *   { value: 2, label: 'Opção 2', disabled: true },
 *   { value: 3, label: 'Opção 3', ariaLabel: 'Terceira opção especial' }
 * ];
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
  // ============================================================================
  // INPUTS - Configuração do Componente
  // ============================================================================

  /** Lista de opções disponíveis */
  readonly options = input.required<readonly ToggleOption<T>[]>();
  
  /** ARIA label para o grupo de opções */
  readonly ariaLabel = input<string>('Selecione uma opção');
  
  /** Se o toggle está desabilitado */
  readonly disabled = input<boolean>(false);
  
  /** Configurações de estilo */
  readonly styleConfig = input<ToggleStyleConfig>({});

  // ============================================================================
  // OUTPUTS - Eventos Emitidos
  // ============================================================================

  /** Emitido quando o valor selecionado muda */
  readonly valueChange = output<T>();

  // ============================================================================
  // ESTADO INTERNO
  // ============================================================================

  /** Valor interno selecionado (signal reativo) */
  readonly internalValue = signal<T | null>(null);
  
  /** Mensagem de anúncio para leitores de tela */
  readonly anuncioSelecao = signal<string>('');
  
  /** Nome único do radio group */
  readonly radioGroupName = `toggle-segmented-${Math.random().toString(36).substr(2, 9)}`;

  // ============================================================================
  // DEPENDÊNCIAS INJETADAS
  // ============================================================================

  /** Referência para cleanup automático */
  private readonly destroyRef = inject(DestroyRef);

  // ============================================================================
  // CONTROL VALUE ACCESSOR - Callbacks
  // ============================================================================

  /** Callback onChange do ControlValueAccessor */
  private onChange: (value: T | null) => void = () => {};
  
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
    color: 'primary' as const,
    fullWidth: false,
    rounded: undefined,
    spacing: undefined,
    ...this.styleConfig()
  }));

  /**
   * Classes CSS do host baseadas na configuração
   */
  readonly hostClasses = computed(() => {
    const config = this.computedStyleConfig();
    const classes: Record<string, boolean> = {
      [`toggle-segmented--variant-${config.variant}`]: true,
      [`toggle-segmented--size-${config.size}`]: true,
      [`toggle-segmented--color-${config.color}`]: true,
      'toggle-segmented--full-width': config.fullWidth
    };

    if (config.rounded) {
      classes[`toggle-segmented--rounded-${config.rounded}`] = true;
    }

    if (config.spacing) {
      classes[`toggle-segmented--spacing-${config.spacing}`] = true;
    }

    return classes;
  });

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor() {
    // Emitir mudanças de valor
    effect(() => {
      const value = this.internalValue();
      if (value !== null) {
        this.valueChange.emit(value);
      }
    });

    // Sincronizar elementos visuais e acessíveis
    effect(() => {
      const opts = this.options();
      
      setTimeout(() => {
        requestAnimationFrame(() => {
        opts.forEach((option, idx) => {
            this.syncA11yWithVisual(option, idx);
          });
        });
      }, 0);
    });
  }

  // ============================================================================
  // CONTROL VALUE ACCESSOR - Integração com Angular Forms
  // ============================================================================

  /**
   * Escreve um novo valor no componente
   * Chamado pelo Angular Forms quando o valor externo muda
   */
  writeValue(value: T | null): void {
    this.internalValue.set(value);
  }

  /**
   * Registra callback para notificar mudanças de valor
   * Chamado pelo Angular Forms durante inicialização
   */
  registerOnChange(fn: (value: T | null) => void): void {
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
          }

  // ============================================================================
  // MÉTODOS PRIVADOS - Setup e Sincronização
  // ============================================================================

  /**
   * Sincroniza dimensões e eventos do elemento acessível com o visual
   * Garante que navegação por teclado reflita visualmente
   */
  private syncA11yWithVisual(option: ToggleOption<T>, idx: number): void {
          const a11yElement = document.getElementById(this.getOptionId(option, idx)) as HTMLElement;
    const visualElement = document.getElementById(`visual-${this.getOptionId(option, idx)}`);
    
          if (a11yElement && visualElement) {
      // Sincronizar dimensões
            const rect = visualElement.getBoundingClientRect();
            const parentRect = visualElement.parentElement?.getBoundingClientRect();
            
            if (parentRect) {
              a11yElement.style.left = `${rect.left - parentRect.left}px`;
              a11yElement.style.width = `${rect.width}px`;
              a11yElement.style.height = `${rect.height}px`;
            }
            
      // Remover listeners anteriores
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
  }

  /**
   * Atualiza o foco visual para sincronizar com elemento acessível
   * Adiciona outline no elemento visual quando acessível está focado
   */
  private updateVisualFocus(index: number): void {
    const option = this.options()[index];
    if (!option) return;

    const visualId = `visual-${this.getOptionId(option, index)}`;
    const visualElement = document.getElementById(visualId);
    
    if (visualElement) {
      this.clearVisualFocus();

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
   * Anuncia seleção de um item para leitores de tela
   * Usa blur temporário + aria-live para forçar narração
   */
  private announceSelection(option: ToggleOption<T>, index: number): void {
    const currentFocusedElement = document.activeElement as HTMLElement;
    const a11yElement = document.getElementById(this.getOptionId(option, index));

    const isA11yFocused = currentFocusedElement?.classList.contains('sr-only-option');

    if (isA11yFocused && currentFocusedElement) {
      currentFocusedElement.blur();
    }

    this.anuncioSelecao.set('');

    const announcement = this.getCustomAnnouncement(option, index);

    setTimeout(() => {
      this.anuncioSelecao.set(announcement);

      setTimeout(() => {
        if (a11yElement) {
          a11yElement.focus();
          this.updateVisualFocus(index);
        }
      }, 100);
    }, 50);
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS - Seleção e Navegação
  // ============================================================================

  /**
   * Seleciona uma opção
   * Atualiza estado interno e notifica Angular Forms
   */
  selectOption(option: ToggleOption<T>): void {
    if (this.disabled() || option.disabled) return;

    const previousValue = this.internalValue();
    this.internalValue.set(option.value);
    this.onChange(option.value);
    this.onTouched();

    const index = this.options().indexOf(option);
    if (index !== -1) {
      this.announceSelection(option, index);
    }
  }

  /**
   * Handler de teclado para navegação
   * Implementa padrão de navegação com setas + roving tabindex
   * 
   * **Teclas suportadas:**
   * - ArrowLeft/ArrowUp: Opção anterior (com wrap)
   * - ArrowRight/ArrowDown: Próxima opção (com wrap)
   * - Home: Primeira opção habilitada
   * - End: Última opção habilitada
   * - Space/Enter: Seleciona opção atual
   * - Tab: Navega para fora do componente
   */
  onKeyDown(event: KeyboardEvent, currentOption: ToggleOption<T>, currentIndex: number): void {
    if (this.disabled()) return;

    // Navegação com setas
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

    // Seleção com Space/Enter
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

  // ============================================================================
  // MÉTODOS PÚBLICOS - Utilitários
  // ============================================================================

  /**
   * Verifica se opção está selecionada
   */
  isSelected(option: ToggleOption<T>): boolean {
    return this.internalValue() === option.value;
  }

  /**
   * Obtém tabindex para opção (roving tabindex pattern)
   * Apenas uma opção tem tabindex=0 por vez (a selecionada ou a primeira)
   */
  getTabIndex(option: ToggleOption<T>): number {
    if (this.disabled() || option.disabled) return -1;
    
    if (this.internalValue() !== null) {
      return this.isSelected(option) ? 0 : -1;
    }
    
    const firstEnabledOption = this.options().find(opt => !opt.disabled);
    return option === firstEnabledOption ? 0 : -1;
  }

  /**
   * Gera ID único para uma opção
   */
  getOptionId(option: ToggleOption<T>, index: number): string {
    return `toggle-option-${index}`;
  }

  /**
   * Obtém classes CSS para uma opção
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
   * Obtém aria-label para uma opção
   */
  getOptionAriaLabel(option: ToggleOption<T>): string {
    return option.ariaLabel || option.label;
  }

  /**
   * Gera mensagem de narração customizada para um item
   * Formato: "x de total, selecionado/não selecionado, label"
   */
  getCustomAnnouncement(option: ToggleOption<T>, index: number): string {
    const position = index + 1;
    const total = this.options().length;
    const status = this.isSelected(option) ? 'selecionado' : 'não selecionado';
    
    return `${position} de ${total}, ${status} ${option.label}`;
  }
}
