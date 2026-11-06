# Mural da Coordenação

Sistema de gerenciamento e acompanhamento de tarefas destinado à organização das atividades da coordenação, com foco no controle de prazos, no registro de conclusões e na identificação de pendências atrasadas.

## 1. Visão Geral

O Mural da Coordenação tem como objetivo centralizar o acompanhamento de tarefas em um único ambiente, permitindo visualizar as atividades, registrar suas conclusões e identificar aquelas cujo prazo de execução foi ultrapassado.

O projeto é desenvolvido em grupo como parte de uma atividade avaliativa, contemplando as áreas de desenvolvimento de software, dados, infraestrutura em nuvem e garantia da qualidade.

## 2. Requisitos Funcionais

| Identificador | Requisito | Descrição |
|---|---|---|
| RF01 | Visualização de tarefas | Permitir a visualização das tarefas cadastradas no sistema. |
| RF02 | Conclusão de tarefas | Permitir marcar uma tarefa como concluída. |
| RF03 | Registro de conclusão | Registrar automaticamente a data e a hora em que a tarefa for concluída. |
| RF04 | Filtro de atrasadas | Permitir filtrar as tarefas com prazo vencido que ainda não foram concluídas. |

## 3. Regras de Negócio

### RN01 — Registro de conclusão

Ao concluir uma tarefa, o sistema deverá registrar automaticamente a data e a hora da conclusão, vinculando essas informações à tarefa correspondente.

### RN02 — Identificação de tarefas atrasadas

Uma tarefa será considerada atrasada quando sua data e hora limite tiverem sido ultrapassadas e ela permanecer sem conclusão registrada.

### RN03 — Integridade do registro

A data e a hora registradas deverão corresponder ao momento efetivo da conclusão da tarefa, permitindo consultar posteriormente quando a atividade foi finalizada.

## 4. Equipe e Responsabilidades

O desenvolvimento está organizado em quatro frentes de trabalho.

| Integrante | Área de atuação |
|---|---|
| Wesley Telles | Desenvolvimento de Software (DEV) |
| Arthur Alexandre | Dados |
| Felipe Diogo | Infraestrutura em Nuvem |
| Lucas Ferreira | Garantia da Qualidade (QA) |

### Desenvolvimento de Software — Wesley Telles

Responsável pela frente de desenvolvimento da aplicação, incluindo a implementação das funcionalidades e das regras de negócio relacionadas ao gerenciamento de tarefas.

### Dados — Arthur Alexandre

Responsável pela frente de dados, contemplando a organização e a estruturação das informações necessárias ao funcionamento do sistema.

### Infraestrutura em Nuvem — Felipe Diogo

Responsável pela frente de infraestrutura em nuvem, contemplando os recursos necessários para disponibilização e operação da aplicação no ambiente definido pelo projeto.

### Garantia da Qualidade — Lucas Ferreira

Responsável pela frente de qualidade, contemplando a validação dos requisitos, a execução de testes e a identificação de comportamentos inesperados.

## 5. Critérios de Aceitação

- [ ] As tarefas cadastradas podem ser visualizadas.
- [ ] Uma tarefa pode ser marcada como concluída.
- [ ] A conclusão gera automaticamente um registro de data e hora.
- [ ] O registro de conclusão permanece associado à tarefa correspondente.
- [ ] O filtro "Atrasadas" identifica tarefas com prazo vencido e sem conclusão registrada.
- [ ] As funcionalidades atendem aos requisitos e às regras de negócio definidos.

## 6. Tecnologias e Arquitetura

As tecnologias, os serviços de infraestrutura e os componentes utilizados serão documentados de acordo com a implementação efetivamente adotada pelo grupo.

## 7. Contexto do Projeto

Projeto acadêmico desenvolvido em equipe, com divisão de responsabilidades entre desenvolvimento de software, dados, infraestrutura em nuvem e garantia da qualidade.

---
**Mural da Coordenação** | Projeto acadêmico

---

## 8. Documentação Técnica da Parte DEV

**Stack:** Node.js 20+, Express 4, `pg` (PostgreSQL), HTML/JS sem framework em `public/`.

**Endpoints** (alias `/api/tarefas` usado pela interface):

| Método | Rota | Resposta |
|---|---|---|
| POST | `/tarefas` | 201, ou 400 se inválido |
| GET | `/tarefas?situacao=pendentes\|concluidas\|atrasadas` | 200, ou 400 se filtro inválido |
| PATCH | `/tarefas/:id/concluir` | 200, 404 ou 409 (já concluída) |
| DELETE | `/tarefas/:id` | 200 ou 404 |
| GET | `/health` | 200 ou 503 (banco indisponível), com `iniciado_em` |

**Fuso e "hoje":** o "hoje" é calculado no PostgreSQL com `(now() AT TIME ZONE 'America/Recife')::date`, tanto na validação do prazo quanto no filtro de atrasadas, pois o App Service roda em UTC. Datas de conclusão e criação são `timestamptz`.

**Exclusão:** física (`DELETE`), pela simplicidade e pelo escopo da atividade.

**Conclusão atômica:** `UPDATE ... WHERE id = $1 AND concluida_em IS NULL`; só uma conclusão simultânea tem sucesso, as demais recebem 409.

**Como executar:**
```bash
npm install
cp .env.example .env   # preencha DATABASE_URL (e DB_SSL)
npm run db:schema
npm start
```
**Testes:** `npm test` (exige `DATABASE_URL` com o schema aplicado). Resultado registrado em `evidencias/resultados-testes.md`.

**Preparação do CA4:** `banco/preparar-teste-ca4.sql` (feita direto no banco, pois a API recusa prazo passado).

**Limitações conhecidas:** sem autenticação; não validado no Azure; `/reabrir`, `/contadores` e filtro por responsável são extras além do escopo.

**Dependências de outras frentes:** DADOS (schema, usuário `app_mural`, banco gerenciado) e NUVEM (App Service, `DATABASE_URL`, `DB_SSL`).
