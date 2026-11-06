-- Print 4 da prova de persistência: consulta direta ao banco.
-- Troque GXX-PALAVRA pelo código real (ex.: G07-NIMBUS).
SELECT id, titulo, responsavel, prioridade, prazo, concluida_em, criada_em
FROM tarefas
WHERE titulo LIKE 'GXX-PALAVRA%';
