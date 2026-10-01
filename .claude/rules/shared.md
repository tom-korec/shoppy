---
paths:
  - 'packages/shared/**'
---

# Shared package

- Contains only Zod schemas, inferred types and constants used by both web and API. No framework code, no runtime dependencies besides `zod`.
- One domain per file (`lists.ts`, `households.ts`, `permissions.ts`), re-exported from `src/index.ts`.
- Naming: `<thing>Schema` for schemas, `<Thing>` for the inferred type. Inputs: `create<Thing>InputSchema` → `Create<Thing>Input`. Responses: `<thing>Schema` → `<Thing>Dto`.
- Put validation rules (lengths, trimming, enums) in the schema so web forms and API agree.
- The package compiles to `dist/`. Turbo builds it before dependents; in dev `tsc --watch` keeps it fresh.
