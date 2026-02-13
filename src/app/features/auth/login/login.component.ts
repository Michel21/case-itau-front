import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { fadeInOut } from '../../../animations/route.animations';
import { buttonAnimation } from '../../../animations/component.animations';

/**
 * Componente de login seguindo padrão do MFE Home.
 * 
 * Características:
 * - Signals para estado reativo
 * - ChangeDetectionStrategy.OnPush para performance
 * - Computed signals para validação
 * - Integração com API de autenticação (banco de dados)
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

  // Signals de estado
  public readonly email = signal<string>('');
  public readonly password = signal<string>('');
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');
  public readonly buttonState = signal<'normal' | 'hover'>('normal');

  // Computed signals (seguindo padrão do home)
  public readonly isFormValid = computed(() => {
    const emailValue = this.email().trim();
    const passwordValue = this.password().trim();
    return emailValue.length > 0 && passwordValue.length >= 6;
  }, { equal: (a, b) => a === b });

  public readonly canSubmit = computed(() => {
    return this.isFormValid() && !this.isLoading();
  }, { equal: (a, b) => a === b });

  // Handlers de eventos
  onEmailChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
    // Limpar erro ao digitar
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  onPasswordChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.password.set(target.value);
    // Limpar erro ao digitar
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  onButtonHover(): void {
    if (!this.isLoading()) {
      this.buttonState.set('hover');
    }
  }

  onButtonLeave(): void {
    this.buttonState.set('normal');
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      if (!this.email().trim()) {
        this.errorMessage.set('Por favor, informe seu email');
      } else if (!this.password().trim()) {
        this.errorMessage.set('Por favor, informe sua senha');
      } else if (this.password().trim().length < 6) {
        this.errorMessage.set('A senha deve ter no mínimo 6 caracteres');
      }
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Chamar API de autenticação (banco de dados)
    this.authService.login(this.email().trim(), this.password().trim()).subscribe({
      next: (success) => {
        if (success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
          this.router.navigate([returnUrl]);
        } else {
          this.errorMessage.set('Credenciais inválidas. Verifique email e senha.');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro no login:', error);
        if (error.status === 401) {
          this.errorMessage.set('Credenciais inválidas. Verifique email e senha.');
        } else if (error.status === 0) {
          this.errorMessage.set('Erro de conexão. Verifique se a API está rodando.');
        } else {
          this.errorMessage.set(`Erro ao fazer login: ${error.message || 'Erro desconhecido'}`);
        }
        this.isLoading.set(false);
      }
    });
  }

  // Credenciais de teste (seguindo padrão do home com botões de ação)
  fillAdminCredentials(): void {
    if (!this.isLoading()) {
      this.email.set('admin@example.com');
      this.password.set('admin123');
      this.errorMessage.set('');
    }
  }

  fillUserCredentials(): void {
    if (!this.isLoading()) {
      this.email.set('user@example.com');
      this.password.set('user123');
      this.errorMessage.set('');
    }
  }
}
