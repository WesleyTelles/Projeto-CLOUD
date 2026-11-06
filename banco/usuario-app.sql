-- Usuário da aplicação SEM privilégio de administrador (critério de segurança).
-- Rode como administrador do servidor, trocando o nome do banco e a senha.
-- A senha abaixo é um MARCADOR: use uma senha forte e guarde só no .env / App Service.

CREATE ROLE app_mural LOGIN PASSWORD 'TROQUE-ESTA-SENHA';
GRANT CONNECT ON DATABASE mural TO app_mural;
GRANT USAGE ON SCHEMA public TO app_mural;
GRANT SELECT, INSERT, UPDATE, DELETE ON tarefas TO app_mural;
GRANT USAGE, SELECT ON SEQUENCE tarefas_id_seq TO app_mural;
-- Sem CREATE, sem DROP, sem superusuário: a aplicação não altera o schema.
