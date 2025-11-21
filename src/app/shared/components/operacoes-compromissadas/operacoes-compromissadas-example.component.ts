import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperacoesCompromissadasComponent, CertificadoCompromissadas } from './operacoes-compromissadas.component';

@Component({
  selector: 'app-operacoes-compromissadas-example',
  standalone: true,
  imports: [CommonModule, OperacoesCompromissadasComponent],
  template: `
    <div class="example-container">
      <h1>Exemplo - Operações Compromissadas</h1>
      
      <app-operacoes-compromissadas
        [certificados]="certificados"
        [valorBrutoTotal]="valorBrutoTotal"
        [valorLiquidoTotal]="valorLiquidoTotal"
        [totalItens]="totalItens"
        [paginaAtual]="paginaAtual"
        [itensPorPagina]="itensPorPagina"
        (ordenar)="onOrdenar($event)"
        (mudarPagina)="onMudarPagina($event)"
        (ocultarValores)="onOcultarValores()">
      </app-operacoes-compromissadas>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
  `]
})
export class OperacoesCompromissadasExampleComponent implements OnInit {
  
  certificados: CertificadoCompromissadas[] = [];
  valorBrutoTotal: number = 0;
  valorLiquidoTotal: number = 0;
  totalItens: number = 0;
  paginaAtual: number = 1;
  itensPorPagina: number = 15;

  ngOnInit(): void {
    this.carregarDadosExemplo();
  }

  /**
   * Carregar dados de exemplo baseados na imagem
   */
  private carregarDadosExemplo(): void {
    this.certificados = [
      {
        certificado: '1405190840',
        dataEmissao: '18/08/2024',
        valorPrincipal: 175997.84,
        valorBruto: 21078.57,
        valorLiquido: 21778.0
      },
      {
        certificado: '141058507',
        dataEmissao: '27/05/2025',
        valorPrincipal: 2165.54,
        valorBruto: 2181.10,
        valorLiquido: 2177.80
      },
      {
        certificado: '142345678',
        dataEmissao: '15/06/2024',
        valorPrincipal: 50000.00,
        valorBruto: 51000.00,
        valorLiquido: 50800.00
      },
      {
        certificado: '143456789',
        dataEmissao: '22/07/2024',
        valorPrincipal: 25000.00,
        valorBruto: 25250.00,
        valorLiquido: 25200.00
      },
      {
        certificado: '144567890',
        dataEmissao: '10/09/2024',
        valorPrincipal: 100000.00,
        valorBruto: 101500.00,
        valorLiquido: 101200.00
      },
      {
        certificado: '145678901',
        dataEmissao: '05/10/2024',
        valorPrincipal: 75000.00,
        valorBruto: 76250.00,
        valorLiquido: 76000.00
      },
      {
        certificado: '146789012',
        dataEmissao: '18/11/2024',
        valorPrincipal: 30000.00,
        valorBruto: 30450.00,
        valorLiquido: 30400.00
      },
      {
        certificado: '147890123',
        dataEmissao: '12/12/2024',
        valorPrincipal: 150000.00,
        valorBruto: 152250.00,
        valorLiquido: 151800.00
      },
      {
        certificado: '148901234',
        dataEmissao: '25/01/2025',
        valorPrincipal: 80000.00,
        valorBruto: 81200.00,
        valorLiquido: 81000.00
      },
      {
        certificado: '149012345',
        dataEmissao: '08/02/2025',
        valorPrincipal: 120000.00,
        valorBruto: 121800.00,
        valorLiquido: 121500.00
      },
      {
        certificado: '150123456',
        dataEmissao: '20/03/2025',
        valorPrincipal: 90000.00,
        valorBruto: 91350.00,
        valorLiquido: 91200.00
      },
      {
        certificado: '151234567',
        dataEmissao: '15/04/2025',
        valorPrincipal: 60000.00,
        valorBruto: 60900.00,
        valorLiquido: 60750.00
      },
      {
        certificado: '152345678',
        dataEmissao: '30/04/2025',
        valorPrincipal: 40000.00,
        valorBruto: 40600.00,
        valorLiquido: 40500.00
      },
      {
        certificado: '153456789',
        dataEmissao: '12/05/2025',
        valorPrincipal: 35000.00,
        valorBruto: 35525.00,
        valorLiquido: 35475.00
      }
    ];

    // Calcular totais
    this.valorBrutoTotal = this.certificados.reduce((total, cert) => total + cert.valorBruto, 0);
    this.valorLiquidoTotal = this.certificados.reduce((total, cert) => total + cert.valorLiquido, 0);
    this.totalItens = this.certificados.length;
  }

  /**
   * Handler para ordenação com suporte a todas as páginas
   */
  onOrdenar(event: { coluna: string; direcao: 'asc' | 'desc' }): void {
    console.log('Ordenar:', event);
    
    // Exemplo de ordenação global (todas as páginas)
    this.ordenarDadosGlobais(event.coluna, event.direcao);
    
    // Atualizar dados locais para demonstração
    this.atualizarDadosOrdenados(event.coluna, event.direcao);
  }

  /**
   * Simula ordenação global (backend)
   */
  private ordenarDadosGlobais(coluna: string, direcao: 'asc' | 'desc'): void {
    console.log(`Ordenando globalmente por ${coluna} - ${direcao}`);
    
    // Aqui você faria a chamada para o backend
    // this.apiService.ordenarOperacoes(coluna, direcao, this.paginaAtual)
    //   .subscribe(dados => {
    //     this.certificados = dados.itens;
    //     this.totalItens = dados.total;
    //   });
  }

  /**
   * Atualiza dados locais para demonstração
   */
  private atualizarDadosOrdenados(coluna: string, direcao: 'asc' | 'desc'): void {
    this.certificados = [...this.certificados].sort((a, b) => {
      const valorA = a[coluna as keyof typeof a];
      const valorB = b[coluna as keyof typeof b];
      
      if (valorA == null || valorB == null) {
        return 0;
      }
      
      if (valorA < valorB) {
        return direcao === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return direcao === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Handler para mudança de página
   */
  onMudarPagina(novaPagina: number): void {
    console.log('Mudar página:', novaPagina);
    this.paginaAtual = novaPagina;
    // Aqui você implementaria a lógica de paginação no backend
  }

  /**
   * Handler para ocultar/mostrar valores
   */
  onOcultarValores(): void {
    console.log('Alternar visibilidade dos valores');
    // A lógica de ocultar/mostrar é gerenciada internamente pelo componente
  }
}
