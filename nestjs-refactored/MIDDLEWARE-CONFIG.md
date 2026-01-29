# Configuração de Middleware - Todas as Chamadas Exceto Health

## 📋 Visão Geral

Este documento descreve a configuração de middleware implementada para que **todas as chamadas de API, exceto o endpoint `/health`, passem pelos middlewares de autenticação e logging**.

## 🏗️ Estrutura de Middlewares

A aplicação utiliza três middlewares aplicados em sequência:

1. **`createLoggingMiddleware()`** - Middleware de logging de requisições
2. **`JWTMiddleware`** - Validação básica de token Bearer
3. **`BearerJWTAccountMiddleware`** - Processamento completo do JWT e validação de conta/agência

## 📁 Arquivos Criados/Modificados

### Arquivos Principais

- **`app.module.ts`** - Configuração global de middlewares com exclusão de `/health`
- **`main.ts`** - Bootstrap da aplicação NestJS
- **`health/health.controller.ts`** - Controller para endpoint de health check
- **`health/health.module.ts`** - Módulo de health check
- **`shared/middlewares/logging.middleware.ts`** - Middleware de logging
- **`shared/middlewares/jwt.middleware.ts`** - Middleware de validação JWT básica

## 🔧 Configuração no AppModule

```typescript
@Module({
  imports: [
    HealthModule,
    InvestimentosModule,
    JwtModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        createLoggingMiddleware(),
        JWTMiddleware,
        BearerJWTAccountMiddleware,
      )
      .exclude(
        { path: '/health', method: RequestMethod.GET },
        { path: '/health', method: RequestMethod.ALL },
        { path: '/api', method: RequestMethod.GET },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
```

### Explicação da Configuração

- **`.apply()`**: Aplica os três middlewares em sequência para todas as rotas
- **`.exclude()`**: Exclui rotas específicas do processamento dos middlewares:
  - `/health` (GET e ALL methods) - Endpoint de health check
  - `/api` (GET) - Endpoint de documentação Swagger
- **`.forRoutes()`**: Aplica para todas as rotas (`*`) e todos os métodos HTTP (`ALL`)

## 🚀 Endpoints Afetados

### ✅ Endpoints que PASSAM pelo Middleware

- `/api/v1/extratos/investimentos/*` - Todas as rotas de investimentos
- Qualquer outra rota da aplicação

### ❌ Endpoints que NÃO PASSAM pelo Middleware

- `/health` - Health check endpoint (excluído)
- `/api` (GET) - Documentação Swagger (excluído)

## 📝 Exemplo de Uso

### Endpoint com Middleware (Requer Autenticação)

```bash
# Requer token Bearer
curl -X POST http://localhost:8080/api/v1/extratos/investimentos/produtos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tipoInvestimento": "1", "agencia": "1234", "conta": "56789"}'
```

### Endpoint sem Middleware (Health Check)

```bash
# Não requer autenticação
curl http://localhost:8080/health
```

## 🔍 Fluxo de Processamento

1. **Requisição chega** → `createLoggingMiddleware()` registra entrada
2. **Validação JWT** → `JWTMiddleware` verifica presença do token Bearer
3. **Processamento JWT** → `BearerJWTAccountMiddleware` decodifica e valida
4. **Requisição processada** → Controller recebe requisição com dados do JWT
5. **Resposta enviada** → `createLoggingMiddleware()` registra saída e tempo

## ⚠️ Observações Importantes

- O endpoint `/health` é **sempre excluído** do middleware para permitir health checks sem autenticação
- Rotas de documentação Swagger (`/api`, `/swagger-ui`) também são excluídas para facilitar acesso
- Todos os outros endpoints **requerem** token Bearer válido no header `Authorization`

## 🧪 Testando a Configuração

```bash
# Teste 1: Health check (deve funcionar sem token)
curl http://localhost:8080/health

# Teste 2: Endpoint protegido sem token (deve retornar 401)
curl -X POST http://localhost:8080/api/v1/extratos/investimentos/produtos

# Teste 3: Endpoint protegido com token (deve funcionar)
curl -X POST http://localhost:8080/api/v1/extratos/investimentos/produtos \
  -H "Authorization: Bearer <seu-token-jwt>"
```
