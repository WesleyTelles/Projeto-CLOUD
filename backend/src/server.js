'use strict';
require('dotenv').config(); // local: lê .env. No App Service as variáveis já vêm do ambiente.
const { createApp } = require('./app');
const db = require('./db');

const porta = process.env.PORT || 3000;
const iniciadoEm = new Date().toISOString();

if (!process.env.DATABASE_URL) {
  console.warn('[aviso] DATABASE_URL não definida: /health responderá 503.');
}

const servidor = createApp({ iniciadoEm }).listen(porta, () => {
  console.log(`Mural da Coordenação ouvindo na porta ${porta} (iniciado_em ${iniciadoEm})`);
});

async function encerrar() {
  servidor.close(async () => {
    await db.fechar().catch(() => {});
    process.exit(0);
  });
}
process.on('SIGTERM', encerrar);
process.on('SIGINT', encerrar);
