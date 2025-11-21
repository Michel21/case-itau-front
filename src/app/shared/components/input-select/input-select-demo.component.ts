import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputSelectComponent } from './input-select.component';

/**
 * Componente de Demonstração do Input Select
 */
@Component({
  selector: 'app-input-select-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputSelectComponent],
  template: `
    <div class="demo">
      <header class="demo__header">
        <h1>📝 Input Select - Componente Customizável</h1>
        <p>Baseado no design do Itaú Investimentos</p>
      </header>

      <!-- EXEMPLO DA IMAGEM -->
      <section class="demo__section demo__section--imagem">
        <div class="periodo-header">
          <h2 class="periodo-title">Para visualizar o extrato escolha o período</h2>
          <p class="periodo-subtitle">É possível consultar lançamentos dos últimos 12 meses</p>
        </div>

        <div class="periodo-toggle">
          <button 
            class="toggle-btn"
            [class.toggle-btn--active]="tipoPeriodo() === 'mes'"
            (click)="tipoPeriodo.set('mes')">
            Mês
          </button>
          <button 
            class="toggle-btn"
            [class.toggle-btn--active]="tipoPeriodo() === 'intervalo'"
            (click)="tipoPeriodo.set('intervalo')">
            Intervalo
          </button>
        </div>
        
        <div class="demo__grid">
          <app-input-select
            label="Mês"
            [value]="mesExemplo()"
            placeholder="Selecione"
            (inputClick)="onClickMes()"
            [styleConfig]="{variant: 'outline', fullWidth: true}"
          />

          <app-input-select
            label="Ano"
            [value]="anoExemplo()"
            placeholder="Selecione"
            (inputClick)="onClickAno()"
            [styleConfig]="{variant: 'outline', fullWidth: true}"
          />
        </div>

        <div class="periodo-actions">
          <button 
            class="btn-aplicar"
            (click)="aplicarFiltro()">
            Aplicar Filtro
          </button>
        </div>
      </section>

      <!-- VARIANTES -->
      <section class="demo__section">
        <h2>🎨 Variantes de Estilo</h2>
        
        <div class="demo__grid">
          <!-- Outline (Padrão) -->
          <div>
            <h3>Outline (Padrão)</h3>
            <app-input-select
              label="Campo Outline"
              [value]="valorOutline()"
              placeholder="Selecione uma opção"
              (inputClick)="valorOutline.set('')"
              [styleConfig]="{variant: 'outline'}"
            />
          </div>

          <!-- Filled -->
          <div>
            <h3>Filled</h3>
            <app-input-select
              label="Campo Filled"
              [value]="valorFilled()"
              placeholder="Selecione uma opção"
              (inputClick)="valorFilled.set('2025')"
              [styleConfig]="{variant: 'filled'}"
            />
          </div>

          <!-- Minimal -->
          <div>
            <h3>Minimal (Underline)</h3>
            <app-input-select
              label="Campo Minimal"
              [value]="valorMinimal()"
              placeholder="Selecione uma opção"
              (inputClick)="valorMinimal.set('Novembro')"
              [styleConfig]="{variant: 'minimal'}"
            />
          </div>
        </div>
      </section>

      <!-- TAMANHOS -->
      <section class="demo__section">
        <h2>📏 Tamanhos</h2>
        
        <div class="demo__grid">
          <!-- Small -->
          <div>
            <h3>Small</h3>
            <app-input-select
              label="Tamanho Pequeno"
              value="Valor SM"
              placeholder="Selecione"
              [styleConfig]="{size: 'sm'}"
            />
          </div>

          <!-- Medium -->
          <div>
            <h3>Medium (Padrão)</h3>
            <app-input-select
              label="Tamanho Médio"
              value="Valor MD"
              placeholder="Selecione"
              [styleConfig]="{size: 'md'}"
            />
          </div>

          <!-- Large -->
          <div>
            <h3>Large</h3>
            <app-input-select
              label="Tamanho Grande"
              value="Valor LG"
              placeholder="Selecione"
              [styleConfig]="{size: 'lg'}"
            />
          </div>
        </div>
      </section>

      <!-- ESTADOS -->
      <section class="demo__section">
        <h2>🎯 Estados</h2>
        
        <div class="demo__grid">
          <!-- Normal -->
          <div>
            <h3>Normal</h3>
            <app-input-select
              label="Campo Normal"
              value="Outubro"
              placeholder="Selecione"
            />
          </div>

          <!-- Vazio -->
          <div>
            <h3>Vazio (Placeholder)</h3>
            <app-input-select
              label="Campo Vazio"
              placeholder="Selecione um mês"
            />
          </div>

          <!-- Com Erro -->
          <div>
            <h3>Com Erro</h3>
            <app-input-select
              label="Campo com Erro"
              placeholder="Selecione"
              [required]="true"
              error="Este campo é obrigatório"
            />
          </div>

          <!-- Desabilitado -->
          <div>
            <h3>Desabilitado</h3>
            <app-input-select
              label="Campo Desabilitado"
              value="Valor desabilitado"
              [disabled]="true"
            />
          </div>

          <!-- Com Hint -->
          <div>
            <h3>Com Hint</h3>
            <app-input-select
              label="Campo com Dica"
              placeholder="Selecione"
              hint="Escolha o mês desejado para o extrato"
            />
          </div>

          <!-- Obrigatório -->
          <div>
            <h3>Obrigatório</h3>
            <app-input-select
              label="Campo Obrigatório"
              placeholder="Selecione"
              [required]="true"
            />
          </div>
        </div>
      </section>

      <!-- INTEGRAÇÃO COM FORMS -->
      <section class="demo__section">
        <h2>🔗 Integração com Reactive Forms</h2>
        
        <form [formGroup]="demoForm" class="demo__form">
          <app-input-select
            label="Mês do Extrato"
            formControlName="mes"
            placeholder="Selecione o mês"
            [required]="true"
            (inputClick)="onClickFormMes()"
            [error]="getMesError()"
            hint="Escolha o mês para visualizar o extrato"
          />

          <app-input-select
            label="Ano do Extrato"
            formControlName="ano"
            placeholder="Selecione o ano"
            [required]="true"
            (inputClick)="onClickFormAno()"
            [error]="getAnoError()"
          />

          <div class="demo__form-actions">
            <button 
              type="button" 
              class="btn btn--primary"
              [disabled]="!demoForm.valid"
              (click)="submitForm()">
              Aplicar Filtro
            </button>
            
            <button 
              type="button" 
              class="btn btn--secondary"
              (click)="resetForm()">
              Limpar
            </button>
          </div>

          <div class="demo__info">
            <strong>Form Status:</strong> {{ demoForm.status }}<br>
            <strong>Valores:</strong> {{ demoForm.value | json }}
          </div>
        </form>
      </section>

      <!-- FULL WIDTH -->
      <section class="demo__section">
        <h2>📐 Largura Total</h2>
        
        <app-input-select
          label="Input com Largura Total"
          value="Valor que ocupa toda a largura disponível"
          placeholder="Selecione"
          [styleConfig]="{fullWidth: true}"
        />
      </section>

      <!-- SEM ÍCONE -->
      <section class="demo__section">
        <h2>🚫 Sem Ícone</h2>
        
        <div class="demo__grid">
          <app-input-select
            label="Sem Seta"
            value="Sem ícone"
            placeholder="Selecione"
            [styleConfig]="{showIcon: false}"
          />

          <app-input-select
            label="Com Seta (Padrão)"
            value="Com ícone"
            placeholder="Selecione"
            [styleConfig]="{showIcon: true}"
          />
        </div>
      </section>
    </div>
  `,
  styles: [`
    .demo {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .demo__header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .demo__header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #0046C0;
      margin-bottom: 0.5rem;
    }

    .demo__header p {
      font-size: 1.125rem;
      color: #6B6B6B;
    }

    .demo__section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .demo__section--imagem {
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .periodo-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .periodo-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1A1A1A;
      margin: 0 0 0.5rem 0;
      line-height: 1.3;
    }

    .periodo-subtitle {
      font-size: 0.875rem;
      color: #6B6B6B;
      margin: 0;
    }

    .periodo-toggle {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      justify-content: center;
    }

    .toggle-btn {
      flex: 1;
      max-width: 180px;
      height: 48px;
      padding: 0 24px;
      background: #FFFFFF;
      border: 1px solid #D9D9D9;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      color: #1A1A1A;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toggle-btn:hover {
      border-color: #0046C0;
    }

    .toggle-btn--active {
      background: #0046C0;
      border-color: #0046C0;
      color: #FFFFFF;
    }

    .periodo-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-aplicar {
      background: #0046C0;
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      padding: 14px 32px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 160px;
    }

    .btn-aplicar:hover {
      background: #003380;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 70, 192, 0.3);
    }

    .btn-aplicar:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 70, 192, 0.2);
    }

    .demo__section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1A1A1A;
      margin-bottom: 1rem;
    }

    .demo__section h3 {
      font-size: 1rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.75rem;
    }

    .demo__section p {
      color: #6B6B6B;
      margin-bottom: 1.5rem;
    }

    .demo__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .demo__info {
      margin-top: 1rem;
      padding: 1rem;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }

    .demo__info strong {
      color: #0046C0;
    }

    .demo__form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .demo__form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn--primary {
      background-color: #0046C0;
      color: white;
    }

    .btn--primary:hover:not(:disabled) {
      background-color: #003380;
    }

    .btn--primary:disabled {
      background-color: #B3B3B3;
      cursor: not-allowed;
    }

    .btn--secondary {
      background-color: #F5F5F5;
      color: #1A1A1A;
      border: 1px solid #D9D9D9;
    }

    .btn--secondary:hover {
      background-color: #E5E5E5;
    }

    @media (max-width: 768px) {
      .demo {
        padding: 1rem;
      }

      .demo__header h1 {
        font-size: 1.75rem;
      }

      .demo__grid {
        grid-template-columns: 1fr;
      }

      .demo__form-actions {
        flex-direction: column;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputSelectDemoComponent {
  private readonly fb = inject(FormBuilder);

  // ============================================================================
  // SIGNALS
  // ============================================================================

  readonly mesExemplo = signal('');
  readonly anoExemplo = signal('');
  readonly tipoPeriodo = signal<'mes' | 'intervalo'>('mes');
  
  readonly valorOutline = signal('');
  readonly valorFilled = signal('');
  readonly valorMinimal = signal('');

  // ============================================================================
  // REACTIVE FORM
  // ============================================================================

  readonly demoForm = this.fb.group({
    mes: ['', Validators.required],
    ano: ['', Validators.required]
  });

  // ============================================================================
  // MÉTODOS
  // ============================================================================

  onClickMes(): void {
    console.log('📅 Clicou em Mês - Abrir modal de seleção');
    // Aqui você abriria um modal para selecionar o mês
    // Exemplo: this.mesExemplo.set('Novembro');
  }

  onClickAno(): void {
    console.log('📅 Clicou em Ano - Abrir modal de seleção');
    // Aqui você abriria um modal para selecionar o ano
    // Exemplo: this.anoExemplo.set('2024');
  }

  aplicarFiltro(): void {
    const mes = this.mesExemplo();
    const ano = this.anoExemplo();
    const tipo = this.tipoPeriodo();
    
    console.log('✅ Aplicar Filtro:', { tipo, mes, ano });
    alert(`Filtro aplicado!\nTipo: ${tipo}\nMês: ${mes || 'Não selecionado'}\nAno: ${ano || 'Não selecionado'}`);
  }

  onClickFormMes(): void {
    console.log('📋 Form - Clicou em Mês');
    // Simular seleção
    this.demoForm.patchValue({ mes: '' });
  }

  onClickFormAno(): void {
    console.log('📋 Form - Clicou em Ano');
    // Simular seleção
    this.demoForm.patchValue({ ano: '2025' });
  }

  submitForm(): void {
    if (this.demoForm.valid) {
      console.log('✅ Form válido:', this.demoForm.value);
      alert(`Filtro aplicado: ${this.demoForm.value.mes}/${this.demoForm.value.ano}`);
    }
  }

  resetForm(): void {
    this.demoForm.reset();
    console.log('🔄 Form resetado');
  }

  getMesError(): string {
    const control = this.demoForm.get('mes');
    if (control?.touched && control?.invalid) {
      return 'Selecione o mês';
    }
    return '';
  }

  getAnoError(): string {
    const control = this.demoForm.get('ano');
    if (control?.touched && control?.invalid) {
      return 'Selecione o ano';
    }
    return '';
  }
}

