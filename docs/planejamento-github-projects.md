# Planejamento no GitHub Projects

Entrega do dia 30/10: publicar no GitHub Projects o planejamento e as tarefas da **Sprint 1 (persistência)**, com responsáveis e andamento. A avaliação usa os **commits do GitHub**: cada integrante precisa ter commits próprios, ao longo do tempo, e não tudo no final.

## 1. Criar o quadro

1. No GitHub: aba **Projects** da organização ou do perfil, **New project**, modelo **Board**. Nome: `Mural da Coordenação · Grupo XX`.
2. Vincule o projeto ao repositório (**Link a repository**).
3. Colunas (campo Status): `Backlog`, `Sprint 1 · A fazer`, `Em andamento`, `Em revisão`, `Feito`.
4. Campos extras: `Papel` (DEV, DADOS, NUVEM, QA), `Sprint` (Sprint 1, Sprint 2, Finalização), `Prazo`.
5. Adicione os integrantes ao repositório (Settings, Collaborators) para poderem ser responsáveis (Assignees).

## 2. Sprint 1: Persistência

Objetivo: o sistema salva e consulta tarefas num banco de dados real, e o dado sobrevive a um reinício.

| # | Tarefa | Papel | Entregável / critério de pronto |
|---|---|---|---|
| 1 | Criar repositório, `.gitignore` (com `.env`), `.env.example` e estrutura de pastas | NUVEM | Repositório com estrutura; `.env` ignorado |
| 2 | Modelar a tabela `tarefas` com tipos e restrições | DADOS | Modelo no README; `CHECK`, `NOT NULL` definidos |
| 3 | Escrever `banco/schema.sql` | DADOS | Roda sem erro duas vezes (idempotente) |
| 4 | Escrever `banco/dados-iniciais.sql` (dados fictícios) | DADOS | Script insere tarefas de exemplo |
| 5 | Criar o banco (Azure PostgreSQL ou local) e liberar firewall | NUVEM | Conexão testada com `psql` |
| 6 | Configurar `DATABASE_URL` como variável de ambiente (local e App Service) | NUVEM | Nenhum segredo no Git |
| 7 | Implementar conexão com o banco (`src/db.js`) e `GET /health` | DEV | `/health` 200 com banco; 503 sem banco |
| 8 | Implementar cadastro de tarefa (RF1) com validação no servidor | DEV | `POST /api/tarefas` grava no banco; 400 em entrada inválida |
| 9 | Implementar listagem de tarefas (RF2) | DEV | `GET /api/tarefas` lê do banco |
| 10 | Interface mínima (formulário e lista) | DEV | `public/index.html` cadastra e lista |
| 11 | Prova de persistência: cadastrar `GXX-PALAVRA`, reiniciar, conferir | DADOS | 4 prints em `evidencias/` |
| 12 | Casos de teste da Sprint 1 (cadastro, listagem, 400) | QA | Tabela de testes no README |
| 13 | Arquivo `requests.http` com as requisições | QA | Requisições executam |
| 14 | Esqueleto do README (problema, arquitetura, modelo) | QA | README com seções 1 a 4 |

## 3. Sprint 2: regras, implantação e testes

| # | Tarefa | Papel |
|---|---|---|
| 15 | Concluir tarefa com data e hora, `409` na repetição (RF3, CA3) | DEV |
| 16 | Filtro "atrasadas" calculado no SQL com fuso de Recife (RF4, CA4) | DEV + DADOS |
| 17 | Excluir tarefa, `404` para id inexistente (RF5, CA5) | DEV |
| 18 | Filtros pendentes/concluídas e contadores | DEV |
| 19 | Criar App Service e publicar; configurar `DATABASE_URL` | NUVEM |
| 20 | Ativar logs do App Service e testar `/health` na nuvem | NUVEM |
| 21 | Usuário de banco sem privilégio de administrador | DADOS + NUVEM |
| 22 | Testes CA1 a CA5 (`npm test`) e print do filtro "atrasadas" | QA |
| 23 | Testar o CA4 à noite (depois das 21h) e documentar o fuso | QA |

## 4. Finalização

| # | Tarefa | Papel |
|---|---|---|
| 24 | Prints E1 a E6 organizados em `evidencias/` | QA |
| 25 | README completo (decisões, trade-offs, dificuldade superada, limitações) | QA |
| 26 | Gravar e publicar o vídeo do pitch de 90 segundos; colar o link no README | QA + todos |
| 27 | Ensaio de perguntas: todos explicam o fluxo completo | todos |
| 28 | Parar o servidor de banco e excluir o grupo de recursos na data do professor | NUVEM |

## 5. Criar as issues de uma vez (opcional)

Com o GitHub CLI (`gh auth login` feito), edite os nomes de usuário no topo de `scripts/criar-issues.sh` e rode `bash scripts/criar-issues.sh`. Depois, no Projects, use **Add item** para trazer as issues e preencher o campo Sprint/Status. Se preferir, crie os cartões à mão a partir das tabelas acima.

## 6. Como acompanhar o andamento

- Mover o cartão: `Sprint 1 · A fazer`, `Em andamento`, `Em revisão`, `Feito`.
- Cada tarefa tem **um responsável** (Assignee) e uma issue.
- Commits referenciam a issue: `feat(api): cadastrar tarefa (#8)`; o PR ou commit com `Closes #8` fecha o cartão.

### Convenção de commits
`feat:` funcionalidade · `fix:` correção · `db:` tabelas e scripts · `docs:` README e documentos · `test:` testes · `chore:` configuração.

### Plano de commits da Sprint 1 (um por marco, cada papel com os seus)

| Papel | Commits esperados |
|---|---|
| NUVEM | `chore: estrutura inicial, .gitignore e .env.example` · `docs: passo a passo Azure` · `chore: variável DATABASE_URL no App Service` |
| DADOS | `db: schema.sql com restrições` · `db: dados iniciais fictícios` · `docs: modelo de dados e prova de persistência` |
| DEV | `feat: conexão com o banco e /health` · `feat: cadastro de tarefa com validação` · `feat: listagem de tarefas` · `feat: interface web` |
| QA | `test: casos de teste de validação` · `docs: requests.http` · `docs: esqueleto do README` |

Regra do grupo: commits pequenos e frequentes, mensagem clara, cada um no seu nome. Não publicar tudo no último dia.
