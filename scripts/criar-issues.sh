#!/usr/bin/env bash
# Cria labels, milestones e as issues da Sprint 1 (e do restante) com o GitHub CLI.
# Pré-requisito: gh instalado e autenticado (gh auth login), dentro da pasta do repositório.
# Edite os usuários abaixo (nome de usuário do GitHub de cada papel).
set -euo pipefail

DEV_USER="usuario-dev"
DADOS_USER="usuario-dados"
NUVEM_USER="usuario-nuvem"
QA_USER="usuario-qa"

repo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repositório: $repo"

for l in DEV DADOS NUVEM QA; do gh label create "$l" --force >/dev/null; done
gh label create "sprint-1" --color 0E8A16 --force >/dev/null
gh label create "sprint-2" --color 1D76DB --force >/dev/null
gh label create "finalizacao" --color 5319E7 --force >/dev/null
gh api "repos/$repo/milestones" -f title="Sprint 1 - Persistência" >/dev/null 2>&1 || true
gh api "repos/$repo/milestones" -f title="Sprint 2 - Regras, implantação e testes" >/dev/null 2>&1 || true
gh api "repos/$repo/milestones" -f title="Finalização" >/dev/null 2>&1 || true

criar() { # titulo papel usuario sprint-label milestone
  gh issue create --title "$1" --body "Papel: $2. Critério de pronto descrito em docs/planejamento-github-projects.md." \
    --label "$2" --label "$4" --assignee "$3" --milestone "$5"
}

S1="Sprint 1 - Persistência"
criar "Criar repositório, .gitignore e .env.example" NUVEM "$NUVEM_USER" sprint-1 "$S1"
criar "Modelar tabela tarefas (tipos e restrições)" DADOS "$DADOS_USER" sprint-1 "$S1"
criar "Escrever banco/schema.sql" DADOS "$DADOS_USER" sprint-1 "$S1"
criar "Escrever banco/dados-iniciais.sql (fictícios)" DADOS "$DADOS_USER" sprint-1 "$S1"
criar "Criar banco e liberar firewall" NUVEM "$NUVEM_USER" sprint-1 "$S1"
criar "Configurar DATABASE_URL (local e App Service)" NUVEM "$NUVEM_USER" sprint-1 "$S1"
criar "Conexão com o banco e GET /health" DEV "$DEV_USER" sprint-1 "$S1"
criar "Cadastro de tarefa (RF1) com validação" DEV "$DEV_USER" sprint-1 "$S1"
criar "Listagem de tarefas (RF2)" DEV "$DEV_USER" sprint-1 "$S1"
criar "Interface mínima (formulário e lista)" DEV "$DEV_USER" sprint-1 "$S1"
criar "Prova de persistência (4 prints)" DADOS "$DADOS_USER" sprint-1 "$S1"
criar "Casos de teste da Sprint 1" QA "$QA_USER" sprint-1 "$S1"
criar "Arquivo requests.http" QA "$QA_USER" sprint-1 "$S1"
criar "Esqueleto do README" QA "$QA_USER" sprint-1 "$S1"

S2="Sprint 2 - Regras, implantação e testes"
criar "Concluir tarefa com data/hora e 409 (RF3, CA3)" DEV "$DEV_USER" sprint-2 "$S2"
criar "Filtro atrasadas no SQL com fuso de Brasília (RF4, CA4)" DEV "$DEV_USER" sprint-2 "$S2"
criar "Excluir tarefa com 404 (RF5, CA5)" DEV "$DEV_USER" sprint-2 "$S2"
criar "Filtros pendentes/concluídas e contadores" DEV "$DEV_USER" sprint-2 "$S2"
criar "Criar App Service e publicar" NUVEM "$NUVEM_USER" sprint-2 "$S2"
criar "Ativar logs e testar /health na nuvem" NUVEM "$NUVEM_USER" sprint-2 "$S2"
criar "Usuário de banco sem privilégio de administrador" DADOS "$DADOS_USER" sprint-2 "$S2"
criar "Testes CA1 a CA5 e print das atrasadas" QA "$QA_USER" sprint-2 "$S2"
criar "Testar CA4 à noite (depois das 21h) e documentar fuso" QA "$QA_USER" sprint-2 "$S2"

F="Finalização"
criar "Organizar evidências E1 a E6" QA "$QA_USER" finalizacao "$F"
criar "README completo" QA "$QA_USER" finalizacao "$F"
criar "Vídeo do pitch de 90 segundos" QA "$QA_USER" finalizacao "$F"
criar "Parar servidor e excluir grupo de recursos" NUVEM "$NUVEM_USER" finalizacao "$F"

echo "Pronto. Adicione as issues ao GitHub Projects (Add item) e defina o Status."
