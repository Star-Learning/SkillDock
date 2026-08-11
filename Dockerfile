FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN pnpm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    SITE_HOST=0.0.0.0 \
    SITE_PORT=3000 \
    SKILLDOCK_STATS_PATH=/data/skill-stats.json \
    SKILLDOCK_STATS_TIMEZONE=Asia/Shanghai

WORKDIR /app
RUN mkdir -p /data && chown node:node /data

COPY --from=builder --chown=node:node /app/out ./out
COPY --from=builder --chown=node:node /app/data/generated ./data/generated
COPY --from=builder --chown=node:node /app/scripts ./scripts

USER node
VOLUME ["/data"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/v1/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));"]

CMD ["node", "scripts/serve-static.mjs"]
