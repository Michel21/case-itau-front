import {
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  DestroyRef,
  HostListener
} from '@angular/core';

/**
 * Diretiva para navegação acessível via Tab
 * 
 * Garante que elementos focados via Tab fiquem sempre visíveis na tela.
 * Otimizada para acessibilidade e navegação por teclado.
 * 
 * @example
 * ```html
 * <!-- Uso básico -->
 * <button appTabNavigation>Botão</button>
 * 
 * <!-- Com offset para header fixo -->
 * <input appTabNavigation [tabScrollOffset]="80">
 * 
 * <!-- Desabilitar scroll -->
 * <div appTabNavigation [enableTabScroll]="false">
 * ```
 */
@Directive({
  selector: '[appTabNavigation]',
  standalone: true
})
export class TabNavigationDirective implements OnInit {
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Habilita scroll automático ao receber foco via Tab
   * @default true
   */
  readonly enableTabScroll = input<boolean>(true);

  /**
   * Comportamento do scroll
   * @default 'smooth'
   */
  readonly tabScrollBehavior = input<ScrollBehavior>('smooth');

  /**
   * Posição do elemento no viewport
   * @default 'nearest'
   */
  readonly tabScrollPosition = input<ScrollLogicalPosition>('nearest');

  /**
   * Offset para compensar headers/toolbars fixos (em pixels)
   * @default 0
   */
  readonly tabScrollOffset = input<number>(0);

  /**
   * Delay em ms antes de fazer scroll (útil para animações)
   * @default 0
   */
  readonly tabScrollDelay = input<number>(0);

  /**
   * Se deve fazer scroll apenas quando elemento não está visível
   * @default true
   */
  readonly tabScrollIfNeeded = input<boolean>(true);

  /**
   * Anunciar foco para leitores de tela
   * @default false
   */
  readonly announceOnFocus = input<boolean>(false);

  /**
   * Mensagem personalizada para leitores de tela
   */
  readonly focusAnnouncement = input<string>('');

  private isTabNavigation = false;

  ngOnInit(): void {
    this.setupAccessibility();
  }

  /**
   * Detecta navegação por Tab antes do foco
   */
  @HostListener('document:keydown.tab', ['$event'])
  @HostListener('document:keydown.shift.tab', ['$event'])
  onTabKeyDown(event: KeyboardEvent): void {
    this.isTabNavigation = true;
  }

  /**
   * Processa foco quando elemento é focado
   */
  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent): void {
    if (!this.enableTabScroll()) return;

    // Verificar se foi navegação por Tab
    if (this.isTabNavigation) {
      this.handleTabFocus();
    }

    // Resetar flag após processamento
    setTimeout(() => {
      this.isTabNavigation = false;
    }, 100);
  }

  /**
   * Configura atributos de acessibilidade
   */
  private setupAccessibility(): void {
    const element = this.elementRef.nativeElement as HTMLElement;

    // Garantir que elemento seja focável
    if (!element.hasAttribute('tabindex') && 
        !this.isFocusableElement(element)) {
      element.setAttribute('tabindex', '0');
    }
  }

  /**
   * Verifica se elemento é naturalmente focável
   */
  private isFocusableElement(element: HTMLElement): boolean {
    const focusableTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    return focusableTags.includes(element.tagName) && 
           !element.hasAttribute('disabled');
  }

  /**
   * Processa foco via Tab
   */
  private handleTabFocus(): void {
    const delay = this.tabScrollDelay();

    if (delay > 0) {
      setTimeout(() => this.scrollToElement(), delay);
    } else {
      requestAnimationFrame(() => this.scrollToElement());
    }

    // Anunciar foco se habilitado
    if (this.announceOnFocus()) {
      this.announceFocus();
    }
  }

  /**
   * Scrolla elemento para a view
   */
  private scrollToElement(): void {
    // Verificar se elemento já está visível
    if (this.tabScrollIfNeeded() && this.isElementVisible()) {
      return;
    }

    const element = this.elementRef.nativeElement as HTMLElement;
    const offset = this.tabScrollOffset();

    if (offset > 0) {
      this.scrollWithOffset(element, offset);
    } else {
      element.scrollIntoView({
        behavior: this.tabScrollBehavior(),
        block: this.tabScrollPosition(),
        inline: 'nearest'
      });
    }
  }

  /**
   * Verifica se elemento está completamente visível no viewport
   */
  private isElementVisible(): boolean {
    const element = this.elementRef.nativeElement as HTMLElement;
    const rect = element.getBoundingClientRect();
    const offset = this.tabScrollOffset();

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top >= offset &&
      rect.left >= 0 &&
      rect.bottom <= viewportHeight &&
      rect.right <= viewportWidth
    );
  }

  /**
   * Scrolla com offset personalizado
   */
  private scrollWithOffset(element: HTMLElement, offset: number): void {
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: this.tabScrollBehavior()
    });
  }

  /**
   * Anuncia foco para leitores de tela
   */
  private announceFocus(): void {
    const element = this.elementRef.nativeElement as HTMLElement;
    const announcement = this.focusAnnouncement() || 
                        element.getAttribute('aria-label') || 
                        element.textContent?.trim() || 
                        'Elemento focado';

    // Criar região aria-live temporária
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = announcement;

    document.body.appendChild(liveRegion);

    // Remover após anúncio
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }
}

