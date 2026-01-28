import {
  Directive,
  ElementRef,
  inject,
  input,
  effect,
  DestroyRef
} from '@angular/core';

/**
 * Diretiva de Focus Trap
 * 
 * Mantém o foco dentro do elemento quando ativo.
 * Útil para modais e outros overlays.
 * 
 * Features:
 * - Foca automaticamente o primeiro elemento focável
 * - Previne Tab para fora do elemento
 * - Suporta Shift+Tab (reverso)
 * - Restaura foco ao fechar
 * - ESC fecha o elemento
 * 
 * @example
 * ```html
 * <div appFocusTrap [trapActive]="isOpen()">
 *   <button>Cancelar</button>
 *   <button>Confirmar</button>
 * </div>
 * ```
 */
@Directive({
  selector: '[appFocusTrap], [appModalTrap]',
  standalone: true
})
export class FocusTrapDirective {
  // ============================================================================
  // INPUTS
  // ============================================================================
  
  /**
   * Se o trap está ativo
   */
  readonly trapActive = input<boolean>(false);

  /**
   * Se deve focar automaticamente ao ativar
   */
  readonly autoFocus = input<boolean>(true);

  // ============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ============================================================================
  
  private readonly el = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  // ============================================================================
  // STATE
  // ============================================================================
  
  private previouslyFocusedElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;

  // ============================================================================
  // SELETORES DE ELEMENTOS FOCÁVEIS
  // ============================================================================
  
  private readonly focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================
  
  constructor() {
    // Effect: Ativa/desativa trap quando input muda
    effect(() => {
      const active = this.trapActive();
      
      if (active) {
        this.activateInternal();
      } else {
        this.deactivateInternal();
      }
    });

    // Cleanup automático
    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Ativa o focus trap (método público para uso programático)
   */
  activate(): void {
    this.activateInternal();
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  /**
   * Ativa o focus trap (implementação interna)
   */
  private activateInternal(): void {
    // Salvar elemento que tinha foco antes
    this.previouslyFocusedElement = document.activeElement as HTMLElement;

    // Aguardar o DOM estar pronto
    queueMicrotask(() => {
      this.updateFocusableElements();
      
      if (this.autoFocus() && this.firstFocusableElement) {
        this.firstFocusableElement.focus();
      }

      // Adicionar listeners
      this.el.nativeElement.addEventListener('keydown', this.handleKeyDown);
      document.addEventListener('focus', this.handleFocus, true);
    });
  }

  /**
   * Desativa o focus trap (método público para uso programático)
   */
  deactivate(): void {
    this.deactivateInternal();
  }

  /**
   * Desativa o focus trap (implementação interna)
   */
  private deactivateInternal(): void {
    // Remover listeners
    this.el.nativeElement?.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('focus', this.handleFocus, true);

    // Restaurar foco anterior
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      queueMicrotask(() => {
        this.previouslyFocusedElement?.focus();
        this.previouslyFocusedElement = null;
      });
    }
  }

  /**
   * Atualiza lista de elementos focáveis
   */
  private updateFocusableElements(): void {
    const element = this.el.nativeElement;
    
    if (!element) {
      return;
    }

    const elements = element.querySelectorAll(this.focusableSelector);
    this.focusableElements = Array.from(elements) as HTMLElement[];

    // Filtrar apenas elementos visíveis
    this.focusableElements = this.focusableElements.filter(el => {
      return el.offsetParent !== null && 
             getComputedStyle(el).visibility !== 'hidden' &&
             getComputedStyle(el).display !== 'none';
    });

    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  /**
   * Handler de keydown (Tab e Shift+Tab)
   * IMPORTANTE: Só trata Tab, deixa outras teclas (setas, etc) passarem
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    // Só processar Tab - deixar outras teclas (setas, etc) passarem
    if (event.key !== 'Tab') {
      return;
    }

    // Atualizar elementos antes de processar
    this.updateFocusableElements();

    if (this.focusableElements.length === 0) {
      // Se não há elementos focáveis, previne Tab
      event.preventDefault();
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab (navegação reversa)
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab (navegação normal)
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };

  /**
   * Handler de focus (previne foco fora do trap)
   */
  private handleFocus = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    const element = this.el.nativeElement;

    if (!element || !target) {
      return;
    }

    // Se o foco foi para fora do elemento
    if (!element.contains(target)) {
      event.stopPropagation();
      
      // Retornar foco para o primeiro elemento
      if (this.firstFocusableElement) {
        this.firstFocusableElement.focus();
      }
    }
  };

  /**
   * Cleanup completo
   */
  private cleanup(): void {
    this.deactivateInternal();
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    this.previouslyFocusedElement = null;
  }
}

