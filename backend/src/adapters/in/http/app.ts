import express, { Express, Router } from 'express';
import { rotaNaoEncontrada, tratarErros } from './tratarErros';

/**
 * Monta a aplicação Express com as rotas de cada fatia.
 * Cada fatia expõe uma função `criarRotasDe...` que devolve um Router.
 */
export function criarApp(rotas: Router[]): Express {
  const app = express();

  app.use(express.json());
  app.get('/saude', (_req, res) => {
    res.json({ status: 'ok' });
  });
  rotas.forEach((router) => app.use(router));
  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
