import { Injectable } from '@angular/core';
import { AuthStoreService } from './auth-store.service';

/**
 * Serviço para comunicação de autenticação entre MFEs (cross-origin).
 * 
 * Estratégias suportadas:
 * 1. PostMessage API (para MFEs em diferentes origens)
 * 2. Custom Events (para MFEs na mesma origem)
 * 3. BroadcastChannel API (para comunicação cross-tab)
 * 4. LocalStorage events (fallback)
 * 
 * Uso em arquitetura de MFEs:
 * - Shell App: Gerencia autenticação centralizada
 * - MFE Login: Publica eventos de login
 * - MFE Home: Escuta eventos e atualiza token
 */
@Injectable({
  providedIn: 'root'
})
export class CrossMfeAuthService {
  private readonly authStore: AuthStoreService;
  private readonly channelName = 'corporate-eda-auth';
  private broadcastChannel: BroadcastChannel | null = null;

  constructor(authStore: AuthStoreService) {
    this.authStore = authStore;
    this.initializeCrossMfeCommunication();
  }

  /**
   * Inicializa comunicação cross-MFE.
   */
  private initializeCrossMfeCommunication(): void {
    // BroadcastChannel API (moderno, suporta cross-tab)
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel(this.channelName);
      
      this.broadcastChannel.onmessage = (event) => {
        this.handleAuthEvent(event.data);
      };
    }

    // Custom Events (mesma origem)
    if (typeof window !== 'undefined') {
      window.addEventListener('corporate-eda-auth', ((event: CustomEvent) => {
        this.handleAuthEvent(event.detail);
      }) as EventListener);
    }

    // PostMessage (cross-origin)
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        // Validar origem em produção
        if (event.data?.type === 'corporate-eda-auth') {
          this.handleAuthEvent(event.data.payload);
        }
      });
    }
  }

  /**
   * Trata eventos de autenticação recebidos.
   */
  private handleAuthEvent(data: { type: string; token?: string; user?: any }): void {
    if (data.type === 'login' && data.token) {
      // Token já está sincronizado via AuthStoreService
      // Este método pode ser usado para ações adicionais
    } else if (data.type === 'logout') {
      // Logout sincronizado
    }
  }

  /**
   * Publica evento de login para outros MFEs.
   */
  publishLogin(token: string, user: any): void {
    const event = {
      type: 'login',
      token,
      user,
      timestamp: Date.now(),
    };

    // BroadcastChannel
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(event);
    }

    // Custom Event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('corporate-eda-auth', { detail: event }));
    }

    // PostMessage (para iframes/popups)
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage(
        { type: 'corporate-eda-auth', payload: event },
        '*' // Em produção, especificar origem específica
      );
    }
  }

  /**
   * Publica evento de logout para outros MFEs.
   */
  publishLogout(): void {
    const event = {
      type: 'logout',
      timestamp: Date.now(),
    };

    // BroadcastChannel
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(event);
    }

    // Custom Event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('corporate-eda-auth', { detail: event }));
    }

    // PostMessage
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage(
        { type: 'corporate-eda-auth', payload: event },
        '*'
      );
    }
  }

  /**
   * Limpa recursos.
   */
  destroy(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }
}
