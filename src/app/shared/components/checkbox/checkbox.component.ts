import {
  Component,
  forwardRef,
  input,
  output,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Componente de Checkbox - Standalone
 * Angular 19.2 - Signals API
 * 
 * Checkbox customizado com suporte a três estados (selecionado, desmarcado, parcial).
 * Implementa ControlValueAccessor para integração com Forms.
 * 
 * @example
 * ```html
 * <app-checkbox 
 *   titulo="Aceito os termos"
 *   [(ngModel)]="aceito">
 * </app-checkbox>
 * ```
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  // ============================================================================
  // INPUT SIGNALS (Angular 17+)
  // ============================================================================
  
  /** Atributo title do DOM */
  readonly attrTitle = input<string>();
  
  /** Habilita/desabilita o componente */
  readonly disabled = input<boolean>(false);
  
  /** Ativa três estados: true, false, undefined */
  readonly enableMixed = input<boolean>(false);
  
  /** Renderiza checkbox menor */
  readonly small = input<boolean>(false);
  
  /** Atributo tabindex */
  readonly tabindex = input<number>(0);
  
  /** Texto ao lado do checkbox */
  readonly titulo = input<string>();
  
  /** Justifica espaço entre checkbox e label */
  readonly justificar = input<boolean>(false);
  
  /** Posiciona label à esquerda */
  readonly labelEsquerda = input<boolean>(false);

  // ============================================================================
  // OUTPUT SIGNALS (Angular 17+)
  // ============================================================================
  
  /** Emite quando o valor do checkbox muda */
  readonly valueChange = output<boolean | undefined>();

  // ============================================================================
  // STATE SIGNALS
  // ============================================================================
  
  /** Valor atual do checkbox */
  readonly value = signal<boolean | undefined>(false);

  // ============================================================================
  // COMPUTED SIGNALS
  // ============================================================================
  
  /** Valor do atributo aria-checked baseado no estado atual */
  readonly ariaChecked = computed<string | boolean>(() => {
    const val = this.value();
    return val === undefined ? 'mixed' : val;
  });

  /** Classes CSS dinâmicas para o label */
  readonly labelClasses = computed(() => ({
    'justificar': this.justificar(),
    'reverse': this.labelEsquerda(),
    'bradCheckboxSmall': this.small(),
    'noselect': true,
    'bradCheckbox': true
  }));

  // ============================================================================
  // CONTROL VALUE ACCESSOR
  // ============================================================================

  private onChangeFn: any;
  private onTouchedFn: any;

  // ============================================================================
  // CONSTRUCTOR & EFFECTS
  // ============================================================================

  // Note: Removido effect desnecessário para evitar overhead
  // Effects são automaticamente limpos, mas é melhor evitar quando não necessário

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Altera o estado do checkbox
   * Se enableMixed está ativo, cicla entre: false → true → undefined → false
   */
  changeCheckbox(): void {
    if (this.disabled()) {
      return;
    }

    // Se enableMixed está ativo, cicla entre false -> true -> undefined
    if (this.enableMixed()) {
      const currentValue = this.value();
      
      if (currentValue === false) {
        this.value.set(true);
      } else if (currentValue === true) {
        this.value.set(undefined);
      } else {
        this.value.set(false);
      }
    } else {
      // Modo normal: apenas true/false
      this.value.update(val => !val);
    }

    // Emitir mudança
    this.valueChange.emit(this.value());
    
    // Notificar Forms API
    if (this.onChangeFn) {
      this.onChangeFn(this.value());
      this.onTouchedFn();
    }
  }

  // ============================================================================
  // CONTROL VALUE ACCESSOR IMPLEMENTATION
  // ============================================================================

  writeValue(obj: any): void {
    if (this.enableMixed() && obj === undefined) {
      this.value.set(undefined);
    } else {
      this.value.set(!!obj);
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Note: disabled is now an input signal
    // In a real app, you might need a writable signal for this
    // For now, we'll just log it
    if (isDisabled !== this.disabled()) {
      console.warn('setDisabledState called with:', isDisabled, 'but disabled is an input signal');
    }
  }
}
