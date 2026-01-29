import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Factory function para criar middleware de logging
 * Baseado no padrão @bradesco/ensc-lib-cloudjs-logging/express
 */
export function createLoggingMiddleware() {
  const logger = new Logger('RequestLogger');

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    // Log da requisição recebida
    logger.log(`[${method}] ${originalUrl} - IP: ${ip}`);

    // Intercepta o fim da resposta para logar o tempo de processamento
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      
      logger.log(
        `[${method}] ${originalUrl} - ${statusCode} - ${duration}ms - IP: ${ip}`
      );
    });

    next();
  };
}
