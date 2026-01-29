import { Injectable, NestMiddleware, Logger, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware JWT para validação básica de token Bearer
 * Valida a presença do token antes do BearerJWTAccountMiddleware processar
 */
@Injectable()
export class JWTMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JWTMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Este middleware valida apenas a presença do token
    // A validação completa é feita pelo BearerJWTAccountMiddleware
    // Rotas públicas já são excluídas no AppModule, mas verificamos aqui também por segurança
    const publicRoutes = ['/health', '/api', '/swagger-ui'];
    const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));

    if (isPublicRoute) {
      return next();
    }

    // Verifica se há token Bearer no header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn(`Requisição sem token Bearer: ${req.method} ${req.path}`);
      throw new UnauthorizedException('Token Bearer não fornecido');
    }

    next();
  }
}
