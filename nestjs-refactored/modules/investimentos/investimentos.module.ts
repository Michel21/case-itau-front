import { Module } from '@nestjs/common';
import { InvestimentosController } from '../../controllers/investimentos.controller';
import { InvestimentosService } from '../../services/investimentos.service';

/**
 * Módulo de Investimentos
 */
@Module({
  controllers: [InvestimentosController],
  providers: [InvestimentosService],
  exports: [InvestimentosService],
})
export class InvestimentosModule {}
