import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

/**
 * Diretiva para navegação por página (PageUp / PageDown) em listas
 * 
 * Permite navegar pulando múltiplos itens de uma vez, simulando o comportamento
 * de rolagem de página, mas mantendo o foco nos itens (acessibilidade).
 * 
 * @example
 * ```html
 * <div appPageNavigation [pageSize]="5" selector=".list-item">
 *   <button class="list-item">Item 1</button>
 *   ...
 * </div>
 * ```
 */
@Directive({
  selector: '[appPageNavigation]',
  standalone: true
})
export class PageNavigationDirective {
  /** Tamanho do salto da página (quantidade de itens) */
  @Input() pageSize = 5;
  
  /** Seletor dos itens focáveis dentro do container */
  @Input() itemSelector = 'button, a, input, [tabindex]:not([tabindex="-1"])';

  private readonly el = inject(ElementRef);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const isPageUp = event.key === 'PageUp';
    const isPageDown = event.key === 'PageDown';

    if (!isPageUp && !isPageDown) {
      return;
    }

    event.preventDefault(); // Previne o scroll nativo da página

    const container = this.el.nativeElement as HTMLElement;
    const items = Array.from(container.querySelectorAll(this.itemSelector)) as HTMLElement[];
    
    if (items.length === 0) return;

    const activeElement = document.activeElement as HTMLElement;
    const currentIndex = items.indexOf(activeElement);

    // Se o foco não está em nenhum item, foca no primeiro ou último dependendo da tecla
    if (currentIndex === -1) {
      if (isPageDown) {
        items[0]?.focus();
      } else {
        items[items.length - 1]?.focus();
      }
      return;
    }

    let nextIndex: number;

    if (isPageDown) {
      // PageDown: Avança pageSize itens ou vai para o último
      nextIndex = Math.min(currentIndex + this.pageSize, items.length - 1);
    } else {
      // PageUp: Recua pageSize itens ou vai para o primeiro
      nextIndex = Math.max(currentIndex - this.pageSize, 0);
    }

    const targetItem = items[nextIndex];
    if (targetItem) {
      targetItem.focus();
      targetItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
}

