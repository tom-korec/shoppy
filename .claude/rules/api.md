---
paths:
  - 'apps/api/**'
---

# API (NestJS)

## Layout

```
src/
  main.ts, instrument.ts, app.module.ts
  bootstrap/              create-app, configure-app, Fastify hooks
  config/                 env schema + validation
  common/                 cross-feature pipes, guards, decorators, filters (one per file)
  infrastructure/         prisma/, logging/, email/ … (adapters to the outside world)
  features/<feature>/
    <feature>.module.ts
    <feature>.service.ts         business logic, injected into endpoints
    <feature>.service.spec.ts
    endpoints/<verb>-<thing>.endpoint.ts
test/
  support/create-test-app.ts
  <feature>/<verb>-<thing>.e2e-spec.ts
```

Reference implementation: `src/features/health/`.

## Endpoints: one per file

- Each endpoint is its own `@Controller` class with exactly one route handler named `handle`.
- Class name = file name in PascalCase + `Endpoint`: `create-list.endpoint.ts` → `CreateListEndpoint`.
- Endpoints are thin: validate input, check permissions, call one service method, return the result. No Prisma calls, no business rules.
- Register every endpoint in the feature module's `controllers`.
- Routes are REST under `/api` (global prefix). Follow the API outline in `docs/03-architecture.md` §3.7.

```ts
@Controller('lists')
export class CreateListEndpoint {
  constructor(private readonly lists: ListsService) {}

  @Post()
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createListInputSchema)) input: CreateListInput,
  ): Promise<ListDto> {
    return this.lists.create(user, input);
  }
}
```

## Services

- One service per feature (split by sub-domain if it grows large). Services own business rules, transactions and Prisma access.
- Inject `PrismaService` and `ConfigService<Env, true>`; never read `process.env` outside `config/` and `instrument.ts`.
- Multi-step writes go in `prisma.$transaction`.
- Return DTOs shaped by the shared schemas, never raw Prisma models with internal fields (password hashes, token hashes).

## Validation and contracts

- Request and response schemas live in `packages/shared` (Zod). Validate input with `ZodValidationPipe`.
- Throw Nest HTTP exceptions (`NotFoundException`, `ForbiddenException`, `ConflictException` …) with a short message. Never leak internals.

## Authorization

- Every household-scoped endpoint enforces a permission from the catalog in `packages/shared` (FR-R1). Personal scope is owner-only.
- Check on the server even when the UI hides the action.

## Misc

- ESM: relative imports end in `.js`.
- Log with the injected Nest `Logger` (pino underneath). Never log secrets, tokens, passwords or cookies.
