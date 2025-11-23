import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  DestroyRef,
  viewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FocusTrapDirective } from '../../directives/focus-trap.directive';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Opção genérica para seleção no modal
 * 
 * @template T - Tipo do valor da opção (padrão: string)
 */
export interface ModalSelectOption<T = string> {
  /** Valor único que identifica a opção */
  readonly value: T;
  /** Texto exibido para o usuário */
  readonly label: string;
}

/**
 * Configuração de estilo e comportamento do modal
 */
export interface ModalSelectConfig {
  /** Exibir ícone de check na opção selecionada */
  readonly showCheckIcon?: boolean;
  /** Altura máxima do container de scroll */
  readonly maxHeight?: string;
  /** Classes CSS customizadas para o backdrop */
  readonly backdropClass?: string;
  /** Classes CSS customizadas para o content */
  readonly contentClass?: string;
}

/**
 * Função para customizar a narração ARIA de um item
 * 
 * @param option - Opção sendo narrada
 * @param index - Índice da opção (base 0)
 * @param total - Total de opções
 * @param isSelected - Se a opção está selecionada
 * @returns Texto customizado para narração
 */
export type AriaLabelGeneratorFn<T> = (
  option: ModalSelectOption<T>,
  index: number,
  total: number,
  isSelected: boolean
) => string;

/**
 * Função para customizar narração durante navegação por teclado
 * 
 * @param option - Opção recebendo foco
 * @param index - Índice da opção
 * @param total - Total de opções
 * @param isSelected - Se a opção está selecionada
 * @param navigationKey - Tecla pressionada ('ArrowDown', 'Home', etc)
 * @returns Texto customizado para anunciar
 */
export type NavigationAnnouncementFn<T> = (
  option: ModalSelectOption<T>,
  index: number,
  total: number,
  isSelected: boolean,
  navigationKey: string
) => string;

/**
 * Função para customizar comportamento de navegação
 * 
 * @param key - Tecla pressionada
 * @param currentIndex - Índice atual
 * @param total - Total de opções
 * @param options - Array de todas as opções
 * @returns Novo índice ou null para usar comportamento padrão
 */
export type NavigationHandlerFn<T> = (
  key: string,
  currentIndex: number,
  total: number,
  options: readonly ModalSelectOption<T>[]
) => number | null;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Modal de Seleção Genérico e Acessível
 * 
 * Componente profissional para seleção de itens em modais, implementando:
 * - WCAG 2.1 Level AA (acessibilidade completa)
 * - Navegação por teclado (setas, Home, End, Enter, Esc)
 * - Suporte a leitores de tela (VoiceOver, NVDA, JAWS)
 * - Gestão de foco com restauração automática
 * - Anúncios ao vivo (LiveAnnouncer)
 * - Customização completa de narração e navegação
 * - Tipagem genérica TypeScript
 * 
 * @template T - Tipo do valor das opções (padrão: string)
 * 
 * @example
 * ```html
 * <app-modal-select-generic
 *   [isOpen]="modalAberto"
 *   titulo="Selecione o mês"
 *   [options]="meses"
 *   [selectedValue]="mesSelecionado"
 *   (confirmar)="aoConfirmar($event)"
 *   (cancelar)="aoCancelar()"
 * />
 * ```
 * 
 * @example Com customização avançada
 * ```html
 * <app-modal-select-generic
 *   [isOpen]="isOpen"
 *   titulo="Escolha um produto"
 *   [options]="produtos"
 *   [selectedValue]="produtoAtual"
 *   [ariaLabelFn]="customAriaLabel"
 *   [navigationHandlerFn]="customNavigation"
 *   [config]="{showCheckIcon: true, maxHeight: '300px'}"
 *   (confirmar)="onConfirm($event)"
 *   (cancelar)="onCancel()"
 * />
 * ```
 */
@Component({
  selector: 'app-modal-select-generic',
  standalone: true,
  imports: [CommonModule, FocusTrapDirective],
  templateUrl: './modal-select-generic.component.html',
  styleUrls: ['./modal-periodo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.modal-periodo-host]': 'true',
    '[class.modal-periodo-host--open]': 'isOpen()'
  }
})
export class ModalSelectGenericComponent<T = string> implements AfterViewInit, OnDestroy {
  // ============================================================================
  // INPUTS - Configuração do Componente
  // ============================================================================
  
