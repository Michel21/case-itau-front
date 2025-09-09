import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent, DatePickerConfig } from './date-picker.component';

@Component({
  selector: 'app-date-picker-example',
  standalone: true,
  imports: [CommonModule, DatePickerComponent],
  template: `
    <div class="example-container">
      <h2>Date Picker Example</h2>
      
      <div class="example-controls">
        <button 
          type="button" 
          class="open-picker-button"
          (click)="showDatePicker.set(true)">
          Abrir Date Picker
        </button>
        
        @if (selectedDate()) {
          <div class="selected-date-info">
            <strong>Data selecionada:</strong> {{ formatDate(selectedDate()!) }}
          </div>
        }
      </div>

      @if (showDatePicker()) {
        <app-date-picker
          [config]="datePickerConfig"
          [selectedDate]="selectedDate()"
          (dateSelected)="onDateSelected($event)"
          (cancelled)="onCancelled()">
        </app-date-picker>
      }
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .example-controls {
      margin: 20px 0;
    }

    .open-picker-button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background: #2563eb;
      }
    }

    .selected-date-info {
      margin-top: 16px;
      padding: 12px;
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
      color: #0c4a6e;
    }
  `]
})
export class DatePickerExampleComponent {
  readonly showDatePicker = signal(false);
  readonly selectedDate = signal<Date | null>(null);

  readonly datePickerConfig: DatePickerConfig = {
    title: 'Selecione a data',
    minDate: new Date(2020, 0, 1), // 1 de janeiro de 2020
    maxDate: new Date(2030, 11, 31), // 31 de dezembro de 2030
    locale: 'pt-BR'
  };

  onDateSelected(date: Date): void {
    this.selectedDate.set(date);
    this.showDatePicker.set(false);
    console.log('Data selecionada:', date);
  }

  onCancelled(): void {
    this.showDatePicker.set(false);
    console.log('Seleção cancelada');
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
