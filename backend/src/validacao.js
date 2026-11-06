'use strict';

const PRIORIDADES = ['baixa', 'média', 'alta'];

function ehDataValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [a, m, d] = texto.split('-').map(Number);
  const data = new Date(Date.UTC(a, m - 1, d));
  return (
    data.getUTCFullYear() === a &&
    data.getUTCMonth() === m - 1 &&
    data.getUTCDate() === d
  );
}

const tamanho = (texto) => [...texto].length;

/**
 * Valida o corpo do cadastro (RF1, CA1, CA2).
 * `hoje` vem do banco, no fuso de Recife, no formato YYYY-MM-DD.
 * Retorna { erros: string[], valores }.
 */
function validarNovaTarefa(corpo, hoje) {
  const erros = [];
  if (corpo === null || typeof corpo !== 'object' || Array.isArray(corpo)) {
    return { erros: ['O corpo da requisição deve ser um objeto JSON.'], valores: null };
  }

  // título: 3 a 120 caracteres
  let titulo = null;
  if (typeof corpo.titulo !== 'string') {
    erros.push('O título é obrigatório e deve ser texto.');
  } else {
    titulo = corpo.titulo.trim();
    if (tamanho(titulo) < 3 || tamanho(titulo) > 120) {
      erros.push('O título deve ter entre 3 e 120 caracteres.');
    }
  }

  // responsável: obrigatório, até 100 caracteres
  let responsavel = null;
  if (typeof corpo.responsavel !== 'string') {
    erros.push('O responsável é obrigatório e deve ser texto.');
  } else {
    responsavel = corpo.responsavel.trim();
    if (tamanho(responsavel) < 1 || tamanho(responsavel) > 100) {
      erros.push('O responsável deve ter entre 1 e 100 caracteres.');
    }
  }

  // prioridade: baixa | média | alta (padrão média; aceita "media" sem acento)
  let prioridade = 'média';
  const bruta = corpo.prioridade;
  if (bruta !== undefined && bruta !== null && bruta !== '') {
    if (typeof bruta !== 'string') {
      erros.push('A prioridade deve ser baixa, média ou alta.');
    } else {
      const normal = bruta.trim().toLowerCase() === 'media' ? 'média' : bruta.trim().toLowerCase();
      if (PRIORIDADES.includes(normal)) prioridade = normal;
      else erros.push('A prioridade deve ser baixa, média ou alta.');
    }
  }

  // prazo: opcional, YYYY-MM-DD, não pode ser anterior a hoje (Recife)
  let prazo = null;
  const p = corpo.prazo;
  if (p !== undefined && p !== null && p !== '') {
    if (typeof p !== 'string' || !ehDataValida(p.trim())) {
      erros.push('O prazo deve ser uma data válida no formato AAAA-MM-DD.');
    } else if (p.trim() < hoje) {
      erros.push('O prazo não pode ser anterior à data de hoje.');
    } else {
      prazo = p.trim();
    }
  }

  return { erros, valores: { titulo, responsavel, prioridade, prazo } };
}

// ids do tipo SERIAL: inteiro positivo de 32 bits
function interpretarId(texto) {
  if (!/^\d{1,10}$/.test(texto)) return null;
  const id = Number(texto);
  return id >= 1 && id <= 2147483647 ? id : null;
}

module.exports = { PRIORIDADES, ehDataValida, validarNovaTarefa, interpretarId };
