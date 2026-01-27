# Changelog

## [1.0.0] - Refatoração Profissional

### ✨ Adicionado
- Separação de responsabilidades em serviços especializados
  - `JwtParserService`: Parsing e decodificação de tokens JWT
  - `AccountExtractorService`: Extração de dados de conta/agência
  - `AccountOwnershipService`: Validação de propriedade de conta
- Interfaces TypeScript bem definidas
  - `JwtPayload`: Interface para payload JWT
  - `AccountPair`: Interface para par agência/conta
  - `RequestWithJwt`: Extensão do Request do Express
- DTOs com validação usando class-validator
  - `ObterProdutosInvestimentoDto`: DTO para requisição de produtos
- Testes unitários
  - Cobertura de testes para o middleware
- Documentação completa
  - README com instruções de uso
  - JSDoc em todos os métodos públicos
- Integração com Swagger/OpenAPI
  - Decorators do @nestjs/swagger nos controllers

### 🔄 Refatorado
- Middleware dividido em serviços reutilizáveis
- Tratamento de erros melhorado com exceções do NestJS
- Logging mais estruturado e informativo
- Código mais testável e manutenível

### 🐛 Corrigido
- Validação de propriedade de conta mais robusta
- Tratamento de casos edge (valores null/undefined)
- Normalização de strings (remoção de zeros à esquerda)

### 📚 Melhorias
- Código seguindo as melhores práticas do NestJS 18
- Type safety melhorado
- Injeção de dependências correta
- Separação de concerns
