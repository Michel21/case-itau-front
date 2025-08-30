import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  private readonly router = inject(Router);

  // Current year
  public readonly currentYear = signal(new Date().getFullYear());

  // Footer links
  public readonly footerLinks = signal([
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/extrato', label: 'Extrato', icon: '📊' },
    { path: '/admin', label: 'Admin', icon: '⚙️' }
  ]);

  // Social links
  public readonly socialLinks = signal([
    { url: 'https://github.com', label: 'GitHub', icon: '🐙' },
    { url: 'https://linkedin.com', label: 'LinkedIn', icon: '💼' },
    { url: 'https://twitter.com', label: 'Twitter', icon: '🐦' }
  ]);

  // Company info
  public readonly companyInfo = signal({
    name: 'CatApp',
    description: 'Aplicação moderna para gerenciamento de dados de gatos',
    version: '1.0.0'
  });

  // Computed current route
  public readonly currentRoute = computed(() => this.router.url);

  onNavigateTo(path: string): void {
    this.router.navigate([path]);
  }

  onExternalLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  isActiveRoute(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  getCurrentRoute(): string {
    return this.router.url;
  }
}