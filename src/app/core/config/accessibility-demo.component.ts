import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  announce,
  generateA11yId,
  isNativelyFocusable,
  removeNativeSemantics,
  enableDebugMode,
  disableDebugMode,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  DEFAULT_ACCESSIBILITY_CONFIG,
  NAVIGATION_KEYS,
  ARIA_ROLES
} from './accessibility.config';

@Component({
  selector: 'app-accessibility-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-container">
      <h1>🧪 Demo de Configuração Global de Acessibilidade</h1>
      
      <!-- Status -->
      <section class="demo-section">
        <h2>📊 Status da Configuração</h2>
        <div class="status-grid">
          <div class="status-item">
            <strong>CSS Global:</strong>
            <span class="badge success">✅ Carregado</span>
          </div>
          <div class="status-item">
            <strong>TypeScript Config:</strong>
            <span class="badge success">✅ Funcionando</span>
          </div>
          <div class="status-item">
            <strong>Debug Mode:</strong>
            <span [class.badge]="true" [class.success]="debugEnabled()" [class.error]="!debugEnabled()">
              {{ debugEnabled() ? '✅ Ativo' : '❌ Inativo' }}
            </span>
          </div>
        </div>
      </section>

      <!-- Preferências do Usuário -->
      <section class="demo-section">
        <h2>👤 Preferências do Usuário</h2>
        <div class="preferences-grid">
          <div class="pref-item">
            <span>Movimento Reduzido:</span>
            <strong>{{ userPrefs().reducedMotion ? 'Sim' : 'Não' }}</strong>
          </div>
          <div class="pref-item">
            <span>Alto Contraste:</span>
            <strong>{{ userPrefs().highContrast ? 'Sim' : 'Não' }}</strong>
          </div>
          <div class="pref-item">
            <span>Modo Escuro:</span>
            <strong>{{ userPrefs().darkMode ? 'Sim' : 'Não' }}</strong>
          </div>
        </div>
      </section>

      <!-- Teste de Anúncios -->
      <section class="demo-section">
        <h2>📢 Teste de Anúncios (Live Regions)</h2>
        <p class="description">Ative um leitor de tela para ouvir os anúncios</p>
        <div class="button-group">
          <button (click)="testAnnouncePolite()">
            Anúncio Polite
          </button>
          <button (click)="testAnnounceAssertive()">
            Anúncio Assertive (Urgente)
          </button>
          <button (click)="testAnnounceDelayed()">
            Anúncio com Delay (500ms)
          </button>
        </div>
        @if (lastAnnouncement()) {
          <div class="announcement-log">
            <strong>Último anúncio:</strong> {{ lastAnnouncement() }}
          </div>
        }
      </section>

      <!-- Teste de IDs Únicos -->
      <section class="demo-section">
        <h2>🔑 Geração de IDs Únicos</h2>
        <button (click)="generateNewId()">Gerar Novo ID</button>
        @if (generatedIds().length > 0) {
          <div class="id-list">
            @for (id of generatedIds(); track id) {
              <code class="id-badge">{{ id }}</code>
            }
          </div>
        }
      </section>

      <!-- Teste de Semântica Nativa -->
      <section class="demo-section">
        <h2>🚫 Remoção de Semântica Nativa</h2>
        
        <div class="example-row">
          <div class="example-box">
            <h3>Sem role="presentation"</h3>
            <h2>Título Nível 2</h2>
            <button>Botão</button>
            <ul><li>Item de lista</li></ul>
            <p class="hint">☝️ Leitores de tela anunciam: "heading nível 2", "botão", "lista"</p>
          </div>
          
          <div class="example-box">
            <h3>Com role="presentation"</h3>
            <h2 role="presentation" aria-hidden="true">Título Nível 2</h2>
            <button role="none" aria-label="Controle customizado">Botão</button>
            <ul role="none"><li role="none">Item de lista</li></ul>
            <p class="hint">☝️ Leitores de tela anunciam apenas: "Controle customizado"</p>
          </div>
        </div>
      </section>

      <!-- Teste de Classes CSS -->
      <section class="demo-section">
        <h2>🎨 Classes CSS Utilitárias</h2>
        
        <div class="css-examples">
          <div class="example">
            <h4>.sr-only (Screen Reader Only)</h4>
            <span class="sr-only">Este texto é visível apenas para leitores de tela</span>
            <span class="visual-indicator">👁️ Visualmente oculto</span>
          </div>
          
          <div class="example">
            <h4>.visual-only (Hidden from Screen Readers)</h4>
            <span class="visual-only" aria-hidden="true">🎨 Ícone decorativo</span>
            <span>Este ícone é ignorado por leitores de tela</span>
          </div>
        </div>
      </section>

      <!-- Modo Debug -->
      <section class="demo-section">
        <h2>🐛 Modo Debug Visual</h2>
        <p class="description">
          Quando ativado, mostra outlines coloridos em elementos focáveis
        </p>
        <div class="button-group">
          <button (click)="toggleDebugMode()">
            {{ debugEnabled() ? '❌ Desativar' : '✅ Ativar' }} Debug Mode
          </button>
        </div>
        @if (debugEnabled()) {
          <div class="debug-legend">
            <h4>Legenda de Cores:</h4>
            <ul>
              <li><span class="color-box orange"></span> Laranja: elementos com tabindex</li>
              <li><span class="color-box green"></span> Verde: botões, links, inputs</li>
              <li><span class="color-box red"></span> Vermelho: elementos aria-hidden</li>
            </ul>
          </div>
        }
      </section>

      <!-- Teste de Foco -->
      <section class="demo-section">
        <h2>🎯 Teste de Foco (WCAG 2.1 AA)</h2>
        <p class="description">Navegue com Tab para ver os estilos de foco consistentes</p>
        <div class="focusable-elements">
          <button>Botão 1</button>
          <button>Botão 2</button>
          <input type="text" placeholder="Input de texto">
          <a href="#">Link</a>
          <div tabindex="0">Div focável</div>
        </div>
      </section>

      <!-- Constantes ARIA -->
      <section class="demo-section">
        <h2>📚 Constantes ARIA Disponíveis</h2>
        <div class="constants-grid">
          <div class="constant-group">
            <h4>NAVIGATION_KEYS</h4>
            <code>{{ navigationKeys }}</code>
          </div>
          <div class="constant-group">
            <h4>ARIA_ROLES</h4>
            <code>{{ ariaRoles }}</code>
          </div>
        </div>
      </section>

      <!-- Configuração -->
      <section class="demo-section">
        <h2>⚙️ Configuração Padrão</h2>
        <pre class="config-display">{{ configDisplay }}</pre>
      </section>

      <!-- Documentação -->
      <section class="demo-section">
        <h2>📖 Documentação</h2>
        <ul class="doc-links">
          <li>📄 <strong>ACCESSIBILITY.md</strong> - README principal</li>
          <li>📘 <strong>src/app/core/config/ACCESSIBILITY-GUIDE.md</strong> - Guia completo</li>
          <li>📗 <strong>src/app/shared/components/modal-periodo/ACCESSIBILITY-IMPLEMENTATION.md</strong> - Exemplo</li>
          <li>🎨 <strong>src/styles/_accessibility.scss</strong> - CSS global</li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
    }

    h1 {
      color: #0046c0;
      margin-bottom: 2rem;
    }

    .demo-section {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .description {
      color: #666;
      margin-bottom: 1rem;
    }

    .status-grid, .preferences-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .status-item, .pref-item {
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .badge.success {
      background: #d4edda;
      color: #155724;
    }

    .badge.error {
      background: #f8d7da;
      color: #721c24;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    button {
      padding: 0.75rem 1.5rem;
      background: #0046c0;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    button:hover {
      background: #003a9a;
    }

    .announcement-log {
      padding: 1rem;
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      margin-top: 1rem;
    }

    .id-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .id-badge {
      background: #f5f5f5;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.875rem;
    }

    .example-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .example-box {
      border: 2px solid #e0e0e0;
      padding: 1rem;
      border-radius: 4px;
    }

    .hint {
      font-size: 0.875rem;
      color: #666;
      margin-top: 1rem;
      font-style: italic;
    }

    .css-examples {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .example {
      padding: 1rem;
      background: #f9f9f9;
      border-radius: 4px;
    }

    .visual-indicator {
      color: #666;
      font-size: 0.875rem;
    }

    .debug-legend {
      margin-top: 1rem;
      padding: 1rem;
      background: #fff3cd;
      border-radius: 4px;
    }

    .color-box {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 2px;
      margin-right: 0.5rem;
      vertical-align: middle;
    }

    .color-box.orange { background: orange; }
    .color-box.green { background: green; }
    .color-box.red { background: red; }

    .focusable-elements {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .focusable-elements input {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .focusable-elements a {
      color: #0046c0;
      text-decoration: underline;
    }

    .focusable-elements div[tabindex] {
      padding: 0.75rem 1.5rem;
      background: #f5f5f5;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .constants-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .constant-group {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
    }

    .constant-group code {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      white-space: pre-wrap;
    }

    .config-display {
      background: #282c34;
      color: #abb2bf;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 0.875rem;
    }

    .doc-links {
      list-style: none;
      padding: 0;
    }

    .doc-links li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .example-row, .constants-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AccessibilityDemoComponent {
  debugEnabled = signal(false);
  lastAnnouncement = signal('');
  generatedIds = signal<string[]>([]);
  
  userPrefs = signal({
    reducedMotion: prefersReducedMotion(),
    highContrast: prefersHighContrast(),
    darkMode: prefersDarkMode()
  });

  navigationKeys = JSON.stringify(NAVIGATION_KEYS, null, 2);
  ariaRoles = JSON.stringify(ARIA_ROLES, null, 2);
  configDisplay = JSON.stringify(DEFAULT_ACCESSIBILITY_CONFIG, null, 2);

  testAnnouncePolite(): void {
    const message = 'Teste de anúncio polite - Esta é uma mensagem de baixa prioridade';
    announce(message, 'polite');
    this.lastAnnouncement.set(`[POLITE] ${message}`);
  }

  testAnnounceAssertive(): void {
    const message = 'Teste de anúncio assertive - Esta é uma mensagem URGENTE!';
    announce(message, 'assertive');
    this.lastAnnouncement.set(`[ASSERTIVE] ${message}`);
  }

  testAnnounceDelayed(): void {
    const message = 'Teste de anúncio com delay de 500ms';
    announce(message, 'polite', 500);
    this.lastAnnouncement.set(`[DELAYED] ${message}`);
  }

  generateNewId(): void {
    const id = generateA11yId('demo');
    this.generatedIds.update(ids => [...ids, id]);
  }

  toggleDebugMode(): void {
    if (this.debugEnabled()) {
      disableDebugMode();
      this.debugEnabled.set(false);
    } else {
      enableDebugMode();
      this.debugEnabled.set(true);
    }
  }
}

