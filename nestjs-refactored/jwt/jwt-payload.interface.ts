/**
 * Chave de identificação para autorização de faturamento
 */
export interface ChaveIdFaturamentoAutorizacao {
  tipo?: string;
  agencia?: number;
  conta?: number;
  digito?: number;
  titularidade?: number;
}

/**
 * Dados do framework
 */
export interface DadosFramework {
  uuid?: string;
  empresa?: number;
  dependencia?: number;
  canal?: number;
  periferico?: string;
  idioma?: number;
  idSessao?: string;
  ticket?: string;
  tipoUsuario?: string;
  usuario?: string;
}

/**
 * Payload JWT decodificado
 */
export interface PayloadJwt {
  [key: string]: any;
  agencia?: string | number;
  conta?: string | number;
  chvIdFatAut?: ChaveIdFaturamentoAutorizacao;
  frwk?: DadosFramework;
  sub?: string;
  aud?: string;
  scope?: string;
  iss?: string;
  exp?: number;
  iat?: number;
  jti?: string;
}

/**
 * Requisição estendida com dados JWT
 */
export interface RequisicaoComJwt extends Request {
  jwt?: PayloadJwt;
  contaDecodificada?: string;
  agenciaDecodificada?: string;
}
