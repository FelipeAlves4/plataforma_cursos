# syntax=docker/dockerfile:1.7

ARG FRANKENPHP_IMAGE=dunglas/frankenphp:1-php8.4-bookworm

FROM node:22-bookworm-slim AS frontend

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
    && corepack prepare pnpm@10.33.4 --activate \
    && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM ${FRANKENPHP_IMAGE} AS php-base

RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && apt-get update \
    && apt-get install -y --no-install-recommends --reinstall \
        autoconf \
        dpkg-dev \
        file \
        g++ \
        gcc \
        libc6-dev \
        libdpkg-perl \
        make \
        perl \
        perl-base \
        perl-modules-5.36 \
        pkg-config \
        re2c \
    && curl -fsSL "$PHP_URL" -o /usr/src/php.tar.xz \
    && echo "$PHP_SHA256 */usr/src/php.tar.xz" | sha256sum -c - \
    && mkdir -p /usr/src/php \
    && tar -xJf /usr/src/php.tar.xz -C /usr/src/php --strip-components=1 \
    && install-php-extensions \
        bcmath \
        exif \
        gd \
        intl \
        pcntl \
        pdo_pgsql \
        zip \
    && apt-get update \
    && apt-get install -y --no-install-recommends gosu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM php-base AS php-dependencies

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --no-autoloader

COPY . .

RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction \
    --no-progress

FROM php-base AS runtime

ENV APP_ENV=production \
    APP_DEBUG=false \
    PORT=8080

COPY --from=php-dependencies --chown=www-data:www-data /app /app
COPY --from=frontend --chown=www-data:www-data /app/public/build /app/public/build
COPY docker/Caddyfile /etc/frankenphp/Caddyfile
COPY docker/entrypoint.sh /usr/local/bin/asex-entrypoint

RUN chmod +x /usr/local/bin/asex-entrypoint \
    && mkdir -p \
        /config/caddy \
        /data/caddy \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data /config/caddy /data/caddy storage bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/asex-entrypoint"]
CMD ["serve"]
