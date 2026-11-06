# Resultados dos testes automatizados (DEV)

Execução: `npm test` (node:test) contra PostgreSQL real, schema `backend/banco/schema.sql` aplicado, fuso de referência `America/Recife`, em 06/11/2026.

Resultado obtido: **36 testes, 36 aprovados, 0 falhas** (`backend/testes/api.test.js`, `backend/testes/validacao.test.js`, `backend/testes/indisponibilidade.test.js`).

| Caso | Esperado | Obtido |
|---|---|---|
| CA1 título com 2 caracteres | 400 com mensagem | 400 ✔ |
| Título com 121 / 120 caracteres | 400 / 201 | 400 / 201 ✔ |
| Prioridade inválida; sem prioridade | 400; assume média | 400; média ✔ |
| CA2 prazo de ontem; prazo de hoje | 400; 201 | 400; 201 ✔ |
| CA3 concluir; concluir de novo | 200 com `concluida_em`; 409 | 200; 409 ✔ |
| Conclusões simultâneas (5 PATCH) | 1×200 e 4×409 | 1×200 e 4×409 ✔ |
| CA4 pendente e concluída com prazo de ontem | só a pendente em atrasadas | só a pendente ✔ |
| CA5 excluir id inexistente | 404 | 404 ✔ |
| Excluir existente | 200, depois 404 | 200, 404 ✔ |
| `/health` com banco | 200 com `iniciado_em` | 200 ✔ |
| `/health` e `/tarefas` sem banco | 503 sem detalhes internos | 503 ✔ |
| Palavra do dia `G07-NIMBUS` e `PROF-2105` | 201 pelo fluxo normal | 201 ✔ |

Não verificado: execução no Azure App Service, reinício real do processo no Azure e prints de evidência (dependem de Nuvem e Dados).
