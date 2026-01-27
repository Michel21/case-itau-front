import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  OnDestroy,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FocusTrapDirective } from '../../directives/focus-trap.directive';

// ============================================================================
// INTERFACES
// ============================================================================

export type DownloadFormat = 'pdf' | 'excel';

interface RadioOption {
  value: DownloadFormat;
  label: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Bottom Sheet de Download com Acessibilidade
 * 
 * Componente modal inferior com opções de download (PDF/Excel)
 * 
 * Features:
 * - Radio buttons acessíveis (PDF e Excel)
 * - Botão de download
 * - Link adicional no final
 * - Acessibilidade completa (ARIA, focus trap, live announcer)
 * - Animações de entrada/saída
 */
@Component({
  selector: 'app-bottom-sheet-download',
  standalone: true,
  imports: [CommonModule, FocusTrapDirective],
  templateUrl: './bottom-sheet-download.component.html',
  styleUrls: ['./bottom-sheet-download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.bottom-sheet-download-host]': 'true',
    '[class.bottom-sheet-download-host--open]': 'isOpen()',
    '[attr.aria-hidden]': '!isOpen()',
    '[attr.aria-modal]': 'isOpen()',
    '[attr.id]': '"bottom-sheet-download"'
  }
})
export class BottomSheetDownloadComponent implements OnDestroy {
  // ============================================================================
  // INPUTS
  // ============================================================================
  
  /**
   * Se o bottom sheet está aberto
   */
  readonly isOpen = input<boolean>(false);

  /**
   * Formato selecionado inicialmente
   */
  readonly formatoInicial = input<DownloadFormat>('pdf');

  /**
   * Texto do botão de download
   */
  readonly textoBotao = input<string>('Baixar');

  /**
   * URL do link final
   */
  readonly linkUrl = input<string>('#');

  /**
   * Texto do link final
   */
  readonly linkTexto = input<string>('Saiba mais sobre downloads');

  /**
   * ID único para acessibilidade (auto-gerado se não fornecido)
   */
  readonly idUnico = signal<string>(`bottom-sheet-${Math.random().toString(36).substr(2, 9)}`);

  // ============================================================================
  // OUTPUTS
  // ============================================================================
  
  /**
   * Evento ao confirmar download
   */
  readonly downloadConfirmado = output<DownloadFormat>();

  /**
   * Evento ao fechar o bottom sheet
   */
  readonly fechar = output<void>();

  /**
   * Evento ao clicar no link
   */
  readonly linkClicado = output<void>();

  // ============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ============================================================================
  
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly elementRef = inject(ElementRef);

  // ============================================================================
  // TOUCH GESTURES (MOBILE)
  // ============================================================================
  
  private touchStartY = 0;
  private touchStartTime = 0;
  private isDragging = false;
  private dragDistance = 0;
  private readonly SWIPE_THRESHOLD = 100; // pixels para fechar
  private readonly SWIPE_VELOCITY_THRESHOLD = 0.3; // velocidade mínima
  private originalBodyOverflow = '';
  private originalBodyPosition = '';

  // ============================================================================
  // STATE
  // ============================================================================
  
  /**
   * Formato selecionado
   */
  readonly formatoSelecionado = signal<DownloadFormat>('pdf');

  /**
   * Opções de radio buttons
   */
  readonly opcoes: RadioOption[] = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' }
  ];

  /**
   * Computed para verificar se pode baixar
   */
  readonly podeBaixar = computed(() => !!this.formatoSelecionado());

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  /**
   * Sincroniza formato inicial com formato selecionado
   */
  private readonly sincronizarFormato = effect(() => {
    const formatoInicial = this.formatoInicial();
    if (formatoInicial) {
      this.formatoSelecionado.set(formatoInicial);
    }
  });

  /**
   * Anuncia abertura/fechamento para leitores de tela
   * E controla scroll do body para mobile
   */
  private readonly anunciarEstado = effect(() => {
    const aberto = this.isOpen();
    if (aberto) {
      // Narrar o título ao abrir
      const titulo = 'Escolha o formato de download';
      this.liveAnnouncer.announce(titulo, 'polite');
      this.preventBodyScroll();
      
      // Focar no container e primeiro elemento após a abertura
      queueMicrotask(() => {
        this.focusFirstElement();
      });
    } else {
      this.restoreBodyScroll();
    }
  });

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  /**
   * Previne scroll do body quando bottom sheet está aberto (iOS/Android)
   */
  private preventBodyScroll(): void {
    const body = document.body;
    this.originalBodyOverflow = body.style.overflow;
    this.originalBodyPosition = body.style.position;
    
    // Previne scroll no body
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.width = '100%';
    body.style.top = `-${window.scrollY}px`;
  }

