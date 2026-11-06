# Evidências

Todos os prints precisam mostrar **data e hora visíveis**. Salve nesta pasta com estes nomes.

| Código | Evidência | Arquivo sugerido |
|---|---|---|
| E1 | URL pública (Nível A) ou descrição do ambiente (B e C) | `E1-ambiente.png` e a URL no README |
| E2 | Prova de persistência, 4 prints do registro `GXX-PALAVRA` | `E2-print1-lista.png`, `E2-print2-iniciado-em-antes.png`, `E2-print3-apos-reinicio.png`, `E2-print4-consulta-banco.png` |
| E3 | Casos de teste (mínimo 5, 2 negativos, esperado e obtido) | tabela no README + `E3-npm-test.png` |
| E4 | Diagrama de arquitetura | seção 3 do README |
| E5 | Variáveis de ambiente com valor oculto e `.gitignore` com `.env` | `E5-variaveis-ocultas.png`, `E5-gitignore.png` |
| E6 | README completo e link do vídeo do pitch | README + link |

## Evidências específicas do Desafio 01

- Print do filtro **"atrasadas"** demonstrando o CA4 (uma pendente e uma concluída com prazo de ontem; só a pendente aparece). Arquivo: `CA4-atrasadas.png`. Preparação documentada em `backend/banco/preparar-teste-ca4.sql`.
- Registro do teste do CA3 (**409** ao concluir de novo). Arquivo: `CA3-409.png`.

## Roteiro da prova de persistência

1. Cadastrar `GXX-PALAVRA` pela aplicação (título começando com o código, ex.: `G02-NIMBUS prova`).
2. Listar pela aplicação: **Print 1**.
3. Anotar `iniciado_em` de `/health`: **Print 2**.
4. Reiniciar a aplicação (botão **Reiniciar** no portal ou `az webapp restart`; nos níveis B e C, parar e iniciar o processo).
5. Conferir que `iniciado_em` mudou e o registro continua listado: **Print 3**.
6. Mostrar a mesma linha numa consulta direta ao banco (`backend/banco/prova-persistencia.sql`): **Print 4**.
7. Nível A: o professor cadastra `PROF-HHMM`; mostrar na apresentação.
