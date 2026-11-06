'use strict';
const { Pool, types } = require('pg');

// DATE (oid 1082) volta como texto "YYYY-MM-DD", sem conversão de fuso pelo driver.
types.setTypeParser(1082, (valor) => valor);

let pool = null;

function sslConfig() {
  const modo = (process.env.DB_SSL || '').toLowerCase();
  if (modo === 'true') return true; // valida o certificado do servidor
  if (modo === 'no-verify') return { rejectUnauthorized: false };
  return false; // sem SSL: apenas banco local
}

function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    const erro = new Error('DATABASE_URL não definida');
    erro.code = 'SEM_DATABASE_URL';
    throw erro;
  }
  pool = new Pool({
    connectionString,
    ssl: sslConfig(),
    max: 5,
    connectionTimeoutMillis: 5000, // /health responde 503 rápido se o banco não responde
    idleTimeoutMillis: 30000,
  });
  pool.on('error', (erro) => {
    console.error('[db] erro em conexão ociosa:', erro.code || erro.message);
  });
  return pool;
}

const query = (texto, parametros) => getPool().query(texto, parametros);

async function fechar() {
  if (pool) {
    const p = pool;
    pool = null;
    await p.end();
  }
}

module.exports = { query, fechar };
