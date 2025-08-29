import { Component, Input, OnInit } from '@angular/core';
import { ExtratoDados, ExtratoSecao } from './types/extrato.types';
import { MOCK_EXTRATO_DATA } from './data/mock-extrato.data';
import { ExtratoUtils } from './utils/extrato.utils';
import { ExtratoPdfService } from './extrato-pdf.service';

@Component({
  selector: 'app-extrato-pdf',
  templateUrl: './extrato-pdf.component.html',
  styleUrls: ['./extrato-pdf.component.css']
})
export class ExtratoPdfComponent implements OnInit {
  @Input() extratoData: ExtratoDados | null = null;

  dadosAtuais: ExtratoDados;
  dataTransacao: string;
  numeroControle: string;

  constructor(private extratoService: ExtratoPdfService) {
    this.dadosAtuais = MOCK_EXTRATO_DATA;
    this.dataTransacao = ExtratoUtils.getDataAtual();
    this.numeroControle = ExtratoUtils.gerarNumeroControle();
  }

  ngOnInit(): void {
    if (this.extratoData) {
      this.dadosAtuais = this.extratoData;
    }
  }

  // Propriedades computadas para verificar se seções têm itens
  get temSaldoAnterior(): boolean {
    return ExtratoUtils.temItens(this.dadosAtuais.saldoAnterior);
  }

  get temAplicacoes(): boolean {
    return ExtratoUtils.temItens(this.dadosAtuais.aplicacoes);
  }

  get temResgates(): boolean {
    return ExtratoUtils.temItens(this.dadosAtuais.resgates);
  }

  get temSaldoFinal(): boolean {
    return ExtratoUtils.temItens(this.dadosAtuais.saldoFinal);
  }

  // Métodos para formatação de data
  getDataGeracao(): string {
    return ExtratoUtils.getDataAtual();
  }

  getHoraGeracao(): string {
    return ExtratoUtils.getHoraAtual();
  }

  // Métodos de exportação delegados para o service
  gerarPDFCorporativo(): void {
    const config = this.extratoService.criarConfigPDF(this.dataTransacao, this.numeroControle);
    this.extratoService.gerarPDFCorporativo(this.dadosAtuais, config);
  }

  gerarPDF(): void {
    this.extratoService.gerarPDFPrint();
  }

  gerarCSV(): void {
    const config = this.extratoService.criarConfigPDF(this.dataTransacao, this.numeroControle);
    this.extratoService.gerarCSV(this.dadosAtuais, config);
  }

  exportarHTML(): void {
    const config = this.extratoService.criarConfigPDF(this.dataTransacao, this.numeroControle);
    this.extratoService.exportarHTML(this.dadosAtuais, config);
  }
}

