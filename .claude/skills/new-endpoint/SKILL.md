---
name: new-endpoint
description: Add a REST endpoint to the Shoppy NestJS API following the project conventions (shared Zod schema, one endpoint per file, feature service, permission check, e2e test). Use whenever a new API route is needed.
argument-hint: '<METHOD> <path> — e.g. "POST /lists"'
---

# New API endpoint

Follow `.claude/rules/api.md`, `shared.md` and `testing.md`. Reference implementation: `apps/api/src/features/health/`.

## 1. Understand the contract

- Find the endpoint in `docs/03-architecture.md` §3.7 and the requirement (`FR-*`) it serves in `docs/02-requirements.md`.
- Identify the scope (personal or household) and the permission from the RBAC matrix. If anything about behavior is unclear, ask the user before writing code.

## 2. Shared schemas (`packages/shared/src/<domain>.ts`)

- Add an input schema (`create<Thing>InputSchema`) and a response schema (`<thing>Schema`), and export the inferred types.
- Re-export from `src/index.ts` if the domain file is new.

## 3. Service method (`apps/api/src/features/<feature>/<feature>.service.ts`)

- Put the business logic here: Prisma queries, transactions, domain rules, mapping to the response DTO.
- Create the feature module and service if this is the feature's first endpoint, and add the module to `AppModule`.

## 4. Endpoint file (`apps/api/src/features/<feature>/endpoints/<verb>-<thing>.endpoint.ts`)

```ts
@Controller('<resource>')
export class <Verb><Thing>Endpoint {
  constructor(private readonly <feature>: <Feature>Service) {}

  @<Method>('<sub-path>')
  handle(/* validated params */): Promise<<Thing>Dto> {
    return this.<feature>.<method>(/* … */);
  }
}
```

- Validate body, params and query with `ZodValidationPipe` and the shared schemas.
- Apply the auth/permission decorators once they exist (Phase 1/3). Never skip authorization for household routes.
- Register the class in the feature module's `controllers`.

## 5. Tests

- `<feature>.service.spec.ts`: business rules, using hand-written fakes.
- `apps/api/test/<feature>/<verb>-<thing>.e2e-spec.ts` with `createTestApp()`: success, validation error, not found, and allowed/denied roles where relevant.

## 6. Verify

```bash
pnpm --filter @shoppy/shared build && pnpm --filter @shoppy/api typecheck && pnpm --filter @shoppy/api test && pnpm lint
```

Report the new route, its permission and the test results. If the endpoint changes the documented API, update `docs/03-architecture.md`.
