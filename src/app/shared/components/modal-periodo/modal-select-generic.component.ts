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
// INTERFACES
// ============================================================================

/**
 * Interface genérica para opções do modal
 */
export interface ModalSelectOption<T = string> {
  readonly value: T;
  readonly label: string;
}

/**
 * Configuração de estilo do modal
 */
export interface ModalSelectConfig {
  readonly showCheckIcon?: boolean;
  readonly maxHeight?: string;
  readonly backdropClass?: string;
  readonly contentClass?: string;
}

/**
 * Função para customizar a narração de acessibilidade de um item.
 */
export type AriaLabelGeneratorFn<T> = (
  option: ModalSelectOption<T>,
  index: number,
  total: number,
  isSelected: boolean
) => string;

/**
 * Função para customizar a narração durante a navegação (foco em um item).
 */
export type NavigationAnnouncementFn<T> = (
  option: ModalSelectOption<T>,
  index: number,
  total: number,
  isSelected: boolean,
  navigationKey: string
) => string;

/**
 * Função para customizar o comportamento de navegação.
 * Permite definir como calcular o próximo índice baseado na tecla pressionada.
 */
export type NavigationHandlerFn<T> = (
  key: string,
  currentIndex: number,
  total: number,
  options: readonly ModalSelectOption<T>[]
) => number | null; // Retorna null para usar comportamento padrão

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Modal de Seleção Genérico - Componente Profissional e Acessível
 * 
 * Modal completamente parametrizável e agnóstico para seleção de itens.
 * Implementa as melhores práticas de acessibilidade (WCAG 2.1 AA).
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
  // INPUTS
  // ============================================================================
  
  readonly isOpen = input.required<boolean>();
  readonly titulo = input.required<string>();
  readonly options = input.required<readonly ModalSelectOption<T>[]>();
  readonly selectedValue = input<T | null>(null);
  readonly ariaLabelFn = input<AriaLabelGeneratorFn<T> | undefined>(undefined);
  readonly navigationAnnouncementFn = input<NavigationAnnouncementFn<T> | undefined>(undefined);
  readonly navigationHandlerFn = input<NavigationHandlerFn<T> | undefined>(undefined);
  readonly cancelText = input<string>('Cancelar');
  readonly confirmText = input<string>('Confirmar');
  readonly config = input<ModalSelectConfig>({
    showCheckIcon: true,
    maxHeight: '227px'
  });

  // ============================================================================
  // OUTPUTS
  // ============================================================================
  
  readonly confirmar = output<ModalSelectOption<T>>();
  readonly cancelar = output<void>();

  // ============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ============================================================================
  
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  
  readonly modalAnnouncer = viewChild<ElementRef<HTMLElement>>('modalAnnouncer');
  readonly modalContent = viewChild<ElementRef<HTMLElement>>('modalContent');
  readonly modalTitle = viewChild<ElementRef<HTMLElement>>('modalTitle');

  // ============================================================================
  // STATE
  // ============================================================================
  
  /**
   * ID único para o modal (usado para aria-labelledby)
   */
  readonly modalId = `modal-${Math.random().toString(36).substring(2, 9)}`;
  
  readonly currentValue = signal<T | null>(null);
  readonly focusedIndex = signal<number>(0);
  readonly anuncioSelecao = signal<string>('');
  readonly isNavigating = signal<boolean>(false);
  
  /**
   * Signal para controlar narração da abertura do modal
   * Reativo - atualiza automaticamente quando o modal abre
   * Público para uso no template
   */
  readonly modalOpeningAnnouncement = signal<string>('');
  
  /**
   * Signal para controlar narração do título
   * Reativo - atualiza quando o título muda ou recebe foco
   */
  private readonly titleAnnouncement = signal<string>('');
  
  /**
   * Flag para indicar que um item está processando evento de teclado
   * Usado para evitar que o título interfira na navegação
   */
  private isItemProcessingKey = false;

  /**
   * Referências para os handlers de eventos (bound methods)
   * Necessário para poder remover os listeners corretamente
   */
  private titleKeyDownHandler: ((event: KeyboardEvent) => void) | null = null;
  private titleFocusHandler: (() => void) | null = null;
  private titleBlurHandler: (() => void) | null = null;

  readonly canConfirm = computed(() => this.currentValue() !== null);
  
  readonly currentOption = computed(() => {
    const value = this.currentValue();
    return this.options().find(opt => opt.value === value) || null;
  });

  // ============================================================================
  // EFFECTS - Controle Reativo de Narração (Angular Signals)
  // ============================================================================

  /**
   * Effect para limpar narração quando modal fecha
   * A narração de abertura é feita pelo método announceModalOpening()
   */
  private readonly modalOpeningEffect = effect(() => {
    const isOpen = this.isOpen();
    
    if (!isOpen) {
      // Limpar narração quando modal fecha
      this.modalOpeningAnnouncement.set('');
      this.titleAnnouncement.set('');
      this.liveAnnouncer.clear();
    }
  });

  /**
   * Effect para anunciar título quando recebe foco
   * Reativo - atualiza automaticamente quando necessário
   */
  private readonly titleFocusEffect = effect(() => {
    const titleAnnouncement = this.titleAnnouncement();
    
    if (titleAnnouncement && this.isOpen()) {
      // Anunciar título de forma polida quando recebe foco
      this.announceWithLiveAnnouncer(titleAnnouncement, 'polite');
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

    // Effect: Gerenciar abertura/fechamento
    effect(() => {
      if (this.isOpen()) {
        this.handleModalOpen();
      } else {
        this.handleModalClose();
      }
    }, { allowSignalWrites: true });

    // Configurar cleanup quando componente for destruído
    this.destroyRef.onDestroy(() => {
      this.cleanupTitleEventListeners();
    });
  }

  // ============================================================================
  // LIFECYCLE HOOKS - Gerenciamento de Event Listeners via JavaScript
  // ============================================================================

  /**
   * Configura event listeners nativos após a view ser inicializada
   * REFATORADO: Usa JavaScript nativo ao invés de event bindings do Angular
   */
  ngAfterViewInit(): void {
    // Aguardar próximo ciclo para garantir que o elemento está no DOM
    requestAnimationFrame(() => {
      this.setupTitleEventListeners();
    });
  }

  /**
   * Limpa event listeners quando componente é destruído
   */
  ngOnDestroy(): void {
    this.cleanupTitleEventListeners();
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - LÓGICA DE NEGÓCIO
  // ============================================================================

  /**
   * Manipula abertura da modal
   * REFATORADO: Reconfigura event listeners quando modal abre
   */
  private handleModalOpen(): void {
    this.resetState();
    
    // Aguardar modal estar no DOM antes de ocultar conteúdo da página
    requestAnimationFrame(() => {
      this.hidePageContent();
      this.setupTitleEventListeners();
    });
    
    // Anunciar abertura do modal após um pequeno delay
    setTimeout(() => {
      this.announceModalOpening();
    }, 150);
    
    // Configurar foco no título após a narração
    setTimeout(() => {
      this.setupInitialFocus();
    }, 800);
  }

  /**
   * Manipula fechamento da modal
   * REFATORADO: Limpa event listeners quando modal fecha
   */
  private handleModalClose(): void {
    this.restorePageContent();
    this.resetState();
    // Não remover listeners aqui - serão removidos no ngOnDestroy
    // Mas podemos limpar estado específico se necessário
  }

  /**
   * Oculta conteúdo da página (exceto modal)
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
   * Reseta estado interno
   */
  private resetState(): void {
    this.isNavigating.set(false);
    this.anuncioSelecao.set('');
    this.liveAnnouncer.clear();
  }

  /**
   * Configura foco inicial no título
   */
  private setupInitialFocus(): void {
    this.updateTabIndices();
    
    // Focar no título após DOM estar pronto
    requestAnimationFrame(() => {
      const titleElement = this.modalTitle()?.nativeElement;
      if (titleElement) {
        titleElement.focus();
      }
    });
  }

  /**
   * Anuncia mensagem usando LiveAnnouncer do Angular CDK
   * Método centralizado para narração profissional
   */
  private announceWithLiveAnnouncer(message: string, priority: 'polite' | 'assertive' = 'assertive'): void {
    if (!message?.trim()) return;
    
    // Limpar anúncios anteriores para evitar sobreposição
    this.liveAnnouncer.clear();
    
    // Aguardar um frame para garantir que a limpeza foi processada
    requestAnimationFrame(() => {
      this.liveAnnouncer.announce(message, priority);
      
      // Atualizar signal para sincronização com aria-live
      this.anuncioSelecao.set(message);
    });
  }

  /**
   * Anuncia abertura da modal e título
   * REFATORADO: Usa apenas região aria-live nativa para máxima confiabilidade
   */
  private announceModalOpening(): void {
    const titulo = this.titulo();
    if (titulo) {
      // Narração personalizada: "Selecione o mês, modal aberta"
      const mensagem = `${titulo}, modal aberta`;
      
      // Primeiro limpar a região para garantir que a mudança seja detectada
      this.modalOpeningAnnouncement.set('');
      this.cdr.detectChanges();
      
      // Depois definir a mensagem após um pequeno delay
      setTimeout(() => {
        this.modalOpeningAnnouncement.set(mensagem);
        this.cdr.detectChanges();
      }, 100);
    }
  }

  /**
   * Encontra índice de uma opção pelo valor
   */
  private findOptionIndex(value: T): number {
    return this.options().findIndex(opt => opt.value === value);
  }

  /**
   * Calcula próximo índice baseado na tecla e índice atual
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
   * Atualiza tabindex de todos os itens
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
   * Obtém elemento DOM de um item
   */
  private getItemElement(value: T): HTMLElement | null {
    const id = `option-${this.getOptionId(value)}`;
    return document.getElementById(id);
  }

  /**
   * Torna item acessível (remove aria-hidden)
   * CORRIGIDO: Containers intermediários removidos para evitar narração "grupo"
   */
  private makeItemAccessible(item: HTMLElement): void {
    item.removeAttribute('aria-hidden');

    // Garantir que o container de scroll permaneça oculto
    const scrollContainer = item.closest('.modal-scroll-container');
    if (scrollContainer) {
      scrollContainer.setAttribute('aria-hidden', 'true');
      scrollContainer.setAttribute('role', 'none');
    }
  }

  /**
   * Foca em um item específico
   * IMPORTANTE: Garante que o foco fica no item, nunca volta para o título
   */
  private focusItem(index: number, option: ModalSelectOption<T>, navigationKey?: string): void {
    const item = this.getItemElement(option.value);
    if (!item) return;

    // Preparar item para foco
    item.setAttribute('tabindex', '0');
    this.makeItemAccessible(item);
    this.updateTabIndices();
    this.cdr.markForCheck();

    // Aplicar foco com múltiplas tentativas para garantir
    const applyFocus = (): boolean => {
      try {
        item.focus({ preventScroll: true });
        
        // Verificar se o foco foi aplicado corretamente
        if (document.activeElement === item) {
          // Narrar apenas se estiver navegando (não ao abrir)
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

    // Tentar focar imediatamente
    if (applyFocus()) {
      return;
    }

    // Tentar após requestAnimationFrame
    requestAnimationFrame(() => {
      if (applyFocus()) {
        return;
      }
      
      // Última tentativa após pequeno delay
      setTimeout(() => {
        applyFocus();
      }, 50);
    });
  }

  /**
   * Anuncia um item
   */
  /**
   * Anuncia item durante navegação
   * Usa função customizada se fornecida, senão usa a padrão
   */
  private announceItem(option: ModalSelectOption<T>, index: number, navigationKey?: string): void {
    const customNavFn = this.navigationAnnouncementFn();
    
    if (customNavFn && navigationKey) {
      const total = this.options().length;
      const isSelected = this.isSelected(option.value);
      const announcement = customNavFn(option, index, total, isSelected, navigationKey);
      this.announceCustom(announcement, 'polite');
    } else {
      // Usar narração padrão (aria-label)
      const announcement = this.getCustomAnnouncement(option, index);
      this.announceCustom(announcement, 'polite');
    }
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS - ACESSIBILIDADE
  // ============================================================================

  /**
   * Gera mensagem de narração customizada para um item
   */
  getCustomAnnouncement(option: ModalSelectOption<T>, index: number): string {
    const position = index + 1;
    const total = this.options().length;
    const status = this.isSelected(option.value) ? 'selecionado' : 'não selecionado';
    
    const customFn = this.ariaLabelFn();
    if (customFn) {
      return customFn(option, index, total, this.isSelected(option.value));
    }
    
    // Formato limpo: sem "grupo", sem "radio button", apenas informações essenciais
    return `${position} de ${total}, ${status}, ${option.label}`;
  }

  /**
   * Anuncia mensagem usando LiveAnnouncer
   * REFATORADO: Usa método centralizado para consistência
   */
  private announceCustom(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.announceWithLiveAnnouncer(message, priority);
  }

  /**
   * Configura event listeners nativos no título do modal
   * REFATORADO: Usa JavaScript puro ao invés de event bindings do Angular
   */
  private setupTitleEventListeners(): void {
    const titleElement = this.modalTitle()?.nativeElement;
    if (!titleElement) {
      return;
    }

    // Criar handlers bound para poder remover depois
    this.titleKeyDownHandler = (event: KeyboardEvent) => this.handleTitleKeyDown(event);
    this.titleFocusHandler = () => this.handleTitleFocus();
    this.titleBlurHandler = () => this.handleTitleBlur();

    // Adicionar listeners nativos
    titleElement.addEventListener('keydown', this.titleKeyDownHandler, { passive: false });
    titleElement.addEventListener('focus', this.titleFocusHandler);
    titleElement.addEventListener('blur', this.titleBlurHandler);
  }

  /**
   * Remove event listeners do título
   * Previne memory leaks
   */
  private cleanupTitleEventListeners(): void {
    const titleElement = this.modalTitle()?.nativeElement;
    if (!titleElement) {
      return;
    }

    // Remover listeners se existirem
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
   * Handler quando o título recebe foco
   * REFATORADO: Método privado usado por event listener nativo
   */
  private handleTitleFocus(): void {
    if (!this.isOpen()) return;
    
    // Atualizar signal de narração do título
    // O effect titleFocusEffect irá anunciar automaticamente
    const titulo = this.titulo();
    if (titulo) {
      // Narrar apenas o título quando receber foco (sem "caixa de diálogo")
      this.titleAnnouncement.set(titulo);
    }
    
    // Não resetar isNavigating aqui para evitar interferir com navegação em andamento
    // O estado de navegação é gerenciado pelos métodos de navegação
  }

  /**
   * Handler quando o título perde foco
   * REFATORADO: Método privado usado por event listener nativo
   */
  private handleTitleBlur(): void {
    // Não fazer nada aqui - deixar a navegação gerenciar o estado
    // Este handler pode ser usado para logging, analytics, etc. no futuro
  }

  /**
   * Handler de teclado no título
   * REFATORADO: Método privado usado por event listener nativo
   * IMPORTANTE: Só processa quando foco está NO TÍTULO, não interfere na navegação da lista
   * CORRIGIDO: Usa flag para garantir que itens têm prioridade absoluta
   */
  private handleTitleKeyDown(event: KeyboardEvent): void {
    // PRIORIDADE MÁXIMA: Se um item está processando, NÃO fazer NADA
    if (this.isItemProcessingKey) {
      return;
    }
    
    // Verificação inicial: modal deve estar aberto
    if (!this.isOpen()) {
      return;
    }
    
    // Obter elemento ativo de forma segura
    const activeElement = document.activeElement as HTMLElement;
    const titleElement = this.modalTitle()?.nativeElement;
    
    if (!activeElement || !titleElement) {
      return;
    }
    
    // PRIORIDADE 1: Se o foco está em um item, NÃO processar aqui
    const isItemFocused = activeElement.classList.contains('modal-label') ||
                          activeElement.closest('.modal-label') !== null;
    
    if (isItemFocused) {
      return;
    }
    
    // PRIORIDADE 2: Verificar se o foco está REALMENTE no título
    const isTitleFocused = activeElement === titleElement;
    
    if (!isTitleFocused) {
      return;
    }
    
    // PRIORIDADE 3: Verificar se o evento veio do título
    const target = event.target as HTMLElement;
    const isEventFromTitle = target === titleElement;
    
    if (!isEventFromTitle) {
      return;
    }
    
    // Permitir Tab e Escape passarem normalmente (navegação padrão)
    if (event.key === 'Tab' || event.key === 'Escape') {
      return;
    }
    
    // Só processar teclas de navegação quando foco está no título
    const navigationKeys = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'];
    const isNavigationKey = navigationKeys.includes(event.key);
    
    if (!isNavigationKey) {
      return;
    }
    
    // Prevenir comportamento padrão e propagação ANTES de processar
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    // Marcar que está navegando e navegar imediatamente
    this.isNavigating.set(true);
    
    requestAnimationFrame(() => {
      this.navigateToItem(event.key, -1);
    });
  }

  /**
   * Handler de teclado em um item
   * IMPORTANTE: Impede que eventos façam bubble e redirecionem foco
   * CORRIGIDO: Usa flag para garantir prioridade absoluta sobre o título
   */
  onKeyDown(event: KeyboardEvent, currentValue: T, currentIndex: number): void {
    if (!this.isOpen()) return;
    
    // PRIORIDADE MÁXIMA: Marcar que item está processando ANTES de qualquer coisa
    this.isItemProcessingKey = true;
    
    // Parar propagação IMEDIATAMENTE - isso impede que o título processe
    event.stopImmediatePropagation();
    event.stopPropagation();
    
    // Seleção
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.selectOption(currentValue);
      // Desmarcar flag após processar
      requestAnimationFrame(() => {
        this.isItemProcessingKey = false;
      });
      return;
    }

    // Navegação
    const isNavigationKey = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key);
    if (!isNavigationKey) {
      // Não é tecla de navegação - desmarcar e permitir comportamento padrão
      requestAnimationFrame(() => {
        this.isItemProcessingKey = false;
      });
      return;
    }

    // Prevenir comportamento padrão para teclas de navegação
    event.preventDefault();
    
    // Marcar navegação e processar
    this.isNavigating.set(true);
    this.navigateToItem(event.key, currentIndex);
    
    // Desmarcar flag após navegação ser iniciada
    requestAnimationFrame(() => {
      this.isItemProcessingKey = false;
    });
  }

  /**
   * Navega para um item específico
   * Usa função customizada de navegação se fornecida
   */
  private navigateToItem(key: string, currentIndex: number): void {
    const options = this.options();
    if (options.length === 0) return;

    // Tentar usar função customizada de navegação
    const customNavFn = this.navigationHandlerFn();
    let nextIndex: number | null = null;
    
    if (customNavFn) {
      nextIndex = customNavFn(key, currentIndex, options.length, options);
    }
    
    // Se função customizada retornou null ou não existe, usar comportamento padrão
    if (nextIndex === null) {
      nextIndex = this.calculateNextIndex(key, currentIndex, options.length);
    }
    
    // Validar índice
    if (nextIndex < 0 || nextIndex >= options.length) {
      return;
    }
    
    const nextOption = options[nextIndex];
    if (!nextOption) return;

    this.focusedIndex.set(nextIndex);
    this.cdr.markForCheck();
    
    requestAnimationFrame(() => {
      this.focusItem(nextIndex!, nextOption, key);
    });
  }

  /**
   * Handler ao focar em um item
   * IMPORTANTE: Garante que o foco permanece no item
   */
  onItemFocus(index: number, option: ModalSelectOption<T>): void {
    const item = this.getItemElement(option.value);
    if (item) {
      this.makeItemAccessible(item);
      
      // Garantir que o item tem tabindex="0" quando recebe foco
      item.setAttribute('tabindex', '0');
      
      // Remover qualquer atributo que possa causar narração "grupo" ou "com X itens"
      item.removeAttribute('aria-posinset');
      item.removeAttribute('aria-setsize');
      item.removeAttribute('aria-owns');
      item.removeAttribute('aria-describedby');
      item.removeAttribute('aria-controls');
      // Remover role="presentation" quando focado para que aria-label funcione
      // Mas manter sem role para evitar semântica de grupo
      item.removeAttribute('role');
      item.removeAttribute('aria-expanded');
      item.removeAttribute('aria-haspopup');
      item.removeAttribute('aria-selected');
      
      // Garantir que o container pai permaneça completamente oculto
      const scrollContainer = item.closest('.modal-scroll-container');
      if (scrollContainer) {
        scrollContainer.setAttribute('aria-hidden', 'true');
        scrollContainer.setAttribute('role', 'presentation');
        scrollContainer.removeAttribute('aria-label');
        scrollContainer.removeAttribute('aria-labelledby');
      }
      
      // Garantir que o diálogo não tenha atributos que possam causar "grupo"
      const dialog = item.closest('[role="dialog"]');
      if (dialog) {
        dialog.removeAttribute('aria-describedby');
        dialog.removeAttribute('aria-owns');
      }
      
      // Ocultar todos os outros itens para evitar que sejam interpretados como grupo
      const allItems = document.querySelectorAll('.modal-label');
      allItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.setAttribute('aria-hidden', 'true');
        }
      });
      
      // Garantir que o item focado está visível
      item.removeAttribute('aria-hidden');
    }
    
    this.focusedIndex.set(index);
    this.updateTabIndices();
    
    // Verificar se o foco realmente está no item (não no título)
    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      const isStillOnItem = activeElement === item || 
                           activeElement?.closest('.modal-label') === item;
      
      // Se o foco não está no item, forçar de volta
      if (!isStillOnItem && item) {
        item.focus({ preventScroll: true });
      }
    });
    
    // Narrar apenas se estiver navegando
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
   * Anuncia seleção de um item
   * IMPORTANTE: Mantém foco no item, não volta para título
   */
  private announceSelection(message: string): void {
    const currentFocusedElement = document.activeElement as HTMLElement;
    
    // Verificar se o foco está em um item (não no título)
    const isItemFocused = currentFocusedElement?.closest('.modal-label') !== null || 
                          currentFocusedElement?.classList.contains('modal-label') === true;
    
    // Se não está em um item, não fazer nada (evitar redirecionar foco)
    if (!isItemFocused) {
      this.anuncioSelecao.set(message);
      this.liveAnnouncer.announce(message, 'assertive');
      return;
    }
    
    // Se está em um item, fazer blur temporário apenas para narração
    if (currentFocusedElement) {
      currentFocusedElement.blur();
    }
    
    setTimeout(() => {
      this.anuncioSelecao.set(message);
      this.liveAnnouncer.announce(message, 'assertive');
      
      // Restaurar foco APENAS se ainda for um item (não título)
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
  // MÉTODOS PÚBLICOS - AÇÕES
  // ============================================================================

  onItemClick(value: T): void {
    this.selectOption(value);
  }

  onConfirmar(): void {
    const option = this.currentOption();
    if (option) {
      this.confirmar.emit(option);
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancelar();
    }
  }

  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS - UTILITÁRIOS
  // ============================================================================

  getOptionId(value: T): string {
    return String(value).replace(/\s+/g, '-').toLowerCase();
  }

  isSelected(value: T): boolean {
    return this.currentValue() === value;
  }

  getModalId(): string {
    return 'modal-select-generic';
  }

  getAriaLabel(option: ModalSelectOption<T>, index: number): string {
    return this.getCustomAnnouncement(option, index);
  }
}
