# Code style (all code)

## Readability first

- Code should explain itself through names and structure. Prefer renaming a variable or extracting a well-named function over writing a comment.
- Comments are only for a non-obvious **why**: a platform constraint, a security reason, a workaround. Never comment what the code already says, and never leave commented-out code, TODOs without an issue, or section-divider comments.
- No JSDoc on obvious functions, props or fields. Types are the documentation.
- Small, focused functions. Early returns over nested conditionals.
- No speculative abstractions, options or config "for later". Build what the current task needs.

## Files

- **One file, one unit**: one React component, one hook, one class (controller, service, pipe, guard), or one cohesive set of pure helpers.
- File names are `kebab-case`. Suffix by role: `*.endpoint.ts`, `*.service.ts`, `*.module.ts`, `*.pipe.ts`, `*.guard.ts`, `*.decorator.ts`, `use-*.ts`, `*.spec.ts(x)`, `*.e2e-spec.ts`.
- Named exports only (framework-required exports such as TanStack's `Route` are fine).
- A file that grows past roughly 150 lines usually wants to be split.

## Naming

- Components, classes, types and interfaces: `PascalCase`. Functions and variables: `camelCase`. Constants that are true module-level constants: `UPPER_SNAKE_CASE`.
- Booleans read as questions: `isPending`, `hasAccess`, `canInvite`.
- Name things after the domain in `docs/01-project-overview.md` (household, scope, item, entry, purchase record), not after technical concepts.

## TypeScript

- Strict mode; no `any`, no `@ts-ignore`. Use `unknown` and narrow it.
- Avoid non-null assertions (`!`). The one accepted case is `document.getElementById('root')!`.
- Derive types from Zod schemas (`z.infer`) instead of duplicating them.
- Prefer `interface` for object shapes and props, `type` for unions and derived types.

## Dependency injection

- Use Nest DI for anything with dependencies or side effects (database, config, external services), so it can be replaced in tests.
- Plain pure functions don't need DI. Don't wrap a pure helper in an injectable class.
- Constructor injection with `private readonly`. No service locators, no `moduleRef.get` in business code.
- In React, pass dependencies via props or context. Data access lives in hooks, not in components.

## Errors

- Fail loudly at boundaries (config validation, request validation, external responses parsed with Zod).
- Don't swallow errors. If you catch, either handle the case meaningfully or rethrow.
