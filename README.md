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

```mermaid
flowchart TD
    N["Navegador<br/>frontend/index.html"]
    A["Azure App Service<br/>Node.js + Express (backend/)"]
    B[("PostgreSQL gerenciado<br/>tabela tarefas")]

    N -- "HTTP/JSON<br/>/tarefas, /health" --> A
    A -- "SQL parametrizado<br/>DATABASE_URL (SSL)" --> B
```

| Camada | Tecnologia | Observação |
|---|---|---|
| Interface | HTML, CSS e JavaScript puros | Servida pelo próprio backend (pasta `frontend/`), tema claro/escuro, responsiva |
| API | Node.js 20+ e Express 4 | Validação no servidor e tratamento de erros sem detalhes internos |
| Banco | PostgreSQL (`pg`) | Conexão somente por `DATABASE_URL`; restrições `CHECK` no schema |
| Hospedagem | Azure App Service | Configuração feita pela frente de Nuvem 

## 7. Contexto do Projeto

Projeto acadêmico desenvolvido em equipe, com divisão de responsabilidades entre desenvolvimento de software, dados, infraestrutura em nuvem e garantia da qualidade.

---
**Mural da Coordenação** | Projeto acadêmico

---

## 8. Documentação Técnica da Parte DEV

**Problema resolvido:** as tarefas da coordenação ficavam em post-its e grupos de mensagem, sem responsável claro nem controle de prazo. O Mural centraliza tudo e mostra de imediato o que está atrasado.

**Estrutura do repositório:** `backend/` (API Express, SQL do banco, scripts, testes e `requests.http`), `frontend/` (interface web, servida pelo backend), `docs/` e `evidencias/`.

### Modelo de dados (tabela `tarefas`)

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | SERIAL, chave primária | identificador único |
| `titulo` | VARCHAR(120), obrigatório | de 3 a 120 caracteres (após `trim`) |
| `responsavel` | VARCHAR(100), obrigatório | não pode ser vazio |
| `prioridade` | VARCHAR(5), padrão `média` | `baixa`, `média` ou `alta` |
| `prazo` | DATE, opcional | não pode ser anterior a hoje no cadastro |
| `concluida_em` | TIMESTAMPTZ, opcional | preenchida ao concluir |
| `criada_em` | TIMESTAMPTZ, padrão `now()` | data de criação |

A situação (pendente/concluída) e o atraso não são colunas: derivam de `concluida_em` e `prazo`.

### Regras de negócio
- **Cadastro:** título de 3 a 120 caracteres, responsável obrigatório, prioridade padrão média, prazo opcional e nunca anterior a hoje.
- **Conclusão:** `PATCH /tarefas/:id/concluir` grava `concluida_em` com a data e hora reais, de forma atômica (`UPDATE ... WHERE concluida_em IS NULL`). Concluir de novo retorna 409.
- **Atrasada:** prazo anterior a hoje e `concluida_em` vazio. Tarefa concluída nunca aparece em "atrasadas".
- **"Hoje":** calculado no PostgreSQL com `(now() AT TIME ZONE 'America/Recife')::date`, na validação do prazo e no filtro de atrasadas, pois o App Service roda em UTC.
- **Exclusão:** física (`DELETE`), pela simplicidade e pelo escopo da atividade. ID inexistente retorna 404.

### Endpoints
A interface usa o alias `/api/tarefas`; as rotas oficiais são as abaixo.

| Método | Rota | Respostas |
|---|---|---|
| POST | `/tarefas` | 201 criada; 400 dados inválidos |
| GET | `/tarefas?situacao=pendentes\|concluidas\|atrasadas` | 200; 400 filtro inválido |
| PATCH | `/tarefas/:id/concluir` | 200; 404 inexistente; 409 já concluída |
| DELETE | `/tarefas/:id` | 200; 404 inexistente |
| GET | `/health` | 200 com `iniciado_em`; 503 se o banco estiver indisponível |

Erros em JSON (`{"erro": "..."}`), sem SQL, credenciais ou stack trace. Requisições prontas em `backend/requests.http`.

### Como executar localmente
```bash
cd backend
npm install
cp .env.example .env   # edite e preencha DATABASE_URL (e DB_SSL)
npm run db:schema
npm start              # abra http://localhost:3000
```

### Como configurar a DATABASE_URL
Formato: `postgres://USUARIO:SENHA@SERVIDOR:5432/BANCO`. Caracteres especiais na senha precisam ser codificados (`@` vira `%40`). Use `DB_SSL=true` no Azure e deixe vazio em banco local. O arquivo `.env` está no `.gitignore`; só o `.env.example` (sem credenciais reais) é versionado. Na nuvem, as variáveis ficam nas configurações do App Service.

### Testes executados
`npm test` (dentro de `backend/`): 36 testes aprovados em PostgreSQL real, cobrindo cadastro válido e inválido, limites do título, prioridade inválida, prazo anterior a hoje, filtros, conclusão (inclusive duplicada e simultânea), exclusão, `/health` e falha de conexão (503). Detalhes em `evidencias/resultados-testes.md`. A preparação do CA4 está em `backend/banco/preparar-teste-ca4.sql`.

### Limitações conhecidas
- Testes automatizados exigem um PostgreSQL acessível via `DATABASE_URL`.
- Extras além do enunciado: reabrir tarefa, contadores do painel e busca por responsável.

### Próximos passos
Publicar no App Service, rodar os critérios CA1 a CA5 no ambiente real, registrar as evidências (prova de persistência após reinício e prints) e gravar o pitch.
#Link Azure :
mural-da-coordenacao-eac6dmdqaegzasa3.mexicocentral-01.azurewebsites.net


### Dependências de outras frentes
- **Dados:** criar o banco `mural`, rodar `schema.sql` e criar o usuário `app_mural`.
- **Nuvem:** App Service, variáveis `DATABASE_URL` e `DB_SSL`, comando de inicialização `cd backend && npm start` e acesso do app ao banco.
- **QA:** execução dos critérios de aceitação no ambiente real.
