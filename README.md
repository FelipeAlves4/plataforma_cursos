# Asex Educação — Plataforma de Cursos

Plataforma de aprendizagem para profissionais e negócios do setor de alimentação. O fluxo atual inclui login, matrícula, catálogo, aulas em vídeo e progresso, sem pagamentos ou checkout.

## Stack e arquitetura

- Laravel 13 e PHP 8.3+
- React, TypeScript, Inertia.js, Tailwind CSS e Vite
- PostgreSQL; sessões, cache e filas usam tabelas do banco
- `Course → CourseModule → Lesson`, com acesso controlado por `Enrollment` e `LessonProgress`
- YouTube via `youtube-nocookie.com`; Panda é opcional

Laravel e React/Inertia são compilados e publicados como um único serviço. Em produção, o container usa FrankenPHP em modo clássico; não há Octane, worker permanente ou serviço frontend separado.

## Desenvolvimento local

```bash
composer install
pnpm install --frozen-lockfile
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
pnpm dev
php artisan serve
```

O seeder é apenas para desenvolvimento e cria credenciais demonstrativas. Nunca execute `db:seed` ou `migrate:fresh` em produção.

## Verificações

```bash
./vendor/bin/pint
php artisan test
pnpm run build
composer audit
```

## Deploy no Railway

### 1. Criar os serviços

1. Envie o repositório para o GitHub.
2. No Railway, crie um projeto e adicione um serviço a partir do repositório.
3. Adicione PostgreSQL ao mesmo projeto em **New → Database → PostgreSQL**.
4. O Railway detectará o `Dockerfile` na raiz e fará o build do Vite dentro da imagem.
5. Não configure um Start Command: o `ENTRYPOINT` e o `CMD` do Dockerfile já iniciam o FrankenPHP na variável `PORT` fornecida pelo Railway.

### 2. Configurar o deploy

Na aba **Settings → Deploy** do serviço da aplicação, configure:

- Pre-deploy command: `php artisan migrate --force`
- Healthcheck path: `/ready`
- Healthcheck timeout: `300`
- Restart policy: `On Failure`

O pre-deploy executa somente migrations. Ele nunca executa seeders e não escreve no Volume. `/health` verifica o processo; `/ready` também verifica a conexão com PostgreSQL e retorna `503` sem detalhes quando o banco está indisponível.

Não foi adicionado `railway.toml`: a configuração como código legada do Railway está em processo de descontinuação. As opções acima devem ser mantidas no painel do serviço.

### 3. Variáveis do serviço

Gere uma chave fora do repositório:

```bash
php artisan key:generate --show
```

Copie o resultado para `APP_KEY` no Railway e marque a variável como protegida/selada. Nunca coloque a chave em `.env.example`, GitHub ou Dockerfile.

Exemplo para o editor de variáveis do serviço, supondo que o banco se chame `Postgres`:

```env
APP_NAME="Asex Educação"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
APP_TIMEZONE=America/Sao_Paulo

APP_LOCALE=en
APP_FALLBACK_LOCALE=en

LOG_CHANNEL=stderr
LOG_LEVEL=info

DB_CONNECTION=pgsql
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SSLMODE=prefer

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
CACHE_STORE=database
QUEUE_CONNECTION=database

FILESYSTEM_DISK=public
TRUSTED_PROXIES=*

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_SCHEME=tls
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="Asex Educação"

PANDA_API_KEY=
PANDA_VIDEO_HOST=
```

`PORT` é injetada automaticamente pelo Railway. Não a fixe manualmente. Se o serviço PostgreSQL tiver outro nome, troque `Postgres` no namespace da variável de referência.

A aplicação aceita `DATABASE_URL` diretamente. Como alternativa, remova essa variável e mapeie individualmente:

```env
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_DATABASE=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
```

O locale do framework permanece `en` porque o repositório ainda não contém o catálogo completo de traduções `pt_BR`; mudar somente a variável faria mensagens de validação ficarem incompletas. A interface da plataforma já está em português e o timezone da aplicação é `America/Sao_Paulo`. Datas são persistidas pelo banco e apresentadas no timezone configurado pela aplicação.

### 4. Storage persistente

Thumbnails usam o disco Laravel `public`, em `/app/storage/app/public`. Sem Volume, uploads desaparecem em restart ou redeploy.

