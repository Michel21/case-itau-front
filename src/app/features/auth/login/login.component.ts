import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { fadeInOut } from '../../../animations/route.animations';
import { buttonAnimation } from '../../../animations/component.animations';

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

  public readonly email = signal<string>('');
  public readonly password = signal<string>('');
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');

  public readonly buttonState = signal<'normal' | 'hover'>('normal');

  onEmailChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
  }

  onPasswordChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.password.set(target.value);
  }

  onButtonHover(): void {
    this.buttonState.set('hover');
  }

  onButtonLeave(): void {
    this.buttonState.set('normal');
  }

  async onSubmit(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor, preencha todos os campos');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const success = await this.authService.login(this.email(), this.password()).toPromise();
      
      if (success) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigate([returnUrl]);
      } else {
        this.errorMessage.set('Credenciais inválidas');
      }
    } catch (error) {
      this.errorMessage.set('Erro ao fazer login');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Credenciais de teste
  fillAdminCredentials(): void {
    this.email.set('admin@example.com');
    this.password.set('admin123');
  }

  fillUserCredentials(): void {
    this.email.set('user@example.com');
    this.password.set('user123');
  }
}
