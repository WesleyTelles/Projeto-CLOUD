# Passo a passo na Azure (Nível A)

Use somente a assinatura indicada pelo professor. Todo recurso criado gera responsabilidade de custo e de exclusão. Não crie máquina virtual nem plano pago sem autorização. Substitua `gXX` pelo número do grupo (ex.: `g02`) e `ab` pelas suas iniciais.

## 1. Grupo de recursos

Portal, Grupos de recursos, Criar. Nome `rg-cloud-gXX`, região permitida pela assinatura, marcas `aula = cloud-challenge` e `grupo = gXX`.

```bash
az group create --name rg-cloud-gXX --location brazilsouth --tags aula=cloud-challenge grupo=gXX
```

Erro de política ao criar recurso: a região não é permitida; recrie numa região listada na mensagem.

## 2. Banco: Azure Database for PostgreSQL, Servidor Flexível

Comece por aqui: o banco leva de 5 a 15 minutos. Versão 16, camada Burstable B1ms, 32 GiB, acesso público, **permitir serviços do Azure** e **adicionar o IP atual**. Anote servidor, usuário, senha e banco.

Depois que o servidor estiver pronto, crie o banco `mural` e aplique os scripts (Cloud Shell com `psql`, ou da sua máquina com o IP liberado):

```bash
psql "host=SERVIDOR.postgres.database.azure.com port=5432 dbname=mural user=USUARIO sslmode=require" -f backend/banco/schema.sql
psql "host=SERVIDOR.postgres.database.azure.com port=5432 dbname=mural user=USUARIO sslmode=require" -f backend/banco/dados-iniciais.sql
```

Opcional (segurança): rode `backend/banco/usuario-app.sql` e use o usuário `app_mural` na aplicação.

String de conexão:

```
postgres://USUARIO:SENHA@SERVIDOR.postgres.database.azure.com:5432/mural
```

Senha com caractere especial deve ser codificada na URL (`@` vira `%40`).

## 3. App Service

Portal, Criar um recurso, Aplicativo Web. Publicar: **Código**. Pilha: **Node 20 LTS**. SO: **Linux**. Plano: **Gratuito F1**. Nome: `app-cloud-gXX-ab` (global e único).

## 4. Ligar o App Service ao banco

Configurações, Variáveis de ambiente, Configurações de aplicativo. Adicione:

| Nome | Valor |
|---|---|
| `DATABASE_URL` | a string de conexão |
| `DB_SSL` | `true` |

Aplique e confirme (a aplicação reinicia). Pela CLI:

```bash
az webapp config appsettings set --name app-cloud-gXX-ab --resource-group rg-cloud-gXX \
  --settings DATABASE_URL="postgres://..." DB_SSL="true"
```

A Azure injeta a variável `PORT`; a aplicação já lê `process.env.PORT`. O backend fica na pasta `backend/` e o `start` é `node src/server.js`; no App Service use o comando de inicialização `cd backend && npm start` (a aplicação também serve a pasta `frontend/`).

## 5. Publicar

Escolha uma opção: extensão Azure App Service do VS Code (Deploy to Web App), Centro de Implantação com GitHub, ou CLI:

```bash
az login
az webapp up --name app-cloud-gXX-ab --resource-group rg-cloud-gXX \
  --plan plan-cloud-gXX --sku F1 --runtime "NODE:20-lts" --location brazilsouth
az webapp restart --name app-cloud-gXX-ab --resource-group rg-cloud-gXX
az webapp log tail --name app-cloud-gXX-ab --resource-group rg-cloud-gXX
```

Confira o nome do runtime com `az webapp list-runtimes --os linux`. No Linux, maiúsculas e minúsculas nos nomes de arquivo importam.

## 6. Logs

Monitoramento, Logs do Serviço de Aplicativo, Log de aplicativo: **Sistema de arquivos**. Depois, Monitoramento, **Fluxo de log**.

## 7. Verificar

1. Abra `https://app-cloud-gXX-ab.azurewebsites.net/health`. Esperado: `status: ok`, `banco: conectado`. Esse é o **E1** (registre a URL pública).
2. Abra a raiz da URL e cadastre `GXX-PALAVRA` (palavra do dia do professor).
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
az postgres flexible-server stop --name SERVIDOR --resource-group rg-cloud-gXX
az group delete --name rg-cloud-gXX --yes --no-wait   # só na data do professor
```
