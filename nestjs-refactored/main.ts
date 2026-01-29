import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

/**
 * Função de bootstrap da aplicação NestJS
 */
async function bootstrap() {
  const logger = new Logger('AppLogger');
  
  const port = process.env.PORT || '8080';
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('cinv-bff-pdpj-saldo-extrato-inv')
    .setDescription('BFF dedicado à movimentação do extrato de investimentos do canal PDPJ.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  SwaggerModule.setup('swagger-ui', app, document);
  
  await app.listen(port, () => {
    logger.log(`App running on port ${port} as ${process.env.NODE_ENV || 'development'} mode...`);
  });
}

bootstrap();
