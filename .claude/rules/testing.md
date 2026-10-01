---
paths:
  - '**/*.spec.ts'
  - '**/*.spec.tsx'
  - '**/*.e2e-spec.ts'
  - 'apps/api/test/**'
---

# Testing

- Vitest everywhere. Unit specs sit next to the file (`health.service.spec.ts`). API e2e specs live in `apps/api/test/<feature>/<endpoint>.e2e-spec.ts`.
- Test behavior through public interfaces, not implementation details.
- Arrange, act, assert, separated by a blank line. One behavior per test, named as a sentence (`it('returns 403 for a viewer without entry.check')`).
- API e2e: build the app with `createTestApp()` and call it with `app.inject()`. Every endpoint covers success, validation failure and authorization (allowed and denied roles) where applicable.
- Services: construct them directly with hand-written fakes for their dependencies. No mocking framework is needed.
- Web: Testing Library queries by role or text; stub `fetch` with `vi.stubGlobal`.
- No snapshot tests for logic. Keep tests deterministic: no real network, fixed dates where time matters.