1. No serviço da aplicação, adicione um Railway Volume.
2. Configure exatamente o mount path `/app/storage/app/public`.
3. Faça um novo deploy.

O entrypoint cria `public/storage` de forma idempotente, ajusta somente as permissões necessárias e inicia o servidor como `www-data`. Teste criar, visualizar, substituir e excluir uma capa, depois reinicie o serviço e confirme que a imagem continua disponível.

Ative backups do Volume no Railway. Em uma evolução futura, o mesmo código pode usar S3, Cloudflare R2 ou outro storage compatível alterando o disco Laravel; não é necessário migrar agora.

### 5. Primeiro administrador

Depois do primeiro deploy, instale a Railway CLI, vincule o projeto/serviço e abra uma sessão no container:

```bash
railway login
railway link
railway service
railway ssh
php artisan asex:create-admin
```

O comando solicita nome, e-mail, senha e confirmação. Ele exige senha forte, converte o e-mail para minúsculas, usa o hashing do Laravel, marca o administrador como verificado e recusa sobrescrever um usuário existente. A senha nunca aparece no código ou no histórico do shell.

### 6. E-mail

`MAIL_MAILER=log` serve somente para desenvolvimento. Em produção, configure SMTP de Resend, Brevo ou do provedor corporativo. O reset de senha depende de e-mail real.

As rotas de verificação existem, mas o modelo `User` atualmente não implementa `MustVerifyEmail`; portanto, novos cadastros não ficam bloqueados aguardando verificação. Não altere esse comportamento sem uma decisão de produto e SMTP funcionando.

### 7. Domínio e HTTPS

Primeiro use **Settings → Networking → Generate Domain**. Depois ajuste `APP_URL` para a URL HTTPS gerada.

Para `cursos.asexeducacao.com.br`:

1. adicione o domínio em **Public Networking → Custom Domain**;
2. crie no provedor DNS os registros `CNAME` e `TXT` informados pelo Railway;
3. aguarde a validação e emissão automática do certificado;
4. altere `APP_URL=https://cursos.asexeducacao.com.br`;
5. faça redeploy.

Não há redirecionamento `www` porque o domínio definitivo ainda não foi escolhido. `TRUSTED_PROXIES=*` deve ser usado somente no serviço atrás do proxy do Railway; ele permite que Laravel reconheça HTTPS e gere URLs/cookies corretos.

### 8. Filas e logs

As migrations já criam `jobs`, `job_batches` e `failed_jobs`, mas não existem jobs próprios no código atual. Não crie um worker Railway agora. Quando surgirem jobs assíncronos, adicione um segundo serviço com a mesma imagem e comando `php artisan queue:work --sleep=3 --tries=3`.

Use `LOG_CHANNEL=stderr` para que os logs apareçam no Railway. Não registre senhas, tokens, `APP_KEY` ou credenciais de banco.

### 9. Backups

- Configure backup e retenção para o PostgreSQL no Railway.
- Configure backups do Volume que contém thumbnails.
- Teste periodicamente a restauração em um ambiente separado.

## Checklist de produção

- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY` definida e protegida
- [ ] PostgreSQL conectado por `DATABASE_URL`
- [ ] pre-deploy `php artisan migrate --force`
- [ ] domínio Railway ou customizado configurado
- [ ] `APP_URL` usa HTTPS
- [ ] Volume montado em `/app/storage/app/public`
- [ ] backup do PostgreSQL e do Volume configurado
- [ ] primeiro admin criado com `asex:create-admin`
- [ ] SMTP configurado e reset de senha testado
- [ ] login e cookies seguros funcionando
- [ ] upload, substituição e exclusão de thumbnail testados
- [ ] player YouTube funcionando
- [ ] `/health` e `/ready` retornando `200`
- [ ] testes, Pint, build e audit passando

## Referências operacionais

- [Dockerfiles no Railway](https://docs.railway.com/builds/dockerfiles)
- [Pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command)
- [Healthchecks](https://docs.railway.com/deployments/healthchecks)
- [PostgreSQL](https://docs.railway.com/databases/postgresql)
- [Volumes e backups](https://docs.railway.com/volumes)
- [Domínios](https://docs.railway.com/networking/domains/working-with-domains)
- [FrankenPHP com Laravel](https://frankenphp.dev/docs/laravel/)
