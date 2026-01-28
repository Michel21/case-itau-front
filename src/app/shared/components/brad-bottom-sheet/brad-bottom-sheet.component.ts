import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Renderer2,
  inject,
  signal,
  effect,
  runInInjectionContext,
  Injector,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FocusTrapDirective } from '../../directives/focus-trap.directive';

declare const LiquidCorp: any;

interface BsModalInstance {
  open: () => void;
  close: () => void;
}

/**
 * Componente Bottom Sheet com melhorias de acessibilidade para iOS VoiceOver
 */
@Component({
  selector: 'app-brad-bottom-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, FocusTrapDirective],
  templateUrl: './brad-bottom-sheet.component.html',
  styleUrls: ['./brad-bottom-sheet.component.scss']
})
export class BradBottomSheetComponent implements OnInit, OnDestroy {
  // Signals
  title = signal<string>('');
  subtitle = signal<string>('');
  isOpen = signal<boolean>(false);
  hasCloseIcon = signal<boolean>(true);
  botaoBaixarDesabilitado = signal<boolean>(true);
  formatoSelecionado = signal<'pdf' | 'xls' | null>(null);

  // Outputs
  @Output() onHabilitarBtBaixar = new EventEmitter<void>();
  @Output() onBaixarExtrato = new EventEmitter<void>();
  @Output() onRedirecionarParaVisualizarHtml = new EventEmitter<void>();

  // ViewChild
  @ViewChild(FocusTrapDirective, { static: false }) 
  focusTrapDirective?: FocusTrapDirective;
  
  @ViewChild('titleRef', { static: false }) 
  titleRef?: ElementRef<HTMLElement>;

  // Properties
  private bsModal!: BsModalInstance;
  private renderer = inject(Renderer2);
  private injector = inject(Injector);
  private mutationObserver?: MutationObserver;
  private previousActiveElement: HTMLElement | null = null;
  private focusTimeoutId?: number;
  private announcementTimeoutId?: number;

