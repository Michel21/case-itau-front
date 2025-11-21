import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  type Signal
} from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

/**
 * Componente de Checkbox Acessível com Angular 19 + LiveAnnouncer
 * 
 * Features:
 * - Signals API completa
 * - LiveAnnouncer para narração robusta
 * - ARIA attributes corretos
 * - Navegação por teclado (Space, Enter)
 * - WCAG 2.1 AA compliant
 * 
 * @example
 * ```html
 * <app-checkbox-accessible
 *   label="Aceito os termos"
 *   [checked]="aceitoTermos()"
 *   (checkedChange)="aceitoTermos.set($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-checkbox-accessible',
  standalone: true,
  imports: [],
  templateUrl: './checkbox-accessible.component.html',
  styleUrls: ['./checkbox-accessible.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.checkbox-container]': 'true'
  }
})
export class CheckboxAccessibleComponent {
  // ============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ============================================================================
  
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  // ============================================================================
  // INPUTS (Signals)
  // ============================================================================
  
  /**
   * Label do checkbox
   */
  readonly label = input.required<string>();

  /**
   * Estado inicial (marcado/desmarcado)
   */
  readonly checked = input<boolean>(false);

  /**
   * Desabilitar checkbox
   */
  readonly disabled = input<boolean>(false);

  /**
   * ID único para o checkbox
   */
  readonly id = input<string>(`checkbox-${Math.random().toString(36).substr(2, 9)}`);

  /**
   * Descrição adicional (opcional)
   */
  readonly description = input<string>('');

  /**
   * Mostrar ícone de validação
   */
  readonly showValidation = input<boolean>(false);

  // ============================================================================
  // OUTPUTS (Signals)
  // ============================================================================
  
  /**
   * Evento emitido quando o estado muda
   */
  readonly checkedChange = output<boolean>();

  // ============================================================================
  // STATE SIGNALS
  // ============================================================================
  
  /**
   * Estado interno do checkbox
   */
  private readonly _internalChecked = signal<boolean>(false);

  /**
   * Se está focado
   */
  readonly isFocused = signal<boolean>(false);

  // ============================================================================
  // COMPUTED SIGNALS
  // ============================================================================
  
  /**
   * Estado atual do checkbox (sincronizado com input)
   */
  readonly isChecked = computed(() => this.checked());

  /**
   * Texto para leitores de tela
   */
  readonly ariaLabel = computed(() => {
    const label = this.label();
    // NÃO incluir estado aqui - aria-checked cuida disso
    return label;
  });

  /**
   * Descrição completa para aria-describedby
   */
  readonly ariaDescription = computed(() => {
    const desc = this.description();
    return desc || null;
  });

  /**
   * Classes CSS dinâmicas
   */
  readonly checkboxClasses = computed(() => ({
    'checkbox--checked': this.isChecked(),
    'checkbox--disabled': this.disabled(),
    'checkbox--focused': this.isFocused()
  }));

  // ============================================================================
  // CONSTRUCTOR - EFFECTS
  // ============================================================================
  
  constructor() {
    // Effect: Sincronizar estado interno com input checked
    effect(() => {
      this._internalChecked.set(this.checked());
    });

    // Effect: Anunciar mudanças de estado via LiveAnnouncer
    effect(() => {
      const checked = this.isChecked();
      const label = this.label();
      
      // Usar queueMicrotask para garantir que o DOM foi atualizado
      queueMicrotask(() => {
        // Apenas anunciar se houve mudança de estado
        if (this._internalChecked() !== checked) {
          const mensagem = checked
            ? `${label} marcado`
            : `${label} desmarcado`;
          
          this.liveAnnouncer.announce(mensagem, 'polite');
        }
      });
    });
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Alterna o estado do checkbox
   */
  toggle(): void {
    if (this.disabled()) {
      return;
    }

    const newState = !this.isChecked();
    this._internalChecked.set(newState);
    this.checkedChange.emit(newState);

    // LiveAnnouncer vai anunciar via effect automaticamente
  }

  /**
   * Handler de foco
   */
  onFocus(): void {
    this.isFocused.set(true);
  }

  /**
   * Handler de blur
   */
  onBlur(): void {
    this.isFocused.set(false);
  }

  /**
   * Handler de tecla Space/Enter
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }
}

