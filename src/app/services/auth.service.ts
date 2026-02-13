import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CrossMfeAuthService } from '../core/auth/cross-mfe-auth.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  agencia: string;
  conta: string;
}

export interface JwtPayload {
  sub: string;
  agencia: string;
  conta: string;
  email?: string;
  nome?: string;
  exp?: number;
  iat?: number;
}

/**
 * Resposta da API de login
 */
interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    agencia: string;
    conta: string;
  };
}

/**
 * Serviço de autenticação com suporte a JWT.
 * 
 * Token JWT contém: { sub, agencia, conta, email, nome }
 * Agência e conta são extraídas automaticamente do token e usadas nas requisições.
 * 
 * Integração com API: POST /v1/auth/login
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly crossMfeAuth = inject(CrossMfeAuthService);
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private readonly jwtTokenKey = 'jwt_token';
  private readonly currentUserKey = 'currentUser';
  private readonly apiUrl = environment.apiInvestimentos || 'http://localhost:3001';

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check if user is logged in from localStorage
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedToken = localStorage.getItem(this.jwtTokenKey);
    if (storedToken) {
      try {
        const payload = this.decodeToken(storedToken);
        if (payload && !this.isTokenExpired(payload)) {
          const user = this.payloadToUser(payload);
          this.setCurrentUser(user, storedToken);
        } else {
          this.logout();
        }
      } catch (error) {
        this.logout();
      }
    }
  }

  /**
   * Login que chama a API para obter token JWT.
   * 
   * Endpoint: POST /v1/auth/login
   * Body: { email, password }
   * Response: { access_token, user: { id, name, email, agencia, conta } }
   */
  login(email: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/v1/auth/login`,
      { email, password }
    ).pipe(
      map(response => {
        if (response.access_token) {
          const user: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: 'user', // Poderia vir do backend se necessário
            agencia: response.user.agencia,
            conta: response.user.conta,
          };
          this.setCurrentUser(user, response.access_token);
          
          // Publicar evento para outros MFEs (estratégia profissional)
          this.crossMfeAuth.publishLogin(response.access_token, user);
          
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Erro no login:', error);
        // Fallback para mock se API não disponível (apenas em desenvolvimento)
        if (!environment.production && error.status === 0) {
          return this.loginMock(email, password);
        }
        return of(false);
      })
    );
  }

  /**
   * Login mock para desenvolvimento (fallback quando API não disponível).
   */
  private loginMock(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        let token: string | null = null;
        
        if (email === 'admin@example.com' && password === 'admin123') {
          token = this.generateMockToken('1', 'Admin User', email, 'admin', '0001', '123456');
        } else if (email === 'user@example.com' && password === 'user123') {
          token = this.generateMockToken('2', 'Regular User', email, 'user', '1234', '567890');
        }

        if (token) {
          const payload = this.decodeToken(token);
          if (payload) {
            const user = this.payloadToUser(payload);
            this.setCurrentUser(user, token);
            observer.next(true);
          } else {
            observer.next(false);
          }
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem(this.jwtTokenKey);
    localStorage.removeItem(this.currentUserKey);
    
    // Publicar evento de logout para outros MFEs
    this.crossMfeAuth.publishLogout();
  }

  getToken(): string | null {
    return localStorage.getItem(this.jwtTokenKey);
  }

  private setCurrentUser(user: User, token: string): void {
    this.currentUserSignal.set(user);
    this.isAuthenticatedSubject.next(true);
    localStorage.setItem(this.jwtTokenKey, token);
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Decodifica o token JWT (sem validar assinatura - apenas para extrair payload).
   * Em produção, a validação é feita no backend.
   */
  private decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica se o token expirou.
   */
  private isTokenExpired(payload: JwtPayload): boolean {
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /**
   * Converte payload JWT para User.
   */
  private payloadToUser(payload: JwtPayload): User {
    return {
      id: payload.sub,
      name: payload.nome || 'Usuário',
      email: payload.email || '',
      role: 'user', // Poderia vir do token se necessário
      agencia: payload.agencia,
      conta: payload.conta,
    };
  }

  /**
   * Gera um token JWT mock para testes.
   * Em produção, o token vem do servidor de autenticação.
   */
  private generateMockToken(
    id: string,
    name: string,
    email: string,
    role: string,
    agencia: string,
    conta: string
  ): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: id,
      agencia,
      conta,
      email,
      nome: name,
      iat: now,
      exp: now + 3600, // Expira em 1 hora
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    // Nota: assinatura mock (em produção vem do servidor)
    const signature = 'mock-signature-' + Math.random().toString(36);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}
