import { useAuth } from '../auth/AuthContext';

const ROTULOS = { CLIENTE: 'Cliente', FREELANCER: 'Freelancer', ADMINISTRADOR: 'Administrador' };

export function Inicio() {
  const { usuario, sair } = useAuth();
  if (!usuario) return null;
  return (
    <main className="cartao">
      <h1>Olá, {usuario.nome}</h1>
      <p>Você entrou como {ROTULOS[usuario.perfil]}.</p>
      <button type="button" onClick={sair}>Sair</button>
    </main>
  );
}
