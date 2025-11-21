import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XLSDataBuilderService } from './builders/xls-data-builder.service';
import { ExtratoGeneratorCleanService } from './extrato-generator-clean.service';
import { LOGO_BRADESCO_TEST, ICON_BLUE_TEST, ICON_GREEN_TEST } from './test-images.constant';
import { ExtratoData, DocumentConfig, GenerationOptions } from './interfaces/extrato-generator-clean.interfaces';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-xls-image-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-container">
      <h1>📸 Demo - Imagens no Excel (XLS)</h1>
      
      <div class="demo-section">
        <h2>🎯 Imagens de Teste Disponíveis</h2>
        
        <div class="image-preview">
          <div class="preview-item">
            <img [src]="logoBradescoTest" alt="Logo Bradesco">
            <p>Logo Bradesco (Vermelho)</p>
          </div>
          <div class="preview-item">
            <img [src]="iconBlueTest" alt="Ícone Azul">
            <p>Ícone Azul</p>
          </div>
          <div class="preview-item">
            <img [src]="iconGreenTest" alt="Ícone Verde">
            <p>Ícone Verde</p>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h2>📥 Upload de Imagem Personalizada</h2>
        <input 
          type="file" 
          accept="image/*" 
          (change)="onFileSelected($event)"
          class="file-input"
        >
        @if (imagemCustomizada()) {
          <div class="image-preview">
            <div class="preview-item">
              <img [src]="imagemCustomizada()" alt="Imagem personalizada">
              <p>Sua imagem</p>
            </div>
          </div>
        }
      </div>

      <div class="demo-section">
        <h2>🚀 Gerar XLS com Imagem</h2>
        
        <div class="button-group">
          <button (click)="gerarComLogoBradesco()" class="btn btn-primary">
            🏦 Gerar com Logo Bradesco
          </button>
          
          <button (click)="gerarComIconeAzul()" class="btn btn-info">
            🔵 Gerar com Ícone Azul
          </button>
          
          <button (click)="gerarComIconeVerde()" class="btn btn-success">
            🟢 Gerar com Ícone Verde
          </button>
          
          <button 
            (click)="gerarComImagemCustomizada()" 
            [disabled]="!imagemCustomizada()"
            class="btn btn-warning"
          >
            📸 Gerar com Imagem Personalizada
          </button>
        </div>
      </div>

      @if (mensagem()) {
        <div [class]="'alert alert-' + mensagemTipo()">
          {{ mensagem() }}
        </div>
      }

      <div class="demo-section code-section">
        <h2>💻 Código de Exemplo</h2>
        <pre><code>{{ codigoExemplo }}</code></pre>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    h1 {
      color: #1a1a1a;
      margin-bottom: 24px;
      font-size: 28px;
    }

    h2 {
      color: #333;
      margin-bottom: 16px;
      font-size: 20px;
    }

    .demo-section {
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .image-preview {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .preview-item {
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      background: #f8f9fa;
    }

    .preview-item img {
      display: block;
      margin: 0 auto 12px;
      max-width: 100px;
      max-height: 100px;
      border: 2px solid #ddd;
      border-radius: 4px;
      padding: 8px;
      background: white;
    }

    .preview-item p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .file-input {
      padding: 8px;
      border: 2px solid #e5e5e5;
      border-radius: 6px;
      width: 100%;
      max-width: 400px;
      cursor: pointer;
    }

    .button-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-info {
      background: #17a2b8;
      color: white;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-warning {
      background: #ffc107;
      color: #333;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-top: 16px;
      font-size: 14px;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .code-section pre {
      background: #f8f9fa;
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
    }

    .code-section code {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
      color: #333;
    }
  `]
})
export class XlsImageDemoComponent {
  
  readonly logoBradescoTest = LOGO_BRADESCO_TEST;
  readonly iconBlueTest = ICON_BLUE_TEST;
  readonly iconGreenTest = ICON_GREEN_TEST;
  
  readonly imagemCustomizada = signal<string | null>(null);
  readonly mensagem = signal<string>('');
  readonly mensagemTipo = signal<'success' | 'error'>('success');

  readonly codigoExemplo = `// Exemplo de uso:
import { LOGO_BRADESCO_TEST } from './test-images.constant';

await extratoService.generate('xls', data, config, {
  logoBase64: LOGO_BRADESCO_TEST,
  fileName: 'extrato-com-logo.xlsx'
});

// Ou adicionar manualmente:
xlsDataBuilder.addImageToWorkbook(workbook, logo, 'Extrato', {
  col: 0,    // Coluna A
  row: 0,    // Linha 1
  width: 3,  // 3 colunas de largura
  height: 4  // 4 linhas de altura
});`;

  constructor(
    private extratoService: ExtratoGeneratorCleanService,
    private xlsDataBuilder: XLSDataBuilderService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.mostrarMensagem('Por favor, selecione um arquivo de imagem válido.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagemCustomizada.set(e.target?.result as string);
        this.mostrarMensagem('✅ Imagem carregada com sucesso!', 'success');
      };
      reader.onerror = () => {
        this.mostrarMensagem('❌ Erro ao carregar imagem.', 'error');
      };
      reader.readAsDataURL(file);
    }
  }

  async gerarComLogoBradesco(): Promise<void> {
    try {
      console.log('🏦 Gerando XLS com Logo Bradesco...');
      
      const success = await this.gerarXLSComImagem(
        this.logoBradescoTest,
        'extrato-com-logo-bradesco.xlsx'
      );
      
      if (success) {
        this.mostrarMensagem('✅ XLS com Logo Bradesco gerado com sucesso!', 'success');
      } else {
        this.mostrarMensagem('❌ Erro ao gerar XLS.', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      this.mostrarMensagem('❌ Erro ao gerar XLS.', 'error');
    }
  }

  async gerarComIconeAzul(): Promise<void> {
    try {
      console.log('🔵 Gerando XLS com Ícone Azul...');
      
      const success = await this.gerarXLSComImagem(
        this.iconBlueTest,
        'extrato-com-icone-azul.xlsx'
      );
      
      if (success) {
        this.mostrarMensagem('✅ XLS com Ícone Azul gerado com sucesso!', 'success');
      } else {
        this.mostrarMensagem('❌ Erro ao gerar XLS.', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      this.mostrarMensagem('❌ Erro ao gerar XLS.', 'error');
    }
  }

  async gerarComIconeVerde(): Promise<void> {
    try {
      console.log('🟢 Gerando XLS com Ícone Verde...');
      
      const success = await this.gerarXLSComImagem(
        this.iconGreenTest,
        'extrato-com-icone-verde.xlsx'
      );
      
      if (success) {
        this.mostrarMensagem('✅ XLS com Ícone Verde gerado com sucesso!', 'success');
      } else {
        this.mostrarMensagem('❌ Erro ao gerar XLS.', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      this.mostrarMensagem('❌ Erro ao gerar XLS.', 'error');
    }
  }

  async gerarComImagemCustomizada(): Promise<void> {
    try {
      const imagem = this.imagemCustomizada();
      if (!imagem) return;

      console.log('📸 Gerando XLS com Imagem Personalizada...');
      
      const success = await this.gerarXLSComImagem(
        imagem,
        'extrato-com-imagem-personalizada.xlsx'
      );
      
      if (success) {
        this.mostrarMensagem('✅ XLS com Imagem Personalizada gerado com sucesso!', 'success');
      } else {
        this.mostrarMensagem('❌ Erro ao gerar XLS.', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      this.mostrarMensagem('❌ Erro ao gerar XLS.', 'error');
    }
  }

  private mostrarMensagem(msg: string, tipo: 'success' | 'error'): void {
    this.mensagem.set(msg);
    this.mensagemTipo.set(tipo);
    
    // Limpar mensagem após 5 segundos
    setTimeout(() => this.mensagem.set(''), 5000);
  }

  /**
   * Método auxiliar para gerar XLS com imagem usando ExcelJS
   */
  private async gerarXLSComImagem(imageData: string, fileName: string): Promise<boolean> {
    try {
      console.log('📝 Criando workbook com ExcelJS...');
      
      // Criar workbook com ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Extrato');

      // Configurar largura das colunas
      worksheet.columns = [
        { width: 20 }, { width: 15 }, { width: 15 }, { width: 10 },
        { width: 10 }, { width: 10 }, { width: 10 }
      ];

      // Adicionar imagem
      // Remover o prefixo data:image/png;base64, se existir
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      
      const imageId = workbook.addImage({
        base64: base64Data,
        extension: 'png',
      });

      console.log('🖼️ Imagem adicionada ao workbook, ID:', imageId);

      // Adicionar imagem à planilha (posição: coluna A-C, linhas 1-4)
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },  // Top-left: coluna A, linha 1
        ext: { width: 150, height: 80 } // Tamanho em pixels
      });

      // Adicionar dados de teste (começando da linha 5 para não sobrepor a imagem)
      worksheet.addRow(['', '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '', '', '']);
      worksheet.addRow(['bradesco empresas e negócios', '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '', '', '']);
      worksheet.addRow(['Saldo e Extrato', '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '', '', '']);
      worksheet.addRow(['Agência | Conta:', '2 | 35108-3', '', '', '', '', '']);
      worksheet.addRow(['Data:', new Date().toLocaleDateString('pt-BR'), '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '', '', '']);
      
      // Cabeçalho da tabela
      const headerRow = worksheet.addRow(['Descrição', 'Valor', 'Saldo', '', '', '', '']);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Dados
      worksheet.addRow(['Teste 1', '1.000,00', '1.000,00', '', '', '', '']);
      worksheet.addRow(['Teste 2', '500,00', '1.500,00', '', '', '', '']);
      
      const totalRow = worksheet.addRow(['Total', '1.500,00', '1.500,00', '', '', '', '']);
      totalRow.font = { bold: true };

      console.log('📊 Dados adicionados à planilha');

      // Gerar arquivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ XLS gerado e baixado com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao gerar XLS:', error);
      return false;
    }
  }
}

