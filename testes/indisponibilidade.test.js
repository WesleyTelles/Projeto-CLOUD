'use strict';
// Falha de conexão com o banco: não precisa de banco no ar (aponta para porta fechada).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

process.env.DATABASE_URL = 'postgres://app:senha-falsa@127.0.0.1:1/mural';
process.env.DB_SSL = '';
const { createApp } = require('../src/app');
const db = require('../src/db');

let servidor;
let base;
before(async () => {
  servidor = createApp().listen(0);
  await once(servidor, 'listening');
  base = `http://127.0.0.1:${servidor.address().port}`;
});
after(async () => { servidor.close(); await db.fechar(); });

test('/health com banco indisponível: 503 sem detalhes internos', async () => {
  const r = await fetch(base + '/health');
  const texto = await r.text();
  assert.equal(r.status, 503);
  assert.ok(JSON.parse(texto).iniciado_em);
  assert.doesNotMatch(texto, /senha|127\.0\.0\.1|postgres:|ECONN/i);
});

test('GET /tarefas com banco indisponível: 503 sem detalhes internos', async () => {
  const r = await fetch(base + '/tarefas');
  const texto = await r.text();
  assert.equal(r.status, 503);
  assert.doesNotMatch(texto, /senha|127\.0\.0\.1|postgres:|ECONN|stack/i);
});

test('POST /tarefas com banco indisponível: 503', async () => {
  const r = await fetch(base + '/tarefas', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo: 'Qualquer', responsavel: 'Ana Exemplo' }),
  });
  assert.equal(r.status, 503);
});
