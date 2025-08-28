# 📦 Instalação de Dependências - PDF Corporativo

## 🎯 **Dependências Necessárias**

Para que o **PDF Corporativo** funcione corretamente, você precisa instalar as seguintes dependências:

### **📋 Dependências Obrigatórias**
- `jspdf` - Geração de PDFs no navegador
- `html2canvas` - Conversão de HTML para canvas (usado pelo jsPDF)

## 🚀 **Como Instalar**

### **1. Instalação via npm**
```bash
npm install jspdf html2canvas
```

### **2. Verificação da Instalação**
```bash
npm list jspdf html2canvas
```

### **3. Verificar no package.json**
Após a instalação, seu `package.json` deve incluir:
```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1"
  }
}
```

## 🔧 **Configurações Adicionais**

### **1. Angular.json (se necessário)**
Se houver problemas com CommonJS, adicione no `angular.json`:
```json
{
  "projects": {
    "your-project": {
      "architect": {
        "build": {
          "options": {
            "allowedCommonJsDependencies": [
              "jspdf",
              "html2canvas"
            ]
          }
        }
      }
    }
  }
}
```

### **2. TypeScript (se necessário)**
No `tsconfig.json`, certifique-se de ter:
```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 🧪 **Teste de Funcionamento**

### **1. Teste Básico**
Após a instalação, teste o PDF corporativo:
```typescript
// No componente
gerarPDFCorporativo(): void {
  const config = this.extratoPdfService.criarConfigPDF(
    this.dataTransacao, 
    this.numeroControle
  );
  this.extratoPdfService.gerarPDFCorporativo(this.dadosAtuais, config);
}
```

### **2. Verificação no Console**
- Abra o DevTools (F12)
- Vá na aba Console
- Execute a geração do PDF
- Verifique se não há erros de módulo

## ❌ **Problemas Comuns**

### **1. "Cannot find module 'jspdf'"**
**Solução**: Reinstale as dependências
```bash
npm uninstall jspdf html2canvas
npm install jspdf html2canvas
```

### **2. "jsPDF is not a constructor"**
**Solução**: Verifique a importação no service
```typescript
// No extrato-pdf.service.ts
try {
  const jsPDF = (window as any).jsPDF || await import('jspdf');
  // ... resto do código
} catch (error) {
  console.error('jsPDF não disponível:', error);
}
```

### **3. Erro de CommonJS**
**Solução**: Adicione no angular.json
```json
"allowedCommonJsDependencies": ["jspdf", "html2canvas"]
```

## 📊 **Status Atual**

### **✅ Verificado**
- [x] Dependências **NÃO** estão no package.json
- [x] Instruções de instalação criadas
- [x] Configurações de troubleshooting documentadas

### **⏳ Pendente**
- [ ] Instalação das dependências via npm
- [ ] Verificação de funcionamento
- [ ] Teste do PDF corporativo

## 🎯 **Próximos Passos**

### **1. Execute a Instalação**
```bash
npm install jspdf html2canvas
```

### **2. Verifique a Instalação**
```bash
npm list jspdf html2canvas
```

### **3. Teste o PDF Corporativo**
- Abra o componente
- Clique em "PDF Corporativo"
- Verifique se o PDF é gerado corretamente

### **4. Se Houver Problemas**
- Consulte a seção "Problemas Comuns"
- Verifique o console do navegador
- Execute os comandos de troubleshooting

## 📞 **Suporte**

Se ainda houver problemas após seguir estas instruções:

1. **Verifique a versão do Node.js**: `node --version`
2. **Limpe o cache**: `npm cache clean --force`
3. **Delete node_modules**: `rm -rf node_modules && npm install`
4. **Verifique o Angular**: `ng version`

---

**Instruções de instalação criadas!** ✅

**Execute**: `npm install jspdf html2canvas`
