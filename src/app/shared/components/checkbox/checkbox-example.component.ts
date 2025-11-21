import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

/**
 * Componente de Exemplo - Checkbox Component
 * Angular 19.2 - Standalone + Signals API
 */
@Component({
  selector: 'app-checkbox-example',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CheckboxComponent],
  template: `
    <div class="container" style="padding: 2rem; max-width: 1000px; margin: 0 auto;">
      <h1>☑️ Exemplos do Componente Checkbox</h1>
      <p style="color: #666; margin-bottom: 2rem;">
        Componente refatorado com Angular 19.2 - Signals API + Standalone
      </p>

      <section style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
        <h2>1. Checkbox Básico</h2>
        <app-checkbox 
          titulo="Aceito os termos e condições"
          [(ngModel)]="basico">
        </app-checkbox>
        <p style="margin-top: 0.5rem; color: #666;">
          <strong>Valor:</strong> {{ basico }}
        </p>
      </section>

      <section style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
        <h2>2. Três Estados (Mixed)</h2>
        <app-checkbox 
          titulo="Selecionar todos"
          [enableMixed]="true"
          [(ngModel)]="mixedValue">
        </app-checkbox>
        <p style="margin-top: 0.5rem; color: #666;">
          <strong>Valor:</strong> {{ mixedValue }} 
          <span [style.color]="getEstadoCor()">
            ({{ getEstadoTexto() }})
          </span>
        </p>
      </section>

      <section style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
        <h2>3. Desabilitado</h2>
        <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
          <app-checkbox 
            titulo="Marcado e desabilitado"
            [disabled]="true"
            [(ngModel)]="desabilitadoMarcado">
          </app-checkbox>
          <app-checkbox 
            titulo="Desmarcado e desabilitado"
            [disabled]="true"
            [(ngModel)]="desabilitadoDesmarcado">
          </app-checkbox>
        </div>
      </section>

      <section style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
        <h2>4. Com FormControl (Reactive Forms)</h2>
        <form [formGroup]="form()">
          <app-checkbox 
            titulo="Concordo com a política de privacidade"
            formControlName="privacidade">
          </app-checkbox>
          
          @if (form().get('privacidade')?.invalid && form().get('privacidade')?.touched) {
            <p style="color: red; margin-top: 0.5rem; font-size: 0.9rem;">
              ⚠️ Este campo é obrigatório
            </p>
          }
        </form>
        
        <div style="margin-top: 1rem; color: #666;">
          <p><strong>Form válido:</strong> {{ form().valid }}</p>
          <p><strong>Valor:</strong> {{ form().get('privacidade')?.value }}</p>
        </div>
      </section>

      <section style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
        <h2>5. Lista com Checkbox (Seleção Múltipla)</h2>
        <app-checkbox 
          titulo="Selecionar todos os itens"
          [enableMixed]="true"
          [(ngModel)]="checkboxPrincipal"
          (ngModelChange)="alterarTodos()">
        </app-checkbox>

        <div style="margin-left: 2rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
          @for (item of itens(); track item.id) {
            <app-checkbox 
              [titulo]="item.nome"
              [(ngModel)]="item.selecionado"
              (ngModelChange)="verificarSelecao()">
            </app-checkbox>
          }
        </div>

        <p style="margin-top: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 6px;">
          <strong>📊 Itens selecionados:</strong> {{ itensSelecionados().length }} de {{ itens().length }}
        </p>
      </section>

      <section style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
        <h2>6. Com Evento</h2>
        <app-checkbox 
          titulo="Receber notificações por email"
          (valueChange)="onNotificacao($event)">
        </app-checkbox>
        
        @if (ultimoEvento() !== null) {
          <p style="margin-top: 0.5rem; color: #3B69FF;">
            <strong>Último evento:</strong> {{ ultimoEvento() }}
          </p>
        }
      </section>

      <section style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
        <h2>7. Label à Esquerda</h2>
        <app-checkbox 
          titulo="Texto posicionado à esquerda do checkbox"
          [labelEsquerda]="true">
        </app-checkbox>
      </section>

      <section style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
        <h2>8. Justificado (Espaço entre)</h2>
        <div style="width: 400px; border: 1px solid #ccc; padding: 1rem; border-radius: 6px; background: white;">
          <app-checkbox 
            titulo="Opção com espaçamento justificado"
            [justificar]="true">
          </app-checkbox>
        </div>
      </section>

      <section style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
        <h2>9. Checkbox Pequeno</h2>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <app-checkbox 
            titulo="Checkbox tamanho normal">
          </app-checkbox>
          <app-checkbox 
            titulo="Checkbox pequeno"
            [small]="true">
          </app-checkbox>
        </div>
      </section>

      <section style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
        <h2>10. Integração com Termos de Uso</h2>
        <div style="display: flex; align-items: start; gap: 0.5rem;">
          <app-checkbox [(ngModel)]="aceitoTermos"></app-checkbox>
          <p style="margin: 0;">
            Li e concordo com os 
            <a href="#" style="color: #3B69FF; text-decoration: underline;">termos de uso</a> e 
            <a href="#" style="color: #3B69FF; text-decoration: underline;">política de privacidade</a>
          </p>
        </div>
        <button 
          [disabled]="!aceitoTermos"
          (click)="continuar()"
          style="margin-top: 1rem; padding: 0.75rem 2rem; background: #3B69FF; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s;"
          [style.opacity]="aceitoTermos ? 1 : 0.5"
          [style.cursor]="aceitoTermos ? 'pointer' : 'not-allowed'">
          Continuar
        </button>
      </section>
    </div>
  `,
  styles: [`
    .container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    section {
      border: 1px solid #e0e0e0;
    }

    h1 {
      color: #333;
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    h2 {
      color: #666;
      font-size: 1.3rem;
      margin-bottom: 1rem;
      margin-top: 0;
    }

    p {
      margin: 0;
      line-height: 1.6;
    }

    button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 105, 255, 0.3);
    }
  `]
})
export class CheckboxExampleComponent {
  // ============================================================================
  // STATE SIGNALS
  // ============================================================================
  
