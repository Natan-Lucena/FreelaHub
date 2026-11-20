import { NextFunction, Request, Response } from 'express';
import {
  ErroConflito,
  ErroNaoAutenticado,
  ErroNaoEncontrado,
  ErroSemPermissao,
  ErroValidacao,
} from '../../../domain/erros';

function statusDoErro(erro: unknown): number | null {
  if (erro instanceof ErroValidacao) return 400;
  if (erro instanceof ErroNaoAutenticado) return 401;
  if (erro instanceof ErroSemPermissao) return 403;
  if (erro instanceof ErroNaoEncontrado) return 404;
  if (erro instanceof ErroConflito) return 409;
  return null;
}

export function tratarErros(erro: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(erro);
    return;
  }
  const status = statusDoErro(erro);
  if (status !== null) {
    res.status(status).json({ mensagem: (erro as Error).message });
    return;
  }
  const tipo = (erro as { type?: string }).type;
  if (tipo === 'entity.parse.failed') {
    res.status(400).json({ mensagem: 'O corpo da requisição não é um JSON válido.' });
    return;
  }
  if (tipo === 'entity.too.large') {
    res.status(413).json({ mensagem: 'O corpo da requisição é grande demais.' });
    return;
  }
  console.error(erro);
  res.status(500).json({ mensagem: 'Erro interno do servidor.' });
}