  /** Se o modal está aberto ou fechado */
  readonly isOpen = input.required<boolean>();
  
  /** Título exibido no topo do modal */
  readonly titulo = input.required<string>();
  
  /** Lista de opções disponíveis para seleção */
  readonly options = input.required<readonly ModalSelectOption<T>[]>();
  
  /** Valor atualmente selecionado (pode ser null) */
  readonly selectedValue = input<T | null>(null);
  
  /** Função customizada para gerar aria-label dos itens */
  readonly ariaLabelFn = input<AriaLabelGeneratorFn<T> | undefined>(undefined);
  
  /** Função customizada para narração durante navegação */
  readonly navigationAnnouncementFn = input<NavigationAnnouncementFn<T> | undefined>(undefined);
  
  /** Função customizada para controlar navegação por teclado */
  readonly navigationHandlerFn = input<NavigationHandlerFn<T> | undefined>(undefined);
  
  /** Texto do botão de cancelar */
  readonly cancelText = input<string>('Cancelar');
  
  /** Texto do botão de confirmar */
  readonly confirmText = input<string>('Confirmar');
  
  /** Configurações de estilo e comportamento */
  readonly config = input<ModalSelectConfig>({
    showCheckIcon: true,
    maxHeight: '227px'
  });

  // ============================================================================
  // OUTPUTS - Eventos Emitidos
  // ============================================================================
  
  /** Emitido quando usuário confirma uma seleção */
  readonly confirmar = output<ModalSelectOption<T>>();
  
  /** Emitido quando usuário cancela o modal */
  readonly cancelar = output<void>();

  // ============================================================================
  // DEPENDÊNCIAS INJETADAS
  // ============================================================================
  
  /** Serviço para anúncios ao vivo (leitores de tela) */
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  
  /** Referência para cleanup automático */
  private readonly destroyRef = inject(DestroyRef);
  
  /** Para forçar detecção de mudanças quando necessário */
  private readonly cdr = inject(ChangeDetectorRef);
  
  /** Referência para o elemento de anúncios (aria-live) */
  readonly modalAnnouncer = viewChild<ElementRef<HTMLElement>>('modalAnnouncer');
  
  /** Referência para o container principal do modal */
  readonly modalContent = viewChild<ElementRef<HTMLElement>>('modalContent');
  
  /** Referência para o elemento de título */
  readonly modalTitle = viewChild<ElementRef<HTMLElement>>('modalTitle');

  // ============================================================================
  // ESTADO INTERNO - Signals Reativos
  // ============================================================================
  
  /** ID único para ARIA (aria-labelledby) */
  readonly modalId = `modal-${Math.random().toString(36).substring(2, 9)}`;
  
  /** Valor atualmente selecionado internamente */
  readonly currentValue = signal<T | null>(null);
  
  /** Índice do item com foco */
  readonly focusedIndex = signal<number>(0);
  
  /** Mensagem de anúncio de seleção */
  readonly anuncioSelecao = signal<string>('');
  
  /** Se está navegando por teclado */
  readonly isNavigating = signal<boolean>(false);
  
  /** Mensagem de abertura do modal */
  readonly modalOpeningAnnouncement = signal<string>('');
  
  /** Mensagem de título (uso interno) */
  private readonly titleAnnouncement = signal<string>('');
  
  /** Flag para evitar conflitos de navegação */
  private isItemProcessingKey = false;

  /** Se o modal já foi aberto alguma vez (evita narração inicial incorreta) */
  private hasBeenOpened = false;
  
  /** Estado anterior do isOpen (detecta transições reais) */
  private previousIsOpen = false;

  /** Handlers de eventos (para cleanup correto) */
  private titleKeyDownHandler: ((event: KeyboardEvent) => void) | null = null;
  private titleFocusHandler: (() => void) | null = null;
  private titleBlurHandler: (() => void) | null = null;

  /** Elemento que tinha foco antes do modal abrir */
  private elementFocusedBeforeModal: HTMLElement | null = null;

  // ============================================================================
  // COMPUTED - Valores Derivados
  // ============================================================================

