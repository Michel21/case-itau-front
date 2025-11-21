import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CertificadoCompromissadas {
  certificado: string;
  dataEmissao: string;
  valorPrincipal: number;
  valorBruto: number;
  valorLiquido: number;
  expandido?: boolean;
  // Informações da operação
  investimentoInicial?: number;
  indexador?: string;
  percentualIndexador?: number;
  dataVencimentoOperacao?: string;
  valorIOF?: number;
  valorIRRF?: number;
  quantidadePapeis?: number;
  precoUnitarioAtual?: number;
  // Informações do papel
  codigo?: string;
  tipo?: string;
  emissor?: string;
  dataVencimentoPapel?: string;
}

@Component({
  selector: 'app-operacoes-compromissadas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './operacoes-compromissadas.component.html',
  styleUrls: ['./operacoes-compromissadas.component.scss']
})
export class OperacoesCompromissadasComponent {
  
  // Dados dos certificados (15 itens como na imagem)
  readonly certificados = signal<CertificadoCompromissadas[]>([
    {
      certificado: '140999840',
      dataEmissao: '18/08/2024',
      valorPrincipal: 174955.04,
      valorBruto: 175997.84,
      valorLiquido: 175765.42,
      expandido: false,
      investimentoInicial: 174955.94,
      indexador: 'DI',
      percentualIndexador: 60,
      dataVencimentoOperacao: '16/07/2025',
      valorIOF: 0.00,
      valorIRRF: 234.42,
      quantidadePapeis: 163,
      precoUnitarioAtual: 1079.74,
      codigo: 'FOZG12',
      tipo: 'DEB',
      emissor: 'BRK AMBIENTAL - GOIAS SA',
      dataVencimentoPapel: '15/04/2029'
    },
    {
      certificado: '141022837',
      dataEmissao: '20/06/2025',
      valorPrincipal: 201466.28,
      valorBruto: 202479.36,
      valorLiquido: 202251.42,
      expandido: false
    },
    {
      certificado: '141042872',
      dataEmissao: '25/06/2025',
      valorPrincipal: 20872.01,
      valorBruto: 21078.37,
      valorLiquido: 21031.94,
      expandido: false
    },
    {
      certificado: '141058807',
      dataEmissao: '27/06/2025',
      valorPrincipal: 2165.54,
      valorBruto: 2181.10,
      valorLiquido: 2177.60,
      expandido: false
    },
    {
      certificado: '141068191',
      dataEmissao: '04/03/2025',
      valorPrincipal: 500901.80,
      valorBruto: 502893.12,
      valorLiquido: 502893.12,
      expandido: false
    },
    {
      certificado: '141058507',
      dataEmissao: '27/08/2025',
      valorPrincipal: 2005.54,
      valorBruto: 2005.54,
      valorLiquido: 2177.80,
      expandido: false
    },
    {
      certificado: '141058507',
      dataEmissao: '07/02/2026',
      valorPrincipal: 400455.55,
      valorBruto: 400455.55,
      valorLiquido: 400455.55,
      expandido: false
    },
    {
      certificado: '141058507',
      dataEmissao: '01/01/2026',
      valorPrincipal: 0.00,
      valorBruto: 0.00,
      valorLiquido: 0.00,
      expandido: false
    },
    {
      certificado: '141058507',
      dataEmissao: '15/03/2025',
      valorPrincipal: 150000.00,
      valorBruto: 151500.00,
      valorLiquido: 151500.00,
      expandido: false
    },
    {
      certificado: '141058507',
      dataEmissao: '20/04/2025',
      valorPrincipal: 75000.00,
      valorBruto: 75750.00,
      valorLiquido: 75750.00,
      expandido: false
    },
    {
      certificado: '141058507',
      dataEmissao: '10/05/2025',
      valorPrincipal: 300000.00,
      valorBruto: 303000.00,
      valorLiquido: 303000.00,
      expandido: false
    },
    {
      certificado: '141058507',
      dataEmissao: '25/06/2025',
      valorPrincipal: 120000.00,
      valorBruto: 121200.00,
      valorLiquido: 121200.00,
      expandido: false
    },
    {
      certificado: '141058507',
      dataEmissao: '30/07/2025',
      valorPrincipal: 95000.00,
      valorBruto: 95950.00,
      valorLiquido: 95950.00,
      expandido: false
    },
    {
      certificado: '141058507',
      dataEmissao: '12/09/2025',
      valorPrincipal: 180000.00,
      valorBruto: 181800.00,
      valorLiquido: 181800.00,
      expandido: false
    },
    {
      certificado: '141058507',
      dataEmissao: '15/10/2025',
      valorPrincipal: 250000.00,
      valorBruto: 252500.00,
      valorLiquido: 252500.00,
      expandido: false
    }
  ]);

  // Direção de ordenação para cada coluna
  readonly sortDirection = signal<Record<string, 'asc' | 'desc'>>({});

  // Valores totais computados
  readonly valorBrutoTotal = computed(() => {
    return this.certificados().reduce((total, cert) => total + cert.valorBruto, 0);
  });

  readonly valorLiquidoTotal = computed(() => {
    return this.certificados().reduce((total, cert) => total + cert.valorLiquido, 0);
  });

