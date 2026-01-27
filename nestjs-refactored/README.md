# Middleware JWT - NestJS 18

## 📋 Visão Geral

Middleware para processar Bearer JWT, decodificar conta/agência e validar propriedade.

## 🏗️ Estrutura

```
nestjs-refactored/
├── jwt/
│   ├── jwt-payload.interface.ts          # Interfaces TypeScript
│   ├── bearer-jwt-account.middleware.ts  # Middleware principal
│   ├── jwt.module.ts                     # Módulo NestJS
│   └── bearer-jwt-account.middleware.spec.ts # Testes
└── README.md
```

## ✨ Funcionalidades

- Decodifica payload JWT e popula `requisicao.jwt`
- Extrai conta/agência do JWT ou `requisicao.body` (base64 ou texto)
- Injeta header `x-pdpj-conta` para downstream
- Valida propriedade usando `payload.chvIdFatAut` vs header `x-pdpj-conta`

## 🔧 Métodos

- `extrairToken`: Extrai token Bearer do header
- `parsearPayloadJwt`: Parseia e decodifica payload JWT
- `extrairDadosConta`: Extrai conta/agência do payload ou req.body
- `decodificarValor`: Decodifica valores (base64 URL-safe, números, strings)
- `injetarHeader`: Injeta header `x-pdpj-conta`
- `validarPropriedade`: Valida propriedade usando `chvIdFatAut`
- `construirHeaderDaChave`: Constrói header a partir de `chvIdFatAut`
- `compararHeaderConta`: Compara headers normalizados

## 🚀 Como Usar

### 1. Importar o Módulo

```typescript
import { JwtModule } from './jwt/jwt.module';

@Module({
  imports: [JwtModule],
})
export class AppModule {}
```

### 2. Usar em Controllers

```typescript
import { Controller, Post, Req } from '@nestjs/common';
import { RequisicaoComJwt } from './jwt/jwt-payload.interface';

@Controller('investimentos')
export class InvestimentosController {
  @Post('produtos')
  obterProdutos(@Req() requisicao: RequisicaoComJwt) {
    // requisicao.jwt - payload JWT completo
    // requisicao.jwt.chvIdFatAut - dados de autorização
    // requisicao.contaDecodificada - conta decodificada
    // requisicao.agenciaDecodificada - agência decodificada
    // requisicao.headers['x-pdpj-conta'] - header injetado (agencia-conta)
    return { data: 'produtos' };
  }
}
```

### 3. Estrutura do Payload JWT

```typescript
{
  chvIdFatAut: {
    tipo: "AGENCIA_CONTA",
    agencia: 2,
    conta: 93253,
    digito: 1,
    titularidade: 1
  },
  frwk: { /* dados do framework */ },
  sub: "cpf#11122233399"
}
```

## 🧪 Testes

```bash
npm test
```
