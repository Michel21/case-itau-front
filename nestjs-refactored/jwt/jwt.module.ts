import { Module } from '@nestjs/common';
import { BearerJWTAccountMiddleware } from './bearer-jwt-account.middleware';

/**
 * Módulo JWT
 * O middleware BearerJWTAccountMiddleware é configurado globalmente no AppModule
 */
@Module({
  providers: [BearerJWTAccountMiddleware],
  exports: [BearerJWTAccountMiddleware],
})
export class JwtModule {}
