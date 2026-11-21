import { ErrorRequestHandler, RequestHandler } from 'express';
import {
  AcessoNegadoError,
  DadosInvalidosError,
  ErroDeDominio,
  RecursoNaoEncontradoError,
  RegraDeNegocioError,
} from '../../../domain/erros';
import { NaoAutenticadoError } from './autenticacao';

/** Converte erros de domínio em respostas HTTP padronizadas (ADR-003). */
export function statusPara(erro: unknown): number {
  if (erro instanceof DadosInvalidosError) return 400;
  if (erro instanceof NaoAutenticadoError) return 401;
  if (erro instanceof AcessoNegadoError) return 403;
  if (erro instanceof RecursoNaoEncontradoError) return 404;
  if (erro instanceof RegraDeNegocioError) return 409;
  if (erro instanceof ErroDeDominio) return 400;
  return 500;
}

export const rotaNaoEncontrada: RequestHandler = (_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
};

export const tratarErros: ErrorRequestHandler = (erro, _req, res, _next) => {
  // JSON malformado no corpo da requisição (express.json)
  if ((erro as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ erro: 'Corpo da requisição não é um JSON válido.' });
    return;
  }

  const status = statusPara(erro);
  if (status === 500) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
    return;
  }
  res.status(status).json({ erro: (erro as Error).message });
};
