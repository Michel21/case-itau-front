import { Injectable, signal, computed, effect } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';

/**
 * Store centralizado de autenticação para compartilhamento entre MFEs.
 * 
 * Estratégia profissional:
 * - Single Source of Truth para estado de autenticação
 * - Signals reativos para sincronização automática
 * - Eventos customizados para comunicação cross-origin (se necessário)
 * - Compatível com Module Federation e standalone MFEs
 * 
 * Uso:
 * - MFE Login: atualiza token via AuthService
 * - MFE Home: lê token via AuthStoreService
 * - Todos os MFEs: compartilham mesmo estado
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStoreService {
  private readonly authService = AuthService;

  // Estado centralizado (signals)
  private readonly tokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<User | null>(null);
  private readonly isAuthenticatedSignal = signal<boolean>(false);

  // Getters públicos (readonly)
  public readonly token = this.tokenSignal.asReadonly();
  public readonly user = this.userSignal.asReadonly();
  public readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  // Computed: verifica se token está válido (não expirado)
  public readonly isValidToken = computed(() => {
    const token = this.tokenSignal();
    if (!token) return false;
    
    try {
      const payload = this.decodeToken(token);
      if (!payload?.exp) return true; // Se não tem exp, assume válido
      
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }, { equal: (a, b) => a === b });

  constructor() {
    // Sincronizar com AuthService na inicialização
    this.syncFromAuthService();

    // Efeito: quando AuthService muda, atualizar store
    effect(() => {
      const authUser = this.authService.currentUser();
      const authToken = this.authService.getToken();
      
      if (authUser && authToken) {
        this.tokenSignal.set(authToken);
        this.userSignal.set(authUser);
        this.isAuthenticatedSignal.set(true);
      } else {
        this.tokenSignal.set(null);
        this.userSignal.set(null);
        this.isAuthenticatedSignal.set(false);
      }
    });

    // Sincronizar com localStorage (para cross-tab)
    this.syncFromLocalStorage();
    
    // Listener para mudanças no localStorage (outras abas)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'jwt_token') {
          this.syncFromLocalStorage();
        }
      });
    }
  }

  /**
   * Sincroniza estado inicial do AuthService.
   */
  private syncFromAuthService(): void {
    const token = this.authService.getToken();
    const user = this.authService.currentUser();
    
    if (token && user) {
      this.tokenSignal.set(token);
      this.userSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    }
  }

  /**
   * Sincroniza com localStorage (para persistência e cross-tab).
   */
  private syncFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('jwt_token');
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.tokenSignal.set(token);
        this.userSignal.set(user);
        this.isAuthenticatedSignal.set(true);
      } catch {
        // Ignorar erro de parse
      }
    }
  }

  /**
   * Decodifica token JWT (sem validar assinatura).
   */
  private decodeToken(token: string): { exp?: number; [key: string]: any } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Obtém token atual (para uso em interceptors).
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Obtém usuário atual.
   */
  getCurrentUser(): User | null {
    return this.userSignal();
  }

  /**
   * Verifica se está autenticado.
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }
}
