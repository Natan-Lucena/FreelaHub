import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { DadosCadastro, useAuth } from '../auth/AuthContext';

const TIPOS_CONTA: { valor: DadosCadastro['perfil']; rotulo: string }[] = [
  { valor: 'CLIENTE', rotulo: 'Cliente' },
  { valor: 'FREELANCER', rotulo: 'Freelancer' },
];

export function Cadastro() {
  const { usuario, cadastrar } = useAuth();
  const navegar = useNavigate();
  const [dados, setDados] = useState<DadosCadastro>({ nome: '', email: '', senha: '', perfil: 'CLIENTE' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const alterar = <K extends keyof DadosCadastro>(campo: K, valor: DadosCadastro[K]) =>
    setDados((atual) => ({ ...atual, [campo]: valor }));

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await cadastrar(dados);
      navegar('/login', { state: { mensagem: 'Cadastro realizado. Faça login para continuar.' } });
    } catch (e) {
      setErro((e as Error).message);
      setEnviando(false);
    }
  }

  return (
    <main className="cartao">
      <h1>Criar conta</h1>
      <form onSubmit={enviar}>
        <label>
          Nome
          <input autoComplete="name" required maxLength={120} value={dados.nome} onChange={(e) => alterar('nome', e.target.value)} />
        </label>
        <label>
          E-mail
          <input type="email" autoComplete="email" required value={dados.email} onChange={(e) => alterar('email', e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" autoComplete="new-password" required minLength={8} value={dados.senha} onChange={(e) => alterar('senha', e.target.value)} />
        </label>
        <label>
          Tipo de conta
          <select value={dados.perfil} onChange={(e) => alterar('perfil', e.target.value as DadosCadastro['perfil'])}>
            {TIPOS_CONTA.map(({ valor, rotulo }) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>
        {erro && <p role="alert" className="erro">{erro}</p>}
        <button type="submit" disabled={enviando}>{enviando ? 'Cadastrando...' : 'Cadastrar'}</button>
      </form>
      <p>Já tem conta? <Link to="/login">Entrar</Link></p>
    </main>
  );
}
