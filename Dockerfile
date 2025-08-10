# ============ deps ============
FROM node:20-alpine AS deps
WORKDIR /app
# Installe les dépendances
COPY package.json package-lock.json ./
RUN npm ci

# ============ builder ============
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables nécessaires AU BUILD
ARG NEXT_PUBLIC_API_ROUTE
ARG NEXT_PUBLIC_TOKEN_NAME
ARG APP_VERSION=1.0.0

ENV NEXT_PUBLIC_API_ROUTE=${NEXT_PUBLIC_API_ROUTE}
ENV NEXT_PUBLIC_TOKEN_NAME=${NEXT_PUBLIC_TOKEN_NAME}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ============ runner ============
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
