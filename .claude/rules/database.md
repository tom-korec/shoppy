---
paths:
  - 'apps/api/prisma/**'
---

# Database (Prisma + PostgreSQL)

- The data model follows `docs/03-architecture.md` §3.6. Update that section when the model changes.
- Models are `PascalCase` singular and fields `camelCase`, mapped to `snake_case` tables and columns with `@@map` / `@map`.
- IDs: `String @id @default(uuid(7)) @db.Uuid`. Timestamps: `createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz` and `updatedAt … @updatedAt` where rows change.
- Scope ownership (user XOR household) is enforced with a CHECK constraint. Prisma can't express it, so add it in the generated migration SQL.
- Add indexes for every foreign key and for each query pattern in the architecture doc.
- Migration names describe the change: `pnpm --filter @shoppy/api db:migrate --name add_households`.
- Never edit a migration that has been applied anywhere (CI, production). Create a new one.
- Destructive changes (drop or rename columns) need an explicit plan in the PR or commit: backfill, then drop.
