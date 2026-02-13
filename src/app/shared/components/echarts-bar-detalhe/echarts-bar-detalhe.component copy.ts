import { Component, Input, Output, EventEmitter, signal, computed, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChartBarItem {
  month: string;
  year: string;
  value: number;
  percentage: number;
  percentageValue: number;
  isPositive: boolean;
  selected: boolean;
}

export interface SelectedBarData {
  month: string;
  monthName: string;
  percentage: number;
  percentageValue: number;
  isPositive: boolean;
}

@Component({
  selector: 'app-echarts-bar-detalhe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './echarts-bar-detalhe.component.html',
  styleUrls: ['./echarts-bar-detalhe.component.scss'],
})
export class EvolucaoChartDetalheComponent implements OnInit, OnChanges {
  @Input() periodo: '3m' | '6m' | '12m' = '6m';
  @Input() ocultarValores = false;

  @Output() selectedBarChange = new EventEmitter<SelectedBarData | null>();

  private readonly monthNames: Record<string, string> = {
    jan: 'Janeiro', fev: 'Fevereiro', mar: 'Março', abr: 'Abril', mai: 'Maio', jun: 'Junho',
    jul: 'Julho', ago: 'Agosto', set: 'Setembro', out: 'Outubro', nov: 'Novembro', dez: 'Dezembro',
  };

  private readonly data6m: ChartBarItem[] = [
    { month: 'fev', year: "'25", value: 140_000, percentage: 6, percentageValue: 1_641.02, isPositive: true, selected: false },
    { month: 'mar', year: '', value: 145_000, percentage: 1.55, percentageValue: 2_247.5, isPositive: true, selected: false },
    { month: 'abr', year: '', value: 125_000, percentage: -2.79, percentageValue: 3_488, isPositive: false, selected: false },
    { month: 'mai', year: '', value: 158_000, percentage: 3.1, percentageValue: 4_898, isPositive: true, selected: false },
    { month: 'jun', year: '', value: 170_000, percentage: 1.64, percentageValue: 2_788, isPositive: true, selected: false },
    { month: 'jul', year: '', value: 160_000, percentage: -1.2, percentageValue: 2_040, isPositive: false, selected: false },
    { month: 'ago', year: '', value: 165_000, percentage: 2.3, percentageValue: 3_795, isPositive: true, selected: false },
    { month: 'set', year: '', value: 155_000, percentage: -1.8, percentageValue: 2_790, isPositive: false, selected: false },
    { month: 'out', year: '', value: 162_000, percentage: 4.5, percentageValue: 7_290, isPositive: true, selected: false },
  ];

  private readonly data3m: ChartBarItem[] = [
    { month: 'abr', year: '', value: 125_000, percentage: -2.79, percentageValue: 3_488, isPositive: false, selected: false },
    { month: 'mai', year: '', value: 158_000, percentage: 3.1, percentageValue: 4_898, isPositive: true, selected: false },
    { month: 'jun', year: '', value: 170_000, percentage: 1.64, percentageValue: 2_788, isPositive: true, selected: false },
  ];

  private readonly data12m: ChartBarItem[] = [
    { month: 'jul', year: "'24", value: 75_000, percentage: 0.5, percentageValue: 375, isPositive: true, selected: false },
    { month: 'ago', year: '', value: 76_000, percentage: 1.33, percentageValue: 1_010.8, isPositive: true, selected: false },
    { month: 'set', year: '', value: 77_500, percentage: 1.97, percentageValue: 1_526.75, isPositive: true, selected: false },
    { month: 'out', year: '', value: 78_000, percentage: 0.65, percentageValue: 507, isPositive: true, selected: false },
    { month: 'nov', year: '', value: 79_000, percentage: 1.28, percentageValue: 1_011.2, isPositive: true, selected: false },
    { month: 'dez', year: '', value: 79_500, percentage: 0.63, percentageValue: 500.85, isPositive: true, selected: false },
    { month: 'fev', year: "'25", value: 80_000, percentage: 6, percentageValue: 1_641.02, isPositive: true, selected: false },
    { month: 'mar', year: '', value: 82_000, percentage: 1.55, percentageValue: 2_247.5, isPositive: true, selected: false },
    { month: 'abr', year: '', value: 79_500, percentage: -2.79, percentageValue: 3_488, isPositive: false, selected: false },
    { month: 'mai', year: '', value: 82_000, percentage: 3.1, percentageValue: 4_898, isPositive: true, selected: false },
    { month: 'jun', year: '', value: 83_500, percentage: 1.64, percentageValue: 2_788, isPositive: true, selected: false },
  ];

  chartData = signal<ChartBarItem[]>([]);

  maxValue = computed(() => Math.max(...this.chartData().map((d) => d.value), 170_000));

  hasSelection = computed(() => this.chartData().some((item) => item.selected));

  /** Maior percentual absoluto para escalar a altura das barras */
  maxPercentage = computed(() => {
    const data = this.chartData();
    if (!data.length) return 1;
    return Math.max(...data.map((d) => Math.abs(d.percentage)), 1);
  });

  /** Altura da barra baseada no percentual, limitada para não cortar o valor e seta acima */
  readonly barHeightMaxPercent = 88;

  getBarHeightPercent(data: ChartBarItem): number {
    const pct = (Math.abs(data.percentage) / this.maxPercentage()) * this.barHeightMaxPercent;
    return Math.min(this.barHeightMaxPercent, Math.max(2, pct));
  }


  ngOnInit(): void {
    this.chartData.set(this.initChartData());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['periodo']) {
      this.chartData.set(this.initChartData());
      this.selectedBarChange.emit(null);
    }
  }


  private initChartData(): ChartBarItem[] {
    let data: ChartBarItem[];
    if (this.periodo === '3m') data = [...this.data3m];
    else if (this.periodo === '12m') data = [...this.data12m];
    else data = [...this.data6m];
    return data.map((d) => ({ ...d, selected: false }));
  }

  toggleBar(selectedData: ChartBarItem): void {
    const data = this.chartData();
    const updated = data.map((item) => ({
      ...item,
      selected:
        item.month === selectedData.month && item.year === selectedData.year ? !item.selected : false,
    }));
    this.chartData.set(updated);

    const selected = updated.find((i) => i.selected);
    if (selected) {
      this.selectedBarChange.emit({
        month: selected.month,
        monthName: this.monthNames[selected.month] ?? selected.month,
        percentage: selected.percentage,
        percentageValue: selected.percentageValue,
        isPositive: selected.isPositive,
      });
    } else {
      this.selectedBarChange.emit(null);
    }
  }

  formatPercent(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatValor(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatYearDisplay(year: string): string {
    if (!year || !year.trim()) return '';
    const match = year.match(/'(\d{2})/);
    if (match) return '20' + match[1];
    return year;
  }
}
