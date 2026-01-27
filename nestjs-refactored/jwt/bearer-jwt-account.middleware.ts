import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequisicaoComJwt, PayloadJwt } from './jwt-payload.interface';

/**
 * Middleware para processar Bearer JWT, decodificar conta/agência e validar propriedade
 */
@Injectable()
export class BearerJWTAccountMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BearerJWTAccountMiddleware.name);

  use(requisicao: RequisicaoComJwt, resposta: Response, proximo: NextFunction): void {
    const token = this.extrairToken(requisicao);
    if (!token) {
      return proximo();
    }

    const payload = this.parsearPayloadJwt(token);
    if (!payload) {
      this.logger.warn('JWT inválido ou malformado');
      return proximo();
    }

    requisicao.jwt = payload;

    const { conta, agencia } = this.extrairDadosConta(payload, requisicao);
    requisicao.contaDecodificada = conta;
    requisicao.agenciaDecodificada = agencia;

    this.injetarHeader(requisicao, agencia, conta);

    if (!this.validarPropriedade(payload, requisicao)) {
      resposta.status(403).json({
        error: 'Conta/Agência não pertence ao usuário autenticado',
      });
      return;
    }

    proximo();
  }

  private extrairToken(requisicao: RequisicaoComJwt | Request): string | null {
    const autorizacao = (requisicao.headers['authorization'] || '') as string;
    const correspondencia = autorizacao.match(/^Bearer\s+(.+)$/i);
    return correspondencia ? correspondencia[1] : null;
  }

  private parsearPayloadJwt(token: string): PayloadJwt | null {
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    try {
      return JSON.parse(Buffer.from(partes[1], 'base64').toString('utf8'));
    } catch {
      return null;
    }
  }

  private extrairDadosConta(
    payload: PayloadJwt,
    requisicao: RequisicaoComJwt | Request,
  ): { conta?: string; agencia?: string } {
    let conta = this.decodificarValor(payload.conta);
    let agencia = this.decodificarValor(payload.agencia);

    if (!conta || !agencia) {
      const corpo = (requisicao as any).body;
      conta ||= this.decodificarValor(corpo?.conta ?? corpo?.account);
      agencia ||= this.decodificarValor(corpo?.agencia ?? corpo?.branch);
    }

    return { conta, agencia };
  }

  private decodificarValor(valor: unknown): string | undefined {
    if (valor == null) return undefined;
    if (typeof valor === 'number') return String(valor);
    if (typeof valor !== 'string') return undefined;

    const valorLimpo = valor.trim();
    if (!valorLimpo) return undefined;
    if (/^[0-9-]+$/.test(valorLimpo)) return valorLimpo;

    try {
      let valorBase64 = valorLimpo.replace(/-/g, '+').replace(/_/g, '/');
      const padding = valorBase64.length % 4;
      if (padding) valorBase64 += '='.repeat(4 - padding);
      return Buffer.from(valorBase64, 'base64').toString('utf8');
    } catch {
      return undefined;
    }
  }

  private injetarHeader(requisicao: RequisicaoComJwt | Request, agencia?: string, conta?: string): void {
    if (!agencia || !conta) return;

    const headers = (requisicao as any).headers as Record<string, any>;
    if (!headers['x-pdpj-conta']) {
      headers['x-pdpj-conta'] = `${agencia}-${conta}`;
    }
  }

  private validarPropriedade(
    payload: PayloadJwt,
    requisicao: RequisicaoComJwt | Request,
  ): boolean {
    const chave = payload?.chvIdFatAut;
    const contaHeader = (requisicao.headers as any)['x-pdpj-conta'];

    if (!chave || !contaHeader) return true;

    const esperado = this.construirHeaderDaChave(chave);
    return this.compararHeaderConta(esperado, contaHeader);
  }

  private construirHeaderDaChave(chave: any): string {
    if (!chave) return '';

    const agencia = chave.agencia ?? '';
    const conta = chave.conta ?? '';
    const digito = chave.digito ?? '';

    return `${String(agencia)}-${String(conta)}${digito ? `-${String(digito)}` : ''}`;
  }

  private compararHeaderConta(headerA: string, headerB: string): boolean {
    const normalizar = (valor: string) => {
      const partes = (valor || '').toString().split('-');
      return partes
        .map((parte) => parte.replace(/^0+/, '').replace(/\s+/g, ''))
        .join('-')
        .toLowerCase();
    };

    return normalizar(headerA) === normalizar(headerB);
  }
}
