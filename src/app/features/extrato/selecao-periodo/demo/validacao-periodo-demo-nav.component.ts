import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Componente de navegação para a demo do ValidacaoPeriodoService
 */
@Component({
  selector: 'app-validacao-periodo-demo-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="demo-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <h2>🎯 ValidacaoPeriodoService</h2>
          <p>Demo Interativa</p>
        </div>
        
        <div class="nav-links">
          <a routerLink="/validacao-periodo-demo" 
             routerLinkActive="active" 
             [routerLinkActiveOptions]="{exact: true}">
            📋 Demo Principal
          </a>
          
          <a routerLink="/demo" 
             routerLinkActive="active">
            🎨 Outras Demos
          </a>
          
          <a routerLink="/extrato" 
             routerLinkActive="active">
            📊 Extrato
          </a>
          
          <a routerLink="/home" 
             routerLinkActive="active">
            🏠 Home
          </a>
        </div>
        
        <div class="nav-info">
          <span class="status-indicator">🟢 Online</span>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .demo-nav {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 20px;
    }

    .nav-brand h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .nav-brand p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .nav-links {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-links a:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    .nav-links a.active {
      background: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }

    .nav-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-indicator {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .nav-container {
        flex-direction: column;
        gap: 15px;
        padding: 15px;
      }

      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }

      .nav-links a {
        padding: 6px 12px;
        font-size: 0.9rem;
      }
    }
  `]
})
export class ValidacaoPeriodoDemoNavComponent {}
