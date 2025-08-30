import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Signals
  public readonly currentUser = this.authService.currentUser;
  public readonly isAuthenticated = computed(() => !!this.currentUser());
  public readonly isAdmin = computed(() => this.authService.isAdmin());

  // Navigation items
  public readonly navigationItems = signal([
    { path: '/home', label: 'Home', icon: '🏠', requiresAuth: true },
    { path: '/extrato', label: 'Extrato', icon: '📊', requiresAuth: true },
    { path: '/admin', label: 'Admin', icon: '⚙️', requiresAuth: true, requiresAdmin: true }
  ]);

  // Computed navigation items based on user role
  public readonly availableNavItems = computed(() => {
    const user = this.currentUser();
    return this.navigationItems().filter(item => {
      if (!item.requiresAuth) return true;
      if (!user) return false;
      if (item.requiresAdmin && !this.authService.isAdmin()) return false;
      return true;
    });
  });

  // Mobile menu state
  public readonly isMobileMenuOpen = signal(false);

  onNavigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeMobileMenu();
  }

  onLogoClick(): void {
    this.router.navigate(['/home']);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(open => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.closeMobileMenu();
  }

  getCurrentRoute(): string {
    return this.router.url;
  }

  isActiveRoute(path: string): boolean {
    return this.router.url.startsWith(path);
  }
}