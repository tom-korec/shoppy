---
name: db-migration
description: Change the Shoppy database schema safely with Prisma (model naming, scope CHECK constraints, indexes, migration naming, local verification). Use for any change to apps/api/prisma/schema.prisma.
argument-hint: '<change> — e.g. "add households and members"'
---

# Database migration

Follow `.claude/rules/database.md`.

1. **Design first.** Compare the change with `docs/03-architecture.md` §3.6. If the model differs from the doc, decide with the user (or record the decision) and update the doc.
2. **Edit `apps/api/prisma/schema.prisma`**: models `PascalCase` with `@@map("snake_case")`, uuid v7 ids, `@db.Timestamptz` timestamps, relations with explicit `onDelete`, `@@index` on foreign keys.
3. **Make sure the local DB is running**: `pnpm db:up`.
4. **Create the migration without applying it**, so constraints can be added:
   ```bash
   pnpm --filter @shoppy/api exec prisma migrate dev --create-only --name <describe_change>
   ```
5. **Add what Prisma can't express** to the generated `migration.sql`: CHECK constraints (scope XOR, entry item-or-text), partial unique indexes, `citext` extension and columns.
6. **Apply and regenerate**:
   ```bash
   pnpm --filter @shoppy/api db:migrate
   ```
7. **Verify**: inspect the result with `docker compose exec db psql -U shoppy -c '\d+ <table>'`, then `pnpm --filter @shoppy/api typecheck && pnpm --filter @shoppy/api test`. CI applies all migrations to a fresh database (`db:deploy`), so a broken migration fails there.
8. **Never edit an applied migration.** Fix forward with a new one.

Report the tables and constraints that changed and any data implications.
