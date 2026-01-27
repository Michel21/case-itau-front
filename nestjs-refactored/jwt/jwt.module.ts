import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { BearerJWTAccountMiddleware } from './bearer-jwt-account.middleware';

/**
 * Módulo JWT
 */
@Module({
  providers: [BearerJWTAccountMiddleware],
  exports: [BearerJWTAccountMiddleware],
})
export class JwtModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BearerJWTAccountMiddleware).forRoutes('*');
  }
}
