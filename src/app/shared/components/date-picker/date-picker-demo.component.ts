import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent, DatePickerConfig } from './date-picker.component';

interface DemoSection {
  id: string;
  title: string;
  description: string;
  type: 'basic' | 'restricted' | 'initial' | 'config' | 'events';
  draggable: boolean;
}

@Component({
  selector: 'app-date-picker-demo',
  standalone: true,
  imports: [CommonModule, DatePickerComponent],
  template: `
    <div class="demo-container" [class]="'theme-' + currentTheme()">
      <header class="demo-header">
        <h1>DatePicker Component Demo</h1>
        <p>Demonstração completa do componente DatePicker profissional</p>
        
        <!-- Theme Selector -->
        <div class="theme-selector">
          <label for="theme-select">Tema:</label>
          <select id="theme-select" [value]="currentTheme()" (change)="changeTheme($event)">
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="blue">Azul</option>
            <option value="green">Verde</option>
            <option value="purple">Roxo</option>
          </select>
        </div>
      </header>

      <div class="demo-sections" 
           (dragover)="onDragOver($event)"
           (drop)="onDrop($event)">
        @for (section of demoSections(); track section.id; let i = $index) {
          <section class="demo-section" 
                   [draggable]="section.draggable"
                   (dragstart)="onDragStart($event, i)"
                   (dragend)="onDragEnd($event)">
            
            @if (section.draggable) {
              <div class="drag-handle">⋮⋮</div>
            }
            
            @switch (section.type) {
              @case ('basic') {
                <h2>{{ section.title }}</h2>
                <p>{{ section.description }}</p>
                
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
              }
              
              @case ('restricted') {
                <h2>{{ section.title }}</h2>
                <p>{{ section.description }}</p>
                
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
              }
              
              @case ('initial') {
                <h2>{{ section.title }}</h2>
                <p>{{ section.description }}</p>
                
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
              }
              
              @case ('config') {
                <h2>{{ section.title }}</h2>
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
              }
              
              @case ('events') {
                <h2>{{ section.title }}</h2>
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
              }
            }
          </section>
        }
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
      transition: all 0.3s ease;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .demo-header {
      text-align: center;
      margin-bottom: 30px;
      padding: 30px 20px;
      border-radius: 16px;
      transition: all 0.3s ease;
    }

    /* Light Theme (Default) */
    .demo-container.theme-light .demo-header {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #1e293b;
      border: 1px solid #e2e8f0;
    }

    /* Dark Theme */
    .demo-container.theme-dark .demo-header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #f1f5f9;
      border: 1px solid #334155;
    }

    /* Blue Theme */
    .demo-container.theme-blue .demo-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      color: white;
      border: 1px solid #2563eb;
    }

    /* Green Theme */
    .demo-container.theme-green .demo-header {
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      color: white;
      border: 1px solid #059669;
    }

    /* Purple Theme */
    .demo-container.theme-purple .demo-header {
      background: linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%);
      color: white;
      border: 1px solid #7c3aed;
    }

    .demo-header h1 {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
      font-weight: 700;
    }

    .demo-header p {
      font-size: 1.1rem;
      margin: 0 0 20px 0;
      opacity: 0.9;
    }

    .theme-selector {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      margin-top: 20px;
    }

    .theme-selector label {
      font-size: 1rem;
      font-weight: 600;
      opacity: 0.9;
    }

    .theme-selector select {
      padding: 8px 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: inherit;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
    }

    .theme-selector select:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .theme-selector select:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.8);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    }

    /* Theme-specific select styles */
    .theme-light .theme-selector select {
      background: rgba(255, 255, 255, 0.8);
      color: #1e293b;
      border-color: rgba(30, 41, 59, 0.2);
    }

    .theme-light .theme-selector select:hover {
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(30, 41, 59, 0.3);
    }

    .demo-sections {
      display: grid;
      gap: 25px;
      flex: 1;
    }

    .demo-section {
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }

    /* Light theme sections */
    .theme-light .demo-section {
      background: white;
      border-color: #e5e7eb;
    }

    /* Dark theme sections */
    .theme-dark .demo-section {
      background: #1e293b;
      border-color: #334155;
      color: #f1f5f9;
    }

    /* Colored theme sections */
    .theme-blue .demo-section,
    .theme-green .demo-section,
    .theme-purple .demo-section {
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(255, 255, 255, 0.2);
      color: #1e293b;
    }

    .demo-section h2 {
      font-size: 1.5rem;
      margin: 0 0 10px 0;
      font-weight: 600;
    }

    .demo-section p {
      margin: 0 0 20px 0;
      line-height: 1.6;
    }

    /* Light theme text colors */
    .theme-light .demo-section h2 {
      color: #1f2937;
    }

    .theme-light .demo-section p {
      color: #6b7280;
    }

    /* Dark theme text colors */
    .theme-dark .demo-section h2 {
      color: #f1f5f9;
    }

    .theme-dark .demo-section p {
      color: #cbd5e1;
    }

    /* Colored theme text colors */
    .theme-blue .demo-section h2,
    .theme-green .demo-section h2,
    .theme-purple .demo-section h2 {
      color: #1e293b;
    }

    .theme-blue .demo-section p,
    .theme-green .demo-section p,
    .theme-purple .demo-section p {
      color: #475569;
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

    /* Drag and Drop Styles */
    .demo-section.dragging {
      opacity: 0.5;
      transform: rotate(2deg);
      z-index: 1000;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .drag-handle {
      position: absolute;
      top: 8px;
      right: 8px;
      color: rgba(107, 114, 128, 0.6);
      font-size: 14px;
      cursor: grab;
      user-select: none;
      padding: 6px;
      border-radius: 4px;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.8);
    }

    .drag-handle:hover {
      color: rgba(107, 114, 128, 0.9);
      background: rgba(255, 255, 255, 0.95);
      transform: scale(1.1);
    }

    .demo-section {
      position: relative;
    }

    /* Theme-specific drag handle styles */
    .theme-dark .drag-handle {
      color: rgba(203, 213, 225, 0.6);
      background: rgba(30, 41, 59, 0.8);
    }

    .theme-dark .drag-handle:hover {
      color: rgba(203, 213, 225, 0.9);
      background: rgba(30, 41, 59, 0.95);
    }

    .theme-blue .drag-handle,
    .theme-green .drag-handle,
    .theme-purple .drag-handle {
      color: rgba(30, 41, 59, 0.6);
      background: rgba(255, 255, 255, 0.9);
    }

    .theme-blue .drag-handle:hover,
    .theme-green .drag-handle:hover,
    .theme-purple .drag-handle:hover {
      color: rgba(30, 41, 59, 0.9);
      background: rgba(255, 255, 255, 0.95);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .demo-container {
        padding: 15px;
        min-height: 100vh;
      }

      .demo-header {
        padding: 20px 15px;
        margin-bottom: 20px;
      }

      .demo-header h1 {
        font-size: 2rem;
      }

      .demo-header p {
        font-size: 1rem;
      }

      .demo-sections {
        gap: 20px;
      }

      .demo-section {
        padding: 20px;
      }

      .demo-section h2 {
        font-size: 1.3rem;
      }

      .config-grid {
        grid-template-columns: 1fr;
      }

      .theme-selector {
        flex-direction: column;
        gap: 8px;
      }

      .theme-selector select {
        width: 100%;
        max-width: 200px;
      }
    }

    @media (max-width: 480px) {
      .demo-container {
        padding: 10px;
      }

      .demo-header {
        padding: 15px 10px;
        margin-bottom: 15px;
      }

      .demo-header h1 {
        font-size: 1.75rem;
      }

      .demo-header p {
        font-size: 0.9rem;
      }

      .demo-sections {
        gap: 15px;
      }

      .demo-section {
        padding: 15px;
      }

      .demo-section h2 {
        font-size: 1.2rem;
      }

      .demo-section p {
        font-size: 0.9rem;
      }

      .demo-button {
        padding: 10px 20px;
        font-size: 14px;
      }

      .selected-date-info {
        padding: 12px;
        font-size: 14px;
      }
    }
  `]
})
export class DatePickerDemoComponent implements OnInit {
  // Signals para controle de estado
  readonly showBasicPicker = signal(false);
  readonly showRestrictedPicker = signal(false);
  readonly showInitialDatePicker = signal(false);
  
