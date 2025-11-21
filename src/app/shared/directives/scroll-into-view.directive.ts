import {
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  DestroyRef
} from '@angular/core';

/**
 * Diretiva para manter elementos na tela durante navegação
 * 
 * Automaticamente scrolla o elemento para a view quando:
 * - Recebe foco via teclado
 * - É explicitamente acionado via input
 * 
 * @example
 * ```html
 * <button appScrollIntoView [scrollBehavior]="'smooth'">
 *   Botão
 * </button>
 * ```
 */
@Directive({
  selector: '[appScrollIntoView]',
  standalone: true
})
export class ScrollIntoViewDirective implements OnInit {
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Comportamento do scroll
   * - 'auto': Scroll instantâneo
   * - 'smooth': Scroll suave
   */
  readonly scrollBehavior = input<ScrollBehavior>('smooth');

  /**
   * Posição do elemento no viewport após scroll
   * - 'start': Topo do viewport
   * - 'center': Centro do viewport
   * - 'end': Final do viewport
   * - 'nearest': Posição mais próxima (padrão)
   */
  readonly scrollBlock = input<ScrollLogicalPosition>('nearest');

  /**
   * Se deve fazer scroll apenas quando o elemento recebe foco
   */
  readonly scrollOnFocus = input<boolean>(true);

  /**
   * Se deve fazer scroll apenas quando não está visível
   */
  readonly scrollIfNeeded = input<boolean>(true);

  /**
   * Offset adicional em pixels (útil para headers fixos)
   */
  readonly scrollOffset = input<number>(0);

  private focusHandler?: (event: FocusEvent) => void;

  ngOnInit(): void {
    if (this.scrollOnFocus()) {
      this.setupFocusListener();
    }
  }

  /**
   * Configura listener de foco
   */
  private setupFocusListener(): void {
    const element = this.elementRef.nativeElement as HTMLElement;

    this.focusHandler = (event: FocusEvent) => {
      // Verificar se o foco veio de navegação por teclado
      const isKeyboardNavigation = event.relatedTarget !== null || 
                                   document.activeElement === element;

      if (isKeyboardNavigation) {
        this.scrollIntoView();
      }
    };

    element.addEventListener('focus', this.focusHandler);

    // Cleanup
    this.destroyRef.onDestroy(() => {
      if (this.focusHandler) {
        element.removeEventListener('focus', this.focusHandler);
      }
    });
  }

  /**
   * Verifica se elemento está visível no viewport
   */
  private isElementVisible(): boolean {
    const element = this.elementRef.nativeElement as HTMLElement;
    const rect = element.getBoundingClientRect();
    const offset = this.scrollOffset();

    return (
      rect.top >= offset &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Scrolla o elemento para a view
   */
  public scrollIntoView(): void {
    // Se scrollIfNeeded está ativo, verificar se elemento já está visível
    if (this.scrollIfNeeded() && this.isElementVisible()) {
      return;
    }

    const element = this.elementRef.nativeElement as HTMLElement;
    const offset = this.scrollOffset();

    // Se houver offset, usar scroll manual
    if (offset > 0) {
      this.scrollWithOffset();
    } else {
      // Usar scrollIntoView nativo
      element.scrollIntoView({
        behavior: this.scrollBehavior(),
        block: this.scrollBlock(),
        inline: 'nearest'
      });
    }
  }

  /**
   * Scrolla com offset personalizado
   */
  private scrollWithOffset(): void {
    const element = this.elementRef.nativeElement as HTMLElement;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - this.scrollOffset();

    window.scrollTo({
      top: offsetPosition,
      behavior: this.scrollBehavior()
    });
  }
}

