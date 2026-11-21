import { RequestHandler, Response } from 'express';
import { PerfilUsuario, Solicitante } from '../../../application/Solicitante';

/** Requisição sem usuário identificado (HTTP 401). Erro do adaptador HTTP, não do domínio. */
export class NaoAutenticadoError extends Error {
  constructor(mensagem = 'Autenticação necessária.') {
    super(mensagem);
    this.name = 'NaoAutenticadoError';
  }
}

/**
 * Contrato entre o middleware JWT (RF01, ADR-002) e as rotas:
 * depois de validar o token, o middleware grava o usuário em `res.locals.usuario`.
 */
export interface LocalsAutenticados {
  usuario?: Solicitante;
}

const PERFIS: readonly PerfilUsuario[] = ['CLIENTE', 'FREELANCER', 'ADMINISTRADOR'];

export function obterSolicitante(res: Response): Solicitante {
  const usuario = (res.locals as LocalsAutenticados).usuario;
  if (!usuario || typeof usuario.id !== 'string' || !PERFIS.includes(usuario.perfil)) {
    throw new NaoAutenticadoError();
  }
  return usuario;
}

/**
 * Usado no server.ts enquanto o middleware JWT da fatia RF01 não está integrado:
 * recusa todas as rotas protegidas com 401, em vez de deixá-las abertas.
 */
export const autenticacaoNaoConfigurada: RequestHandler = (_req, _res, next) => {
  next(new NaoAutenticadoError('Autenticação ainda não configurada nesta versão da API.'));
};