  // Paginação
  readonly pageSize = signal(5);
  readonly currentPage = signal(1);

  // Certificados ordenados
  readonly certificadosOrdenados = computed(() => {
    const certificados = [...this.certificados()];
    const sortState = this.sortDirection();
    const colunaAtiva = Object.keys(sortState).find(col => 
      sortState[col] !== undefined
    );

    console.log('🔄 Computando ordenação:', { 
      certificadosCount: certificados.length,
      colunaAtiva, 
      sortState,
      certificadosSample: certificados.slice(0, 2)
    });

    if (!colunaAtiva) {
      console.log('❌ Nenhuma coluna ativa, retornando dados originais');
      return certificados;
    }

    const direcao = sortState[colunaAtiva];
    console.log(`📈 Ordenando por ${colunaAtiva} em ordem ${direcao}`);
    
    const certificadosOrdenados = certificados.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (colunaAtiva) {
        case 'certificado':
          valorA = a.certificado;
          valorB = b.certificado;
          break;
        case 'dataEmissao':
          // Converter DD/MM/YYYY para Date
          const [diaA, mesA, anoA] = a.dataEmissao.split('/');
          const [diaB, mesB, anoB] = b.dataEmissao.split('/');
          valorA = new Date(parseInt(anoA), parseInt(mesA) - 1, parseInt(diaA));
          valorB = new Date(parseInt(anoB), parseInt(mesB) - 1, parseInt(diaB));
          break;
        case 'valorPrincipal':
          valorA = a.valorPrincipal;
          valorB = b.valorPrincipal;
          break;
        case 'valorBruto':
          valorA = a.valorBruto;
          valorB = b.valorBruto;
          break;
        case 'valorLiquido':
          valorA = a.valorLiquido;
          valorB = b.valorLiquido;
          break;
        default:
        return 0;
      }
      
      if (valorA == null || valorB == null) {
        return 0;
      }

      let resultado: number;
      
      if (typeof valorA === 'string' && typeof valorB === 'string') {
        resultado = valorA.localeCompare(valorB);
      } else if (valorA instanceof Date && valorB instanceof Date) {
        resultado = valorA.getTime() - valorB.getTime();
      } else {
        resultado = valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      }

      return direcao === 'asc' ? resultado : -resultado;
    });

    console.log('✅ Ordenação concluída:', {
      primeiro: certificadosOrdenados[0] ? this.getCertificadoValue(certificadosOrdenados[0], colunaAtiva) : null,
      ultimo: certificadosOrdenados[certificadosOrdenados.length - 1] ? this.getCertificadoValue(certificadosOrdenados[certificadosOrdenados.length - 1], colunaAtiva) : null
    });

    return certificadosOrdenados;
  });

  // Certificados paginados
  readonly certificadosPaginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.certificadosOrdenados().slice(start, end);
  });

  // Informações de paginação
  readonly totalPages = computed(() => {
    return Math.ceil(this.certificados().length / this.pageSize());
  });

  readonly paginationInfo = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), this.certificados().length);
    return `${start}-${end} de ${this.certificados().length} itens`;
  });

  onOrdenar(
    coluna: 'certificado' | 'dataEmissao' | 'valorPrincipal' | 'valorBruto' | 'valorLiquido'
  ): void {
    console.log('🎯 CLIQUE DETECTADO na coluna:', coluna);
    
    const direcaoAtual = this.sortDirection()[coluna] || 'asc';
    const novaDirecao = direcaoAtual === 'asc' ? 'desc' : 'asc';
    
    console.log('📊 Estado atual:', { direcaoAtual, novaDirecao, sortState: this.sortDirection() });
    
    // Limpar outras colunas e definir nova direção
    this.sortDirection.set({ [coluna]: novaDirecao });
    
    // Reset para página 1 quando ordenar
    this.currentPage.set(1);
    
    console.log('✅ Novo estado:', { coluna, novaDirecao, sortState: this.sortDirection() });
  }

  // Formatação de valores monetários
  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  // Formatação do valor total
  formatarValorTotal(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  // Métodos de paginação
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  firstPage(): void {
    this.currentPage.set(1);
  }

  lastPage(): void {
    this.currentPage.set(this.totalPages());
  }

  // Método para expandir/colapsar linha
  toggleExpandir(certificado: CertificadoCompromissadas): void {
    const certificados = this.certificados();
    const index = certificados.findIndex(c => c.certificado === certificado.certificado);
    
    if (index !== -1) {
      certificados[index].expandido = !certificados[index].expandido;
      this.certificados.set([...certificados]);
    }
  }

  // Método auxiliar para acessar propriedades dinâmicas
  private getCertificadoValue(certificado: CertificadoCompromissadas, coluna: string): any {
    switch (coluna) {
      case 'certificado':
        return certificado.certificado;
      case 'dataEmissao':
        return certificado.dataEmissao;
      case 'valorPrincipal':
        return certificado.valorPrincipal;
      case 'valorBruto':
        return certificado.valorBruto;
      case 'valorLiquido':
        return certificado.valorLiquido;
      default:
        return null;
    }
  }
}