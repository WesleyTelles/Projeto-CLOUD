# Identificação da equipe

Copie a primeira página do PDF da atividade e preencha com estes dados (ou cole esta tabela).

| Grupo nº | Desafio |
|---|---|
| XX | 01: Mural da Coordenação |

| Integrante | Papel |
|---|---|
| _Nome 1_ | DEV |
| _Nome 2_ | DADOS |
| _Nome 3_ | NUVEM |
| _Nome 4_ | QA |
| _Nome 5 (opcional)_ | acumula papel com ___ |

Formato: grupos de 3 a 6 integrantes. Em grupo menor, acumulem papéis (ex.: DEV + QA).

| Papel | Responde por |
|---|---|
| DEV | Rotas, regras de negócio e interface |
| DADOS | Modelo de dados, tabelas, restrições, consultas e prova de persistência |
| NUVEM | Recursos na Azure, variáveis de ambiente, firewall, deploy e logs |
| QA | Casos de teste, evidências, README e pitch |

**Todos precisam saber explicar o fluxo completo e as decisões técnicas**: a pergunta pode ir para qualquer integrante. Perguntas prováveis:

1. Por que "atrasada" é calculada no SQL e não na aplicação?
2. Qual é o "hoje" do sistema e por que não é o do servidor (UTC)?
3. Por que a situação é derivada de `concluida_em` e não uma coluna?
4. Por que `DELETE` físico e não lógico?
5. Como o `UPDATE ... WHERE concluida_em IS NULL` evita conclusão dupla?
6. Por que PostgreSQL gerenciado e não um banco numa VM?
7. Caminho de uma requisição, do navegador até o banco.
8. Onde está a string de conexão e por que não está no código?
