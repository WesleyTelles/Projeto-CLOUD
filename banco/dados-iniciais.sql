-- Dados FICTÍCIOS para demonstração. Só insere se a tabela estiver vazia.
-- Datas relativas a "hoje em Recife" para o filtro "atrasadas" sempre ter o que mostrar.

WITH h AS (SELECT (now() AT TIME ZONE 'America/Recife')::date AS hoje),
novas (titulo, responsavel, prioridade, prazo_dias, concluida) AS (
    VALUES
    ('Reservar o auditório para a aula inaugural', 'Ana Exemplo',   'alta',  -2, false),
    ('Publicar horários do semestre no mural',     'Bruno Exemplo', 'média', -1, false),
    ('Conferir diários de classe do 1º bimestre',  'Carla Exemplo', 'alta',   0, false),
    ('Enviar comunicado de início das aulas',      'Ana Exemplo',   'média',  3, false),
    ('Reunião de alinhamento com professores',     'Diego Exemplo', 'baixa',  7, false),
    ('Atualizar lista de contatos da secretaria',  'Bruno Exemplo', 'baixa', NULL, false),
    ('Imprimir crachás dos novos alunos',          'Carla Exemplo', 'média', -3, true),
    ('Organizar a recepção dos calouros',          'Diego Exemplo', 'alta',  -1, true)
)
INSERT INTO tarefas (titulo, responsavel, prioridade, prazo, concluida_em)
SELECT n.titulo, n.responsavel, n.prioridade,
       CASE WHEN n.prazo_dias IS NULL THEN NULL ELSE h.hoje + n.prazo_dias END,
       CASE WHEN n.concluida THEN now() ELSE NULL END
FROM novas n CROSS JOIN h
WHERE NOT EXISTS (SELECT 1 FROM tarefas);
