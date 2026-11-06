'use strict';
const path = require('path');
const express = require('express');
const db = require('./db');
const tarefas = require('./rotas/tarefas');

// Erros de banco que significam "serviço indisponível" (503), sem expor detalhes.
function bancoIndisponivel(erro) {
  const codigo = String(erro.code || '');
  const msg = String(erro.message || '');
  return (
    ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'SEM_DATABASE_URL'].includes(codigo) ||
    /^(08|28|53|57)/.test(codigo) ||
    /timeout|Connection terminated|ECONN/i.test(msg)
  );
}

function tratarErros(erro, req, res, _next) {
  // corpo JSON malformado ou grande demais
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  if (erro.type === 'entity.too.large') {
    return res.status(400).json({ erro: 'Corpo da requisição grande demais.' });
  }
  // detalhe técnico só no log do servidor, nunca na resposta
  console.error('[erro]', req.method, req.originalUrl, erro.code || '', erro.message);
  if (bancoIndisponivel(erro)) {
    return res.status(503).json({ erro: 'Serviço temporariamente indisponível. Tente novamente em instantes.' });
  }
  // rede de segurança: o banco recusou algo que a validação deixou passar
  if (erro.code === '23514') return res.status(400).json({ erro: 'Dados inválidos.' });
  if (erro.code === '23505') return res.status(409).json({ erro: 'Registro em conflito.' });
  res.status(500).json({ erro: 'Erro interno.' });
}

function createApp({ iniciadoEm = new Date().toISOString() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(express.json({ limit: '10kb' }));

  // Testa a conexão com o banco. iniciado_em muda quando o processo reinicia (prova de persistência).
  app.get('/health', async (req, res) => {
    try {
      await db.query('SELECT 1');
      res.json({
        status: 'ok',
        banco: 'conectado',
        iniciado_em: iniciadoEm,
        agora: new Date().toISOString(),
      });
    } catch (erro) {
      console.error('[health]', erro.code || erro.message);
      res.status(503).json({ status: 'erro', banco: 'indisponivel', iniciado_em: iniciadoEm });
    }
  });

  // Rota oficial do enunciado (/tarefas) e alias /api/tarefas usado pela interface.
  app.use(['/tarefas', '/api/tarefas'], tarefas);
  app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(tratarErros);
  return app;
}

module.exports = { createApp };