  /**
   * Restaura scroll do body
   */
  private restoreBodyScroll(): void {
    const body = document.body;
    const scrollY = body.style.top;
    
    body.style.overflow = this.originalBodyOverflow || '';
    body.style.position = this.originalBodyPosition || '';
    body.style.width = '';
    
    if (scrollY) {
      body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================
  
  /**
   * Seleciona um formato
   */
  selecionarFormato(formato: DownloadFormat): void {
    this.formatoSelecionado.set(formato);
    this.liveAnnouncer.announce(`Formato ${formato.toUpperCase()} selecionado`, 'polite');
  }

  /**
   * Confirma o download
   */
  confirmarDownload(): void {
    const formato = this.formatoSelecionado();
    if (formato) {
      this.downloadConfirmado.emit(formato);
      this.liveAnnouncer.announce(`Download em formato ${formato.toUpperCase()} iniciado`, 'assertive');
    }
  }

  /**
   * Fecha o bottom sheet
   */
  fecharBottomSheet(): void {
    this.fechar.emit();
    this.liveAnnouncer.announce('Bottom sheet fechado', 'polite');
  }

  /**
   * Manipula clique no backdrop
   */
  onBackdropClick(event: MouseEvent | TouchEvent): void {
    // Fecha apenas se clicar diretamente no backdrop
    if (event.target === event.currentTarget) {
      this.fecharBottomSheet();
    }
  }

  // ============================================================================
  // TOUCH EVENTS (MOBILE)
  // ============================================================================

  /**
   * Inicia o gesto de arrastar (touchstart)
   */
  onTouchStart(event: TouchEvent): void {
    if (!this.isOpen()) return;
    
    this.touchStartY = event.touches[0].clientY;
    this.touchStartTime = Date.now();
    this.isDragging = true;
    this.dragDistance = 0;
  }

  /**
   * Durante o arrasto (touchmove)
   */
  onTouchMove(event: TouchEvent): void {
    if (!this.isOpen()) return;

    const touchY = event.touches[0].clientY;
    const scrollElement = event.target as HTMLElement;
    const container = this.elementRef.nativeElement.querySelector('.bottom-sheet-container') as HTMLElement;
    
    // Verifica se o toque está no header ou drag handle para arrastar
    const isDragHandle = scrollElement.closest('.bottom-sheet-drag-handle') || 
                         scrollElement.closest('.bottom-sheet-header');
    
    if (isDragHandle && this.isDragging) {
      this.dragDistance = touchY - this.touchStartY;

      // Permite arrastar apenas para baixo
      if (this.dragDistance > 0) {
        if (container) {
          // Transforma o container conforme o arrasto
          container.style.transform = `translateY(${this.dragDistance}px)`;
          container.style.transition = 'none';
          
          // Opacidade do backdrop
          const backdrop = this.elementRef.nativeElement.querySelector('.bottom-sheet-backdrop') as HTMLElement;
          if (backdrop) {
            const opacity = Math.max(0, 0.5 - (this.dragDistance / 500));
            backdrop.style.opacity = opacity.toString();
          }
        }
        
        // Previne scroll do conteúdo enquanto arrasta
        event.preventDefault();
      }
    } else if (this.isDragging && this.dragDistance > 0) {
      // Continua arrastando se já começou
      this.dragDistance = touchY - this.touchStartY;
      if (container) {
        container.style.transform = `translateY(${this.dragDistance}px)`;
        container.style.transition = 'none';
      }
      event.preventDefault();
    }
  }

  /**
   * Finaliza o gesto de arrastar (touchend)
   */
  onTouchEnd(event: TouchEvent): void {
    if (!this.isOpen() || !this.isDragging) return;

    const touchDuration = Date.now() - this.touchStartTime;
    const velocity = Math.abs(this.dragDistance) / touchDuration;

    const container = this.elementRef.nativeElement.querySelector('.bottom-sheet-container');
    const backdrop = this.elementRef.nativeElement.querySelector('.bottom-sheet-backdrop');

    // Verifica se deve fechar baseado na distância ou velocidade
    const shouldClose = 
      this.dragDistance > this.SWIPE_THRESHOLD || 
      (this.dragDistance > 50 && velocity > this.SWIPE_VELOCITY_THRESHOLD);

    if (shouldClose) {
      this.fecharBottomSheet();
    } else {
      // Animação de retorno
      if (container) {
        container.style.transform = '';
        container.style.transition = '';
      }
      if (backdrop) {
        backdrop.style.opacity = '';
      }
    }

    this.isDragging = false;
    this.dragDistance = 0;
  }

  /**
   * Manipula clique no link
   */
  onLinkClick(event: Event): void {
    event.preventDefault();
    this.linkClicado.emit();
  }

  /**
   * Manipula teclas de navegação (Escape, PageDown, PageUp)
   */
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    // Escape para fechar
    if (event.key === 'Escape') {
      this.fecharBottomSheet();
      return;
    }

    // PageDown e PageUp para navegação
    if (event.key === 'PageDown' || event.key === 'PageUp') {
      event.preventDefault();
      this.navigateWithPageKeys(event.key);
    }
  }

  /**
   * Navega pelos elementos focáveis com PageDown/PageUp
   */
  private navigateWithPageKeys(key: 'PageDown' | 'PageUp'): void {
    const container = this.elementRef.nativeElement.querySelector('.bottom-sheet-container') as HTMLElement;
    if (!container) return;

    // Seletores dos elementos focáveis: radio buttons, botão e link
    const focusableSelectors = [
      'input[type="radio"]',
      'button:not([disabled])',
      'a[href]'
    ];
    const focusableElements = Array.from(
      container.querySelectorAll(focusableSelectors.join(','))
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const activeElement = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(activeElement);

    let nextIndex: number;

    if (key === 'PageDown') {
      // PageDown: Avança 2 itens ou vai para o último
      if (currentIndex === -1) {
        nextIndex = 0;
      } else {
        nextIndex = Math.min(currentIndex + 2, focusableElements.length - 1);
      }
    } else {
      // PageUp: Recua 2 itens ou vai para o primeiro
      if (currentIndex === -1) {
        nextIndex = focusableElements.length - 1;
      } else {
        nextIndex = Math.max(currentIndex - 2, 0);
      }
    }

    const targetElement = focusableElements[nextIndex];
    if (targetElement) {
      targetElement.focus();
      targetElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      
      // Narrar o elemento que recebeu foco
      this.announceFocusedElement(targetElement);
    }
  }

  /**
   * Foca no título quando o modal abre
   */
  private focusFirstElement(): void {
    const tituloId = `${this.idUnico()}-title`;
    const titulo = document.getElementById(tituloId) as HTMLElement;
    
    if (titulo) {
      // Torna o título focável se não for
      if (!titulo.hasAttribute('tabindex')) {
        titulo.setAttribute('tabindex', '-1');
      }
      titulo.focus();
    } else {
      // Fallback: foca no container se o título não for encontrado
      const container = this.elementRef.nativeElement.querySelector('.bottom-sheet-container') as HTMLElement;
      if (container) {
        container.focus();
      }
    }
  }

  /**
   * Anuncia o elemento que recebeu foco para leitores de tela
   */
  private announceFocusedElement(element: HTMLElement): void {
    let announcement = '';

    if (element.tagName === 'INPUT' && element.getAttribute('type') === 'radio') {
      const label = element.closest('label');
      if (label) {
        const labelText = label.querySelector('.radio-text')?.textContent || '';
        const isChecked = (element as HTMLInputElement).checked;
        announcement = `${labelText}${isChecked ? ' selecionado' : ''}`;
      }
    } else if (element.tagName === 'BUTTON') {
      announcement = element.textContent?.trim() || 'Botão';
    } else if (element.tagName === 'A') {
      announcement = element.textContent?.trim() || element.getAttribute('aria-label') || 'Link';
    }

    if (announcement) {
      this.liveAnnouncer.announce(announcement, 'polite');
    }
  }

  /**
   * Verifica se formato está selecionado
   */
  isFormatoSelecionado(formato: DownloadFormat): boolean {
    return this.formatoSelecionado() === formato;
  }

  /**
   * Obtém ID do radio button
   */
  getRadioId(formato: DownloadFormat): string {
    return `${this.idUnico()}-${formato}`;
  }
}

