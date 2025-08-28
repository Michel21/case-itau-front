# Instalação de Dependências - Extrato PDF

## 🎯 **Problemas Identificados**

### **❌ PDF Corporativo não funciona**
- **Causa**: jsPDF não está instalado
- **Solução**: Instalar dependência jsPDF

### **❌ CSV não está formatado**
- **Causa**: Formatação melhorada implementada
- **Solução**: Já corrigido no service

## 📦 **Dependências Necessárias**

### **1. jsPDF (Para PDF Corporativo)**
```bash
npm install jspdf
```

### **2. html2canvas (Opcional, para conversão HTML)**
```bash
npm install html2canvas
```

### **3. Verificar instalação**
```bash
npm list jspdf html2canvas
```

## 🔧 **Configuração do Angular**

### **1. Verificar angular.json**
```json
{
  "projects": {
    "your-project": {
      "architect": {
        "build": {
          "options": {
            "allowedCommonJsDependencies": [
              "jspdf"
            ]
          }
        }
      }
    }
  }
}
```

### **2. Verificar tsconfig.json**
```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 🚀 **Como Testar**

### **1. Teste do PDF Corporativo**
```typescript
// No componente
async gerarPDFCorporativo(): Promise<void> {
  try {
    const config = this.extratoPdfService.criarConfigPDF(
      this.dataTransacao, 
      this.numeroControle
    );
    await this.extratoPdfService.gerarPDFCorporativo(this.dadosAtuais, config);
  } catch (error) {
    console.error('Erro:', error);
    // Fallback para print
    this.gerarPDF();
  }
}
```

### **2. Teste do CSV**
```typescript
// No componente
gerarCSV(): void {
  const config = this.extratoPdfService.criarConfigPDF(
    this.dataTransacao, 
    this.numeroControle
  );
  this.extratoPdfService.gerarCSV(this.dadosAtuais, config);
}
```

## 📋 **Comandos de Instalação**

### **Instalação Completa**
```bash
# Instalar dependências
npm install jspdf html2canvas

# Verificar instalação
npm list jspdf html2canvas

# Limpar cache se necessário
npm cache clean --force

# Reinstalar node_modules se necessário
rm -rf node_modules package-lock.json
npm install
```

### **Verificação de Funcionamento**
```bash
# Testar se jsPDF está disponível
npm run build

# Se houver erros, verificar:
npm run build --verbose
```

## 🔍 **Solução de Problemas**

### **Erro: "Cannot find module 'jspdf'"**
```bash
# Solução 1: Reinstalar
npm uninstall jspdf
npm install jspdf

# Solução 2: Limpar cache
npm cache clean --force
npm install

# Solução 3: Verificar versão
npm list jspdf
```

### **Erro: "jsPDF is not a constructor"**
```typescript
// No service, usar import dinâmico
const jsPDFModule = await import('jspdf');
const jsPDF = jsPDFModule.default;
```

### **Erro: "Module not found"**
```bash
# Verificar se está no package.json
cat package.json | grep jspdf

# Se não estiver, adicionar manualmente
npm install jspdf --save
```

## 📊 **Estrutura do CSV Corrigido**

### **Formato Atual**
```csv
EXTRATO BANCÁRIO - BRADESCO CORPORATE
Global Solutions
Data da transação: 25/08/2025
Empresa: EMPRESA EXEMPLO LTDA
Agência/Conta: 0001 | 123456-7
Tipo de investimento: CDB
Tipo de produto: CDB Pós-fixado

Seção,Data Aplicação,Data Vencimento,Data Resgate,Taxa (%),Valor Principal (R$),Valor Bruto (R$),Renda Total (R$),IOF (R$),IRRF (R$),Valor Líquido (R$),Renda Bruta Per (R$)

SALDO ANTERIOR em 31/07/2025
"Saldo Anterior","15/07/2025","15/08/2025","15/08/2025","12,50","100000,00","101041,67","1041,67","0,00","156,25","100885,42","1041,67"
"Saldo Anterior - TOTAL","","","","","100000,00","101041,67","1041,67","0,00","156,25","100885,42","1041,67"

APLICAÇÕES
"Aplicações","01/08/2025","01/09/2025","01/09/2025","12,00","50000,00","50500,00","500,00","0,00","75,00","50425,00","500,00"
"Aplicações - TOTAL","","","","","50000,00","50500,00","500,00","0,00","75,00","50425,00","500,00"

Documento gerado automaticamente pelo sistema Bradesco Corporate
Para dúvidas, entre em contato com seu gerente de relacionamento
```

## 🎯 **Melhorias Implementadas**

### **✅ CSV**
- **Cabeçalho corporativo**: Informações da empresa
- **Seções organizadas**: Saldo anterior, aplicações, resgates, saldo final
- **Formatação brasileira**: Vírgula como separador decimal
- **Aspas nos campos**: Evita problemas com vírgulas
- **Rodapé institucional**: Informações de contato

### **✅ PDF Corporativo**
- **Fallback robusto**: Se jsPDF não estiver disponível, usa print
- **Tratamento de erros**: Mensagens claras de erro
- **Importação dinâmica**: Carrega jsPDF quando necessário
- **Layout profissional**: Cabeçalho, seções e rodapé corporativos

## 🚀 **Próximos Passos**

### **1. Instalar Dependências**
```bash
npm install jspdf html2canvas
```

### **2. Testar Funcionalidades**
- Testar PDF Corporativo
- Testar CSV formatado
- Verificar fallback para print

### **3. Verificar Funcionamento**
- Abrir console do navegador
- Verificar se não há erros
- Testar download dos arquivos

---

**Instruções de instalação criadas!** ✅
