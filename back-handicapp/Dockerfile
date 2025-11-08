# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22.11.0

FROM node:${NODE_VERSION}-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable pnpm

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    libvips-dev \
  && rm -rf /var/lib/apt/lists/* \
  && pnpm install --frozen-lockfile

FROM deps AS build

COPY tsconfig.json .
COPY src ./src
COPY scripts ./scripts
COPY migrations ./migrations

RUN pnpm build

FROM deps AS production-deps

RUN pnpm prune --prod

FROM base AS runner

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends libvips \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd -r nodeapp \
  && useradd -r -g nodeapp nodeapp \
  && mkdir -p /app/uploads \
  && chown -R nodeapp:nodeapp /app

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
COPY --from=build /app/migrations ./migrations

USER nodeapp

EXPOSE 3000

CMD ["node", "-r", "tsconfig-paths/register", "dist/index.js"]

