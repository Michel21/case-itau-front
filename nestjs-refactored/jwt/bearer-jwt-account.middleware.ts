import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequisicaoComJwt, PayloadJwt } from './jwt-payload.interface';

/**
 * Middleware para processar Bearer JWT, decodificar conta/agência e validar propriedade
 */
@Injectable()
export class BearerJWTAccountMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BearerJWTAccountMiddleware.name);
  private readonly FORMATO_HEADER_REGEX = /^\d+-\d+(-\d+)?$/;

  use(requisicao: RequisicaoComJwt, resposta: Response, proximo: NextFunction): void {
    // Token já foi validado pelo JWTMiddleware, apenas extraímos e parseamos
    const token = this.extrairToken(requisicao);
    if (!token) {
      // Este caso não deveria acontecer se JWTMiddleware estiver funcionando corretamente
      this.logger.error('Token Bearer não encontrado após validação do JWTMiddleware');
      resposta.status(401).json({
        error: 'Token Bearer não fornecido',
        message: 'O header Authorization com Bearer token é obrigatório',
      });
      return;
    }

    const payload = this.parsearPayloadJwt(token);
    if (!payload) {
      this.logger.error('JWT inválido ou malformado');
      resposta.status(401).json({
        error: 'Token JWT inválido',
        message: 'O token JWT fornecido é inválido ou está malformado',
      });
      return;
    }

    requisicao.jwt = payload;

    const { conta, agencia } = this.extrairDadosConta(payload, requisicao);
    requisicao.contaDecodificada = conta;
    requisicao.agenciaDecodificada = agencia;

    // Tenta injetar header x-pdpj-conta se não existir
    let contaHeaderFinal = (requisicao.headers as any)['x-pdpj-conta'];
    if (!contaHeaderFinal) {
      this.injetarHeader(requisicao, agencia, conta);
      contaHeaderFinal = (requisicao.headers as any)['x-pdpj-conta'];
    }

    // Validação obrigatória: x-pdpj-conta é obrigatório
    if (!contaHeaderFinal) {
      this.logger.error('Header x-pdpj-conta é obrigatório mas não foi fornecido');
      resposta.status(400).json({
        error: 'Header x-pdpj-conta é obrigatório',
        message: 'O header x-pdpj-conta deve ser fornecido na requisição ou estar presente no JWT',
      });
      return;
    }

    // Decodifica e normaliza o header x-pdpj-conta (o método já faz trim e remove espaços)
    contaHeaderFinal = this.decodificarHeaderConta(contaHeaderFinal);
    
    // Valida formato após decodificação
    if (!contaHeaderFinal || !this.validarFormatoHeaderConta(contaHeaderFinal)) {
      this.logger.error(`Formato inválido do header x-pdpj-conta: ${contaHeaderFinal || 'vazio'}`);
      resposta.status(400).json({
        error: 'Formato inválido do header x-pdpj-conta',
        message: 'O header x-pdpj-conta deve estar em base64 ou no formato: agencia-conta ou agencia-conta-digito',
        exemplo: 'MTIzNC01Njc4OQ== (base64) ou 1234-56789',
      });
      return;
    }

    // Atualiza o header com o valor decodificado e normalizado
    (requisicao.headers as any)['x-pdpj-conta'] = contaHeaderFinal;

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

  /**
   * Decodifica e normaliza o header x-pdpj-conta se estiver em base64
   * O frontend envia o valor em base64, então tenta decodificar primeiro
   * Retorna o valor normalizado (sem espaços) ou string vazia se inválido
   */
  private decodificarHeaderConta(headerConta: string): string {
    if (!headerConta || typeof headerConta !== 'string') {
      return '';
    }

    // Normaliza removendo espaços
    const headerLimpo = headerConta.trim().replace(/\s+/g, '');

    // Se já está no formato esperado, retorna normalizado
    if (this.FORMATO_HEADER_REGEX.test(headerLimpo)) {
      return headerLimpo;
    }

    // Tenta decodificar base64
    try {
      let valorBase64 = headerLimpo.replace(/-/g, '+').replace(/_/g, '/');
      const padding = valorBase64.length % 4;
      if (padding) {
        valorBase64 += '='.repeat(4 - padding);
      }
      
      const decodificado = Buffer.from(valorBase64, 'base64').toString('utf8').trim().replace(/\s+/g, '');
      
      // Retorna o valor decodificado (será validado depois)
      return decodificado;
    } catch {
      // Se não conseguiu decodificar, retorna o valor original normalizado
      return headerLimpo;
    }
  }

  /**
   * Valida o formato do header x-pdpj-conta
   * Formato esperado: agencia-conta ou agencia-conta-digito
   * Exemplos válidos: "1234-56789" ou "1234-56789-1"
   * Assume que o valor já está normalizado (sem espaços)
   */
  private validarFormatoHeaderConta(headerConta: string): boolean {
    if (!headerConta || typeof headerConta !== 'string') {
      return false;
    }

    return this.FORMATO_HEADER_REGEX.test(headerConta);
  }
}
