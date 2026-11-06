'use strict';
// Testes unitários da validação: NÃO precisam de banco.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validarNovaTarefa, ehDataValida, interpretarId } = require('../src/validacao');

const HOJE = '2026-11-06';
const ok = (extra = {}) => ({ titulo: 'Reservar auditório', responsavel: 'Ana Exemplo', ...extra });

test('CA1: título com 2 caracteres é recusado', () => {
  const r = validarNovaTarefa(ok({ titulo: 'ab' }), HOJE);
  assert.equal(r.erros.length, 1);
  assert.match(r.erros[0], /entre 3 e 120/);
});

test('título com 3 e com 120 caracteres é aceito; 121 é recusado', () => {
  assert.equal(validarNovaTarefa(ok({ titulo: 'abc' }), HOJE).erros.length, 0);
  assert.equal(validarNovaTarefa(ok({ titulo: 'a'.repeat(120) }), HOJE).erros.length, 0);
  assert.equal(validarNovaTarefa(ok({ titulo: 'a'.repeat(121) }), HOJE).erros.length, 1);
});

test('título só com espaços é recusado (trim)', () => {
  assert.equal(validarNovaTarefa(ok({ titulo: '     ' }), HOJE).erros.length, 1);
});

test('CA2: prazo anterior a hoje é recusado; hoje e futuro são aceitos', () => {
  assert.equal(validarNovaTarefa(ok({ prazo: '2026-11-05' }), HOJE).erros.length, 1);
  assert.equal(validarNovaTarefa(ok({ prazo: '2026-11-06' }), HOJE).erros.length, 0);
  assert.equal(validarNovaTarefa(ok({ prazo: '2026-12-01' }), HOJE).erros.length, 0);
});

test('prazo opcional: ausente, null e vazio viram null', () => {
  for (const prazo of [undefined, null, '']) {
    const r = validarNovaTarefa(ok({ prazo }), HOJE);
    assert.equal(r.erros.length, 0);
    assert.equal(r.valores.prazo, null);
  }
});

test('prazo com formato ou data impossível é recusado', () => {
  for (const prazo of ['06/11/2026', '2026-13-01', '2026-02-30', 'amanhã', 20261106]) {
    assert.equal(validarNovaTarefa(ok({ prazo }), HOJE).erros.length, 1, String(prazo));
  }
});

test('prioridade: padrão média; aceita "media"; recusa valor fora da lista', () => {
  assert.equal(validarNovaTarefa(ok(), HOJE).valores.prioridade, 'média');
  assert.equal(validarNovaTarefa(ok({ prioridade: 'media' }), HOJE).valores.prioridade, 'média');
  assert.equal(validarNovaTarefa(ok({ prioridade: 'ALTA' }), HOJE).valores.prioridade, 'alta');
  assert.equal(validarNovaTarefa(ok({ prioridade: 'urgente' }), HOJE).erros.length, 1);
});

test('responsável é obrigatório', () => {
  assert.equal(validarNovaTarefa({ titulo: 'Tarefa válida' }, HOJE).erros.length, 1);
  assert.equal(validarNovaTarefa(ok({ responsavel: '  ' }), HOJE).erros.length, 1);
});

test('corpo que não é objeto é recusado', () => {
  for (const corpo of [null, 'texto', 42, [], undefined]) {
    assert.equal(validarNovaTarefa(corpo, HOJE).erros.length, 1);
  }
});

test('ehDataValida e interpretarId', () => {
  assert.equal(ehDataValida('2028-02-29'), true);
  assert.equal(ehDataValida('2027-02-29'), false);
  assert.equal(interpretarId('7'), 7);
  for (const id of ['0', '-1', 'abc', '1.5', '99999999999', '2147483648', '']) {
    assert.equal(interpretarId(id), null, id);
  }
});
