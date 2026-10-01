# syntax=docker/dockerfile:1
# Build from the repo root: docker build -f apps/api/Dockerfile .

FROM node:24-slim AS base
SHELL ["/bin/bash", "-c"]
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts --filter "@shoppy/api..."
COPY packages packages
COPY apps/api apps/api
RUN pnpm --filter "@shoppy/api..." run build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm deploy --filter @shoppy/api --prod --ignore-scripts /out
# pnpm links the Prisma CLI in as a peer of @prisma/client even in --prod; it (and its tooling)
# is only needed to generate the client at build time. Dropping it saves ~250 MB, which matters
# for the 0.5 GB Artifact Registry free tier.
RUN cd /out/node_modules/.pnpm && rm -rf prisma@* @prisma+studio-core@* @prisma+dev@* \
    effect@* @electric-sql+pglite* typescript@* react@* react-dom@* @types+react@* elkjs@* \
    && rm -f @prisma+client@*/node_modules/@prisma/client/runtime/query_compiler_*.{cockroachdb,mysql,sqlite,sqlserver}.*

FROM node:24-slim AS runtime
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
COPY --from=build --chown=node:node /out/package.json ./
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/apps/api/dist ./dist
USER node
EXPOSE 8080
CMD ["node", "--import", "./dist/instrument.js", "dist/main.js"]
