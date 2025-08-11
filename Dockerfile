# Multi-stage build for ECHELONX application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application (client only for now, server will be copied directly)
RUN npm run build:client

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application and source files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

# Copy source files needed for runtime
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Copy environment template
COPY --from=builder /app/.env.example ./.env.example

USER nextjs

EXPOSE 5001

ENV PORT=5001
ENV API_PORT=5001

# Start the application using tsx to handle TypeScript
CMD ["npx", "tsx", "server/node-build.ts"]
