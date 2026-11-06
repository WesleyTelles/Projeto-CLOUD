'use strict';
// Aplica um arquivo .sql no banco de DATABASE_URL (útil sem psql instalado).
// Uso: node scripts/aplicar-sql.js banco/schema.sql
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/db');

(async () => {
  const arquivo = process.argv[2];
  if (!arquivo) {
    console.error('Uso: node scripts/aplicar-sql.js <arquivo.sql>');
    process.exit(1);
  }
  try {
    const sql = fs.readFileSync(path.resolve(arquivo), 'utf8');
    await db.query(sql);
    console.log(`OK: ${arquivo} aplicado.`);
  } catch (erro) {
    console.error('Falha ao aplicar o SQL:', erro.code || '', erro.message);
    process.exitCode = 1;
  } finally {
    await db.fechar();
  }
})();
