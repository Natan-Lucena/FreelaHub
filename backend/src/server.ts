import { Pool } from 'pg';
import { autenticacaoNaoConfigurada } from './adapters/in/http/autenticacao';
import { criarApp } from './adapters/in/http/app';
import { criarRotasDePropostas } from './adapters/in/http/rotas/propostas';
import { ConsoleNotificationAdapter } from './adapters/out/notification/ConsoleNotificationAdapter';
import { PostgresProjetoConsulta } from './adapters/out/persistence/PostgresProjetoConsulta';
import { PostgresPropostaRepository } from './adapters/out/persistence/PostgresPropostaRepository';
import { EnviarProposta } from './application/casos-de-uso/EnviarProposta';
import { ListarPropostasDoProjeto } from './application/casos-de-uso/ListarPropostasDoProjeto';

/**
 * Raiz de composição: o único lugar que conhece as implementações concretas
 * e as conecta às portas (ADR-001).
 */
const porta = Number(process.env.PORT ?? 3000);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Adaptadores de saída
const projetos = new PostgresProjetoConsulta(pool);
const propostas = new PostgresPropostaRepository(pool);
const notificacoes = new ConsoleNotificationAdapter();

// Substituir pelo middleware JWT quando a fatia RF01 for integrada.
const autenticar = autenticacaoNaoConfigurada;

const app = criarApp([
  criarRotasDePropostas({
    enviarProposta: new EnviarProposta(projetos, propostas, notificacoes),
    listarPropostasDoProjeto: new ListarPropostasDoProjeto(projetos, propostas),
    autenticar,
  }),
]);

app.listen(porta, () => {
  console.log(`API do FreelaHub ouvindo na porta ${porta}`);
});
