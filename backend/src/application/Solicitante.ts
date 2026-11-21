/**
 * Usuário que dispara um caso de uso, já identificado pelo adaptador de entrada
 * (middleware JWT, ADR-002). A aplicação não conhece o formato do token.
 */
export type PerfilUsuario = 'CLIENTE' | 'FREELANCER' | 'ADMINISTRADOR';

export interface Solicitante {
  id: string;
  perfil: PerfilUsuario;
}
