import { Module } from '@nestjs/common';
import { JWTMiddleware } from './middlewares/jwt.middleware';

/**
 * Módulo compartilhado com middlewares e utilitários
 */
@Module({
  providers: [JWTMiddleware],
  exports: [JWTMiddleware],
})
export class SharedModule {}