  readonly basicSelectedDate = signal<Date | null>(null);
  readonly restrictedSelectedDate = signal<Date | null>(null);
  readonly initialSelectedDate = signal<Date | null>(null);
  
  readonly eventsLog = signal<Array<{timestamp: Date, message: string, type: string}>>([]);
  readonly currentTheme = signal('light');
  readonly demoSections = signal<DemoSection[]>([
    {
      id: 'basic',
      title: 'Demo Básico',
      description: 'Seletor de data simples com configurações padrão',
      type: 'basic',
      draggable: true
    },
    {
      id: 'restricted',
      title: 'Demo com Restrições',
      description: 'Seletor com datas mínimas e máximas definidas',
      type: 'restricted',
      draggable: true
    },
    {
      id: 'initial',
      title: 'Demo com Data Inicial',
      description: 'Seletor que abre com uma data pré-selecionada',
      type: 'initial',
      draggable: true
    },
    {
      id: 'config',
      title: 'Configurações Disponíveis',
      description: 'Opções de personalização do componente',
      type: 'config',
      draggable: true
    },
    {
      id: 'events',
      title: 'Eventos',
      description: 'Log de eventos em tempo real',
      type: 'events',
      draggable: true
    }
  ]);

  private draggedIndex: number | null = null;

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

