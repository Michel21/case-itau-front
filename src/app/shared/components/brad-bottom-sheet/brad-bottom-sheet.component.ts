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
  input,
  signal,
  effect,
  runInInjectionContext,
  Injector,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './brad-bottom-sheet.component.html',
  styleUrls: ['./brad-bottom-sheet.component.scss']
})
export class BradBottomSheetComponent implements OnInit, OnDestroy {
  // Inputs (recebidos do pai)
  title = input<string>('Baixar Extrato');
  subtitle = input<string>('');
  hasCloseIcon = input<boolean>(true);

  // Signals (estado interno)
  isOpen = signal<boolean>(false);
  botaoBaixarDesabilitado = signal<boolean>(true);
  formatoSelecionado = signal<'pdf' | 'xls' | null>(null);

  // Properties
  public hasRoleIOS: boolean = false;

  // Outputs
  @Output() onHabilitarBtBaixar = new EventEmitter<void>();
  @Output() onBaixarExtrato = new EventEmitter<void>();
  @Output() onRedirecionarParaVisualizarHtml = new EventEmitter<void>();

  // ViewChild
  @ViewChild('titleRef', { static: false }) 
  titleRef?: ElementRef<HTMLElement>;

  // Properties
  private bsModal!: BsModalInstance;
  private renderer = inject(Renderer2);
  private injector = inject(Injector);
  private mutationObserver?: MutationObserver;
  private previousActiveElement: HTMLElement | null = null;
  private focusTrapKeyDownHandler?: (event: KeyboardEvent) => void;
  private focusTrapFocusHandler?: (event: FocusEvent) => void;

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
    this.hasRoleIOS = this.isIOSDevice();
    
    // Configura título para não ser focável e não ser verbalizado duas vezes
    this.focusTitle();
    
