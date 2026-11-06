-- =====================================================================
-- Mural da Coordenação: criação das tabelas e restrições (PostgreSQL)
-- Idempotente: pode rodar mais de uma vez.
-- =====================================================================

CREATE TABLE IF NOT EXISTS tarefas (
    id            SERIAL PRIMARY KEY,
    titulo        VARCHAR(120) NOT NULL,
    responsavel   VARCHAR(100) NOT NULL,
    prioridade    VARCHAR(5)   NOT NULL DEFAULT 'média',
    prazo         DATE         NULL,
    concluida_em  TIMESTAMPTZ  NULL,
    criada_em     TIMESTAMPTZ  NOT NULL DEFAULT now(),

    -- Última linha de defesa: o servidor valida, o banco garante.
    CONSTRAINT tarefas_titulo_tamanho
        CHECK (char_length(btrim(titulo)) BETWEEN 3 AND 120),
    CONSTRAINT tarefas_responsavel_nao_vazio
        CHECK (char_length(btrim(responsavel)) >= 1),
    CONSTRAINT tarefas_prioridade_valida
        CHECK (prioridade IN ('baixa', 'média', 'alta'))
);

-- "Situação" NÃO é coluna: é derivada de concluida_em (uma fonte só de verdade).
-- "Atrasada" também é derivada (prazo < hoje E concluida_em IS NULL), calculada no SQL.

-- Acelera o filtro "atrasadas" (somente tarefas não concluídas com prazo).
CREATE INDEX IF NOT EXISTS idx_tarefas_pendentes_prazo
    ON tarefas (prazo)
    WHERE concluida_em IS NULL AND prazo IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel
    ON tarefas (lower(responsavel));
