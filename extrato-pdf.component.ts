import { Component, OnInit } from '@angular/core';
import { ExtratoPdfService, ExtratoDados } from './extrato-pdf.service';

@Component({
  selector: 'app-extrato-pdf',
  templateUrl: './extrato-pdf.component.html',
  styleUrls: ['./extrato-pdf.component.css']
})
export class ExtratoPdfComponent implements OnInit {
  dadosAtuais: ExtratoDados = {
    empresa: 'EMPRESA EXEMPLO LTDA',
    agencia: '0001 | 123456-7',
    dataBusca: '25/08/2025',
    tipoInvestimento: 'CDB',
    tipoProduto: 'CDB Pós-fixado',
    saldoAnterior: {
      dataSaldo: '31/07/2025',
      itens: [
        {
          dataAplicacao: '15/07/2025',
          dataVencimento: '15/08/2025',
          dataResgate: '15/08/2025',
          taxa: 12.5,
          valorPrincipal: 100000.00,
          valorBruto: 101041.67,
          rendaTotal: 1041.67,
          iof: 0.00,
          irrf: 156.25,
          valorLiquido: 100885.42,
          rendaBrutaPer: 1041.67
        }
      ],
      totalValorPrincipal: 100000.00,
      totalValorBruto: 101041.67,
      totalRendaTotal: 1041.67,
      totalIof: 0.00,
      totalIrrf: 156.25,
      totalValorLiquido: 100885.42,
      totalRendaBrutaPer: 1041.67
    },
    aplicacoes: {
      itens: [
        {
          dataAplicacao: '01/08/2025',
          dataVencimento: '01/09/2025',
          dataResgate: '01/09/2025',
          taxa: 12.0,
          valorPrincipal: 50000.00,
          valorBruto: 50500.00,
          rendaTotal: 500.00,
          iof: 0.00,
          irrf: 75.00,
          valorLiquido: 50425.00,
          rendaBrutaPer: 500.00
        }
      ],
      totalValorPrincipal: 50000.00,
      totalValorBruto: 50500.00,
      totalRendaTotal: 500.00,
      totalIof: 0.00,
      totalIrrf: 75.00,
      totalValorLiquido: 50425.00,
      totalRendaBrutaPer: 500.00
    },
    resgates: {
      itens: [
        {
          dataAplicacao: '10/08/2025',
          dataVencimento: '10/09/2025',
          dataResgate: '10/08/2025',
          taxa: 11.5,
          valorPrincipal: 25000.00,
          valorBruto: 25239.58,
          rendaTotal: 239.58,
          iof: 0.00,
          irrf: 35.94,
          valorLiquido: 25203.64,
          rendaBrutaPer: 239.58
        }
      ],
      totalValorPrincipal: 25000.00,
      totalValorBruto: 25239.58,
      totalRendaTotal: 239.58,
      totalIof: 0.00,
      totalIrrf: 35.94,
      totalValorLiquido: 25203.64,
      totalRendaBrutaPer: 239.58
    },
    saldoFinal: {
      dataSaldo: '25/08/2025',
      itens: [
        {
          dataAplicacao: '01/08/2025',
          dataVencimento: '01/09/2025',
          dataResgate: '01/09/2025',
          taxa: 12.0,
          valorPrincipal: 125000.00,
          valorBruto: 126541.67,
          rendaTotal: 1541.67,
          iof: 0.00,
          irrf: 231.25,
          valorLiquido: 126310.42,
          rendaBrutaPer: 1541.67
        }
      ],
      totalValorPrincipal: 125000.00,
      totalValorBruto: 126541.67,
      totalRendaTotal: 1541.67,
      totalIof: 0.00,
      totalIrrf: 231.25,
      totalValorLiquido: 126310.42,
      totalRendaBrutaPer: 1541.67
    }
  };

  dataTransacao = '25/08/2025';
  numeroControle = '202508250001';

  constructor(private extratoPdfService: ExtratoPdfService) { }

  ngOnInit(): void { }

  // Getters para performance
  get temSaldoAnterior(): boolean {
    return this.dadosAtuais.saldoAnterior?.itens?.length > 0;
  }

  get temAplicacoes(): boolean {
    return this.dadosAtuais.aplicacoes?.itens?.length > 0;
  }

  get temResgates(): boolean {
    return this.dadosAtuais.resgates?.itens?.length > 0;
  }

  get temSaldoFinal(): boolean {
    return this.dadosAtuais.saldoFinal?.itens?.length > 0;
  }

  // Método para gerar PDF corporativo
  async gerarPDFCorporativo(): Promise<void> {
    try {
      const config = this.extratoPdfService.criarConfigPDF(this.dataTransacao, this.numeroControle);
      await this.extratoPdfService.gerarPDFCorporativo(this.dadosAtuais, config);
    } catch (error) {
      console.error('Erro ao gerar PDF corporativo:', error);
    }
  }

  // Método para gerar PDF básico (print)
  gerarPDF(): void {
    this.extratoPdfService.gerarPDFPrint();
  }

  // Método para exportar HTML
  exportarHTML(): void {
    const config = this.extratoPdfService.criarConfigPDF(this.dataTransacao, this.numeroControle);
    this.extratoPdfService.exportarHTML(this.dadosAtuais, config);
  }

  // Método para gerar CSV
  gerarCSV(): void {
    const config = this.extratoPdfService.criarConfigPDF(this.dataTransacao, this.numeroControle);
    this.extratoPdfService.gerarCSV(this.dadosAtuais, config);
  }
}

