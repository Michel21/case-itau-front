import { Component, signal, computed, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { fadeInOut } from '../../../../animations/route.animations';
import { buttonAnimation } from '../../../../animations/component.animations';

/**
 * Componente de Login seguindo padrão do HomeComponent.
 * 
 * Características do padrão Home:
 * - Signals reativos para estado
 * - Computed signals para validação
 * - ChangeDetectionStrategy.OnPush para performance
 * - Estrutura de classes BEM-like
 * - Integração com API de autenticação
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut, buttonAnimation]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals de estado (seguindo padrão Home)
  private readonly emailSignal = signal<string>('');
  private readonly passwordSignal = signal<string>('');
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly errorMessageSignal = signal<string>('');
  private readonly buttonStateSignal = signal<'normal' | 'hover'>('normal');

  // Getters públicos (readonly)
  public readonly email = this.emailSignal.asReadonly();
  public readonly password = this.passwordSignal.asReadonly();
  public readonly isLoading = this.isLoadingSignal.asReadonly();
  public readonly errorMessage = this.errorMessageSignal.asReadonly();
  public readonly buttonState = this.buttonStateSignal.asReadonly();

  // Computed signals (seguindo padrão Home)
  public readonly isFormValid = computed(() => {
    const email = this.emailSignal().trim();
    const password = this.passwordSignal().trim();
    return email.length > 0 && 
           email.includes('@') && 
           password.length >= 6;
  }, { equal: (a, b) => a === b });

  public readonly canSubmit = computed(() => {
    return this.isFormValid() && !this.isLoadingSignal();
  }, { equal: (a, b) => a === b });

  public readonly showError = computed(() => {
    return this.errorMessageSignal().length > 0;
  }, { equal: (a, b) => a === b });

  constructor() {
    // Effect: limpar erro ao digitar (seguindo padrão Home)
    effect(() => {
      const email = this.emailSignal();
      const password = this.passwordSignal();
      
      if (email || password) {
        if (this.errorMessageSignal()) {
          this.errorMessageSignal.set('');
        }
      }
    });
  }

  // Handlers de eventos
  onEmailChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emailSignal.set(target.value);
  }

  onPasswordChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.passwordSignal.set(target.value);
  }

  onButtonHover(): void {
    if (!this.isLoadingSignal()) {
      this.buttonStateSignal.set('hover');
    }
  }

  onButtonLeave(): void {
    this.buttonStateSignal.set('normal');
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      this.validateAndSetError();
      return;
    }

    this.isLoadingSignal.set(true);
    this.errorMessageSignal.set('');

    const email = this.emailSignal().trim();
    const password = this.passwordSignal().trim();

    // Usar AuthService que já integra com a API
    // O AuthService chama POST /v1/auth/login e armazena o token
    this.authService.login(email, password).subscribe({
      next: (success) => {
        if (success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
          this.router.navigate([returnUrl]);
        } else {
          this.errorMessageSignal.set('Credenciais inválidas. Verifique email e senha.');
        }
        this.isLoadingSignal.set(false);
      },
      error: (error) => {
        console.error('Erro no login:', error);
        if (error.status === 401) {
          this.errorMessageSignal.set('Credenciais inválidas. Verifique email e senha.');
        } else if (error.status === 0) {
          this.errorMessageSignal.set('Erro de conexão. Verifique se a API está rodando.');
        } else {
          this.errorMessageSignal.set(`Erro ao fazer login: ${error.message || 'Erro desconhecido'}`);
        }
        this.isLoadingSignal.set(false);
      }
    });
  }

  /**
   * Valida formulário e define mensagem de erro apropriada.
   */
  private validateAndSetError(): void {
    const email = this.emailSignal().trim();
    const password = this.passwordSignal().trim();

    if (!email) {
      this.errorMessageSignal.set('Por favor, informe seu email');
    } else if (!email.includes('@')) {
      this.errorMessageSignal.set('Email inválido');
    } else if (!password) {
      this.errorMessageSignal.set('Por favor, informe sua senha');
    } else if (password.length < 6) {
      this.errorMessageSignal.set('A senha deve ter no mínimo 6 caracteres');
    }
  }

  // Credenciais de teste (seguindo padrão Home com botões de ação)
  fillAdminCredentials(): void {
    if (!this.isLoadingSignal()) {
      this.emailSignal.set('admin@example.com');
      this.passwordSignal.set('admin123');
      this.errorMessageSignal.set('');
    }
  }

  fillUserCredentials(): void {
    if (!this.isLoadingSignal()) {
      this.emailSignal.set('user@example.com');
      this.passwordSignal.set('user123');
      this.errorMessageSignal.set('');
    }
  }
}
