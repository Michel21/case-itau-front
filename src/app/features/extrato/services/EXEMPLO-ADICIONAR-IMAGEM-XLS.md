# 📸 Como Adicionar Imagem ao Excel (XLS)

## 🎯 Visão Geral

Este guia mostra como adicionar imagens (logos, gráficos, etc.) aos arquivos Excel gerados.

---

## 🚀 Uso Básico

### 1. **Preparar a Imagem em Base64**

```typescript
// Converter imagem para base64
const imagemBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...';

// Ou carregar de um arquivo
const file = event.target.files[0];
const reader = new FileReader();
reader.onload = (e) => {
  const imagemBase64 = e.target?.result as string;
  // Usar imagemBase64 aqui
};
reader.readAsDataURL(file);
```

### 2. **Gerar XLS com Imagem**

```typescript
import { ExtratoGeneratorCleanService } from './services/extrato-generator-clean.service';

// Injetar o serviço
constructor(private extratoService: ExtratoGeneratorCleanService) {}

// Gerar com imagem
async gerarExtratoComLogo() {
  const data: ExtratoData = {
    // ... seus dados
  };

  const config: DocumentConfig = {
    dataGeracao: new Date(),
    // ... sua config
  };

  const options: GenerationOptions = {
    fileName: 'extrato-com-logo.xlsx',
    logoBase64: this.logoBradesco, // 👈 Adicionar logo aqui
    // ou
    imageData: this.minhaImagem // 👈 Ou usar imageData
  };

  const success = await this.extratoService.generate('xls', data, config, options);
  
  if (success) {
    console.log('✅ XLS com logo gerado com sucesso!');
  }
}
```

---

## 📋 Opções de Posicionamento

### **Posição Personalizada**

```typescript
// No serviço XLSDataBuilderService
xlsDataBuilder.addImageToWorkbook(
  workbook,
  imagemBase64,
  'Extrato', // Nome da planilha
  {
    col: 0,      // Coluna inicial (A = 0, B = 1, etc)
    row: 0,      // Linha inicial (começa em 0)
    width: 3,    // Largura em colunas
    height: 4    // Altura em linhas
  }
);
```

### **Múltiplas Imagens**

```typescript
// Logo no cabeçalho
xlsDataBuilder.addImageToWorkbook(workbook, logoBradesco, 'Extrato', {
  col: 0, row: 0, width: 3, height: 4
});

// Gráfico no meio da planilha
xlsDataBuilder.addImageToWorkbook(workbook, graficoPizza, 'Extrato', {
  col: 6, row: 20, width: 5, height: 15
});

// Assinatura no rodapé
xlsDataBuilder.addImageToWorkbook(workbook, assinatura, 'Extrato', {
  col: 0, row: 100, width: 4, height: 3
});
```

---

## 🎨 Formatos Suportados

### **Imagens Base64**

```typescript
// PNG
'data:image/png;base64,iVBORw0KGgo...'

// JPEG
'data:image/jpeg;base64,/9j/4AAQSkZJ...'

// GIF
'data:image/gif;base64,R0lGODlhAQAB...'
```

### **Converter Imagem para Base64**

```typescript
async converterImagemParaBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Uso
const logo = await this.converterImagemParaBase64('/assets/logo-bradesco.png');
```

---

## 💡 Exemplos Práticos

### **Exemplo 1: Logo Bradesco no Cabeçalho**

```typescript
@Component({
  selector: 'app-extrato-com-logo',
  template: `
    <button (click)="gerarComLogo()">Gerar Extrato com Logo</button>
  `
})
export class ExtratoComLogoComponent {
  
  // Logo Bradesco em base64 (exemplo simplificado)
  readonly logoBradesco = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';

  constructor(private extratoService: ExtratoGeneratorCleanService) {}

  async gerarComLogo() {
    const success = await this.extratoService.generate(
      'xls',
      this.extratoData,
      this.config,
      { logoBase64: this.logoBradesco }
    );
  }
}
```

### **Exemplo 2: Upload de Imagem Personalizada**

```typescript
@Component({
  selector: 'app-upload-logo',
  template: `
    <input type="file" accept="image/*" (change)="onFileSelected($event)">
    <button (click)="gerarComImagemCustomizada()" [disabled]="!imagemSelecionada">
      Gerar com Imagem
    </button>
  `
})
export class UploadLogoComponent {
  imagemSelecionada?: string;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagemSelecionada = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async gerarComImagemCustomizada() {
    if (!this.imagemSelecionada) return;

    await this.extratoService.generate(
      'xls',
      this.extratoData,
      this.config,
      { imageData: this.imagemSelecionada }
    );
  }
}
```

