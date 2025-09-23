import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de teste simples para verificar se o problema é com o template
 */
@Component({
  selector: 'app-extrato-generator-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; background: #f0f0f0; border: 2px solid #333;">
      <h1>🧪 Teste ExtratoGeneratorService</h1>
      <p>Se você está vendo esta mensagem, o componente está funcionando!</p>
      <p>Data atual: {{ dataAtual }}</p>
      <button (click)="testar()" style="padding: 10px; background: #007bff; color: white; border: none; border-radius: 5px;">
        Testar Funcionalidade
      </button>
      <div *ngIf="mensagem" style="margin-top: 10px; padding: 10px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px;">
        {{ mensagem }}
      </div>
    </div>
  `
})
export class ExtratoGeneratorTestComponent {
  dataAtual = new Date().toLocaleString();
  mensagem = '';

  testar(): void {
    this.mensagem = '✅ Componente funcionando perfeitamente!';
    setTimeout(() => {
      this.mensagem = '';
    }, 3000);
  }
}