  ngOnInit(): void {
    // Carregar tema salvo do localStorage
    const savedTheme = localStorage.getItem('demo-theme') || 'light';
    this.currentTheme.set(savedTheme);
    this.applyTheme(savedTheme);

    // Carregar ordem das seções salva
    this.loadSectionOrder();
  }

  changeTheme(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const theme = target.value;
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem('demo-theme', theme);
  }

  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
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

  // Drag and Drop Methods
  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', '');
    }
    
    // Adicionar classe de drag
    const target = event.target as HTMLElement;
    target.classList.add('dragging');
  }

  onDragEnd(event: DragEvent): void {
    // Remover classe de drag
    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
    this.draggedIndex = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    
    if (this.draggedIndex === null) return;

    const target = event.target as HTMLElement;
    const dropTarget = target.closest('.demo-section') as HTMLElement;
    
    if (!dropTarget) return;

    const dropIndex = Array.from(dropTarget.parentElement?.children || [])
      .indexOf(dropTarget);

    if (dropIndex === -1 || dropIndex === this.draggedIndex) return;

    // Reordenar as seções
    const sections = [...this.demoSections()];
    const draggedSection = sections[this.draggedIndex];
    
    // Remover a seção arrastada
    sections.splice(this.draggedIndex, 1);
    
    // Inserir na nova posição
    sections.splice(dropIndex, 0, draggedSection);
    
    // Atualizar o signal
    this.demoSections.set(sections);
    
    // Salvar a nova ordem
    this.saveSectionOrder();
    
    // Adicionar evento ao log
    this.addEvent('info', `Seção "${draggedSection.title}" movida para posição ${dropIndex + 1}`);
  }

  private loadSectionOrder(): void {
    const savedOrder = localStorage.getItem('demo-sections-order');
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        const currentSections = this.demoSections();
        const reorderedSections = order.map((id: string) => 
          currentSections.find(section => section.id === id)
        ).filter(Boolean) as DemoSection[];
        
        // Adicionar seções que não estavam na ordem salva
        const existingIds = reorderedSections.map(s => s.id);
        const newSections = currentSections.filter(section => !existingIds.includes(section.id));
        
        this.demoSections.set([...reorderedSections, ...newSections]);
      } catch (error) {
        console.warn('Erro ao carregar ordem das seções:', error);
      }
    }
  }

  private saveSectionOrder(): void {
    const order = this.demoSections().map(section => section.id);
    localStorage.setItem('demo-sections-order', JSON.stringify(order));
  }
}
