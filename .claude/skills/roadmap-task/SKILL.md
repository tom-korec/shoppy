---
name: roadmap-task
description: Implement a Shoppy roadmap task (P#-##) end to end — read the docs, clarify open questions, build, test, verify, and update the roadmap status and decision log. Use when the user asks to work on a phase or a task ID.
argument-hint: '<task id or phase> — e.g. "P1-02" or "Phase 1"'
---

# Roadmap task

1. **Locate the task** in `docs/04-roadmap.md`. Read the requirements it serves (`docs/02-requirements.md`), the relevant architecture sections (`docs/03-architecture.md`) and related decisions (`docs/05-decisions.md`).
2. **Clarify.** List product or UX ambiguities and ask the user in one batch of multiple-choice questions (with a recommended option) before building. Technical choices within the agreed stack can be made directly.
3. **Plan briefly**: the files and modules touched, schema changes and tests. For a whole phase, work task by task in roadmap order.
4. **Build** with the matching skills: `db-migration` for schema changes, `new-endpoint` for API routes, `new-screen` for UI. Follow `.claude/rules/`.
5. **Verify**:
   ```bash
   pnpm format && pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```
   For UI work, check the running app (preview `dev`) at mobile size.
6. **Review**: run the `code-reviewer` agent on the diff, and the `security-reviewer` for auth, session, RBAC or input-handling changes. Fix confirmed findings.
7. **Update the docs** (or delegate to the `docs-keeper` agent): mark the task `✅ Done` (or `⏳` with what's blocking it) in the roadmap, add decision log rows for deviations, and adjust architecture/requirements if behavior changed.
8. **Report** what was built, how it was verified, and anything left open. Don't commit unless asked; suggest `/commit-push-deploy`.
