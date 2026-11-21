import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface EstadoNavegacao {
  origem?: string;
  mensagem?: string;
}

export function Login() {
  const { usuario, entrar } = useAuth();
  const estado = (useLocation().state ?? {}) as EstadoNavegacao;
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    return <Navigate to={estado.origem ?? '/'} replace />;
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(email, senha);
    } catch (e) {
      setErro((e as Error).message);
      setEnviando(false);
    }
  }

  return (
    <main className="cartao">
      <h1>Entrar no FreelaHub</h1>
      {estado.mensagem && <p role="status" className="sucesso">{estado.mensagem}</p>}
      <form onSubmit={enviar}>
        <label>
          E-mail
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        {erro && <p role="alert" className="erro">{erro}</p>}
        <button type="submit" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p>Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
    </main>
  );
}
