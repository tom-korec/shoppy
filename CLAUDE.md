# Shoppy

Mobile-first PWA for personal and household shopping lists. Personal project: **free tiers only** (the domain `korec.dev` is the only cost). Production: https://shoppy.korec.dev.

## Source of truth

- `docs/` holds the requirements and plan. Read the relevant doc before building a feature:
  - [requirements](docs/02-requirements.md): functional requirements (`FR-*`) and the RBAC matrix
  - [architecture](docs/03-architecture.md): data model, auth design, API outline
  - [roadmap](docs/04-roadmap.md): phase tasks (P#-##) with status
  - [decisions](docs/05-decisions.md): decision log (D-##)
  - [infrastructure](docs/06-infrastructure.md): one-time cloud setup
- Coding rules live in `.claude/rules/`. They load automatically; path-scoped rules apply to matching files.

## Working agreement

- **Ask, don't assume.** Product, UX or scope questions go to the user, batched as multiple-choice questions with a recommended option. Technical details the user delegated can be decided, then recorded in the decision log.
- When implementation deviates from the docs, update the docs in the same change (roadmap status, decision log entry).
- Verify before calling something done: tests, type check, lint, and for UI changes the running app (preview config `dev`, http://localhost:5180).
- Commit or push only when asked. Commits follow Conventional Commits.

## Repo map

| Path                | What                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `apps/api`          | NestJS 12 (ESM, Fastify) + Prisma 7. Features in `src/features/<feature>/`, one endpoint per file                   |
| `apps/web`          | React 19 + Vite 8 PWA, TanStack Router/Query, Tailwind 4. Features in `src/features/<feature>/`, thin `src/routes/` |
| `apps/web/worker`   | Cloudflare Worker: serves the PWA and proxies `/api/*` to Cloud Run                                                 |
| `packages/shared`   | Zod schemas + types shared by web and API (must be built before consumers; Turbo handles it)                        |
| `packages/config`   | Shared tsconfig bases                                                                                               |
| `.github/workflows` | `ci.yml` (PRs + main), `deploy.yml` (main → Cloud Run + Cloudflare)                                                 |

## Commands

```bash
pnpm db:up                            # Postgres 18 on localhost:5442 (docker compose)
pnpm dev                              # shared watch + API :3000 + web :5180
pnpm test | pnpm typecheck | pnpm lint | pnpm format | pnpm build
pnpm --filter @shoppy/web test:e2e   # Playwright (own ports 3100/5190 and shoppy_e2e DB)
pnpm --filter @shoppy/api db:migrate  # create + apply a Prisma migration
pnpm --filter @shoppy/web cf:dev      # built PWA behind the Worker (needs apps/web/.dev.vars)
```

## Gotchas

- API is ESM with `nodenext`: relative imports need the `.js` extension.
- The Prisma client is generated into `apps/api/src/generated` (gitignored). Turbo runs `generate` before typecheck, test and dev.
- Ports 5173, 5432 and 5433 are taken by other projects on this machine. Shoppy uses 5180 (web), 3000 (API) and 5442 (DB).
- TypeScript stays on 6.0 (lint tooling doesn't support 7 yet). pnpm is pinned to 9.6.0.
- `AGENTS.md` is managed by Turborepo; don't edit it by hand.
- API tests hit a real Postgres (`shoppy_test`, created and migrated automatically), so `pnpm db:up` must be running.
- Every route requires a signed-in, verified user unless marked `@Public()` or `@AllowUnverified()`.
- Scoped rows (categories, items, lists) are loaded with `accessibleBy(user)` / `findAccessibleList()` (own rows and those of the user's households; others answer 404), then the service calls `ScopeAccess.require(user, scopeOf(row), '<permission>')` (403). Every new household-capable action needs that call and a row in the permission-matrix test. Archived lists are read-only (409).
- Entries are ordered by id: ids chosen by the app must be UUIDv7 (`uuidV7()` from `@shoppy/shared`). Web mutations on a list use `listMutationOptions(listId)` so they run in order.
- Every API request in production must carry the proxy secret header. Use `createTestApp()` in e2e tests rather than bootstrapping Nest by hand.
