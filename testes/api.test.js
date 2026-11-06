'use strict';
// Testes de integração: exigem DATABASE_URL apontando para um banco com o schema aplicado.
// Os dados de teste usam responsavel = 'TESTE-AUTO' e são apagados no início e no fim.
require('dotenv').config();
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createApp } = require('../src/app');
const db = require('../src/db');

const RESP = 'TESTE-AUTO';
let servidor;
let base;

async function api(metodo, caminho, corpo) {
  const opcoes = { method: metodo, headers: {} };
  if (corpo !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = typeof corpo === 'string' ? corpo : JSON.stringify(corpo);
  }
  const resp = await fetch(base + caminho, opcoes);
  const texto = await resp.text();
  return { status: resp.status, corpo: texto ? JSON.parse(texto) : null };
}

async function diaRelativo(dias) {
  const { rows } = await db.query(
    "SELECT ((now() AT TIME ZONE 'America/Recife')::date + $1::int) AS d", [dias]
  );
  return rows[0].d; // texto YYYY-MM-DD
}

const limpar = () => db.query('DELETE FROM tarefas WHERE responsavel = $1', [RESP]);
const nova = (extra = {}) => ({ titulo: 'Tarefa de teste', responsavel: RESP, ...extra });

before(async () => {
  await limpar();
  servidor = createApp().listen(0);
  await once(servidor, 'listening');
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(async () => {
  await limpar().catch(() => {});
  servidor.close();
  await db.fechar();
});

test('T01 /health: 200, banco conectado e iniciado_em presente', async () => {
  const r = await api('GET', '/health');
  assert.equal(r.status, 200);
  assert.equal(r.corpo.status, 'ok');
  assert.equal(r.corpo.banco, 'conectado');
  assert.ok(r.corpo.iniciado_em);
});

test('T02 cadastro válido: 201, prioridade padrão média, concluida_em nulo', async () => {
  const r = await api('POST', '/api/tarefas', nova());
  assert.equal(r.status, 201);
  assert.equal(r.corpo.prioridade, 'média');
  assert.equal(r.corpo.concluida_em, null);
  assert.equal(r.corpo.situacao, 'pendente');
  assert.equal(r.corpo.atrasada, false);
});

test('CA1 título com 2 caracteres: 400 com mensagem', async () => {
  const r = await api('POST', '/api/tarefas', nova({ titulo: 'ab' }));
  assert.equal(r.status, 400);
  assert.match(r.corpo.erro, /entre 3 e 120/);
});

test('CA2 prazo de ontem no cadastro: 400; prazo de hoje: 201', async () => {
  const ontem = await diaRelativo(-1);
  const hoje = await diaRelativo(0);
  assert.equal((await api('POST', '/api/tarefas', nova({ prazo: ontem }))).status, 400);
  assert.equal((await api('POST', '/api/tarefas', nova({ prazo: hoje }))).status, 201);
});

test('CA3 concluir pendente preenche concluida_em; concluir de novo: 409', async () => {
  const criada = await api('POST', '/api/tarefas', nova({ titulo: 'CA3 concluir' }));
  const id = criada.corpo.id;
  const um = await api('PATCH', `/api/tarefas/${id}/concluir`);
  assert.equal(um.status, 200);
  assert.ok(um.corpo.concluida_em);
  assert.equal(um.corpo.situacao, 'concluida');
  const dois = await api('PATCH', `/api/tarefas/${id}/concluir`);
  assert.equal(dois.status, 409);
});

test('CA4 filtro atrasadas mostra só a pendente (ambas com prazo de ontem)', async () => {
  const ontem = await diaRelativo(-1);
  // Preparação documentada: o cadastro recusa prazo passado, então insere direto no banco.
  await db.query(
    `INSERT INTO tarefas (titulo, responsavel, prazo, concluida_em) VALUES
     ('CA4 pendente', $1, $2, NULL), ('CA4 concluida', $1, $2, now())`,
    [RESP, ontem]
  );
  const r = await api('GET', `/api/tarefas?situacao=atrasadas&responsavel=${RESP}`);
  assert.equal(r.status, 200);
  const titulos = r.corpo.tarefas.map((t) => t.titulo);
  assert.ok(titulos.includes('CA4 pendente'));
  assert.ok(!titulos.includes('CA4 concluida'));
  assert.ok(r.corpo.tarefas.every((t) => t.atrasada === true && t.concluida_em === null));
});

test('filtros pendentes e concluidas separam corretamente', async () => {
  const pend = await api('GET', `/api/tarefas?situacao=pendentes&responsavel=${RESP}`);
  const conc = await api('GET', `/api/tarefas?situacao=concluidas&responsavel=${RESP}`);
  assert.ok(pend.corpo.tarefas.every((t) => t.concluida_em === null));
  assert.ok(conc.corpo.tarefas.every((t) => t.concluida_em !== null));
  assert.ok(conc.corpo.total >= 1);
});

test('filtro com valor inválido: 400', async () => {
  assert.equal((await api('GET', '/api/tarefas?situacao=qualquer')).status, 400);
});

test('CA5 excluir id inexistente: 404', async () => {
  assert.equal((await api('DELETE', '/api/tarefas/2147483647')).status, 404);
});

test('excluir existente: 200 e depois 404; id inválido: 400', async () => {
  const criada = await api('POST', '/api/tarefas', nova({ titulo: 'Para excluir' }));
  const id = criada.corpo.id;
  assert.equal((await api('DELETE', `/api/tarefas/${id}`)).status, 200);
  assert.equal((await api('DELETE', `/api/tarefas/${id}`)).status, 404);
  assert.equal((await api('DELETE', '/api/tarefas/abc')).status, 400);
});

test('concluir id inexistente: 404', async () => {
  assert.equal((await api('PATCH', '/api/tarefas/2147483647/concluir')).status, 404);
});

test('JSON malformado: 400 sem detalhe interno', async () => {
  const r = await api('POST', '/api/tarefas', '{titulo:');
  assert.equal(r.status, 400);
  assert.equal(r.corpo.erro, 'JSON inválido.');
});

test('extra: reabrir tarefa concluída; reabrir pendente: 409', async () => {
  const criada = await api('POST', '/api/tarefas', nova({ titulo: 'Reabrir' }));
  const id = criada.corpo.id;
  assert.equal((await api('PATCH', `/api/tarefas/${id}/reabrir`)).status, 409);
  await api('PATCH', `/api/tarefas/${id}/concluir`);
  const r = await api('PATCH', `/api/tarefas/${id}/reabrir`);
  assert.equal(r.status, 200);
  assert.equal(r.corpo.concluida_em, null);
});

test('extra: contadores batem com a listagem', async () => {
  const c = await api('GET', '/api/tarefas/contadores');
  assert.equal(c.status, 200);
  assert.equal(c.corpo.total, c.corpo.pendentes + c.corpo.concluidas);
  assert.ok(c.corpo.atrasadas <= c.corpo.pendentes);
});

test('rota /api desconhecida: 404 em JSON', async () => {
  const r = await api('GET', '/api/nao-existe');
  assert.equal(r.status, 404);
});

test('rota oficial /tarefas responde igual ao alias /api/tarefas', async () => {
  const r = await api('POST', '/tarefas', nova({ titulo: 'Rota oficial' }));
  assert.equal(r.status, 201);
  const l = await api('GET', '/tarefas?situacao=pendentes');
  assert.equal(l.status, 200);
  assert.ok(l.corpo.tarefas.some((t) => t.id === r.corpo.id));
});

test('título com 121 caracteres: 400', async () => {
  const r = await api('POST', '/tarefas', nova({ titulo: 'x'.repeat(121) }));
  assert.equal(r.status, 400);
});

test('título com 120 caracteres: 201', async () => {
  assert.equal((await api('POST', '/tarefas', nova({ titulo: 'x'.repeat(120) }))).status, 201);
});

test('prioridade inválida: 400; sem prioridade assume média', async () => {
  assert.equal((await api('POST', '/tarefas', nova({ prioridade: 'urgente' }))).status, 400);
  const r = await api('POST', '/tarefas', nova());
  assert.equal(r.corpo.prioridade, 'média');
});

test('responsável ausente: 400', async () => {
  assert.equal((await api('POST', '/tarefas', { titulo: 'Sem responsável' })).status, 400);
});

test('CA4 tarefa concluída com prazo vencido não aparece em atrasadas (após concluir)', async () => {
  const ontem = await diaRelativo(-1);
  const { rows } = await db.query(
    "INSERT INTO tarefas (titulo, responsavel, prazo) VALUES ($1, $2, $3) RETURNING id",
    ['Vencida para concluir', RESP, ontem]
  );
  const id = rows[0].id;
  let l = await api('GET', '/tarefas?situacao=atrasadas');
  assert.ok(l.corpo.tarefas.some((t) => t.id === id));
  assert.equal((await api('PATCH', `/tarefas/${id}/concluir`)).status, 200);
  l = await api('GET', '/tarefas?situacao=atrasadas');
  assert.ok(!l.corpo.tarefas.some((t) => t.id === id));
});

test('conclusões simultâneas: exatamente uma 200 e as demais 409', async () => {
  const r = await api('POST', '/tarefas', nova({ titulo: 'Corrida de conclusão' }));
  const res = await Promise.all(
    Array.from({ length: 5 }, () => api('PATCH', `/tarefas/${r.corpo.id}/concluir`))
  );
  assert.equal(res.filter((x) => x.status === 200).length, 1);
  assert.equal(res.filter((x) => x.status === 409).length, 4);
});

test('palavra do dia GXX-PALAVRA e PROF-HHMM passam pelo fluxo normal de cadastro', async () => {
  const a = await api('POST', '/tarefas', nova({ titulo: 'G07-NIMBUS' }));
  const b = await api('POST', '/tarefas', nova({ titulo: 'PROF-2105' }));
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);
});
