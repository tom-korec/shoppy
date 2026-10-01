---
paths:
  - 'apps/web/**'
---

# Web (React PWA)

## Layout

```
src/
  main.tsx, index.css
  routes/                   TanStack file routes; thin, only wire a page component
  components/ui/            generic building blocks (Page, Section, EmptyState, Button …)
  components/layout/        app shell (RootLayout, BottomNav, UpdatePrompt …)
  features/<feature>/
    <feature>-page.tsx      page component used by a route
    <name>.tsx              feature components
    use-<name>.ts           hooks (queries, mutations, local logic)
    *.spec.tsx
  lib/                      framework-agnostic helpers (api client, cn, query client)
worker/                     Cloudflare Worker (proxy), tested with Vitest
```

## Components

- **One component per file**, named export, file name = kebab-case of the component name.
- Props as an `interface <Name>Props` directly above the component.
- Route files only call `createFileRoute(...)({ component: XPage })`. Loaders and search-param schemas may live there too; UI does not.
- Keep components presentational where possible. Data fetching and mutations go in `use-*.ts` hooks.

## Data

- Server state: TanStack Query hooks in the feature folder. Query keys are arrays starting with the feature name (`['lists', listId]`).
- Call the API only through `lib/api.ts`, parsing responses with schemas from `@shoppy/shared`.
- Use optimistic updates for list interactions (add, check, restore, delete). In-store UX must feel instant.
- No global state library unless a real need appears. Local state stays in components; cross-cutting state goes in context.

## Styling and UX

- Tailwind with the semantic tokens from `index.css` (`bg-background`, `text-muted-foreground`, `bg-primary` …). No hard-coded colors.
- Combine classes with `cn()`.
- Mobile-first: touch targets ≥ 44px, respect `env(safe-area-inset-*)`, one-hand reachable primary actions.
- Icons from `lucide-react`; decorative icons get `aria-hidden`.
- Accessibility: semantic elements, labelled controls, visible focus, sufficient contrast in both light and dark mode.

## Testing

- Component tests with Testing Library, querying by role and text as a user would.
- Stub `fetch` with `vi.stubGlobal` instead of mocking modules.
