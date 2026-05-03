# =============================================================================
# Dockerfile multi-stage pour Ferme Mbiedou
# Build : pnpm install + pnpm build
# Runtime : Node 20 alpine + dist + node_modules production
# =============================================================================

# --- Stage 1 : builder -------------------------------------------------------
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copier les manifests pour profiter du cache Docker
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY tsconfig.base.json tsconfig.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/ferme-familiale/package.json ./artifacts/ferme-familiale/
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY lib/integrations-gemini-ai/package.json ./lib/integrations-gemini-ai/
COPY scripts/package.json ./scripts/

# Installer toutes les dépendances (dev incluses pour le build)
RUN pnpm install --frozen-lockfile

# Copier le code source et builder
COPY . .
RUN pnpm run build

# --- Stage 2 : runtime ------------------------------------------------------
FROM node:20-alpine AS runtime

RUN apk add --no-cache libc6-compat postgresql-client
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copier uniquement ce qui est nécessaire au runtime
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/artifacts/api-server/package.json ./artifacts/api-server/
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/ferme-familiale/package.json ./artifacts/ferme-familiale/
COPY --from=builder /app/artifacts/ferme-familiale/dist ./artifacts/ferme-familiale/dist
COPY --from=builder /app/lib ./lib

# Installer uniquement les dépendances de production
RUN pnpm install --prod --frozen-lockfile --ignore-scripts \
  && pnpm store prune

EXPOSE 3000

# Healthcheck via /api/healthz
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/healthz || exit 1

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
