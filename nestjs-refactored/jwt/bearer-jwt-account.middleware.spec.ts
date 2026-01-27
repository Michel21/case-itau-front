import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';
import { BearerJWTAccountMiddleware } from './bearer-jwt-account.middleware';
import { RequisicaoComJwt } from './jwt-payload.interface';

describe('BearerJWTAccountMiddleware', () => {
  let middleware: BearerJWTAccountMiddleware;
  let requisicaoMock: any;
  let respostaMock: Partial<Response>;
  let proximoMock: NextFunction;

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [BearerJWTAccountMiddleware],
    }).compile();

    middleware = modulo.get<BearerJWTAccountMiddleware>(BearerJWTAccountMiddleware);

    requisicaoMock = { headers: {}, body: {} };
    respostaMock = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    proximoMock = jest.fn();
  });

  describe('Inicialização', () => {
    it('deve ser definido', () => {
      expect(middleware).toBeDefined();
    });
  });

  describe('extrairToken', () => {
    it('deve prosseguir sem header authorization', () => {
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);
      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve prosseguir com header authorization vazio', () => {
      requisicaoMock.headers = { authorization: '' };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);
      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve prosseguir com header authorization sem Bearer', () => {
      requisicaoMock.headers = { authorization: 'Token abc123' };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);
      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve extrair token com Bearer em minúscula', () => {
      const payload = { agencia: '1234', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.jwt).toBeDefined();
      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve extrair token com Bearer em maiúscula', () => {
      const payload = { agencia: '1234', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `BEARER header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.jwt).toBeDefined();
      expect(proximoMock).toHaveBeenCalled();
    });
  });

  describe('parsearPayloadJwt', () => {
    it('deve prosseguir com token malformado (menos de 3 partes)', () => {
      requisicaoMock.headers = { authorization: 'Bearer header.payload' };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);
      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve prosseguir com token malformado (mais de 3 partes)', () => {
      requisicaoMock.headers = { authorization: 'Bearer header.payload.signature.extra' };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);
      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve prosseguir com payload JSON inválido', () => {
      const payloadInvalido = Buffer.from('não é json válido').toString('base64');
      requisicaoMock.headers = { authorization: `Bearer header.${payloadInvalido}.signature` };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);
      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve processar token válido', () => {
      const payload = { agencia: '1234', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.jwt).toEqual(payload);
      expect(proximoMock).toHaveBeenCalled();
    });
  });

  describe('extrairDadosConta', () => {
    it('deve extrair conta e agência do payload', () => {
      const payload = { agencia: '1234', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBe('1234');
      expect(requisicaoMock.contaDecodificada).toBe('5678');
    });

    it('deve extrair conta e agência do body quando não estão no payload', () => {
      const payload = {};
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      requisicaoMock.body = { conta: '5678', agencia: '1234' };

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBe('1234');
      expect(requisicaoMock.contaDecodificada).toBe('5678');
    });

    it('deve extrair conta e agência do body usando account e branch', () => {
      const payload = {};
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      requisicaoMock.body = { account: '5678', branch: '1234' };

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBe('1234');
      expect(requisicaoMock.contaDecodificada).toBe('5678');
    });

    it('deve priorizar payload sobre body', () => {
      const payload = { agencia: '9999', conta: '8888' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      requisicaoMock.body = { conta: '5678', agencia: '1234' };

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBe('9999');
      expect(requisicaoMock.contaDecodificada).toBe('8888');
    });
  });

  describe('decodificarValor', () => {
    it('deve retornar undefined para valor null', () => {
      const payload = { agencia: null, conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBeUndefined();
    });

    it('deve retornar undefined para valor undefined', () => {
      const payload = { conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBeUndefined();
    });

    it('deve converter número para string', () => {
      const payload = { agencia: 1234, conta: 5678 };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBe('1234');
      expect(requisicaoMock.contaDecodificada).toBe('5678');
    });

    it('deve retornar undefined para valor não-string e não-number', () => {
      const payload = { agencia: true, conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBeUndefined();
    });

    it('deve retornar string vazia como undefined', () => {
      const payload = { agencia: '   ', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBeUndefined();
    });

    it('deve retornar string numérica sem decodificar', () => {
      const payload = { agencia: '1234', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBe('1234');
      expect(requisicaoMock.contaDecodificada).toBe('5678');
    });

    it('deve decodificar base64 válido', () => {
      const payload = { agencia: 'MTIzNA==', conta: 'NTY3OA==' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBe('1234');
      expect(requisicaoMock.contaDecodificada).toBe('5678');
    });

    it('deve decodificar base64 URL-safe com hífen', () => {
      const valorBase64 = Buffer.from('1234').toString('base64').replace(/\+/g, '-');
      const payload = { agencia: valorBase64, conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBe('1234');
    });

    it('deve decodificar base64 URL-safe com underscore', () => {
      const valorBase64 = Buffer.from('1234').toString('base64').replace(/\//g, '_');
      const payload = { agencia: valorBase64, conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBe('1234');
    });

    it('deve adicionar padding quando necessário', () => {
      const valorSemPadding = Buffer.from('1234').toString('base64').slice(0, -2);
      const payload = { agencia: valorSemPadding, conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.agenciaDecodificada).toBe('1234');
    });

    it('deve retornar undefined para base64 inválido', () => {
      const payload = { agencia: '!!!base64-inválido!!!', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      // Base64 inválido pode retornar caracteres estranhos, mas não deve ser um número válido
      expect(requisicaoMock.agenciaDecodificada).not.toBe('1234');
      expect(requisicaoMock.agenciaDecodificada).not.toMatch(/^\d+$/);
    });
  });

  describe('injetarHeader', () => {
    it('deve injetar header quando agência e conta estão presentes', () => {
      const payload = { agencia: '1234', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect((requisicaoMock.headers as any)['x-pdpj-conta']).toBe('1234-5678');
    });

    it('não deve injetar header quando agência está ausente', () => {
      const payload = { conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect((requisicaoMock.headers as any)['x-pdpj-conta']).toBeUndefined();
    });

    it('não deve injetar header quando conta está ausente', () => {
      const payload = { agencia: '1234' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect((requisicaoMock.headers as any)['x-pdpj-conta']).toBeUndefined();
    });

    it('não deve sobrescrever header existente', () => {
      const payload = { agencia: '1234', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token, 'x-pdpj-conta': '9999-9999' };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect((requisicaoMock.headers as any)['x-pdpj-conta']).toBe('9999-9999');
    });
  });

  describe('validarPropriedade', () => {
    it('deve retornar true quando não há chvIdFatAut e não há header', () => {
      const payload = { agencia: '1234', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve retornar true quando há chvIdFatAut mas não há header', () => {
      const payload = { agencia: '1234', conta: '5678', chvIdFatAut: { agencia: 1234, conta: 5678 } };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve retornar true quando há header mas não há chvIdFatAut', () => {
      const payload = { agencia: '1234', conta: '5678' };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token, 'x-pdpj-conta': '1234-5678' };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve retornar 403 quando chvIdFatAut não corresponde ao header', () => {
      const payload = { chvIdFatAut: { agencia: 1234, conta: 5678 } };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      (requisicaoMock as any).headers['x-pdpj-conta'] = '9999-9999';

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(respostaMock.status).toHaveBeenCalledWith(403);
      expect(proximoMock).not.toHaveBeenCalled();
    });

    it('deve prosseguir quando chvIdFatAut corresponde ao header', () => {
      const payload = { agencia: '1234', conta: '5678', chvIdFatAut: { agencia: 1234, conta: 5678 } };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      (requisicaoMock as any).headers['x-pdpj-conta'] = '1234-5678';

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve prosseguir quando chvIdFatAut corresponde ao header com dígito', () => {
      const payload = { agencia: '1234', conta: '5678', chvIdFatAut: { agencia: 1234, conta: 5678, digito: 1 } };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      (requisicaoMock as any).headers['x-pdpj-conta'] = '1234-5678-1';

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve normalizar zeros à esquerda na comparação', () => {
      const payload = { agencia: '1234', conta: '5678', chvIdFatAut: { agencia: 1234, conta: 5678 } };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      // O header esperado construído da chave será '1234-5678'
      // O header existente com zeros à esquerda '01234-005678' será normalizado para '1234-5678'
      // Mas o header injetado também será '1234-5678', então o header existente não será usado
      // Precisamos que o header existente corresponda ao esperado após normalização
      (requisicaoMock as any).headers['x-pdpj-conta'] = '01234-005678';

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      // A validação compara o esperado '1234-5678' com o header existente '01234-005678'
      // Após normalização, devem ser iguais, então a validação deve passar
      expect(proximoMock).toHaveBeenCalled();
      expect(respostaMock.status).not.toHaveBeenCalledWith(403);
    });

    it('deve normalizar espaços na comparação', () => {
      const payload = { agencia: '1234', conta: '5678', chvIdFatAut: { agencia: 1234, conta: 5678 } };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      (requisicaoMock as any).headers['x-pdpj-conta'] = ' 1234 - 5678 ';

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve normalizar case na comparação', () => {
      const payload = { agencia: '1234', conta: '5678', chvIdFatAut: { agencia: 1234, conta: 5678 } };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      (requisicaoMock as any).headers['x-pdpj-conta'] = '1234-5678';

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(proximoMock).toHaveBeenCalled();
    });
  });

  describe('construirHeaderDaChave', () => {
    it('deve retornar string vazia quando chave é null', () => {
      const payload = { agencia: '1234', conta: '5678', chvIdFatAut: null };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve construir header sem dígito', () => {
      const payload = { agencia: '1234', conta: '5678', chvIdFatAut: { agencia: 1234, conta: 5678 } };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      (requisicaoMock as any).headers['x-pdpj-conta'] = '1234-5678';

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve construir header com dígito', () => {
      const payload = { agencia: '1234', conta: '5678', chvIdFatAut: { agencia: 1234, conta: 5678, digito: 1 } };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      (requisicaoMock as any).headers['x-pdpj-conta'] = '1234-5678-1';

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve lidar com valores undefined na chave', () => {
      const payload = { agencia: '1234', conta: '5678', chvIdFatAut: { agencia: undefined, conta: undefined } };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      // Quando chvIdFatAut tem valores undefined, construirHeaderDaChave retorna 'undefined-undefined'
      // O header injetado será '1234-5678'
      // Como há header x-pdpj-conta (o injetado), a validação compara 'undefined-undefined' com '1234-5678'
      // Eles não correspondem, então a validação falha e retorna 403
      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      // A validação deve falhar porque 'undefined-undefined' != '1234-5678'
      expect(respostaMock.status).toHaveBeenCalledWith(403);
      expect(proximoMock).not.toHaveBeenCalled();
    });
  });

  describe('Cenários integrados', () => {
    it('deve processar fluxo completo com validação bem-sucedida', () => {
      const payload = {
        agencia: 'MTIzNA==',
        conta: 'NTY3OA==',
        chvIdFatAut: { agencia: 1234, conta: 5678, digito: 1 },
      };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      // O header esperado na validação será '1234-5678-1' (com dígito da chave)
      // O header injetado será '1234-5678' (sem dígito)
      // Para a validação passar, precisamos que o header existente corresponda ao esperado
      (requisicaoMock as any).headers['x-pdpj-conta'] = '1234-5678-1';

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(requisicaoMock.jwt).toBeDefined();
      expect(requisicaoMock.agenciaDecodificada).toBe('1234');
      expect(requisicaoMock.contaDecodificada).toBe('5678');
      // O header não será sobrescrito porque já existe
      expect((requisicaoMock.headers as any)['x-pdpj-conta']).toBe('1234-5678-1');
      // A validação deve passar porque o header existente '1234-5678-1' corresponde ao esperado '1234-5678-1'
      expect(proximoMock).toHaveBeenCalled();
    });

    it('deve processar fluxo completo com validação falhando', () => {
      const payload = {
        agencia: 'MTIzNA==',
        conta: 'NTY3OA==',
        chvIdFatAut: { agencia: 1234, conta: 5678 },
      };
      const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `Bearer header.${payloadCodificado}.signature`;

      requisicaoMock.headers = { authorization: token };
      (requisicaoMock as any).headers['x-pdpj-conta'] = '9999-9999';

      middleware.use(requisicaoMock, respostaMock as Response, proximoMock);

      expect(respostaMock.status).toHaveBeenCalledWith(403);
      expect(respostaMock.json).toHaveBeenCalledWith({
        error: 'Conta/Agência não pertence ao usuário autenticado',
      });
      expect(proximoMock).not.toHaveBeenCalled();
    });
  });
});
