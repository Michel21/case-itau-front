import { Directive, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';

/**
 * Diretiva para restaurar o foco ao elemento anterior quando o elemento atual for destruído.
 * 
 * Útil para componentes temporários (tooltips, menus, popovers não-modais) que,
 * ao serem fechados (destruídos do DOM via *ngIf), devem devolver o foco ao gatilho.
 * 
 * @example
 * <div *ngIf="showMenu" appRestoreFocus>
 *   <!-- conteúdo do menu -->
 * </div>
 */
@Directive({
  selector: '[appRestoreFocus]',
  standalone: true
})
export class RestoreFocusDirective implements OnInit, OnDestroy {
  private previousElement: HTMLElement | null = null;

  ngOnInit(): void {
    // Captura o elemento que tem o foco NO MOMENTO DA CRIAÇÃO da diretiva.
    // Geralmente é o botão que disparou a ação.
    this.previousElement = document.activeElement as HTMLElement;
  }

  ngOnDestroy(): void {
    // Restaura o foco se o elemento ainda existir
    if (this.previousElement && document.body.contains(this.previousElement)) {
      // Pequeno delay para garantir que o ciclo de destruição/rendering termine
      setTimeout(() => {
        this.previousElement?.focus();
      }, 0);
    }
  }
}

