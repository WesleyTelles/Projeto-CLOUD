# Auditoria da parte DEV e matriz de rastreabilidade

Base: código em `backend/` e `frontend/`, testes automatizados em PostgreSQL real local (06/11/2026) e conferência manual da tela no navegador. Nada foi executado no Azure.

Classificação: **APROVADO**, **APROVADO COM RESSALVAS**, **REPROVADO** ou **NÃO TESTADO**.

| Requisito | Arquivo responsável | Teste | Situação |
|---|---|---|---|
| RF1 Cadastro (título 3–120, responsável, prioridade padrão média, prazo opcional) | `backend/src/validacao.js`, `backend/src/rotas/tarefas.js`, `backend/banco/schema.sql` | `api.test.js` (cadastro válido, 120/121 caracteres, prioridade inválida, responsável ausente), `validacao.test.js` | APROVADO COM RESSALVAS (só em banco local) |
| CA1 Título com 2 caracteres → 400 | `backend/src/validacao.js` | `api.test.js` CA1 | APROVADO COM RESSALVAS |
| CA2 Prazo anterior a hoje → 400 | `backend/src/validacao.js` | `api.test.js` CA2 | APROVADO COM RESSALVAS |
| RF2 Listagem e filtros (pendentes, concluídas, atrasadas) | `backend/src/rotas/tarefas.js` | `api.test.js` (filtros, filtro inválido) | APROVADO COM RESSALVAS |
| RF3 / CA3 Conclusão com `concluida_em` e 409 na segunda tentativa | `backend/src/rotas/tarefas.js` | `api.test.js` CA3 e conclusões simultâneas (1×200, 4×409) | APROVADO COM RESSALVAS |
| RF4 / CA4 Atrasadas só com pendentes vencidas | `backend/src/rotas/tarefas.js`, `backend/banco/preparar-teste-ca4.sql` | `api.test.js` CA4 (cenário feito direto no banco) | APROVADO COM RESSALVAS |
| RF5 / CA5 Exclusão e 404 para ID inexistente | `backend/src/rotas/tarefas.js` | `api.test.js` CA5 e exclusão válida | APROVADO COM RESSALVAS |
| `/health` com conexão real, `iniciado_em` e 503 | `backend/src/app.js` | `api.test.js` T01, `indisponibilidade.test.js` | APROVADO COM RESSALVAS |
| Erros sem SQL, credenciais ou stack trace | `backend/src/app.js` | `indisponibilidade.test.js`, JSON malformado | APROVADO |
| Consultas parametrizadas, `.env` fora do Git, sem dados reais | `backend/src/rotas/tarefas.js`, `.gitignore`, `backend/.env.example` | Revisão de código e `git ls-files` | APROVADO |
| Persistência real em banco (sem memória/arquivo) | `backend/src/db.js` | Todos os testes de API em PostgreSQL | APROVADO COM RESSALVAS (banco gerenciado não testado) |
| Palavra do dia (`GXX-PALAVRA`, `PROF-HHMM`) pelo fluxo normal | `backend/src/rotas/tarefas.js` | `api.test.js` (cadastro de `G07-NIMBUS` e `PROF-2105`) | APROVADO COM RESSALVAS |
| Persistência após reinício do processo | `backend/src/server.js` (`iniciado_em`) | — | NÃO TESTADO |
| Interface: dashboard, listagem, cadastro, concluir, excluir com confirmação, filtros, estados de erro/vazio/carregamento | `frontend/index.html` | Conferência manual no navegador (desktop e celular, tema claro e escuro); sem teste automatizado | APROVADO COM RESSALVAS |
| Publicação no Azure App Service | — | — | NÃO TESTADO (frente de Nuvem) |
| Execução dos critérios no ambiente real e prints de evidência | — | — | NÃO TESTADO (QA e ambiente real) |

## Achados da auditoria
1. Nenhum requisito obrigatório foi reprovado nos testes locais.
2. Há dependências ainda sem prova: Azure, banco gerenciado, reinício real e prints. Por isso o projeto **não deve ser declarado concluído** ainda.
3. A interface não tem testes automatizados; a conferência foi manual.
4. Extras fora do enunciado: reabrir tarefa, contadores do painel e busca por responsável. Não afetam os requisitos obrigatórios.
5. Cabeçalhos de segurança adicionados: `X-Content-Type-Options`, `X-Frame-Options` e `Referrer-Policy`. CORS não é necessário, pois a interface e a API usam a mesma origem.
6. `npm audit` (dependências de produção) sem vulnerabilidades conhecidas na data da execução.
