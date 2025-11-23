import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToggleSegmentedComponent, ToggleOption } from './toggle-segmented.component';

@Component({
  selector: 'app-toggle-segmented-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToggleSegmentedComponent],
  template: `
    <div class="demo-container">
      <h1>Toggle Segmented Demo</h1>

      <!-- Exemplo Básico -->
      <section class="demo-section">
        <h2>Básico (ngModel)</h2>
        <app-toggle-segmented
          [options]="optionsBasic"
          [(ngModel)]="selectedBasic"
          ariaLabel="Seleção básica"
        />
        <p>Selecionado: {{ selectedBasic() }}</p>
      </section>

      <!-- Variantes -->
      <section class="demo-section">
        <h2>Variantes</h2>
        
        <h3>Outline (Default)</h3>
        <app-toggle-segmented
          [options]="optionsBasic"
          [(ngModel)]="selectedVariant"
          [styleConfig]="{ variant: 'outline' }"
        />

        <h3>Pills</h3>
        <app-toggle-segmented
          [options]="optionsBasic"
          [(ngModel)]="selectedVariant"
          [styleConfig]="{ variant: 'pills' }"
        />

        <h3>Underline</h3>
        <app-toggle-segmented
          [options]="optionsBasic"
          [(ngModel)]="selectedVariant"
          [styleConfig]="{ variant: 'underline' }"
        />

        <h3>Ghost</h3>
        <app-toggle-segmented
          [options]="optionsBasic"
          [(ngModel)]="selectedVariant"
          [styleConfig]="{ variant: 'ghost' }"
        />
      </section>

      <!-- Cores -->
      <section class="demo-section">
        <h2>Cores</h2>
        <div class="gap-md">
          <app-toggle-segmented
            [options]="optionsBasic"
            [(ngModel)]="selectedColor"
            [styleConfig]="{ color: 'primary' }"
          />
          <app-toggle-segmented
            [options]="optionsBasic"
            [(ngModel)]="selectedColor"
            [styleConfig]="{ color: 'secondary' }"
          />
          <app-toggle-segmented
            [options]="optionsBasic"
            [(ngModel)]="selectedColor"
            [styleConfig]="{ color: 'success' }"
          />
          <app-toggle-segmented
            [options]="optionsBasic"
            [(ngModel)]="selectedColor"
            [styleConfig]="{ color: 'danger' }"
          />
        </div>
      </section>

      <!-- Full Width -->
      <section class="demo-section">
        <h2>Full Width</h2>
        <app-toggle-segmented
          [options]="optionsLong"
          [(ngModel)]="selectedFull"
          [styleConfig]="{ fullWidth: true }"
        />
      </section>

      <!-- Reactive Forms -->
      <section class="demo-section">
        <h2>Reactive Forms</h2>
        <form [formGroup]="form">
          <app-toggle-segmented
            [options]="optionsBasic"
            formControlName="tipo"
            [styleConfig]="{ variant: 'pills', fullWidth: true }"
          />
        </form>
        <p>Form Value: {{ form.value | json }}</p>
        <div class="actions">
          <button (click)="disableForm()">Toggle Disabled</button>
          <button (click)="resetForm()">Reset</button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .demo-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h2 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    h3 { margin: 1rem 0 0.5rem; font-size: 1rem; color: #666; }
    .gap-md { display: flex; flex-direction: column; gap: 1rem; }
    .actions { margin-top: 1rem; display: flex; gap: 0.5rem; }
    button { padding: 0.5rem 1rem; cursor: pointer; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleSegmentedDemoComponent {
  // Options
  readonly optionsBasic: ToggleOption[] = [
    { value: 'mes', label: 'Mês' },
    { value: 'ano', label: 'Ano' },
    { value: 'periodo', label: 'Período' }
  ];

  readonly optionsLong: ToggleOption[] = [
    { value: '1', label: 'Opção Longa 1' },
    { value: '2', label: 'Opção Longa 2' },
    { value: '3', label: 'Opção Longa 3' }
  ];

  // State
  readonly selectedBasic = signal('mes');
  readonly selectedVariant = signal('mes');
  readonly selectedColor = signal('mes');
  readonly selectedFull = signal('1');

  // Forms
  form = this.fb.group({
    tipo: ['mes', Validators.required]
  });

  constructor(private fb: FormBuilder) {}

  disableForm() {
    if (this.form.disabled) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  resetForm() {
    this.form.reset({ tipo: 'mes' });
  }
}

