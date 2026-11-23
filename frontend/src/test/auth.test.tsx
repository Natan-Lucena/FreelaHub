import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { requisitar } from '../api/httpClient';
import { guardarSessao, lerSessao, Sessao } from '../api/sessaoStorage';
import { App } from '../App';
import { AuthProvider } from '../auth/AuthContext';

const sessao: Sessao = {
  token: 'token-teste',
  usuario: { id: '1', nome: 'Ana', email: 'ana@exemplo.com', perfil: 'CLIENTE' },
};

function resposta(status: number, corpo: unknown) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });
}

function renderizar(rota = '/') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

async function preencherLogin(senha = 'senha-segura') {
  const usuario = userEvent.setup();
  await usuario.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com');
  await usuario.type(screen.getByLabelText('Senha'), senha);
  await usuario.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('cliente HTTP', () => {
  it('envia o cabeçalho Bearer quando há token', async () => {
    guardarSessao(sessao);
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta(200, {}));
    await requisitar('/projetos');
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-teste');
  });

  it('não envia Authorization sem token e usa JSON', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta(200, {}));
    await requisitar('/sessoes', { method: 'POST', body: { a: 1 } });
    const opcoes = fetchMock.mock.calls[0][1]!;
    const headers = opcoes.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
    expect(headers['Content-Type']).toBe('application/json');
    expect(opcoes.body).toBe('{"a":1}');
  });
});

describe('rotas e sessão', () => {
  it('redireciona rota protegida sem token para o login', () => {
    renderizar('/');
    expect(screen.getByRole('heading', { name: 'Entrar no FreelaHub' })).toBeInTheDocument();
  });

  it('login válido guarda o token e libera a rota protegida', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta(200, sessao));
    renderizar('/login');
    await preencherLogin();
    expect(await screen.findByRole('heading', { name: 'Olá, Ana' })).toBeInTheDocument();
    expect(lerSessao()?.token).toBe('token-teste');
  });

  it('login inválido mostra o erro e não guarda token', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta(401, { mensagem: 'E-mail ou senha inválidos.' }));
    renderizar('/login');
    await preencherLogin('senha-errada');
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.');
    expect(lerSessao()).toBeNull();
  });

  it('resposta 401 com sessão ativa leva para o login', async () => {
    guardarSessao(sessao);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta(401, { mensagem: 'Token inválido ou expirado.' }));
    renderizar('/');
    expect(screen.getByRole('heading', { name: 'Olá, Ana' })).toBeInTheDocument();
    await requisitar('/projetos').catch(() => undefined);
    expect(await screen.findByRole('heading', { name: 'Entrar no FreelaHub' })).toBeInTheDocument();
    expect(lerSessao()).toBeNull();
  });

  it('logout remove o token', async () => {
    guardarSessao(sessao);
    renderizar('/');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Sair' }));
    await waitFor(() => expect(lerSessao()).toBeNull());
    expect(screen.getByRole('heading', { name: 'Entrar no FreelaHub' })).toBeInTheDocument();
  });
});

describe('tela de cadastro', () => {
  it('lista apenas Cliente e Freelancer', () => {
    renderizar('/cadastro');
    const opcoes = screen.getAllByRole('option').map((o) => o.textContent);
    expect(opcoes).toEqual(['Cliente', 'Freelancer']);
  });

  it('mostra a mensagem de conflito da API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta(409, { mensagem: 'Já existe um usuário com este e-mail.' }));
    renderizar('/cadastro');
    const usuario = userEvent.setup();
    await usuario.type(screen.getByLabelText('Nome'), 'Ana');
    await usuario.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com');
    await usuario.type(screen.getByLabelText('Senha'), 'senha-segura');
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe um usuário com este e-mail.');
  });
});
