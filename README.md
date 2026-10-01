# Shoppy

A mobile-first PWA for creating and managing shopping lists, personal or shared across a household.

> Status: **Phase 1 (authentication)**. Live at https://shoppy.korec.dev. Email and Google sign-in need the one-time setup in [docs/06-infrastructure.md §10](docs/06-infrastructure.md).

## Stack

| Part              | Tech                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`        | React 19 + Vite 8 PWA, TanStack Router & Query, Tailwind CSS 4, Lucide icons, served by a Cloudflare Worker that also proxies `/api/*` |
| `apps/api`        | NestJS 12 (ESM, Fastify), Prisma 7 + PostgreSQL, Zod, pino logging, Sentry; runs on Google Cloud Run                                   |
| `packages/shared` | Zod schemas and types shared by web and API                                                                                            |
| `packages/config` | Shared TypeScript configs                                                                                                              |

## Getting started

Requirements: Node ≥ 24, pnpm 9 (`corepack enable`), Docker.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:up          # Postgres 18 on localhost:5442
pnpm dev            # shared (watch) + API on :3000 + web on :5180
```

Open http://localhost:5180 and create an account. Without a Resend key, emails (with their confirmation link) are printed in the API log.

### Useful commands

| Command                                 | What it does                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`                              | Run everything in watch mode (Turborepo)                                                                     |
| `pnpm build`                            | Build all packages                                                                                           |
| `pnpm test`                             | Run all tests (Vitest). API tests need the local Postgres (`pnpm db:up`) and use their own `shoppy_test` DB  |
| `pnpm --filter @shoppy/web test:e2e`    | Playwright E2E (starts its own API and web server on ports 3100/5190 with a `shoppy_e2e` DB)                 |
| `pnpm typecheck`                        | Type-check all packages                                                                                      |
| `pnpm lint` / `pnpm format`             | oxlint / Prettier                                                                                            |
| `pnpm db:up` / `pnpm db:down`           | Start or stop local Postgres                                                                                 |
| `pnpm --filter @shoppy/api db:migrate`  | Create and apply a Prisma migration (dev)                                                                    |
| `pnpm --filter @shoppy/web cf:dev`      | Run the built PWA behind the Cloudflare Worker locally (needs `apps/web/.dev.vars`, see `.dev.vars.example`) |
| `docker build -f apps/api/Dockerfile .` | Build the production API image                                                                               |

### Conventions

- Code conventions and AI-assistant setup live in [CLAUDE.md](CLAUDE.md) and [.claude/rules/](.claude/rules/): one unit per file, one API endpoint per file, self-explanatory code.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:` …).
- Pre-commit runs oxlint and Prettier on staged files.
- API routes live under `/api`. The web app always calls the API on its own origin (Vite proxy in dev, Worker in production).

## Documentation

| Doc                                                | Contents                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| [Project overview](docs/01-project-overview.md)    | What the app is, goals, non-goals, glossary                         |
| [Requirements](docs/02-requirements.md)            | Functional and non-functional requirements, RBAC matrix             |
| [Architecture](docs/03-architecture.md)            | Tech stack, hosting, auth design, data model, API outline           |
| [Roadmap](docs/04-roadmap.md)                      | Phases, tasks and acceptance criteria (Phase 0 status included)     |
| [Decisions & open questions](docs/05-decisions.md) | Decision log and open items                                         |
| [Infrastructure setup](docs/06-infrastructure.md)  | One-time setup of Neon, Google Cloud, Cloudflare, GitHub and Sentry |
