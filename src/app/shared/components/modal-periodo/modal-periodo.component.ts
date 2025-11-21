import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FocusTrapDirective } from '../../directives/focus-trap.directive';

// ============================================================================
// INTERFACES
// ============================================================================

interface OpcaoMes {
  readonly value: string;
  readonly label: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Modal de Seleção de Período - Design Itaú
 * 
 * Reproduz fielmente o modal do app Itaú Investimentos
 * 
 * Features:
 * - Design modal nativo do app
 * - Lista de meses com radio buttons
 * - Botões "Cancelar" e "Confirmar"
 * - Animação de entrada/saída
 * - Backdrop com overlay
 */
@Component({
  selector: 'app-modal-periodo',
  standalone: true,
  imports: [CommonModule, FocusTrapDirective],
  templateUrl: './modal-periodo.component.html',
  styleUrls: ['./modal-periodo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.modal-periodo-host]': 'true',
    '[class.modal-periodo-host--open]': 'isOpen()'
  }
})
export class ModalPeriodoComponent {
  // ============================================================================
  // INPUTS
  // ============================================================================
  
  /**
   * Se o modal está aberto
   */
  readonly isOpen = input<boolean>(false);

  /**
   * Título do modal
   */
  readonly titulo = input<string>('Selecione o mês');

  /**
   * Mês selecionado inicial
   */
  readonly mesSelecionado = input<string>('');

  // ============================================================================
  // OUTPUTS
  // ============================================================================
  
  /**
   * Evento ao confirmar seleção
   */
  readonly confirmar = output<string>();

  /**
   * Evento ao cancelar
   */
  readonly cancelar = output<void>();

  // ============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ============================================================================
  
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  // ============================================================================
  // STATE
  // ============================================================================
  
  /**
   * Mês selecionado internamente
   */
  readonly mesAtual = signal<string>('');

  /**
   * Lista de meses
   */
  readonly meses: readonly OpcaoMes[] = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  /**
   * Se o botão confirmar está habilitado
   */
  readonly podeConfirmar = computed(() => !!this.mesAtual());

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================
  
  constructor() {
    // Sincronizar com o input inicial
    this.mesAtual.set(this.mesSelecionado());
    
    // Effect: Narrar título quando modal abrir
    effect(() => {
      const isOpen = this.isOpen();
      
      if (isOpen) {
        queueMicrotask(() => {
          const titulo = this.titulo();
          this.liveAnnouncer.announce(titulo, 'polite');
          console.log('📢 Narrando título:', titulo);
        });
      }
    });
    
    // Debug
    console.log('📱 ModalPeriodoComponent criado');
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Seleciona um mês
   */
  selecionarMes(mes: string): void {
    this.mesAtual.set(mes);
  }

  /**
   * Navega pela lista com arrow keys
   */
  onKeyDown(event: KeyboardEvent, mesAtual: string): void {
    const currentIndex = this.meses.findIndex(m => m.value === mesAtual);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = currentIndex < this.meses.length - 1 ? currentIndex + 1 : 0;
        break;
      
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : this.meses.length - 1;
        break;
      
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      
      case 'End':
        event.preventDefault();
        nextIndex = this.meses.length - 1;
        break;
      
      default:
        return;
    }

    // Focar no próximo elemento e narrar
    const nextMes = this.meses[nextIndex];
    if (nextMes) {
      // Atualizar foco
      queueMicrotask(() => {
        const button = document.getElementById(`mes-${nextMes.value}`);
        button?.focus();
        
        // Narrar o item ao navegar
        this.liveAnnouncer.announce(nextMes.label, 'polite');
        console.log('📢 Navegando para:', nextMes.label);
      });
    }
  }

  /**
   * Confirma a seleção
   */
  onConfirmar(): void {
    if (this.mesAtual()) {
      this.confirmar.emit(this.mesAtual());
    }
  }

  /**
   * Cancela a seleção
   */
  onCancelar(): void {
    this.cancelar.emit();
  }

  /**
   * Fecha ao clicar no backdrop
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancelar();
    }
  }

  /**
   * Previne propagação de cliques dentro do modal
   */
  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}

