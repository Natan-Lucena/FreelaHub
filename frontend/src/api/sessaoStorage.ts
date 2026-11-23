export type Perfil = 'CLIENTE' | 'FREELANCER' | 'ADMINISTRADOR';

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface Sessao {
  token: string;
  usuario: UsuarioSessao;
}

const CHAVE = 'freelahub.sessao';

export function lerSessao(): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const sessao = JSON.parse(bruto) as Partial<Sessao>;
    return typeof sessao.token === 'string' && sessao.usuario ? (sessao as Sessao) : null;
  } catch {
    return null;
  }
}

export function guardarSessao(sessao: Sessao): void {
  localStorage.setItem(CHAVE, JSON.stringify(sessao));
}

export function removerSessao(): void {
  localStorage.removeItem(CHAVE);
}