  basico = false;
  mixedValue: boolean | undefined = false;
  checkboxPrincipal: boolean | undefined = false;
  aceitoTermos = false;
  desabilitadoMarcado = true;
  desabilitadoDesmarcado = false;
  
  readonly ultimoEvento = signal<boolean | undefined>(undefined);
  
  readonly itens = signal([
    { id: 1, nome: 'Item 1 - Documento A', selecionado: false },
    { id: 2, nome: 'Item 2 - Documento B', selecionado: false },
    { id: 3, nome: 'Item 3 - Documento C', selecionado: false },
    { id: 4, nome: 'Item 4 - Documento D', selecionado: false },
  ]);

  readonly form = signal(this.fb.group({
    privacidade: [false, Validators.requiredTrue]
  }));

  // ============================================================================
  // COMPUTED SIGNALS
  // ============================================================================
  
  readonly itensSelecionados = computed(() => 
    this.itens().filter(item => item.selecionado)
  );

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(private fb: FormBuilder) {}

  // ============================================================================
  // METHODS
  // ============================================================================

  getEstadoTexto(): string {
    if (this.mixedValue === undefined) return 'Parcial';
    if (this.mixedValue === true) return 'Todos selecionados';
    return 'Nenhum selecionado';
  }

  getEstadoCor(): string {
    if (this.mixedValue === undefined) return '#FF9800';
    if (this.mixedValue === true) return '#4CAF50';
    return '#F44336';
  }

  alterarTodos(): void {
    if (this.checkboxPrincipal === true) {
      this.itens.update(items => 
        items.map(item => ({ ...item, selecionado: true }))
      );
    } else if (this.checkboxPrincipal === false) {
      this.itens.update(items => 
        items.map(item => ({ ...item, selecionado: false }))
      );
    }
  }

  verificarSelecao(): void {
    const items = this.itens();
    const todos = items.every(item => item.selecionado);
    const nenhum = items.every(item => !item.selecionado);
    
    if (todos) {
      this.checkboxPrincipal = true;
    } else if (nenhum) {
      this.checkboxPrincipal = false;
    } else {
      this.checkboxPrincipal = undefined; // Estado parcial
    }
  }

  onNotificacao(value: boolean | undefined): void {
    this.ultimoEvento.set(value);
    console.log('Notificação alterada:', value);
  }

  continuar(): void {
    if (this.aceitoTermos) {
      alert('✅ Termos aceitos! Continuando...');
    }
  }
}
