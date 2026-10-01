---
name: commit-push-deploy
description: Commit the current changes with a Conventional Commit message, push, and follow the CI/deploy run through to a production health check. Only run when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: '[optional commit message or scope]'
---

# Commit, push and deploy

Pushing to `main` deploys to production (`.github/workflows/deploy.yml`). Run this only on the user's explicit request.

1. **Inspect**: `git status`, `git diff` and `git log --oneline -5`. Make sure nothing secret or generated is staged (`.env`, `.dev.vars`, `dist/`, `src/generated/`). Stop and ask if something looks wrong.
2. **Check before committing**:
   ```bash
   pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```
   If anything fails, fix it or report it. Don't commit a red build.
3. **Commit**: stage the relevant files explicitly (no blind `git add -A` when unrelated changes exist). Write a Conventional Commit message (`feat(api): …`, `fix(web): …`, `chore: …`, `docs: …`) with a body explaining the why when it's not obvious, and end it with the attribution trailer given in the session's system reminder. Split unrelated changes into separate commits.
4. **Push**: `git push` (first time: `git push -u origin main`). If there's no remote yet, ask the user whether to create the private `shoppy` repo with `gh repo create`.
5. **Follow the pipeline** (single blocking watches, no polling loops):
   ```bash
   gh run list --branch main --limit 2
   gh run watch <run-id> --exit-status
   ```
6. **Verify production** after the Deploy workflow succeeds:
   ```bash
   curl -s https://shoppy.korec.dev/api/health
   ```
   `status: ok` and `version` equal to the short commit SHA mean the deploy is live.
7. **Report**: commit hash(es), CI and deploy result, and the health response. On failure, show the failing job's log (`gh run view <id> --log-failed`) and propose a fix.
