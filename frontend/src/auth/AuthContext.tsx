import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { definirAoExpirarSessao, requisitar } from '../api/httpClient';
import { guardarSessao, lerSessao, Perfil, removerSessao, Sessao, UsuarioSessao } from '../api/sessaoStorage';

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  perfil: Extract<Perfil, 'CLIENTE' | 'FREELANCER'>;
}

interface AuthContexto {
  usuario: UsuarioSessao | null;
  entrar(email: string, senha: string): Promise<void>;
  cadastrar(dados: DadosCadastro): Promise<void>;
  sair(): void;
}

const Contexto = createContext<AuthContexto | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao);

  useEffect(() => {
    definirAoExpirarSessao(() => setSessao(null));
    return () => definirAoExpirarSessao(() => {});
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    removerSessao();
    setSessao(null);
    const nova = await requisitar<Sessao>('/sessoes', { method: 'POST', body: { email, senha } });
    guardarSessao(nova);
    setSessao(nova);
  }, []);

  const cadastrar = useCallback(async (dados: DadosCadastro) => {
    await requisitar('/usuarios', { method: 'POST', body: dados });
  }, []);

  const sair = useCallback(() => {
    removerSessao();
    setSessao(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario: sessao?.usuario ?? null, entrar, cadastrar, sair }),
    [sessao, entrar, cadastrar, sair],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): AuthContexto {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return contexto;
}
