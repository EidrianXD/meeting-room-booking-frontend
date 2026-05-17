# syntax=docker/dockerfile:1.7
#
# Dockerfile multi-stage do frontend (Quasar / Vue 3 / Vite).
#
# Stages:
#   1) build   -> instala deps e roda `quasar build` produzindo `dist/spa`.
#   2) runtime -> nginx:alpine servindo a SPA + reverse proxy /api -> backend.
#
# A URL da API entra no bundle em build-time (limitação inerente de SPA
# Vite). Para evitar uma imagem por ambiente, escolhemos `/api` como
# base relativa: o próprio Nginx do container faz o proxy reverso para
# o backend pelo nome do serviço no Docker Compose. Resultado: a mesma
# imagem roda em qualquer ambiente sem rebuild.

ARG NODE_VERSION=22
ARG NGINX_VERSION=1.27

# ============================================================================
# Stage 1: build
# ============================================================================
FROM node:${NODE_VERSION}-slim AS build

WORKDIR /app

# URL base da API durante o build do bundle. O default `/api` casa com a
# regra de proxy no nginx.conf. Para builds com URL absoluta (ex.: deploy
# em domínio separado), passe --build-arg VITE_API_BASE_URL=https://api...
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Build da SPA: gera /app/dist/spa com index.html + assets versionados.
RUN npx quasar build

# ============================================================================
# Stage 2: runtime
# ============================================================================
FROM nginx:${NGINX_VERSION}-alpine AS runtime

# wget já vem na imagem base do nginx:alpine — usado pelo HEALTHCHECK.

# Aplica os patches de segurança disponíveis na base Alpine (necessário
# para passar no quality gate do Trivy: as imagens nginx:alpine costumam
# ficar atrás dos repositórios em libs como openssl, libpng, libxml2).
RUN apk upgrade --no-cache

# Substitui a config padrão pelo nosso server block (SPA + proxy /api).
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copia o bundle estático gerado pelo stage de build.
COPY --from=build /app/dist/spa /usr/share/nginx/html

EXPOSE 80

# Usa 127.0.0.1 explicitamente em vez de localhost. O `wget` do BusyBox
# (base do nginx:alpine) prefere IPv6 quando há entrada para `localhost`
# em /etc/hosts, mas o nginx escuta apenas em 0.0.0.0:80 (IPv4). Com
# `localhost`, o healthcheck recebe "Connection refused".
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/healthz || exit 1

# nginx:alpine já tem o CMD padrão (`nginx -g 'daemon off;'`); nada a sobrescrever.
