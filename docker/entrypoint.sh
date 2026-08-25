#!/bin/sh

set -eu

if [ "${1:-}" != "serve" ]; then
    exec "$@"
fi

if [ -z "${APP_KEY:-}" ]; then
    echo "APP_KEY must be configured before the application can start." >&2
    exit 1
fi

debug_value=$(printf '%s' "${APP_DEBUG:-false}" | tr '[:upper:]' '[:lower:]')

if [ "${APP_ENV:-production}" = "production" ]; then
    case "$debug_value" in
        false|0|off|no|'') ;;
        *)
            echo "APP_DEBUG must be false in production." >&2
            exit 1
            ;;
    esac
fi

export PORT="${PORT:-8080}"

mkdir -p \
    /app/storage/app/public \
    /app/storage/framework/cache/data \
    /app/storage/framework/sessions \
    /app/storage/framework/views \
    /app/storage/logs \
    /app/bootstrap/cache

chown www-data:www-data /app/storage/app/public
chown -R www-data:www-data /app/storage/framework /app/storage/logs /app/bootstrap/cache

if [ ! -e /app/public/storage ] && [ ! -L /app/public/storage ]; then
    php artisan storage:link
fi

gosu www-data php artisan optimize

exec gosu www-data frankenphp run --config /etc/frankenphp/Caddyfile --adapter caddyfile
