import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-demo-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="demo-nav">
      <div class="demo-nav-container">
        <div class="demo-nav-header">
          <h1>Component Demos</h1>
          <p>Demonstrações interativas dos componentes</p>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      min-height: 100vh;
    }

    .demo-nav-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .demo-nav-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .demo-nav-header h1 {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
      font-weight: 700;
    }

    .demo-nav-header p {
      font-size: 1.1rem;
      margin: 0;
      opacity: 0.9;
    }

    .demo-nav-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .demo-nav-link {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      text-decoration: none;
      color: white;
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }

      &.active {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
      }

      &.coming-soon {
        opacity: 0.6;
        cursor: not-allowed;

        &:hover {
          transform: none;
          background: rgba(255, 255, 255, 0.1);
        }
      }
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
        padding: 20px 15px;
      }

      .demo-nav-header h1 {
        font-size: 2rem;
      }

      .demo-nav-links {
        grid-template-columns: 1fr;
      }

      .demo-nav-link {
        padding: 20px;
        gap: 16px;
      }

      .demo-nav-icon {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DemoNavComponent {}
