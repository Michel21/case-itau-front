import { Component, signal } from '@angular/core';
import { CheckboxAccessibleComponent } from './checkbox-accessible.component';

/**
 * Componente de Demonstração do Checkbox Acessível
 */
@Component({
  selector: 'app-checkbox-accessible-demo',
  standalone: true,
  imports: [CheckboxAccessibleComponent],
  template: `
    <div class="demo-container">
      <h1>Checkbox Acessível - Demonstração</h1>
      
      <section class="demo-section">
        <h2>Exemplo Básico</h2>
        
        <app-checkbox-accessible
          label="Aceito os termos e condições"
          [checked]="aceitoTermos()"
          (checkedChange)="aceitoTermos.set($event)"
        />

        <p class="demo-status">
          Estado: <strong>{{ aceitoTermos() ? 'Marcado ✓' : 'Desmarcado' }}</strong>
        </p>
      </section>

      <section class="demo-section">
        <h2>Com Descrição</h2>
        
        <app-checkbox-accessible
          label="Receber notificações por email"
          description="Você receberá atualizações sobre novos recursos e promoções"
          [checked]="receberEmails()"
          (checkedChange)="receberEmails.set($event)"
        />
      </section>

      <section class="demo-section">
        <h2>Com Validação Visual</h2>
        
        <app-checkbox-accessible
          label="Li e concordo com a política de privacidade"
          [checked]="concordoPrivacidade()"
          [showValidation]="true"
          (checkedChange)="concordoPrivacidade.set($event)"
        />
      </section>

      <section class="demo-section">
        <h2>Desabilitado</h2>
        
        <app-checkbox-accessible
          label="Opção desabilitada (marcada)"
          [checked]="true"
          [disabled]="true"
        />

        <app-checkbox-accessible
          label="Opção desabilitada (desmarcada)"
          [checked]="false"
          [disabled]="true"
        />
      </section>

      <section class="demo-section">
        <h2>Grupo de Checkboxes</h2>
        
        <div role="group" aria-labelledby="interesses-label">
          <h3 id="interesses-label">Selecione seus interesses:</h3>
          
          <app-checkbox-accessible
            label="Tecnologia"
            [checked]="interesseTecnologia()"
            (checkedChange)="interesseTecnologia.set($event)"
          />
          
          <app-checkbox-accessible
            label="Design"
            [checked]="interesseDesign()"
            (checkedChange)="interesseDesign.set($event)"
          />
          
          <app-checkbox-accessible
            label="Marketing"
            [checked]="interesseMarketing()"
            (checkedChange)="interesseMarketing.set($event)"
          />
        </div>

        <p class="demo-status">
          Selecionados: <strong>{{ totalInteresses() }}</strong>
        </p>
      </section>

      <section class="demo-section">
        <h2>Teste de Acessibilidade</h2>
        
        <div class="demo-instructions">
          <h3>Como testar:</h3>
          <ol>
            <li>Ative o VoiceOver: <kbd>⌘ Cmd + F5</kbd></li>
            <li>Navegue com <kbd>Tab</kbd></li>
            <li>Marque/desmarque com <kbd>Space</kbd> ou <kbd>Enter</kbd></li>
            <li>O VoiceOver deve narrar:
              <ul>
                <li>"[Label], marcado/desmarcado, caixa de seleção"</li>
                <li>Após mudar: "[Label] marcado" ou "[Label] desmarcado"</li>
              </ul>
            </li>
          </ol>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
      color: #1B1B1B;
    }

    .demo-section {
      margin-bottom: 3rem;
      padding: 1.5rem;
      background: #F8F9FA;
      border-radius: 0.5rem;
      border-left: 4px solid #006BA6;
    }

    h2 {
      font-size: 1.5rem;
      margin-top: 0;
      margin-bottom: 1rem;
      color: #006BA6;
    }

    h3 {
      font-size: 1.125rem;
      margin-top: 0;
      margin-bottom: 0.75rem;
      color: #1B1B1B;
    }

    .demo-status {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #E7F6FF;
      border-radius: 0.25rem;
      font-size: 0.9375rem;
    }

    .demo-instructions {
      background: #FFF9E6;
      padding: 1rem;
      border-radius: 0.5rem;
      border-left: 4px solid #FFB81C;
    }

    .demo-instructions ol {
      margin: 0.5rem 0 0 1.5rem;
      padding: 0;
    }

    .demo-instructions li {
      margin-bottom: 0.5rem;
    }

    .demo-instructions ul {
      margin: 0.5rem 0 0 1.5rem;
    }

    kbd {
      padding: 0.125rem 0.375rem;
      background: #1B1B1B;
      color: #FFFFFF;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-family: monospace;
    }
  `]
})
export class CheckboxAccessibleDemoComponent {
  // Estados dos checkboxes
  readonly aceitoTermos = signal(false);
  readonly receberEmails = signal(false);
  readonly concordoPrivacidade = signal(false);
  readonly interesseTecnologia = signal(false);
  readonly interesseDesign = signal(false);
  readonly interesseMarketing = signal(false);

  // Computed: Total de interesses selecionados
  readonly totalInteresses = signal(0);

  constructor() {
    // Atualizar total quando qualquer interesse mudar
    setInterval(() => {
      const total = [
        this.interesseTecnologia(),
        this.interesseDesign(),
        this.interesseMarketing()
      ].filter(Boolean).length;
      
      this.totalInteresses.set(total);
    }, 100);
  }
}

