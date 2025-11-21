import { Component, signal } from '@angular/core';
import { ModalPeriodoComponent } from './modal-periodo.component';

/**
 * Demonstração do Modal de Período
 */
@Component({
  selector: 'app-modal-periodo-demo',
  standalone: true,
  imports: [ModalPeriodoComponent],
  template: `
    <div class="demo-container">
      <h1>Modal de Seleção de Período - Itaú</h1>

      <div class="demo-actions">
        <button 
          class="btn-primary"
          (click)="abrirModal()">
          Abrir Modal
        </button>

        @if (mesEscolhido()) {
          <div class="resultado">
            <strong>Mês Selecionado:</strong> {{ mesEscolhido() }}
          </div>
        }
      </div>

      <!-- Modal -->
      <app-modal-periodo
        [isOpen]="modalAberto()"
        [titulo]="'Selecione o mês'"
        [mesSelecionado]="mesEscolhido()"
        (confirmar)="onConfirmar($event)"
        (cancelar)="onCancelar()"
      />
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, sans-serif;
    }

    h1 {
      font-size: 1.75rem;
      margin-bottom: 2rem;
      color: #1A1A1A;
    }

    .demo-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .btn-primary {
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      background: #0046C0;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: #003380;
      }

      &:active {
        transform: scale(0.98);
      }
    }

    .resultado {
      padding: 1rem;
      background: #E7F6FF;
      border-radius: 8px;
      border-left: 4px solid #0046C0;
      font-size: 1rem;

      strong {
        color: #0046C0;
      }
    }
  `]
})
export class ModalPeriodoDemoComponent {
  // Estado do modal
  readonly modalAberto = signal(false);
  readonly mesEscolhido = signal('07'); // Julho por padrão

  /**
   * Abre o modal
   */
  abrirModal(): void {
    this.modalAberto.set(true);
  }

  /**
   * Ao confirmar seleção
   */
  onConfirmar(mes: string): void {
    this.mesEscolhido.set(mes);
    this.modalAberto.set(false);
    console.log('✅ Mês confirmado:', mes);
  }

  /**
   * Ao cancelar
   */
  onCancelar(): void {
    this.modalAberto.set(false);
    console.log('❌ Cancelado');
  }
}

