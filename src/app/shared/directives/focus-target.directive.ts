import { Directive, HostListener, Input } from '@angular/core';

/**
 * Diretiva para transferir o foco para um elemento específico ao clicar.
 * 
 * Útil para:
 * - Botões de "Pular para conteúdo"
 * - Fluxos onde uma ação deve levar o foco imediatamente para outra área
 * - Mover foco para inputs ou containers após uma ação
 * 
 * @example
 * // Usando string (ID)
 * <button appFocusTarget="#conteudo-principal">Pular para conteúdo</button>
 * 
 * // Usando referência de template variável
 * <button [appFocusTarget]="meuInput">Focar Input</button>
 * <input #meuInput type="text">
 */
@Directive({
  selector: '[appFocusTarget]',
  standalone: true
})
export class FocusTargetDirective {
  /** 
   * O elemento alvo para onde o foco será movido.
   * Pode ser uma string (seletor CSS, ex: '#id') ou um HTMLElement direto.
   */
  @Input('appFocusTarget') target: string | HTMLElement | undefined;

  /**
   * Delay opcional antes de focar (útil se o elemento alvo estiver sendo renderizado/animado)
   * Em milissegundos. Padrão: 0 (imediato).
   */
  @Input() focusDelay = 0;

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.target) return;

    let element: HTMLElement | null = null;

    // Resolve o elemento alvo
    if (typeof this.target === 'string') {
      element = document.querySelector(this.target);
    } else {
      element = this.target as HTMLElement;
    }

    if (element) {
      if (this.focusDelay > 0) {
        setTimeout(() => this.applyFocus(element!), this.focusDelay);
      } else {
        this.applyFocus(element);
      }
    } else {
      console.warn('FocusTargetDirective: Elemento alvo não encontrado:', this.target);
    }
  }

  private applyFocus(element: HTMLElement): void {
    // Garante que elementos não-interativos (div, span, h1) possam receber foco programático
    if (!element.getAttribute('tabindex') && this.needsTabindex(element)) {
      element.setAttribute('tabindex', '-1');
    }
    
    element.focus({ preventScroll: false });
  }

  private needsTabindex(element: HTMLElement): boolean {
    const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'DETAILS', 'SUMMARY'];
    return !interactiveTags.includes(element.tagName) && !element.isContentEditable;
  }
}