  constructor() {
    // Effect para habilitar botão quando formato for selecionado
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const formato = this.formatoSelecionado();
        this.botaoBaixarDesabilitado.set(formato === null);
      });
    });
  }

  ngOnInit(): void {
    const targetSelector = '#bs-modal';
    const state = 'modal';
    const options = { targetSelector, state };
    
    this.bsModal = LiquidCorp.BradBottomSheetService.getInstance(options);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Gerenciamento de foco otimizado para iOS
   */
  openBsModal(): void {
    // Salva elemento com foco atual
    this.previousActiveElement = document.activeElement as HTMLElement;
    
    this.bsModal.open();
    this.isOpen.set(true);

    // Aguarda renderização do DOM
    requestAnimationFrame(() => {
      this.setupModalAccessibility();
    });
  }

  private setupModalAccessibility(): void {
    const isIOS = this.isIOSDevice();
    
    if (isIOS) {
      this.setupIOSFocus();
    } else {
      this.setupStandardFocus();
    }

    // Ativa focus trap após estabelecer foco
    this.focusTimeoutId = window.setTimeout(() => {
      // FocusTrapDirective já é ativado via input binding
    }, isIOS ? 700 : 300);
  }

  /**
   * Foco no iOS - Remove verbalização dupla do título
   */
  private setupIOSFocus(): void {
    if (!this.titleRef?.nativeElement) return;

    const titleEl = this.titleRef.nativeElement;
    const modalEl = document.getElementById('bs-modal');

    // PASSO 1: Garante que título NUNCA seja focável
    this.renderer.setAttribute(titleEl, 'tabindex', '-1');
    this.renderer.setAttribute(titleEl, 'aria-hidden', 'false');

    // PASSO 2: Observa mudanças no tabindex (biblioteca LiquidCorp)
    this.observeTitleTabIndex(titleEl);

    // PASSO 3: Foca no container do modal (não no título)
    if (modalEl) {
      // Remove tabindex se existir
      modalEl.removeAttribute('tabindex');
      
      // Força VoiceOver a ler o contexto do diálogo
      this.announceModalOpened();
      
      // Delay para iOS processar o contexto
      setTimeout(() => {
        // Foca no primeiro elemento interativo (primeiro radio)
        this.focusFirstInteractiveElement();
      }, 100);
    }
  }

  /**
   * Foca no primeiro elemento interativo (não no título)
   */
  private focusFirstInteractiveElement(): void {
    const firstRadio = document.getElementById('chip-pdf') as HTMLInputElement;
    
    if (firstRadio) {
      firstRadio.focus();
      
      // Anuncia contexto para VoiceOver
      this.announceToScreenReader(
        'Modal de download aberto. Selecione o formato do arquivo.'
      );
    }
  }

  /**
   * Configuração padrão para outros navegadores
   */
  private setupStandardFocus(): void {
    if (!this.titleRef?.nativeElement) return;

    const titleEl = this.titleRef.nativeElement;
    this.renderer.setAttribute(titleEl, 'tabindex', '-1');
    
    // Foca no título para leitores de tela desktop
    setTimeout(() => {
      titleEl.focus();
    }, 100);
  }

  /**
   * Observa e corrige mudanças no tabindex do título
   */
  private observeTitleTabIndex(titleEl: HTMLElement): void {
    const callback = (mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'tabindex'
        ) {
          const currentTabIndex = titleEl.getAttribute('tabindex');
          
          // Força tabindex -1 se a biblioteca LiquidCorp tentar mudar
          if (currentTabIndex !== '-1') {
            this.renderer.setAttribute(titleEl, 'tabindex', '-1');
          }
        }
      });
    };

    this.mutationObserver = new MutationObserver(callback);

    this.mutationObserver.observe(titleEl, {
      attributes: true,
      attributeFilter: ['tabindex'],
    });
  }

  /**
   * Anuncia abertura do modal para VoiceOver
   */
  private announceModalOpened(): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `${this.title()} aberto`;

    document.body.appendChild(announcement);

    this.announcementTimeoutId = window.setTimeout(() => {
      try {
        if (announcement && document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      } catch (error) {
        // Ignora erros de remoção
      }
    }, 1000);
  }

  /**
   * Anuncia mensagens para leitores de tela
   */
  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      try {
        if (announcement && document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      } catch (error) {
        // Ignora erros de remoção
      }
    }, 1500);
  }

  closeBsModal(): void {
    this.bsModal.close();
    this.isOpen.set(false);
    
    // Restaura foco ao elemento anterior
    if (this.previousActiveElement) {
      setTimeout(() => {
        this.previousActiveElement?.focus();
      }, 100);
    }

    this.cleanup();
  }

  /**
   * Handler de mudança de formato
   */
  onFormatoChange(formato: 'pdf' | 'xls'): void {
    this.formatoSelecionado.set(formato);
    
    // Anuncia mudança para leitores de tela
    const formatoTexto = formato === 'pdf' ? 'PDF' : 'Excel';
    this.announceToScreenReader(`Formato ${formatoTexto} selecionado`);
  }

  /**
   * Gera aria-label dinâmico para botão baixar
   */
  getAriaLabelBaixar(): string {
    const formato = this.formatoSelecionado();
    
    if (!formato) {
      return 'Baixar arquivo - Selecione um formato primeiro';
    }
    
    const formatoTexto = formato === 'pdf' ? 'PDF' : 'Excel';
    return `Baixar arquivo no formato ${formatoTexto}`;
  }

  /**
   * Detecta se é dispositivo iOS
   */
  private isIOSDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Verifica se tem título
   */
  hasTitle(): boolean {
    return !!this.title();
  }

  /**
   * Limpeza de recursos
   */
  private cleanup(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }

    if (this.focusTimeoutId) {
      window.clearTimeout(this.focusTimeoutId);
    }

    if (this.announcementTimeoutId) {
      window.clearTimeout(this.announcementTimeoutId);
    }
  }
}
