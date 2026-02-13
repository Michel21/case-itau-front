# Módulo de Investimentos

Módulo completo para gerenciamento de operações de investimentos, incluindo consulta de produtos, saldos, extratos e posição consolidada.

## Endpoints Disponíveis

### 1. Obter Produtos de Investimento
**POST** `/api/v1/extratos/investimentos/produtos`

Retorna lista de produtos de investimento para um período específico.

**Request Body:**
```json
{
  "tipoInvestimento": "389",
  "agencia": "1234",
  "conta": "5678",
  "dataInicio": "10/2024",
  "dataFim": "10/2025"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "codigo": "389",
      "nome": "CDB Pré-fixado",
      "tipo": "389",
      "saldoAtual": 50000.0,
      "dataAplicacao": "01/2024",
      "dataVencimento": "01/2025",
      "rentabilidade": 12.5,
      "taxa": 12.5,
      "valorAplicado": 50000.0,
      "valorAtual": 56250.0
    }
  ],
  "timestamp": "2024-10-24T10:00:00.000Z"
}
```

### 2. Obter Saldo de Investimentos
**POST** `/api/v1/extratos/investimentos/saldo`

Retorna saldo consolidado de investimentos para um tipo específico.

**Request Body:**
```json
{
  "tipoInvestimento": "389",
  "agencia": "1234",
  "conta": "5678",
  "dataReferencia": "10/2024"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tipoInvestimento": "389",
    "agencia": "1234",
    "conta": "5678",
    "saldoTotal": 89250.0,
    "saldoDisponivel": 89250.0,
    "saldoBloqueado": 0,
    "dataReferencia": "10/2024",
    "produtos": [...]
  },
  "timestamp": "2024-10-24T10:00:00.000Z"
}
```

### 3. Obter Extrato de Investimentos
**POST** `/api/v1/extratos/investimentos/extrato`

Retorna extrato paginado de movimentações de investimentos.

**Request Body:**
```json
{
  "tipoInvestimento": "389",
  "agencia": "1234",
  "conta": "5678",
  "dataInicio": "10/2024",
  "dataFim": "10/2025",
  "pagina": 1,
  "itensPorPagina": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dados": [
      {
        "data": "15/10/2024",
        "tipoOperacao": "APLICACAO",
        "descricao": "Aplicação em CDB Pré-fixado",
        "valor": 50000.0,
        "saldoAnterior": 0,
        "saldoAtual": 50000.0,
        "codigoProduto": "389",
        "nomeProduto": "CDB Pré-fixado"
      }
    ],
    "paginacao": {
      "paginaAtual": 1,
      "itensPorPagina": 20,
      "totalItens": 3,
      "totalPaginas": 1,
      "temProximaPagina": false,
      "temPaginaAnterior": false
    }
  },
  "timestamp": "2024-10-24T10:00:00.000Z"
}
```

### 4. Obter Posição Consolidada
**GET** `/api/v1/extratos/investimentos/posicao`

Retorna posição consolidada de todos os investimentos.

**Request Body:**
```json
{
  "agencia": "1234",
  "conta": "5678",
  "dataReferencia": "10/2024",
  "tipoInvestimento": "389"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agencia": "1234",
    "conta": "5678",
    "dataReferencia": "10/2024",
    "valorTotalAplicado": 80000.0,
    "valorTotalAtual": 89250.0,
    "rentabilidadeTotal": 9250.0,
    "percentualRentabilidade": 11.56,
    "produtos": [...],
    "resumoPorTipo": [
      {
        "tipo": "389",
        "quantidade": 1,
        "valorTotal": 56250.0
      }
    ]
  },
  "timestamp": "2024-10-24T10:00:00.000Z"
}
```

## Autenticação

Todos os endpoints requerem:
- **Header Authorization**: `Bearer <token>`
- **Header x-pdpj-conta**: `agencia-conta` (opcional se estiver no JWT)

## Validações

- **Período máximo**: 12 meses
- **Data início**: Deve ser anterior à data fim
- **Formato de data**: MM/YYYY
- **Paginação**: Máximo de 100 itens por página

## Estrutura de Arquivos

```
modules/investimentos/
├── investimentos.module.ts
├── README.md
controllers/
├── investimentos.controller.ts
services/
├── investimentos.service.ts
dto/
├── obter-produtos-investimento.dto.ts
├── obter-saldo-investimento.dto.ts
├── obter-extrato-investimento.dto.ts
└── obter-posicao-investimento.dto.ts
interfaces/
└── investimentos.interface.ts
```

## Próximos Passos

- [ ] Implementar integração com serviço externo/banco de dados
- [ ] Adicionar cache para melhorar performance
- [ ] Criar testes unitários completos
- [ ] Adicionar métricas e monitoramento
- [ ] Implementar rate limiting específico
