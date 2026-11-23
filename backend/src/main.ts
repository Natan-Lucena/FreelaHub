import { Pool } from 'pg';
import { criarApp } from './adapters/in/http/app';
import { PostgresUsuarioRepository } from './adapters/out/persistence/PostgresUsuarioRepository';
import { SCHEMA_USUARIOS } from './adapters/out/persistence/schemaUsuarios';
import { carregarAdministrador } from './adapters/out/persistence/seedAdministrador';
import { BcryptSenhaHasher } from './adapters/out/security/BcryptSenhaHasher';
import { JwtTokenService } from './adapters/out/security/JwtTokenService';
import { Autenticar } from './application/usecases/Autenticar';
import { Cadastrar } from './application/usecases/Cadastrar';
import { carregarConfig } from './config';

async function iniciar(): Promise<void> {
  const config = carregarConfig();
  const pool = new Pool({ connectionString: config.databaseUrl });
  const hasher = new BcryptSenhaHasher();
  const tokens = new JwtTokenService(config.jwtSecret, config.jwtExpiracaoSegundos);
  const usuarios = new PostgresUsuarioRepository(pool);

  await pool.query(SCHEMA_USUARIOS);
  await carregarAdministrador(pool, hasher, { email: config.adminEmail, senha: config.adminSenha });

  const app = criarApp({
    cadastrar: new Cadastrar(usuarios, hasher),
    autenticar: new Autenticar(usuarios, hasher, tokens),
  });
  app.listen(config.porta, () => console.log(`API do FreelaHub na porta ${config.porta}`));
}

iniciar().catch((erro) => {
  console.error('Falha ao iniciar a API:', erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
