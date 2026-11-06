-- PREPARAÇÃO DO TESTE (documentada, conforme o enunciado):
-- o cadastro recusa prazo no passado (CA2), então criamos direto no banco
-- uma tarefa pendente e uma concluída, ambas com prazo de ONTEM (Recife).
-- Depois, GET /api/tarefas?situacao=atrasadas deve mostrar APENAS a pendente.

INSERT INTO tarefas (titulo, responsavel, prioridade, prazo, concluida_em)
VALUES
 ('CA4 pendente com prazo de ontem', 'Teste CA4', 'alta',
  (now() AT TIME ZONE 'America/Recife')::date - 1, NULL),
 ('CA4 concluida com prazo de ontem', 'Teste CA4', 'alta',
  (now() AT TIME ZONE 'America/Recife')::date - 1, now());

-- Limpeza depois do print:
-- DELETE FROM tarefas WHERE responsavel = 'Teste CA4';
