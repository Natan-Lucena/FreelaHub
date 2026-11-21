/**
 * Erros de domínio compartilhados por todas as fatias.
 * O adaptador HTTP converte cada tipo em um código de status (ADR-003).
 */
export abstract class ErroDeDominio extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = new.target.name;
  }
}

/** Dados de entrada inválidos (HTTP 400). */
export class DadosInvalidosError extends ErroDeDominio {}

/** Usuário identificado, mas sem permissão para a operação (HTTP 403). */
export class AcessoNegadoError extends ErroDeDominio {}

/** Recurso inexistente (HTTP 404). */
export class RecursoNaoEncontradoError extends ErroDeDominio {}

/** Operação viola uma regra de negócio ou o estado atual do recurso (HTTP 409). */
export class RegraDeNegocioError extends ErroDeDominio {}
