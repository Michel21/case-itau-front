import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Módulo de Health Check
 * Endpoints deste módulo são excluídos do middleware de autenticação
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
