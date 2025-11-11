FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone output and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Debug: Show directory structure
RUN echo "=== Root directory ===" && ls -la /app/ && \
    echo "=== Looking for server.js ===" && \
    find /app -name "server.js" -type f 2>/dev/null || echo "No server.js found" && \
    echo "=== Checking subdirectories ===" && \
    ls -la /app/*/ 2>/dev/null || echo "No subdirectories"

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Try to find and run server.js
CMD ["sh", "-c", "find /app -name 'server.js' -type f | head -1 | xargs node"]
