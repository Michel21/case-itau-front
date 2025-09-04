import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SelecaoPeriodoService } from './selecao-periodo.service';
import { PeriodoMesAno } from './interfaces/periodo.interface';

@Component({
  selector: 'app-selecao-periodo',
  templateUrl: './selecao-periodo.component.html',
  styleUrls: ['./selecao-periodo.component.scss'],
  standalone: true,
  imports: [CommonModule],
  animations: []
})
export class SelecaoPeriodoComponent implements OnInit, OnDestroy {
  // Inject do serviço usando a nova sintaxe
  private readonly selecaoPeriodoService = inject(SelecaoPeriodoService);
  private readonly router = inject(Router);

  // Signals para estado do componente
  readonly tipoSelecao = signal<'intervalo' | 'mes'>('mes');
  readonly mesSelecionado = signal<string>('');
  readonly anoSelecionado = signal<string>('');
  readonly dataInicio = signal<string>('');
  readonly dataFim = signal<string>('');

  // Signals do serviço (readonly)
  readonly listaPeriodoMesAno = this.selecaoPeriodoService.periodos;
  readonly meses = this.selecaoPeriodoService.meses;
  readonly anos = this.selecaoPeriodoService.anos;

  // Computed values para validações
  readonly intervaloInvalido = computed(() => {
    if (this.tipoSelecao() !== 'intervalo') return false;
    
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    
    if (!inicio || !fim) return false;
    
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    
    return !this.selecaoPeriodoService.validarIntervaloDatas(dataInicio, dataFim);
  });

  readonly limiteHistoricoInvalido = computed(() => {
    if (this.tipoSelecao() !== 'intervalo') return false;
    
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    
    if (!inicio || !fim) return false;
    
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    
    return !this.selecaoPeriodoService.validarLimiteHistorico(dataInicio) || 
           !this.selecaoPeriodoService.validarLimiteHistorico(dataFim);
  });

  readonly mensagemErro = computed(() => {
    if (this.tipoSelecao() === 'mes') {
      const resultado = this.selecaoPeriodoService.validarPeriodoCompleto(
        'mes',
        this.mesSelecionado(),
        this.anoSelecionado()
      );
      return resultado.mensagem;
    }
    
    if (this.tipoSelecao() === 'intervalo') {
      const inicio = this.dataInicio();
      const fim = this.dataFim();
      
      if (!inicio || !fim) return '';
      
      const dataInicio = new Date(inicio);
      const dataFim = new Date(fim);
      
      const resultado = this.selecaoPeriodoService.validarPeriodoCompleto(
        'intervalo',
        undefined,
        undefined,
        dataInicio,
        dataFim
      );
      return resultado.mensagem;
    }
    
    return '';
  });

  readonly temErros = computed(() => {
    return this.intervaloInvalido() || this.limiteHistoricoInvalido() || !!this.mensagemErro();
  });

  readonly botaoDesabilitado = computed(() => {
    return this.temErros();
  });

  readonly periodoFormatado = computed(() => {
    if (this.tipoSelecao() === 'mes') {
      return this.selecaoPeriodoService.formatarPeriodo(
        this.mesSelecionado(),
        this.anoSelecionado()
      );
    }
    
    if (this.tipoSelecao() === 'intervalo') {
      const inicio = this.dataInicio();
      const fim = this.dataFim();
      
      if (!inicio || !fim) return '';
      
      const dataInicio = new Date(inicio);
      const dataFim = new Date(fim);
      
      return this.selecaoPeriodoService.formatarIntervalo(dataInicio, dataFim);
    }
    
    return '';
  });

  constructor() {
    // Removido o effect que causava loop infinito
  }

  ngOnInit(): void {
    console.log('🔍 Debug - ngOnInit iniciado');
    this.inicializarValoresPadrao();
    
    // Verificar se os meses e anos estão sendo carregados
    console.log('🔍 Debug - Dados do serviço:', {
      meses: this.meses(),
      anos: this.anos(),
      mesSelecionado: this.mesSelecionado(),
      anoSelecionado: this.anoSelecionado()
    });
  }

  ngOnDestroy(): void {
    // Cleanup automático com signals
  }

  private inicializarValoresPadrao(): void {
    // Garantir que o mês e ano atuais sejam sempre selecionados por padrão
    const dataAtual = new Date();
    const mesAtual = (dataAtual.getMonth() + 1).toString();
    const anoAtual = dataAtual.getFullYear().toString();
    
    console.log('🔍 Debug - Inicializando valores padrão:', {
      dataAtual: dataAtual.toISOString(),
      mesAtual,
      anoAtual
    });
    
    // Definir mês e ano atuais como padrão
    this.mesSelecionado.set(mesAtual);
    this.anoSelecionado.set(anoAtual);
    
    console.log('🔍 Debug - Valores definidos:', {
      mesSelecionado: this.mesSelecionado(),
      anoSelecionado: this.anoSelecionado()
    });
    
    // Definir data atual como padrão para intervalo
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    this.dataFim.set(dataFormatada);
    
    // Definir data de 30 dias atrás como padrão para início
    const trintaDiasAtras = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000));
    const dataInicioFormatada = trintaDiasAtras.toISOString().split('T')[0];
    this.dataInicio.set(dataInicioFormatada);
  }

  alterarTipoSelecao(tipo: 'intervalo' | 'mes'): void {
    this.tipoSelecao.set(tipo);
    
    // Limpar estado de intervalo quando mudar para seleção de mês
    if (tipo === 'mes') {
      this.dataInicio.set('');
      this.dataFim.set('');
    }
  }

  aplicarFiltro(): void {
    // CONFORME ESPECIFICAÇÃO: Botão apenas visual nesta versão
    console.log('Dados do filtro:', {
      tipo: this.tipoSelecao(),
      mes: this.mesSelecionado(),
      ano: this.anoSelecionado(),
      dataInicio: this.dataInicio(),
      dataFim: this.dataFim(),
      periodoFormatado: this.periodoFormatado(),
      valido: !this.temErros()
    });
    
    // Em uma implementação real, aqui seria feita a navegação ou chamada de API
    // this.router.navigate(['/extrato/pdf'], { 
    //   queryParams: { 
    //     tipo: this.tipoSelecao(),
    //     periodo: this.periodoFormatado()
    //   } 
    // });
  }

  voltar(): void {
    this.router.navigate(['/']);
  }

  obterNomeMes(mes: string): string {
    return this.selecaoPeriodoService.obterNomeMes(mes);
  }

  onKeyDown(event: KeyboardEvent, action: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      
      switch (action) {
        case 'voltar':
          this.voltar();
          break;
        case 'aplicar':
          this.aplicarFiltro();
          break;
        case 'tipo-mes':
          this.alterarTipoSelecao('mes');
          break;
        case 'tipo-intervalo':
          this.alterarTipoSelecao('intervalo');
          break;
      }
    }
  }

  getDataMinima(): string {
    const dataMinima = this.selecaoPeriodoService.obterDataLimiteHistorico();
    return dataMinima.toISOString().split('T')[0];
  }

  getDataMaxima(): string {
    const dataMaxima = this.selecaoPeriodoService.obterDataMaxima();
    return dataMaxima.toISOString().split('T')[0];
  }

  // Métodos para atualizar signals (usados no template)
  atualizarMesSelecionado(mes: string): void {
    this.mesSelecionado.set(mes);
  }

  atualizarAnoSelecionado(ano: string): void {
    this.anoSelecionado.set(ano);
  }

  atualizarDataInicio(data: string): void {
    this.dataInicio.set(data);
  }

  atualizarDataFim(data: string): void {
    this.dataFim.set(data);
  }
}
