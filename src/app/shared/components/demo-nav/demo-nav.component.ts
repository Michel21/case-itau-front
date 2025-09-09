import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-demo-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="demo-nav" [class]="'theme-' + currentTheme()">
      <div class="demo-nav-container">
        <div class="demo-nav-header">
          <h1>Component Demos</h1>
          <p>Demonstrações interativas dos componentes</p>
          
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
        </div>
        
        <div class="demo-nav-links">
          <a routerLink="/demo/date-picker" routerLinkActive="active" class="demo-nav-link">
            <div class="demo-nav-icon">📅</div>
            <div class="demo-nav-content">
              <h3>DatePicker</h3>
              <p>Seletor de data profissional e responsivo</p>
            </div>
          </a>
          
          <!-- Placeholder para futuros demos -->
          <div class="demo-nav-link coming-soon">
            <div class="demo-nav-icon">🔧</div>
            <div class="demo-nav-content">
              <h3>Mais Demos</h3>
              <p>Novos componentes em breve...</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .demo-nav {
      padding: 20px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    /* Light Theme (Default) */
    .demo-nav.theme-light {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #1e293b;
    }

    /* Dark Theme */
    .demo-nav.theme-dark {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #f1f5f9;
    }

    /* Blue Theme */
    .demo-nav.theme-blue {
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      color: white;
    }

    /* Green Theme */
    .demo-nav.theme-green {
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      color: white;
    }

    /* Purple Theme */
    .demo-nav.theme-purple {
      background: linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%);
      color: white;
    }

    .demo-nav-container {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    }

    .demo-nav-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .demo-nav-header h1 {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
      font-weight: 700;
    }

    .demo-nav-header p {
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

    .demo-nav-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      justify-items: center;
    }

    .demo-nav-link {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      width: 100%;
      max-width: 400px;
    }

    /* Light theme links */
    .theme-light .demo-nav-link {
      background: rgba(255, 255, 255, 0.8);
      color: #1e293b;
      border-color: rgba(30, 41, 59, 0.1);
    }

    .theme-light .demo-nav-link:hover {
      background: rgba(255, 255, 255, 0.9);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: rgba(30, 41, 59, 0.2);
    }

    .theme-light .demo-nav-link.active {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
    }

    /* Dark theme links */
    .theme-dark .demo-nav-link {
      background: rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
    }

    .theme-dark .demo-nav-link:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .theme-dark .demo-nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
    }

    /* Colored theme links */
    .theme-blue .demo-nav-link,
    .theme-green .demo-nav-link,
    .theme-purple .demo-nav-link {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .theme-blue .demo-nav-link:hover,
    .theme-green .demo-nav-link:hover,
    .theme-purple .demo-nav-link:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .theme-blue .demo-nav-link.active,
    .theme-green .demo-nav-link.active,
    .theme-purple .demo-nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
    }

    /* Coming soon state */
    .demo-nav-link.coming-soon {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .demo-nav-link.coming-soon:hover {
      transform: none;
    }

    .demo-nav-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .demo-nav-content h3 {
      font-size: 1.25rem;
      margin: 0 0 8px 0;
      font-weight: 600;
    }

    .demo-nav-content p {
      font-size: 0.9rem;
      margin: 0;
      opacity: 0.8;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .demo-nav {
        padding: 15px;
        align-items: flex-start;
        padding-top: 40px;
      }

      .demo-nav-container {
        max-width: 100%;
      }

      .demo-nav-header {
        margin-bottom: 25px;
      }

      .demo-nav-header h1 {
        font-size: 2rem;
      }

      .demo-nav-header p {
        font-size: 1rem;
      }

      .demo-nav-links {
        grid-template-columns: 1fr;
        gap: 15px;
        justify-items: stretch;
      }

      .demo-nav-link {
        padding: 20px;
        gap: 16px;
        max-width: none;
      }

      .demo-nav-icon {
        font-size: 1.5rem;
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
      .demo-nav {
        padding: 10px;
        padding-top: 30px;
      }

      .demo-nav-header h1 {
        font-size: 1.75rem;
      }

      .demo-nav-header p {
        font-size: 0.9rem;
      }

      .demo-nav-link {
        padding: 16px;
        gap: 12px;
      }

      .demo-nav-icon {
        font-size: 1.25rem;
      }

      .demo-nav-content h3 {
        font-size: 1.1rem;
      }

      .demo-nav-content p {
        font-size: 0.85rem;
      }
    }
  `]
})
export class DemoNavComponent {
  readonly currentTheme = signal('light');

  constructor() {
    // Carregar tema salvo do localStorage
    const savedTheme = localStorage.getItem('demo-theme') || 'light';
    this.currentTheme.set(savedTheme);
    this.applyTheme(savedTheme);
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
}
