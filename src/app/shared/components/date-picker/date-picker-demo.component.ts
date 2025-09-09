import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent, DatePickerConfig } from './date-picker.component';

@Component({
  selector: 'app-date-picker-demo',
  standalone: true,
  imports: [CommonModule, DatePickerComponent],
  template: `
    <div class="demo-container">
      <header class="demo-header">
        <h1>DatePicker Component Demo</h1>
        <p>Demonstração completa do componente DatePicker profissional</p>
      </header>

      <div class="demo-sections">
        <!-- Seção 1: Demo Básico -->
        <section class="demo-section">
          <h2>Demo Básico</h2>
          <p>Seletor de data simples com configurações padrão</p>
          
          <div class="demo-controls">
            <button 
              type="button" 
              class="demo-button primary"
              (click)="showBasicPicker.set(true)">
              Abrir Date Picker Básico
            </button>
            
            @if (basicSelectedDate()) {
              <div class="selected-date-info">
                <strong>Data selecionada:</strong> {{ formatDate(basicSelectedDate()!) }}
              </div>
            }
          </div>
        </section>

        <!-- Seção 2: Demo com Restrições -->
        <section class="demo-section">
          <h2>Demo com Restrições</h2>
          <p>Seletor com datas mínimas e máximas definidas</p>
          
          <div class="demo-controls">
            <button 
              type="button" 
              class="demo-button secondary"
              (click)="showRestrictedPicker.set(true)">
              Abrir Date Picker com Restrições
            </button>
            
            @if (restrictedSelectedDate()) {
              <div class="selected-date-info">
                <strong>Data selecionada:</strong> {{ formatDate(restrictedSelectedDate()!) }}
              </div>
            }
          </div>
        </section>

        <!-- Seção 3: Demo com Data Inicial -->
        <section class="demo-section">
          <h2>Demo com Data Inicial</h2>
          <p>Seletor que abre com uma data pré-selecionada</p>
          
          <div class="demo-controls">
            <button 
              type="button" 
              class="demo-button accent"
              (click)="showInitialDatePicker.set(true)">
              Abrir Date Picker com Data Inicial
            </button>
            
            @if (initialSelectedDate()) {
              <div class="selected-date-info">
                <strong>Data selecionada:</strong> {{ formatDate(initialSelectedDate()!) }}
              </div>
            }
          </div>
        </section>

        <!-- Seção 4: Demo de Configurações -->
        <section class="demo-section">
          <h2>Configurações Disponíveis</h2>
          <div class="config-grid">
            <div class="config-item">
              <h3>title</h3>
              <p>Título personalizado do modal</p>
              <code>string</code>
            </div>
            <div class="config-item">
              <h3>minDate</h3>
              <p>Data mínima permitida</p>
              <code>Date</code>
            </div>
            <div class="config-item">
              <h3>maxDate</h3>
              <p>Data máxima permitida</p>
              <code>Date</code>
            </div>
            <div class="config-item">
              <h3>locale</h3>
              <p>Localização do componente</p>
              <code>string</code>
            </div>
          </div>
        </section>

        <!-- Seção 5: Eventos -->
        <section class="demo-section">
          <h2>Eventos</h2>
          <div class="events-log">
            <h3>Log de Eventos:</h3>
            <div class="events-list">
              @for (event of eventsLog(); track $index) {
                <div class="event-item" [class]="event.type">
                  <span class="event-time">{{ event.timestamp | date:'HH:mm:ss' }}</span>
                  <span class="event-message">{{ event.message }}</span>
                </div>
              }
            </div>
            <button 
              type="button" 
              class="demo-button small"
              (click)="clearEvents()">
              Limpar Log
            </button>
          </div>
        </section>
      </div>

      <!-- Modais dos Date Pickers -->
      @if (showBasicPicker()) {
        <app-date-picker
          [config]="basicConfig"
          [selectedDate]="basicSelectedDate()"
          (dateSelected)="onBasicDateSelected($event)"
          (cancelled)="onBasicCancelled()">
        </app-date-picker>
      }

      @if (showRestrictedPicker()) {
        <app-date-picker
          [config]="restrictedConfig"
          [selectedDate]="restrictedSelectedDate()"
          (dateSelected)="onRestrictedDateSelected($event)"
          (cancelled)="onRestrictedCancelled()">
        </app-date-picker>
      }

      @if (showInitialDatePicker()) {
        <app-date-picker
          [config]="initialConfig"
          [selectedDate]="initialSelectedDate()"
          (dateSelected)="onInitialDateSelected($event)"
          (cancelled)="onInitialCancelled()">
        </app-date-picker>
      }
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .demo-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
    }

    .demo-header h1 {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
      font-weight: 700;
    }

    .demo-header p {
      font-size: 1.1rem;
      margin: 0;
      opacity: 0.9;
    }

    .demo-sections {
      display: grid;
      gap: 30px;
    }

    .demo-section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .demo-section h2 {
      color: #1f2937;
      font-size: 1.5rem;
      margin: 0 0 10px 0;
      font-weight: 600;
    }

    .demo-section p {
      color: #6b7280;
      margin: 0 0 20px 0;
      line-height: 1.6;
    }

    .demo-controls {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .demo-button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      min-width: 200px;

      &.primary {
        background: #3b82f6;
        color: white;

        &:hover {
          background: #2563eb;
        }
      }

      &.secondary {
        background: #10b981;
        color: white;

        &:hover {
          background: #059669;
        }
      }

      &.accent {
        background: #f59e0b;
        color: white;

        &:hover {
          background: #d97706;
        }
      }

      &.small {
        padding: 8px 16px;
        font-size: 14px;
        min-width: auto;
        background: #6b7280;
        color: white;

        &:hover {
          background: #4b5563;
        }
      }
    }

    .selected-date-info {
      padding: 16px;
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
      color: #0c4a6e;
      font-size: 14px;
    }

    .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .config-item {
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .config-item h3 {
      color: #1f2937;
      font-size: 1.1rem;
      margin: 0 0 8px 0;
      font-weight: 600;
    }

    .config-item p {
      color: #6b7280;
      margin: 0 0 12px 0;
      font-size: 14px;
    }

    .config-item code {
      background: #1f2937;
      color: #f9fafb;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: 'Monaco', 'Menlo', monospace;
    }

    .events-log {
      margin-top: 20px;
    }

    .events-log h3 {
      color: #1f2937;
      font-size: 1.1rem;
      margin: 0 0 16px 0;
      font-weight: 600;
    }

    .events-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
      margin-bottom: 16px;
    }

    .event-item {
      display: flex;
      gap: 12px;
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;

      &:last-child {
        border-bottom: none;
      }

      &.success {
        background: #f0fdf4;
        color: #166534;
      }

      &.info {
        background: #f0f9ff;
        color: #1e40af;
      }

      &.warning {
        background: #fffbeb;
        color: #92400e;
      }
    }

    .event-time {
      font-weight: 600;
      min-width: 80px;
    }

    .event-message {
      flex: 1;
    }

    // Responsive
    @media (max-width: 768px) {
      .demo-container {
        padding: 10px;
      }

      .demo-header {
        padding: 20px 15px;
      }

      .demo-header h1 {
        font-size: 2rem;
      }

      .demo-section {
        padding: 20px;
      }

      .config-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DatePickerDemoComponent {
  // Signals para controle de estado
  readonly showBasicPicker = signal(false);
  readonly showRestrictedPicker = signal(false);
  readonly showInitialDatePicker = signal(false);
  
  readonly basicSelectedDate = signal<Date | null>(null);
  readonly restrictedSelectedDate = signal<Date | null>(null);
  readonly initialSelectedDate = signal<Date | null>(null);
  
  readonly eventsLog = signal<Array<{timestamp: Date, message: string, type: string}>>([]);

  // Configurações dos Date Pickers
  readonly basicConfig: DatePickerConfig = {
    title: 'Selecione uma data'
  };

  readonly restrictedConfig: DatePickerConfig = {
    title: 'Selecione uma data (com restrições)',
    minDate: new Date(2024, 0, 1), // 1 de janeiro de 2024
    maxDate: new Date(2025, 11, 31) // 31 de dezembro de 2025
  };

  readonly initialConfig: DatePickerConfig = {
    title: 'Selecione uma data (com data inicial)',
    minDate: new Date(2020, 0, 1),
    maxDate: new Date(2030, 11, 31)
  };

  constructor() {
    // Definir data inicial para o terceiro demo
    this.initialSelectedDate.set(new Date(2024, 9, 9)); // 9 de outubro de 2024
  }

  // Event handlers para o Date Picker básico
  onBasicDateSelected(date: Date): void {
    this.basicSelectedDate.set(date);
    this.showBasicPicker.set(false);
    this.addEvent('success', `Data básica selecionada: ${this.formatDate(date)}`);
  }

  onBasicCancelled(): void {
    this.showBasicPicker.set(false);
    this.addEvent('warning', 'Seleção básica cancelada');
  }

  // Event handlers para o Date Picker com restrições
  onRestrictedDateSelected(date: Date): void {
    this.restrictedSelectedDate.set(date);
    this.showRestrictedPicker.set(false);
    this.addEvent('success', `Data com restrições selecionada: ${this.formatDate(date)}`);
  }

  onRestrictedCancelled(): void {
    this.showRestrictedPicker.set(false);
    this.addEvent('warning', 'Seleção com restrições cancelada');
  }

  // Event handlers para o Date Picker com data inicial
  onInitialDateSelected(date: Date): void {
    this.initialSelectedDate.set(date);
    this.showInitialDatePicker.set(false);
    this.addEvent('success', `Data inicial selecionada: ${this.formatDate(date)}`);
  }

  onInitialCancelled(): void {
    this.showInitialDatePicker.set(false);
    this.addEvent('warning', 'Seleção inicial cancelada');
  }

  // Métodos utilitários
  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  addEvent(type: string, message: string): void {
    const events = this.eventsLog();
    events.unshift({
      timestamp: new Date(),
      message,
      type
    });
    
    // Manter apenas os últimos 10 eventos
    if (events.length > 10) {
      events.splice(10);
    }
    
    this.eventsLog.set([...events]);
  }

  clearEvents(): void {
    this.eventsLog.set([]);
    this.addEvent('info', 'Log de eventos limpo');
  }
}