### **Exemplo 3: Múltiplas Imagens**

```typescript
async gerarRelatorioCompleto() {
  const data: ExtratoData = { /* ... */ };
  const config: DocumentConfig = { /* ... */ };

  // Gerar workbook manualmente para ter mais controle
  const workbook = XLSXStyle.utils.book_new();
  const xlsData = this.xlsDataBuilder.buildXLSData(data, config);
  const worksheet = XLSXStyle.utils.aoa_to_sheet(xlsData);
  
  this.xlsDataBuilder.applyXLSFormatting(worksheet, xlsData);
  XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Extrato');

  // Adicionar múltiplas imagens
  this.xlsDataBuilder.addImageToWorkbook(
    workbook, 
    this.logoBradesco, 
    'Extrato', 
    { col: 0, row: 0, width: 3, height: 4 }
  );

  this.xlsDataBuilder.addImageToWorkbook(
    workbook, 
    this.graficoMensal, 
    'Extrato', 
    { col: 7, row: 20, width: 6, height: 15 }
  );

  this.xlsDataBuilder.addImageToWorkbook(
    workbook, 
    this.assinaturaDigital, 
    'Extrato', 
    { col: 0, row: 100, width: 4, height: 3 }
  );

  // Gerar e baixar
  const xlsxBuffer = XLSXStyle.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array' 
  });
  
  const blob = new Blob([xlsxBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  this.downloadService.downloadPDF(blob, 'relatorio-completo.xlsx');
}
```

---

## ⚠️ Limitações e Considerações

### **1. Tamanho da Imagem**

```typescript
// ❌ Imagens muito grandes podem causar problemas
const imagemGigante = 'data:image/png;base64,...' // 10MB

// ✅ Redimensionar antes de adicionar
const imagemOtimizada = await this.redimensionarImagem(imagemGigante, 300, 100);
```

### **2. Formato Base64**

```typescript
// ✅ Com prefixo data:image
'data:image/png;base64,iVBORw0...'

// ✅ Sem prefixo (biblioteca detecta automaticamente)
'iVBORw0KGgoAAAANSUhEUgA...'
```

### **3. Compatibilidade**

- ✅ **Funciona:** Excel 2007+, LibreOffice Calc, Google Sheets
- ⚠️ **Limitado:** Versões antigas do Excel
- ❌ **Não funciona:** CSV (use XLS/XLSX)

---

## 🔧 Troubleshooting

### **Problema: Imagem não aparece**

```typescript
// Verificar se a imagem está em base64
console.log('Imagem começa com data:image?', imagem.startsWith('data:image'));

// Verificar tamanho
console.log('Tamanho da imagem:', (imagem.length / 1024).toFixed(2), 'KB');

// Verificar se workbook tem imagens
console.log('Workbook tem imagens?', workbook.Sheets['Extrato']['!images']);
```

### **Problema: Excel corrompe ao abrir**

```typescript
// Certifique-se de usar XLSXStyle.write() com as opções corretas
const xlsxBuffer = XLSXStyle.write(workbook, { 
  bookType: 'xlsx',  // ✅ Correto
  type: 'array',     // ✅ Correto
  compression: true  // ✅ Recomendado
});
```

### **Problema: Imagem muito grande**

```typescript
// Função para redimensionar imagem
async redimensionarImagem(
  base64: string, 
  maxWidth: number, 
  maxHeight: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = base64;
  });
}
```

---

## 📚 Recursos Adicionais

- [Documentação xlsx-js-style](https://www.npmjs.com/package/xlsx-js-style)
- [Exemplos de uso](./examples/)
- [Interface GenerationOptions](./interfaces/extrato-generator-clean.interfaces.ts)

---

## ✅ Checklist de Implementação

- [ ] Imagem convertida para base64
- [ ] Tamanho da imagem otimizado (< 500KB)
- [ ] Posição definida corretamente
- [ ] Testado em Excel/LibreOffice
- [ ] Fallback caso imagem não carregue
- [ ] Logs de debug adicionados

---

**Última atualização:** 2025-01-09  
**Status:** ✅ Funcionalidade implementada e documentada

