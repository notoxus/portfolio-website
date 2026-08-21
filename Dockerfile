# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.19.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM dependencies AS development
RUN mkdir .next && chown -R node:node /app
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]

FROM dependencies AS builder
COPY . .
RUN pnpm build

FROM node:${NODE_VERSION}-bookworm-slim AS production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