  /** Se pode confirmar (tem valor selecionado) */
  readonly canConfirm = computed(() => this.currentValue() !== null);
  
  /** Opção atualmente selecionada (objeto completo) */
  readonly currentOption = computed(() => {
    const value = this.currentValue();
    return this.options().find(opt => opt.value === value) || null;
  });

  // ============================================================================
  // EFFECTS - Reatividade Automática
  // ============================================================================

  /**
   * Effect para limpar narração quando modal fecha
   */
  private readonly modalOpeningEffect = effect(() => {
    const isOpen = this.isOpen();
    
    if (!isOpen) {
      this.modalOpeningAnnouncement.set('');
      this.anuncioSelecao.set('');
      this.titleAnnouncement.set('');
      this.liveAnnouncer.clear();
    }
  });

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================
  
  constructor() {
    // Sincronizar valor inicial
    effect(() => {
      const initialValue = this.selectedValue();
      this.currentValue.set(initialValue);
      
      if (initialValue !== null) {
        const index = this.findOptionIndex(initialValue);
        if (index >= 0) {
          this.focusedIndex.set(index);
        }
      }
    }, { allowSignalWrites: true });

    // Gerenciar abertura/fechamento
    effect(() => {
      const currentIsOpen = this.isOpen();
      const wasOpen = this.previousIsOpen;
      
      this.previousIsOpen = currentIsOpen;
      
      if (currentIsOpen && !wasOpen) {
        // Abriu
        this.modalOpeningAnnouncement.set('');
        this.anuncioSelecao.set('');
        this.titleAnnouncement.set('');
        this.handleModalOpen();
      } else if (!currentIsOpen && wasOpen) {
        // Fechou
        this.handleModalClose();
      }
    }, { allowSignalWrites: true });

    // Cleanup automático
    this.destroyRef.onDestroy(() => {
      this.cleanupTitleEventListeners();
    });
  }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  /**
   * Configura event listeners após view estar pronta
   */
  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.setupTitleEventListeners();
    });
  }

  /**
   * Limpa event listeners ao destruir componente
   */
  ngOnDestroy(): void {
    this.cleanupTitleEventListeners();
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - Abertura/Fechamento
  // ============================================================================

  /**
   * Manipula abertura do modal
   * - Captura elemento com foco anterior
   * - Oculta conteúdo da página
   * - Configura foco inicial
   * - Anuncia abertura para leitores de tela
   */
  private handleModalOpen(): void {
    this.elementFocusedBeforeModal = document.activeElement as HTMLElement;
    this.hasBeenOpened = true;
    
    this.liveAnnouncer.clear();
    this.modalOpeningAnnouncement.set('');
    this.anuncioSelecao.set('');
    
    this.resetState();
    
    requestAnimationFrame(() => {
      this.hidePageContent();
      this.setupTitleEventListeners();
      
      if (this.isOpen()) {
        this.announceModalOpening();
      }
      
      requestAnimationFrame(() => {
        if (this.isOpen()) {
          this.setupInitialFocus();
        }
      });
    });
  }

  /**
   * Manipula fechamento do modal
   * - Restaura visibilidade do conteúdo da página
   * - Restaura foco para elemento anterior
   * - Anuncia fechamento para leitores de tela
   */
  private handleModalClose(): void {
    if (!this.hasBeenOpened) {
      this.restorePageContent();
      return;
    }
    
    this.restorePageContent();
    this.resetState();
    
    const titulo = this.titulo();
    const mensagem = titulo ? `${titulo} fechada` : 'Modal fechada';
    
    this.modalOpeningAnnouncement.set('');
    this.anuncioSelecao.set('');
    this.liveAnnouncer.clear();
    
    setTimeout(() => {
      if (this.elementFocusedBeforeModal && document.body.contains(this.elementFocusedBeforeModal)) {
        this.elementFocusedBeforeModal.focus();
        this.elementFocusedBeforeModal = null;
      }

      if (!this.isOpen()) {
        this.liveAnnouncer.announce(mensagem, 'assertive');
      }
    }, 150);
  }

  /**
   * Oculta conteúdo da página (aria-hidden) exceto o modal
   */
  private hidePageContent(): void {
    const selectors = [
      'main', 'header', 'footer', 'nav', 'aside', 'section',
      '[role="main"]', '[role="navigation"]', '[role="banner"]',
      '[role="contentinfo"]', '[role="complementary"]'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const isInsideModal = el.closest('.modal-backdrop') !== null;
        if (!isInsideModal) {
          el.setAttribute('aria-hidden', 'true');
        }
      });
    });
  }

  /**
   * Restaura visibilidade do conteúdo da página
   */
  private restorePageContent(): void {
    document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
      const isInsideModal = el.closest('.modal-backdrop') !== null;
      if (!isInsideModal) {
        el.removeAttribute('aria-hidden');
      }
    });
  }

  /**
   * Reseta estado interno do modal
   */
  private resetState(): void {
    this.isNavigating.set(false);
    this.anuncioSelecao.set('');
    this.liveAnnouncer.clear();
  }

  /**
   * Configura foco inicial no título do modal
   */
  private setupInitialFocus(): void {
    this.updateTabIndices();
    
    const titleElement = this.modalTitle()?.nativeElement;
    if (titleElement) {
      titleElement.focus();
    }
  }

  /**
   * Anuncia abertura do modal para leitores de tela
   * Usa delay adequado para garantir que leitor está pronto
   */
  private announceModalOpening(): void {
    const titulo = this.titulo();
    if (!titulo || !this.isOpen()) return;
    
    const mensagem = `${titulo}, modal aberta`;
    
    this.anuncioSelecao.set('');
    this.titleAnnouncement.set('');
    
    this.modalOpeningAnnouncement.set(mensagem);
    this.cdr.detectChanges();
    
    setTimeout(() => {
      if (!this.isOpen()) return;
      this.liveAnnouncer.announce(mensagem, 'assertive');
    }, 1000);
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - Navegação e Foco
  // ============================================================================

  /**
   * Encontra índice de uma opção pelo valor
   */
  private findOptionIndex(value: T): number {
    return this.options().findIndex(opt => opt.value === value);
  }

  /**
   * Calcula próximo índice baseado na tecla pressionada
   */
  private calculateNextIndex(key: string, currentIndex: number, total: number): number {
    const isFromTitle = currentIndex === -1;
    
    if (isFromTitle) {
      return this.getInitialIndexFromKey(key, total);
    }
    
    return this.getNextIndexFromKey(key, currentIndex, total);
  }

  /**
   * Obtém índice inicial quando navegando do título
   */
  private getInitialIndexFromKey(key: string, total: number): number {
    const goToFirst = ['ArrowDown', 'ArrowRight', 'Home'].includes(key);
    return goToFirst ? 0 : total - 1;
  }

  /**
   * Obtém próximo índice durante navegação na lista
   */
  private getNextIndexFromKey(key: string, currentIndex: number, total: number): number {
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        return currentIndex < total - 1 ? currentIndex + 1 : 0;
      case 'ArrowUp':
      case 'ArrowLeft':
        return currentIndex > 0 ? currentIndex - 1 : total - 1;
      case 'Home':
        return 0;
      case 'End':
        return total - 1;
      default:
        return currentIndex;
    }
  }

  /**
   * Atualiza tabindex de todos os itens (roving tabindex pattern)
   */
  private updateTabIndices(): void {
    const focusedIdx = this.focusedIndex();
    this.options().forEach((opt, idx) => {
      const item = this.getItemElement(opt.value);
      if (item) {
        item.setAttribute('tabindex', idx === focusedIdx ? '0' : '-1');
      }
    });
  }

  /**
   * Obtém elemento DOM de um item pelo valor
   */
  private getItemElement(value: T): HTMLElement | null {
    const id = `option-${this.getOptionId(value)}`;
    return document.getElementById(id);
  }

  /**
   * Torna item acessível (remove aria-hidden e configura containers)
   */
  private makeItemAccessible(item: HTMLElement): void {
    item.removeAttribute('aria-hidden');

    const scrollContainer = item.closest('.modal-scroll-container');
    if (scrollContainer) {
      scrollContainer.setAttribute('aria-hidden', 'true');
      scrollContainer.setAttribute('role', 'presentation');
    }
    
    const modalContent = item.closest('.modal-content');
    if (modalContent) {
      modalContent.removeAttribute('role');
    }
  }

  /**
   * Foca em um item específico
   * Garante que foco fica no item e anuncia para leitores de tela
   */
  private focusItem(index: number, option: ModalSelectOption<T>, navigationKey?: string): void {
    const item = this.getItemElement(option.value);
    if (!item) return;

    item.setAttribute('tabindex', '0');
    this.makeItemAccessible(item);
    this.updateTabIndices();
    this.cdr.markForCheck();

    const applyFocus = (): boolean => {
      try {
        item.focus({ preventScroll: true });
        
        if (document.activeElement === item) {
          if (this.isNavigating()) {
            this.announceItem(option, index, navigationKey);
          }
          return true;
        }
      } catch (e) {
        console.warn('Erro ao focar item:', e);
      }
      return false;
    };

    if (applyFocus()) return;

    requestAnimationFrame(() => {
      if (applyFocus()) return;
      
      setTimeout(() => applyFocus(), 50);
    });
  }

  /**
   * Anuncia item para leitor de tela durante navegação
   */
  private announceItem(option: ModalSelectOption<T>, index: number, navigationKey?: string): void {
    const customNavFn = this.navigationAnnouncementFn();
    
    if (customNavFn && navigationKey) {
      const total = this.options().length;
      const isSelected = this.isSelected(option.value);
      const announcement = customNavFn(option, index, total, isSelected, navigationKey);
      this.announceCustom(announcement, 'polite');
    } else {
      const announcement = this.getCustomAnnouncement(option, index);
      this.announceCustom(announcement, 'polite');
    }
  }

  /**
   * Anuncia mensagem usando aria-live
   */
  private announceWithLiveAnnouncer(message: string, priority: 'polite' | 'assertive' = 'assertive'): void {
    if (!message?.trim()) return;
    
    this.anuncioSelecao.set('');
    
    requestAnimationFrame(() => {
      this.anuncioSelecao.set(message);
    });
  }

  /**
   * Anuncia mensagem customizada
   */
  private announceCustom(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.announceWithLiveAnnouncer(message, priority);
  }

  /**
   * Navega para um item específico
   * Usa função customizada se fornecida
   */
  private navigateToItem(key: string, currentIndex: number): void {
    const options = this.options();
    if (options.length === 0) return;

    const customNavFn = this.navigationHandlerFn();
    let nextIndex: number | null = null;
    
    if (customNavFn) {
      nextIndex = customNavFn(key, currentIndex, options.length, options);
    }
    
    if (nextIndex === null) {
      nextIndex = this.calculateNextIndex(key, currentIndex, options.length);
    }
    
    if (nextIndex < 0 || nextIndex >= options.length) return;
    
    const nextOption = options[nextIndex];
    if (!nextOption) return;

    this.focusedIndex.set(nextIndex);
    this.cdr.markForCheck();
    
    requestAnimationFrame(() => {
      this.focusItem(nextIndex!, nextOption, key);
    });
  }

  /**
   * Anuncia seleção de um item
   * Mantém foco no item selecionado
   */
  private announceSelection(message: string): void {
    const currentFocusedElement = document.activeElement as HTMLElement;
    
    const isItemFocused = currentFocusedElement?.closest('.modal-label') !== null || 
                          currentFocusedElement?.classList.contains('modal-label') === true;
    
    if (!isItemFocused) {
      this.anuncioSelecao.set(message);
      return;
    }
    
    if (currentFocusedElement) {
      currentFocusedElement.blur();
    }
    
    setTimeout(() => {
      this.anuncioSelecao.set(message);
      
      setTimeout(() => {
        if (currentFocusedElement && 
            document.body.contains(currentFocusedElement) &&
            (currentFocusedElement.closest('.modal-label') !== null ||
             currentFocusedElement.classList.contains('modal-label') === true)) {
          currentFocusedElement.focus();
        }
      }, 350);
    }, 50);
  }

  /**
   * Atualiza aria-labels de todos os itens
   */
  private updateAllAriaLabels(): void {
    this.options().forEach((opt, idx) => {
      const item = this.getItemElement(opt.value);
      if (item) {
        const newAriaLabel = this.getCustomAnnouncement(opt, idx);
        item.setAttribute('aria-label', newAriaLabel);
      }
    });
  }

  // ============================================================================
  // EVENT LISTENERS - Título do Modal
  // ============================================================================

  /**
   * Configura event listeners no título
   */
  private setupTitleEventListeners(): void {
    const titleElement = this.modalTitle()?.nativeElement;
    if (!titleElement) return;

    this.titleKeyDownHandler = (event: KeyboardEvent) => this.handleTitleKeyDown(event);
    this.titleFocusHandler = () => this.handleTitleFocus();
    this.titleBlurHandler = () => this.handleTitleBlur();

    titleElement.addEventListener('keydown', this.titleKeyDownHandler, { passive: false });
    titleElement.addEventListener('focus', this.titleFocusHandler);
    titleElement.addEventListener('blur', this.titleBlurHandler);
  }

  /**
   * Remove event listeners do título (previne memory leaks)
   */
  private cleanupTitleEventListeners(): void {
    const titleElement = this.modalTitle()?.nativeElement;
    if (!titleElement) return;

    if (this.titleKeyDownHandler) {
      titleElement.removeEventListener('keydown', this.titleKeyDownHandler);
      this.titleKeyDownHandler = null;
    }

    if (this.titleFocusHandler) {
      titleElement.removeEventListener('focus', this.titleFocusHandler);
      this.titleFocusHandler = null;
    }

    if (this.titleBlurHandler) {
      titleElement.removeEventListener('blur', this.titleBlurHandler);
      this.titleBlurHandler = null;
    }
  }

  /**
   * Handler quando título recebe foco
   */
  private handleTitleFocus(): void {
    // Título está oculto - não fazer nada
  }

  /**
   * Handler quando título perde foco
   */
  private handleTitleBlur(): void {
    // Reservado para futuras implementações
  }

  /**
   * Handler de teclado no título
   * Apenas processa quando foco está no título
   */
  private handleTitleKeyDown(event: KeyboardEvent): void {
    if (this.isItemProcessingKey) return;
    if (!this.isOpen()) return;
    
    const activeElement = document.activeElement as HTMLElement;
    const titleElement = this.modalTitle()?.nativeElement;
    
    if (!activeElement || !titleElement) return;
    
    const isItemFocused = activeElement.classList.contains('modal-label') ||
                          activeElement.closest('.modal-label') !== null;
    
    if (isItemFocused) return;
    
    const isTitleFocused = activeElement === titleElement;
    if (!isTitleFocused) return;
    
    const target = event.target as HTMLElement;
    const isEventFromTitle = target === titleElement;
    if (!isEventFromTitle) return;
    
    if (event.key === 'Tab' || event.key === 'Escape') return;
    
    const navigationKeys = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'];
    const isNavigationKey = navigationKeys.includes(event.key);
    
    if (!isNavigationKey) return;
    
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    this.isNavigating.set(true);
    
    requestAnimationFrame(() => {
      this.navigateToItem(event.key, -1);
    });
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS - Handlers de Eventos
  // ============================================================================

  /**
   * Handler de teclado em um item
   * Gerencia navegação e seleção
   */
  onKeyDown(event: KeyboardEvent, currentValue: T, currentIndex: number): void {
    if (!this.isOpen()) return;
    
    this.isItemProcessingKey = true;
    event.stopImmediatePropagation();
    event.stopPropagation();
    
    // Seleção com Space/Enter
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.selectOption(currentValue);
      requestAnimationFrame(() => {
        this.isItemProcessingKey = false;
      });
      return;
    }

    // Navegação
    const isNavigationKey = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key);
    if (!isNavigationKey) {
      requestAnimationFrame(() => {
        this.isItemProcessingKey = false;
      });
      return;
    }

    event.preventDefault();
    
    this.isNavigating.set(true);
    this.navigateToItem(event.key, currentIndex);
    
    requestAnimationFrame(() => {
      this.isItemProcessingKey = false;
    });
  }

  /**
   * Handler quando item recebe foco
   * Garante acessibilidade completa
   */
  onItemFocus(index: number, option: ModalSelectOption<T>): void {
    const item = this.getItemElement(option.value);
    if (item) {
      this.makeItemAccessible(item);
      
      item.setAttribute('tabindex', '0');
      
      // Limpar atributos que possam causar narração de "grupo"
      item.removeAttribute('aria-posinset');
      item.removeAttribute('aria-setsize');
      item.removeAttribute('aria-owns');
      item.removeAttribute('aria-describedby');
      item.removeAttribute('aria-controls');
      item.removeAttribute('role');
      item.removeAttribute('aria-expanded');
      item.removeAttribute('aria-haspopup');
      item.removeAttribute('aria-selected');
      item.removeAttribute('aria-checked');
      
      const scrollContainer = item.closest('.modal-scroll-container');
      if (scrollContainer) {
        scrollContainer.setAttribute('aria-hidden', 'true');
        scrollContainer.setAttribute('role', 'presentation');
        scrollContainer.removeAttribute('aria-label');
        scrollContainer.removeAttribute('aria-labelledby');
        scrollContainer.removeAttribute('aria-describedby');
        scrollContainer.removeAttribute('aria-owns');
      }
      
      const modalContent = item.closest('.modal-content');
      if (modalContent) {
        modalContent.removeAttribute('role');
        modalContent.removeAttribute('aria-describedby');
        modalContent.removeAttribute('aria-owns');
        modalContent.removeAttribute('aria-label');
        modalContent.removeAttribute('aria-labelledby');
      }
      
      // Ocultar outros itens
      const allItems = document.querySelectorAll('.modal-label');
      allItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.setAttribute('aria-hidden', 'true');
        }
      });
      
      item.removeAttribute('aria-hidden');
    }
    
    this.focusedIndex.set(index);
    this.updateTabIndices();
    
    // Garantir foco no item
    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      const isStillOnItem = activeElement === item || 
                           activeElement?.closest('.modal-label') === item;
      
      if (!isStillOnItem && item) {
        item.focus({ preventScroll: true });
      }
    });
    
    if (this.isNavigating()) {
      this.announceItem(option, index);
    }
  }

  /**
   * Seleciona uma opção
   */
  selectOption(value: T): void {
    if (this.currentValue() === value) return;
    
    this.currentValue.set(value);
    
    const index = this.findOptionIndex(value);
    if (index === -1) return;
    
    const option = this.options()[index];
    if (!option) return;
    
    this.focusedIndex.set(index);
    this.updateTabIndices();
    this.updateAllAriaLabels();
    
    const announcement = this.getCustomAnnouncement(option, index);
    this.announceSelection(announcement);
  }

  /**
   * Handler de clique em item
   */
  onItemClick(value: T): void {
    this.selectOption(value);
  }

  /**
   * Handler de confirmação
   */
  onConfirmar(): void {
    const option = this.currentOption();
    if (option) {
      this.confirmar.emit(option);
    }
  }

  /**
   * Handler de cancelamento
   */
  onCancelar(): void {
    this.cancelar.emit();
  }

  /**
   * Handler de clique no backdrop
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancelar();
    }
  }

  /**
   * Handler de clique no modal (previne propagação)
   */
  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS - Utilitários
  // ============================================================================

  /**
   * Gera mensagem de narração customizada para um item
   * Formato: "x de total, selecionado/não selecionado, label"
   */
  getCustomAnnouncement(option: ModalSelectOption<T>, index: number): string {
    const position = index + 1;
    const total = this.options().length;
    const status = this.isSelected(option.value) ? 'selecionado' : 'não selecionado';
    
    const customFn = this.ariaLabelFn();
    if (customFn) {
      return customFn(option, index, total, this.isSelected(option.value));
    }
    
    return `${position} de ${total}, ${status}, ${option.label}`;
  }

  /**
   * Gera ID único para uma opção
   */
  getOptionId(value: T): string {
    return String(value).replace(/\s+/g, '-').toLowerCase();
  }

  /**
   * Verifica se valor está selecionado
   */
  isSelected(value: T): boolean {
    return this.currentValue() === value;
  }

  /**
   * Retorna ID do modal
   */
  getModalId(): string {
    return 'modal-select-generic';
  }

  /**
   * Obtém aria-label para uma opção
   */
  getAriaLabel(option: ModalSelectOption<T>, index: number): string {
    return this.getCustomAnnouncement(option, index);
  }
}
