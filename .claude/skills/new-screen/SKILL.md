---
name: new-screen
description: Add a screen (route + page) or a component to the Shoppy React PWA following the project conventions (thin routes, one component per file, hooks for data, Tailwind tokens, mobile-first). Use when building any UI.
argument-hint: '<route or component> — e.g. "/lists/$listId" or "ListEntryRow"'
---

# New screen or component

Follow `.claude/rules/web.md` and `code-style.md`.

## Screen (route + page)

1. **Page component**: `apps/web/src/features/<feature>/<feature>-page.tsx`, exporting `<Feature>Page`. Wrap content in `Page` / `Section` from `components/ui`.
2. **Route file**: `apps/web/src/routes/<path>.tsx` (TanStack file-based routing; `$param` for params), containing only:
   ```ts
   export const Route = createFileRoute('/<path>')({ component: <Feature>Page });
   ```
   The router plugin regenerates `routeTree.gen.ts` when the dev server or build runs.
3. **Navigation**: add a bottom-nav item only for top-level destinations (`components/layout/bottom-nav.tsx`).

## Component

- One component per file in the feature folder (or `components/ui` if it's generic), with `interface <Name>Props` above it.
- Data comes from a `use-<name>.ts` hook (TanStack Query + `lib/api.ts` + shared schema), not fetched inside the component.
- Mutations on lists are optimistic.

## UX checklist

- Works at 375px width, touch targets ≥ 44px, safe areas respected.
- Semantic tokens only (check both light and dark mode). Lucide icons with `aria-hidden` when decorative.
- Loading, empty and error states are handled (use `EmptyState` for empty).

## Tests and verification

- `<name>.spec.tsx` with Testing Library for behavior (render states, user interactions), stubbing `fetch`.
- `pnpm --filter @shoppy/web typecheck && pnpm --filter @shoppy/web test && pnpm lint`.
- Open the screen in the preview (`dev` config, http://localhost:5180) at mobile size in light and dark mode, and check the console for errors.