    // Aguarda renderização e foca no primeiro elemento interativo (não no título)
    requestAnimationFrame(() => {
      if (this.hasRoleIOS) {
        // Para iOS: foca diretamente no primeiro radio, não no título
        setTimeout(() => {
          this.focusFirstInteractiveElement();
          this.ativarFocusTrap();
        }, 300);
      } else {
        // Para outros: ativa trap normalmente
        setTimeout(() => this.ativarFocusTrap(), 300);
      }
    });
  }


  /**
   * Foca no primeiro elemento interativo (não no título)
   */
  private focusFirstInteractiveElement(): void {
    const titleEl = this.titleRef?.nativeElement;
    
    // Garante que título não seja focável antes de focar no radio
    if (titleEl) {
      this.renderer.setAttribute(titleEl, 'tabindex', '-1');
      titleEl.blur();
    }
    
    const firstRadio = document.getElementById('chip-pdf') as HTMLInputElement;
    
    if (firstRadio) {
      firstRadio.focus();
      
      // Anuncia contexto para VoiceOver (sem mencionar título duas vezes)
      this.announceToScreenReader(
        'Modal de download aberto. Selecione o formato do arquivo.'
      );
    }
  }


  /**
   * Garantir que o titulo nunca seja focavel e não seja verbalizado duas vezes no iOS
   */
  focusTitle(): void {
    if (this.titleRef?.nativeElement) {
      const titleEl = this.titleRef.nativeElement;
      const isIOS = this.isIOSDevice();
      
      // PASSO 1: Garante que título NUNCA seja focável
      this.renderer.setAttribute(titleEl, 'tabindex', '-1');
      
      // PASSO 2: Para iOS, oculta o título da navegação direta mas mantém para aria-labelledby
      // Isso evita verbalização dupla: o título é lido apenas uma vez via aria-labelledby
      if (isIOS) {
        // aria-hidden="false" permite que seja lido via aria-labelledby, mas não diretamente
        this.renderer.setAttribute(titleEl, 'aria-hidden', 'false');
        // Remove qualquer foco que possa ter sido dado ao título
        titleEl.blur();
      }
      
      // PASSO 3: Observar mudancas no tabindex feitas pela biblioteca LiquidCorp
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
      }
      
      this.mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'tabindex') {
              // Força tabindex -1 se mudado
              if (titleEl.getAttribute('tabindex') !== '-1') {
                this.renderer.setAttribute(titleEl, 'tabindex', '-1');
                titleEl.blur(); // Remove foco se tiver sido dado
              }
            } else if (mutation.attributeName === 'aria-hidden' && isIOS) {
              // Garante que aria-hidden permaneça false no iOS
              if (titleEl.getAttribute('aria-hidden') === 'true') {
                this.renderer.setAttribute(titleEl, 'aria-hidden', 'false');
              }
            }
          }
        });
      });
      
      this.mutationObserver.observe(titleEl, { 
        attributes: true, 
        attributeFilter: ['tabindex', 'aria-hidden'] 
      });
    }
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
    
    // Desativa focus trap ao fechar
    this.desativarFocusTrap();
    
    // Restaura foco ao elemento anterior
    if (this.previousActiveElement) {
      setTimeout(() => {
        this.previousActiveElement?.focus();
      }, 100);
    }

    this.cleanup();
  }

  /**
   * Handler para habilitar botão baixar (chamado pelos radio buttons)
   */
  onHabilitarBtnBaixar(): void {
    this.onHabilitarBtBaixar.emit();
  }

  /**
   * Handler para clique nos radio buttons
   */
  onRadioClick(formato: 'pdf' | 'xls', event: Event): void {
    const radio = event.target as HTMLInputElement;
    
    // Marca o radio como selecionado
    radio.checked = true;
    this.formatoSelecionado.set(formato);
    
    // Emite evento para habilitar botão
    this.onHabilitarBtnBaixar();
    
    // Anuncia seleção para leitores de tela
    const formatoTexto = formato === 'pdf' ? 'PDF' : 'Excel';
    this.announceToScreenReader(`Formato ${formatoTexto} selecionado`);
    
    // Previne que o foco vá para o título após clicar
    this.prevenirFocoNoTitulo(event as FocusEvent);
  }

  /**
   * Previne que o foco vá para o título após interações
   */
  prevenirFocoNoTitulo(event: FocusEvent | Event): void {
    const titleEl = this.titleRef?.nativeElement;
    if (!titleEl) return;
    
    // Garante que título não seja focável
    this.renderer.setAttribute(titleEl, 'tabindex', '-1');
    
    // Se o evento é um FocusEvent, verifica se o foco está indo para o título
    if (event instanceof FocusEvent) {
      const target = event.target as HTMLElement;
      if (target === titleEl) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    
    // Verifica e corrige foco após um pequeno delay
    setTimeout(() => {
      const elementoAtivo = document.activeElement as HTMLElement;
      
      if (elementoAtivo === titleEl) {
        // Encontra o elemento que deveria ter foco
        const radioAtivo = document.querySelector('#chip-pdf:checked, #chip-xls:checked') as HTMLInputElement;
        const elementoOrigem = event.target as HTMLElement;
        
        if (radioAtivo && radioAtivo !== titleEl) {
          radioAtivo.focus();
        } else if (elementoOrigem && elementoOrigem !== titleEl && 
                   (elementoOrigem.tagName === 'INPUT' || elementoOrigem.tagName === 'BUTTON' || elementoOrigem.tagName === 'A')) {
          elementoOrigem.focus();
        } else {
          // Foca no primeiro radio se não houver outro elemento válido
          const primeiroRadio = document.getElementById('chip-pdf') as HTMLInputElement;
          if (primeiroRadio && primeiroRadio !== titleEl) {
            primeiroRadio.focus();
          }
        }
      }
      
      // Remove foco do título se ainda estiver lá
      if (document.activeElement === titleEl) {
        titleEl.blur();
      }
    }, 10);
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
   * Previne anúncio de "fim de diálogo" quando o botão/link recebe foco
   */
  prevenirAnuncioFimDialogo(event: FocusEvent): void {
    const elemento = event.target as HTMLElement;
    const modalEl = document.getElementById('bs-modal');
    
    if (!modalEl || !elemento) return;
    
    // Garante que o elemento não anuncie "fim de diálogo"
    // Remove qualquer aria-describedby que possa estar causando isso
    elemento.removeAttribute('aria-describedby');
    
    // Remove role="link" se existir (pode causar anúncio de "link")
    if (elemento.getAttribute('role') === 'link') {
      elemento.removeAttribute('role');
    }
    
    // Para iOS, adiciona um pequeno delay e anuncia contexto adequado
    // Isso sobrescreve qualquer anúncio automático de "fim de diálogo"
    if (this.isIOSDevice()) {
      setTimeout(() => {
        // Anuncia apenas o conteúdo do botão, sem mencionar "fim de diálogo" ou "link"
        const ariaLabel = elemento.getAttribute('aria-label') || 'Botão para visualizar extrato na tela';
        this.announceToScreenReader(ariaLabel);
      }, 150);
    }
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
   * Retorna o ID do título para aria-labelledby
   */
  titleId(): string {
    return 'title-id';
  }

  /**
   * Ativa focus trap no modal (método do componente, sem diretiva)
   */
  private ativarFocusTrap(): void {
    const modalEl = document.getElementById('bs-modal');
    if (!modalEl) return;

    // Handler para Tab e Shift+Tab
    this.focusTrapKeyDownHandler = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const elementosFocaveis = this.obterElementosFocaveis(modalEl);
      if (elementosFocaveis.length === 0) {
        event.preventDefault();
        return;
      }

      const primeiroElemento = elementosFocaveis[0];
      const ultimoElemento = elementosFocaveis[elementosFocaveis.length - 1];
      const elementoAtivo = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab (navegação reversa)
        if (elementoAtivo === primeiroElemento || !modalEl.contains(elementoAtivo)) {
          event.preventDefault();
          ultimoElemento.focus();
        }
      } else {
        // Tab (navegação normal)
        if (elementoAtivo === ultimoElemento || !modalEl.contains(elementoAtivo)) {
          event.preventDefault();
          primeiroElemento.focus();
        }
      }
    };

    // Handler para prevenir foco fora do modal
    this.focusTrapFocusHandler = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!modalEl.contains(target)) {
        event.stopPropagation();
        const elementosFocaveis = this.obterElementosFocaveis(modalEl);
        if (elementosFocaveis.length > 0) {
          elementosFocaveis[0].focus();
        }
      }
    };

    // Adiciona listeners
    modalEl.addEventListener('keydown', this.focusTrapKeyDownHandler);
    document.addEventListener('focus', this.focusTrapFocusHandler, true);
  }

  /**
   * Desativa focus trap
   */
  private desativarFocusTrap(): void {
    const modalEl = document.getElementById('bs-modal');
    
    if (this.focusTrapKeyDownHandler && modalEl) {
      modalEl.removeEventListener('keydown', this.focusTrapKeyDownHandler);
    }

    if (this.focusTrapFocusHandler) {
      document.removeEventListener('focus', this.focusTrapFocusHandler, true);
    }

    this.focusTrapKeyDownHandler = undefined;
    this.focusTrapFocusHandler = undefined;
  }

  /**
   * Obtém lista de elementos focáveis dentro do modal
   */
  private obterElementosFocaveis(container: HTMLElement): HTMLElement[] {
    const seletores = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elementos = Array.from(container.querySelectorAll(seletores)) as HTMLElement[];

    // Filtra apenas elementos visíveis
    return elementos.filter(el => {
      const estilo = window.getComputedStyle(el);
      return (
        el.offsetParent !== null &&
        estilo.visibility !== 'hidden' &&
        estilo.display !== 'none'
      );
    });
  }

  /**
   * Limpeza de recursos
   */
  private cleanup(): void {
    this.desativarFocusTrap();

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }
  }
}
