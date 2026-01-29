import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from './jwt/jwt.module';
import { BearerJWTAccountMiddleware } from './jwt/bearer-jwt-account.middleware';
import { HealthModule } from './health/health.module';
import { InvestimentosModule } from './modules/investimentos/investimentos.module';
import { SharedModule } from './shared/shared.module';
import { createLoggingMiddleware } from './shared/middlewares/logging.middleware';
import { JWTMiddleware } from './shared/middlewares/jwt.middleware';

/**
 * Módulo raiz da aplicação NestJS
 * Configura middlewares globais excluindo rotas de health
 */
@Module({
  imports: [
    HealthModule,
    InvestimentosModule,
    JwtModule,
    SharedModule,
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
