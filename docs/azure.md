# Passo a passo na Azure (Nível A)

Use somente a assinatura indicada pelo professor. Todo recurso criado gera responsabilidade de custo e de exclusão. Não crie máquina virtual nem plano pago sem autorização. Grupo: `g01` | Responsável: `AFFelipe` (`ff`).

## 1. Grupo de recursos

Portal, Grupos de recursos, Criar. Nome `rg-cloud-g01`, região permitida pela assinatura (`Canada Central`), marcas `aula = cloud-challenge` e `grupo = g01`.

```bash
az group create --name rg-cloud-g01 --location canadacentral --tags aula=cloud-challenge grupo=g01
```

Erro de política ao criar recurso: a região não é permitida; recrie numa região listada na mensagem.

## 2. Banco: Azure Database for PostgreSQL, Servidor Flexível

Comece por aqui: o banco leva de 5 a 15 minutos. Versão 18.6, camada Burstable B1ms, 32 GiB, acesso público, **permitir serviços do Azure** e **adicionar o IP atual**. Anote servidor (`db-cloud-g01`), usuário (`AFFelipe`), senha e banco (`mural`).

Depois que o servidor estiver pronto, crie o banco `mural` e aplique os scripts (Cloud Shell com `psql`, ou da sua máquina com o IP liberado):

```bash
psql "host=db-cloud-g01.postgres.database.azure.com port=5432 dbname=mural user=AFFelipe sslmode=require" -f backend/banco/schema.sql
psql "host=db-cloud-g01.postgres.database.azure.com port=5432 dbname=mural user=AFFelipe sslmode=require" -f backend/banco/dados-iniciais.sql
```

Opcional (segurança): rode `backend/banco/usuario-app.sql` e use o usuário `app_mural` na aplicação.

String de conexão:

```
postgres://app_mural:SUA_SENHA@db-cloud-g01.postgres.database.azure.com:5432/mural?sslmode=require
```

Senha com caractere especial deve ser codificada na URL (`@` vira `%40`).

## 3. App Service

Portal, Criar um recurso, Aplicativo Web. Publicar: **Código**. Pilha: **Node 20 LTS**. SO: **Linux**. Plano: **Gratuito F1**. Nome: `Mural-da-coordenacao` (global e único).

## 4. Ligar o App Service ao banco

Configurações, Variáveis de ambiente, Configurações de aplicativo. Adicione:

| Nome | Valor |
|---|---|
| `DATABASE_URL` | `postgres://app_mural:SUA_SENHA@db-cloud-g01.postgres.database.azure.com:5432/mural?sslmode=require` |
| `DB_SSL` | `true` |

Aplique e confirme (a aplicação reinicia). Pela CLI:

```bash
az webapp config appsettings set --name Mural-da-coordenacao --resource-group rg-cloud-g01 \
  --settings DATABASE_URL="postgres://app_mural:SUA_SENHA@db-cloud-g01.postgres.database.azure.com:5432/mural?sslmode=require" DB_SSL="true"
```

A Azure injeta a variável `PORT`; a aplicação já lê `process.env.PORT`. O backend fica na pasta `backend/` e o `start` é `node src/server.js`; no App Service use o comando de inicialização `cd backend && npm start` (a aplicação também serve a pasta `frontend/`).

## 5. Publicar

Escolha uma opção: extensão Azure App Service do VS Code (Deploy to Web App), Centro de Implantação com GitHub, ou CLI:

```bash
az login
az webapp up --name Mural-da-coordenacao --resource-group rg-cloud-g01 \
  --plan plan-cloud-g01 --sku F1 --runtime "NODE:20-lts" --location canadacentral
az webapp restart --name Mural-da-coordenacao --resource-group rg-cloud-g01
az webapp log tail --name Mural-da-coordenacao --resource-group rg-cloud-g01
```

Confira o nome do runtime com `az webapp list-runtimes --os linux`. No Linux, maiúsculas e minúsculas nos nomes de arquivo importam.

## 6. Logs

Monitoramento, Logs do Serviço de Aplicativo, Log de aplicativo: **Sistema de arquivos**. Depois, Monitoramento, **Fluxo de log**.

## 7. Verificar

1. Abra `https://mural-da-coordenacao.azurewebsites.net/health`. Esperado: `status: ok`, `banco: conectado`. Esse é o **E1** (registre a URL pública).
2. Abra a raiz da URL e cadastre `G01-PALAVRA` (palavra do dia do professor).
3. Reinicie (Portal, botão **Reiniciar**, ou `az webapp restart`). Confira que `iniciado_em` mudou e o registro continua.

## 8. Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Application Error depois do deploy | Não ouve `PORT` ou dependências não instaladas | Fluxo de log; conferir `package.json` (`start`, `dependencies`) |
| `/health` 503 (timeout no banco) | Firewall do banco | Permitir serviços do Azure e adicionar o IP |
| `ECONNREFUSED` com localhost no log | `DATABASE_URL` não carregada | Configurar a variável no App Service ou `.env` local |
| `password authentication failed` | Usuário ou senha errados, ou caractere especial sem codificar | Testar o mesmo login no Cloud Shell |
| `no pg_hba.conf entry ... no encryption` | Conexão sem TLS | `DB_SSL=true` |
| Erro de certificado com `DB_SSL=true` | Cadeia de certificado não reconhecida | Usar `DB_SSL=no-verify` e registrar no README como limitação |
| Datas com 3 horas de diferença | App Service usa UTC | Já tratado: `timestamptz` e "hoje" calculado em `America/Recife` |

Regra dos 15 minutos: bloqueado por infraestrutura há 15 minutos, desça de nível (A para B, B para C), registre o motivo no painel e siga construindo.

## 9. Custos e limpeza (obrigatório)

Antes de sair, **pare o servidor PostgreSQL** (Parar). Na data informada pelo professor, **exclua o grupo de recursos inteiro**:

```bash
az postgres flexible-server stop --name db-cloud-g01 --resource-group rg-cloud-g01
az group delete --name rg-cloud-g01 --yes --no-wait   # só na data do professor
```