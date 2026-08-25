# Asex Educação — Plataforma de Cursos

Plataforma de aprendizagem para profissionais e negócios do setor de alimentação. O fluxo atual é login, liberação por matrícula, cursos, aulas em vídeo e progresso — sem pagamentos, assinaturas ou checkout.

## Stack

- Laravel 13 / PHP 8.3+
- React, TypeScript, Inertia.js, Tailwind CSS e Vite
- Laravel Breeze para autenticação
- Eloquent para cursos, módulos, aulas, matrículas e progresso

## Arquitetura

`Course → CourseModule → Lesson` é a estrutura de conteúdo. `Enrollment` determina o acesso de estudantes e `LessonProgress` mantém conclusão e última aula acessada. A autorização acontece no backend através de policies; o front-end não libera conteúdo por conta própria.

## Instalação

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
pnpm install
pnpm run build
```

Para desenvolvimento, execute `php artisan serve` e `pnpm dev`. Configure banco, mail e demais variáveis padrão do Laravel no `.env`; não há variáveis de pagamento nesta versão.

## Dados de demonstração

Após `php artisan migrate --seed`:

- Admin: `admin@example.test` / `password`
- Instrutor: `instrutor@example.test` / `password`
- Aluno: `aluno@example.test` / `password`

Troque essas senhas fora de ambientes locais.

## Vídeo

O administrador cola a URL normal do YouTube (`watch`, `youtu.be` ou `embed`). O backend valida e armazena o ID e uma URL normalizada; o player usa `youtube-nocookie.com` e o parâmetro oficial `rel=0` (vídeos relacionados do mesmo canal). Panda permanece como provider separado para evolução futura.

## Verificação

```bash
./vendor/bin/pint
composer test
pnpm run build
```

Os testes cobrem autenticação, roles, acesso a cursos/aulas, progresso e parser de URLs do YouTube. Para deploy, configure `APP_ENV`, `APP_KEY`, banco, armazenamento público e o processo de build dos assets no provedor escolhido.
