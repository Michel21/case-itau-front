import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusTrapDirective } from '../../directives/focus-trap.directive';

/**
 * Modal de Seleção de Ano - Design Itaú
 */
@Component({
  selector: 'app-modal-ano',
  standalone: true,
  imports: [CommonModule, FocusTrapDirective],
  template: `
    @if (isOpen()) {
      <div 
        class="modal-backdrop" 
        (click)="onBackdropClick($event)">
        
        <div 
          class="modal-content"
          (click)="onModalClick($event)"
          appFocusTrap
          [trapActive]="isOpen()"
          [autoFocus]="true"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'modal-ano-title'">
          
          <h2 id="modal-ano-title" class="modal-title">{{ titulo() }}</h2>

          <ul class="modal-list" role="radiogroup" aria-label="Selecione o ano">
            @for (ano of anos; track ano) {
              <li class="modal-item">
                <button
                  type="button"
                  class="modal-label"
                  role="radio"
                  [class.modal-label--selected]="anoAtual() === ano"
                  [attr.aria-checked]="anoAtual() === ano ? 'true' : 'false'"
                  [attr.aria-label]="ano"
                  [tabindex]="anoAtual() === ano ? 0 : -1"
                  (click)="selecionarAno(ano)"
                  (keydown.space)="selecionarAno(ano); $event.preventDefault()"
                  (keydown.enter)="selecionarAno(ano); $event.preventDefault()">
                  
                  <span class="modal-text">{{ ano }}</span>
                  
                  <span class="modal-check" [class.modal-check--active]="anoAtual() === ano">
                    @if (anoAtual() === ano) {
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" fill="#0046C0" stroke="#0046C0" stroke-width="2"/>
                        <circle cx="10" cy="10" r="4" fill="white"/>
                      </svg>
                    } @else {
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" stroke="#B3B3B3" stroke-width="2" fill="none"/>
                      </svg>
                    }
                  </span>
                </button>
              </li>
            }
          </ul>

          <div class="modal-actions">
            <button
              type="button"
              class="modal-btn modal-btn--cancel"
              (click)="onCancelar()">
              Cancelar
            </button>

            <button
              type="button"
              class="modal-btn modal-btn--confirm"
              [disabled]="!podeConfirmar()"
              (click)="onConfirmar()">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./modal-periodo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalAnoComponent {
  readonly isOpen = input<boolean>(false);
  readonly titulo = input<string>('Selecione o ano');
  readonly anoSelecionado = input<string>('');
  
  readonly confirmar = output<string>();
  readonly cancelar = output<void>();

  readonly anoAtual = signal<string>('');
  
  readonly anos: readonly string[] = this.gerarAnos();

  readonly podeConfirmar = computed(() => !!this.anoAtual());

  constructor() {
    this.anoAtual.set(this.anoSelecionado());
  }

  selecionarAno(ano: string): void {
    this.anoAtual.set(ano);
  }

  onConfirmar(): void {
    if (this.anoAtual()) {
      this.confirmar.emit(this.anoAtual());
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

  private gerarAnos(): readonly string[] {
    const anoAtual = new Date().getFullYear();
    const anos: string[] = [];
    
    for (let i = 0; i <= 1; i++) {
      anos.push(String(anoAtual - i));
    }
    
    return anos;
  }
}

