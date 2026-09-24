#!/usr/bin/env bash
# Compila el build estático web y lo sube al VPS (ver padelontour-api/deploy/README.md,
# paso 6). Se ejecuta en tu máquina, no en el servidor -- solo necesita el
# host SSH configurado (usuario 'deploy', ver deploy/setup.sh del backend).
#
# Uso: ./deploy/deploy-web.sh TU_IP_O_HOST
set -euo pipefail

HOST="${1:?Uso: deploy-web.sh <ip-o-host-del-vps>}"

echo "==> Exportando build web (usa .env.production automáticamente)"
npx expo export --platform web

echo "==> Subiendo dist/ a deploy@${HOST}:/var/www/web"
rsync -avz --delete dist/ "deploy@${HOST}:/var/www/web/"

echo "==> hecho"
