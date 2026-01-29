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

    // Validação obrigatória: x-pdpj-conta deve estar presente ou ser injetado
    const contaHeader = (requisicao.headers as any)['x-pdpj-conta'];
    
    // Se não existe no header, tenta injetar
    if (!contaHeader) {
      this.injetarHeader(requisicao, agencia, conta);
    }

    // Validação obrigatória: x-pdpj-conta é obrigatório
    let contaHeaderFinal = (requisicao.headers as any)['x-pdpj-conta'];
    if (!contaHeaderFinal) {
      this.logger.error('Header x-pdpj-conta é obrigatório mas não foi fornecido');
      resposta.status(400).json({
        error: 'Header x-pdpj-conta é obrigatório',
        message: 'O header x-pdpj-conta deve ser fornecido na requisição ou estar presente no JWT',
      });
      return;
    }

    // Decodifica base64 se necessário (o frontend envia em base64)
    contaHeaderFinal = this.decodificarHeaderConta(contaHeaderFinal);
    
    // Se após decodificação ainda não tiver valor válido, retorna erro
    if (!contaHeaderFinal) {
      this.logger.error('Header x-pdpj-conta não pôde ser decodificado');
      resposta.status(400).json({
        error: 'Formato inválido do header x-pdpj-conta',
        message: 'O header x-pdpj-conta deve estar em base64 ou no formato: agencia-conta ou agencia-conta-digito',
        exemplo: 'MTIzNC01Njc4OQ== (base64) ou 1234-56789',
      });
      return;
    }

    // Valida formato do header x-pdpj-conta (deve ser no formato agencia-conta ou agencia-conta-digito)
    // Remove espaços do header antes de validar e normalizar para uso posterior
    const contaHeaderNormalizado = contaHeaderFinal.trim().replace(/\s+/g, '');
    if (!this.validarFormatoHeaderConta(contaHeaderNormalizado)) {
      this.logger.error(`Formato inválido do header x-pdpj-conta: ${contaHeaderFinal}`);
      resposta.status(400).json({
        error: 'Formato inválido do header x-pdpj-conta',
        message: 'O header x-pdpj-conta deve estar no formato: agencia-conta ou agencia-conta-digito',
        exemplo: '1234-56789 ou 1234-56789-1',
      });
      return;
    }

    // Atualiza o header com o valor decodificado e normalizado
    (requisicao.headers as any)['x-pdpj-conta'] = contaHeaderNormalizado;

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
   * Decodifica o header x-pdpj-conta se estiver em base64
   * O frontend envia o valor em base64, então tenta decodificar primeiro
   * Se não for base64 válido, assume que já está no formato texto
   */
  private decodificarHeaderConta(headerConta: string): string {
    if (!headerConta || typeof headerConta !== 'string') {
      return headerConta;
    }

    const headerLimpo = headerConta.trim().replace(/\s+/g, '');

    // Se já está no formato esperado (agencia-conta), retorna como está
    const formatoRegex = /^\d+-\d+(-\d+)?$/;
    if (formatoRegex.test(headerLimpo)) {
      return headerLimpo;
    }

    // Tenta decodificar base64 (o frontend envia em base64)
    try {
      let valorBase64 = headerLimpo.replace(/-/g, '+').replace(/_/g, '/');
      const padding = valorBase64.length % 4;
      if (padding) {
        valorBase64 += '='.repeat(4 - padding);
      }
      
      const decodificado = Buffer.from(valorBase64, 'base64').toString('utf8').trim();
      
      // Verifica se o valor decodificado tem o formato esperado
      if (formatoRegex.test(decodificado)) {
        return decodificado;
      }
      
      // Se decodificou mas não tem formato válido, retorna o decodificado mesmo assim
      // A validação de formato será feita depois
      return decodificado;
    } catch (error) {
      // Se não conseguiu decodificar base64, retorna o valor original sem espaços
      // (pode ser que já esteja no formato correto ou seja inválido)
      return headerLimpo;
    }
  }

  /**
   * Valida o formato do header x-pdpj-conta
   * Formato esperado: agencia-conta ou agencia-conta-digito
   * Exemplos válidos: "1234-56789" ou "1234-56789-1"
   * Remove espaços antes de validar
   */
  private validarFormatoHeaderConta(headerConta: string): boolean {
    if (!headerConta || typeof headerConta !== 'string') {
      return false;
    }

    // Remove espaços e valida formato
    const headerLimpo = headerConta.trim().replace(/\s+/g, '');
    
    // Formato: agencia-conta ou agencia-conta-digito
    // Exemplos válidos: "1234-56789" ou "1234-56789-1"
    const formatoRegex = /^\d+-\d+(-\d+)?$/;
    
    return formatoRegex.test(headerLimpo);
  }
}
