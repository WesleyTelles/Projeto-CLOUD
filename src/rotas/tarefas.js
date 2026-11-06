'use strict';
const express = require('express');
const db = require('../db');
const { validarNovaTarefa, interpretarId } = require('../validacao');

const router = express.Router();

// "Hoje" = data de Recife, calculada no banco (o App Service roda em UTC).
const HOJE = "((now() AT TIME ZONE 'America/Recife')::date)";
const ATRASADA = `(concluida_em IS NULL AND prazo IS NOT NULL AND prazo < ${HOJE})`;

// situacao é DERIVADA de concluida_em; atrasada é calculada no SQL.
const COLUNAS = `id, titulo, responsavel, prioridade, prazo, concluida_em, criada_em,
  CASE WHEN concluida_em IS NULL THEN 'pendente' ELSE 'concluida' END AS situacao,
  ${ATRASADA} AS atrasada`;

const ORDEM = `(concluida_em IS NOT NULL),
  CASE prioridade WHEN 'alta' THEN 1 WHEN 'média' THEN 2 ELSE 3 END,
  prazo ASC NULLS LAST, id ASC`;

const assincrono = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const escaparLike = (texto) => texto.replace(/[\\%_]/g, '\\$&');

function idOuErro(req, res) {
  const id = interpretarId(req.params.id);
  if (id === null) {
    res.status(400).json({ erro: 'O id deve ser um número inteiro positivo.' });
  }
  return id;
}

// RF1 + CA1 + CA2: cadastrar
router.post('/', assincrono(async (req, res) => {
  const { rows: [{ hoje }] } = await db.query(`SELECT ${HOJE} AS hoje`);
  const { erros, valores } = validarNovaTarefa(req.body, hoje);
  if (erros.length > 0) {
    return res.status(400).json({ erro: erros[0], detalhes: erros });
  }
  const { rows } = await db.query(
    `INSERT INTO tarefas (titulo, responsavel, prioridade, prazo)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUNAS}`,
    [valores.titulo, valores.responsavel, valores.prioridade, valores.prazo]
  );
  res.status(201).location(`/api/tarefas/${rows[0].id}`).json(rows[0]);
}));

// Extra: contadores (pendentes / concluídas / atrasadas)
router.get('/contadores', assincrono(async (req, res) => {
  const { rows } = await db.query(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE concluida_em IS NULL)::int AS pendentes,
            count(*) FILTER (WHERE concluida_em IS NOT NULL)::int AS concluidas,
            count(*) FILTER (WHERE ${ATRASADA})::int AS atrasadas
     FROM tarefas`
  );
  res.json(rows[0]);
}));

// RF2 + RF4 + CA4: listar com filtro por situação (e, extra, por responsável)
router.get('/', assincrono(async (req, res) => {
  const { situacao, responsavel } = req.query;
  const onde = [];
  const params = [];

  if (situacao !== undefined) {
    if (situacao === 'pendentes') onde.push('concluida_em IS NULL');
    else if (situacao === 'concluidas') onde.push('concluida_em IS NOT NULL');
    else if (situacao === 'atrasadas') onde.push(ATRASADA);
    else {
      return res.status(400).json({
        erro: 'Situação inválida. Use pendentes, concluidas ou atrasadas.',
      });
    }
  }
  if (typeof responsavel === 'string' && responsavel.trim() !== '') {
    const i = params.push(`%${escaparLike(responsavel.trim())}%`);
    onde.push(`responsavel ILIKE $${i}`);
  }

  const { rows } = await db.query(
    `SELECT ${COLUNAS} FROM tarefas
     ${onde.length ? 'WHERE ' + onde.join(' AND ') : ''}
     ORDER BY ${ORDEM}`,
    params
  );
  res.json({ total: rows.length, tarefas: rows });
}));

// RF3 + CA3: concluir (regra central). O UPDATE condicional é atômico:
// duas conclusões simultâneas nunca passam as duas.
router.patch('/:id/concluir', assincrono(async (req, res) => {
  const id = idOuErro(req, res);
  if (id === null) return;
  const r = await db.query(
    `UPDATE tarefas SET concluida_em = now()
     WHERE id = $1 AND concluida_em IS NULL
     RETURNING ${COLUNAS}`,
    [id]
  );
  if (r.rowCount === 1) return res.json(r.rows[0]);
  const existe = await db.query('SELECT 1 FROM tarefas WHERE id = $1', [id]);
  if (existe.rowCount === 0) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  res.status(409).json({ erro: 'A tarefa já foi concluída.' });
}));

// Extra: reabrir tarefa concluída
router.patch('/:id/reabrir', assincrono(async (req, res) => {
  const id = idOuErro(req, res);
  if (id === null) return;
  const r = await db.query(
    `UPDATE tarefas SET concluida_em = NULL
     WHERE id = $1 AND concluida_em IS NOT NULL
     RETURNING ${COLUNAS}`,
    [id]
  );
  if (r.rowCount === 1) return res.json(r.rows[0]);
  const existe = await db.query('SELECT 1 FROM tarefas WHERE id = $1', [id]);
  if (existe.rowCount === 0) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  res.status(409).json({ erro: 'A tarefa não está concluída.' });
}));

// RF5 + CA5: excluir (id inexistente → 404)
router.delete('/:id', assincrono(async (req, res) => {
  const id = idOuErro(req, res);
  if (id === null) return;
  const r = await db.query('DELETE FROM tarefas WHERE id = $1', [id]);
  if (r.rowCount === 0) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  res.status(200).json({ mensagem: 'Tarefa excluída.', id });
}));

module.exports = router;
