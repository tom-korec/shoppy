# 2. Requirements

Legend: **MVP** = part of the first release, **Later** = post-MVP phase.
All requirements below are confirmed (see [Decisions](05-decisions.md)).

## 2.1 Entities (high level)

| Entity          | Attributes (* = required)                 | Scope                             |
| --------------- | ----------------------------------------- | --------------------------------- |
| Item            | name*, description, category              | user or household                 |
| Category        | name*, icon*                              | user or household                 |
| List            | name*, icon*                              | user or household                 |
| Household       | name*                                     | has an Owner (creator by default) |
| Entry           | item _or_ free text*, note                | belongs to a list                 |
| Purchase record | snapshot of entry, bought by*, bought at* | belongs to a list                 |

Icons for categories and lists come from an **icon library** (Lucide). We store an icon key such as `milk` or `shopping-cart`, and users pick from a curated set.

## 2.2 Functional requirements

### Authentication & account (MVP)

| ID    | Requirement                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-A1 | A user can register with name, email and password (at least 8 characters with a lowercase letter, an uppercase letter and a digit).         |
| FR-A2 | A user can sign in with Google. If a Google account's verified email matches an existing account, the two are linked.                       |
| FR-A3 | Email verification after email/password registration (sent via Resend from `korec.dev`). The app can't be used until the email is verified. |
| FR-A4 | Password reset via email link.                                                                                                              |
| FR-A5 | Sessions last long: a user who opens the app at least once every 90 days never has to log in again (sliding expiry).                        |
| FR-A6 | A user can see active sessions (devices) and log out one or all of them.                                                                    |
| FR-A7 | A user can edit their display name and change their password.                                                                               |
| FR-A8 | A user can delete their account. Households they own must first be transferred or deleted.                                                  |

### Categories (MVP)

| ID    | Requirement                                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| FR-C1 | When a user registers, their personal scope is seeded with a predefined set of categories.                           |
| FR-C2 | When a household is created, it is seeded with the same predefined set.                                              |
| FR-C3 | Categories can be created, renamed, re-iconed, reordered and deleted within a scope (subject to RBAC in households). |
| FR-C4 | Deleting a category that is in use leaves its items uncategorized.                                                   |
| FR-C5 | Category names are unique per scope (case-insensitive).                                                              |

### Items / catalog (MVP)

| ID    | Requirement                                                                                                                                                                                                                                                                                                                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-I1 | Items can be created, edited and deleted in a scope (subject to RBAC).                                                                                                                                                                                                                                                                                                                              |
| FR-I2 | Item category must belong to the same scope as the item.                                                                                                                                                                                                                                                                                                                                            |
| FR-I3 | Item names are unique per scope (case-insensitive).                                                                                                                                                                                                                                                                                                                                                 |
| FR-I4 | The catalog can be searched and filtered by category.                                                                                                                                                                                                                                                                                                                                               |
| FR-I5 | Items can be **copied** between scopes: personal → household (requires `item.create` in the household) and household → personal (any member). The category is matched by name in the target scope. If no match exists, it is created where allowed; otherwise the copy is left uncategorized. If an item with the same name already exists in the target, it is skipped and reported in the result. |
| FR-I6 | Deleting an item that is used on lists turns those entries into one-time entries (the name is kept). History keeps its snapshot.                                                                                                                                                                                                                                                                    |

### Lists & entries (MVP)

| ID      | Requirement                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-L1   | A user can create personal lists (private, visible only to them).                                                                                                                                                                                                                                                                                                         |
| FR-L2   | Household members with permission can create household lists, which are visible to all household members.                                                                                                                                                                                                                                                                 |
| FR-L3   | Lists can be renamed, re-iconed, archived and deleted (subject to RBAC).                                                                                                                                                                                                                                                                                                  |
| FR-L4   | An entry can be added to a list from the catalog of the **same scope** as the list. Other scopes' items are brought in by copying (FR-I5).                                                                                                                                                                                                                                |
| FR-L5   | A **one-time entry** can be added by typing free text. It is not saved in the catalog.                                                                                                                                                                                                                                                                                    |
| FR-L6   | Quick add: typing in the add box searches the catalog and the list's recent history. Picking a match adds a catalog entry; submitting text that matches nothing adds a one-time entry. Text after the first comma becomes the note ("milk, 2 l").                                                                                                                         |
| FR-L7   | A one-time entry can be **promoted** to a catalog item in the list's scope (one tap, optionally choosing a category).                                                                                                                                                                                                                                                     |
| FR-L8   | Each entry has an optional free-text **note** (also used for quantity).                                                                                                                                                                                                                                                                                                   |
| FR-L9   | Entries on a list are grouped by category, in the category order.                                                                                                                                                                                                                                                                                                         |
| FR-L10  | The same catalog item **can** be on a list multiple times (e.g. with different notes). There is no duplicate check.                                                                                                                                                                                                                                                       |
| FR-L11  | **Checking** an entry marks it as bought: a purchase record is created (who + when), and the entry leaves the active list. The app offers Undo for a few seconds.                                                                                                                                                                                                         |
| FR-L11b | **Deleting** an entry removes it permanently. No history record is created.                                                                                                                                                                                                                                                                                               |
| FR-L12  | A collapsed **Recent history** section below the active entries shows recent purchase records. Its time range adapts to how busy the list is: let _t10_ be the time of the 10th most recent record (or of the oldest one if there are fewer than 10). If _t10_ is within the last 7 days, the section shows the **last 7 days**; otherwise it shows the **last 30 days**. |
| FR-L13  | A separate **History** screen for each list shows all purchase records (paginated, newest first).                                                                                                                                                                                                                                                                         |
| FR-L14  | **Restore** a history record: it goes back onto the list as an entry and is removed from history (the "undo" of a check).                                                                                                                                                                                                                                                 |
| FR-L15  | **Re-add** a history record: a new entry is created on the list and the record stays in history.                                                                                                                                                                                                                                                                          |
| FR-L16  | **Bulk actions on entries:** multi-select mode → check selected / delete selected; plus **Check all** and **Delete all** for the whole list (with confirmation).                                                                                                                                                                                                          |
| FR-L17  | **Bulk actions on history:** multi-select → restore selected / re-add selected / delete selected records.                                                                                                                                                                                                                                                                 |
| FR-L18  | Bulk actions are all-or-nothing (one transaction) and need the same permission as the single action.                                                                                                                                                                                                                                                                      |
| FR-L19  | **Shopping mode:** a focused screen of the list. Tapping an entry strikes it through (saved, so it survives leaving the screen and shows on other devices); tapping again undoes it. **Finish** moves the struck-through entries to history, each with when and by whom it was struck through.                                                                            |
| FR-L20  | **Lists screen view:** grouping by Personal and each household can be turned off (each list then shows where it belongs), and lists sort by last activity, newest first, or the user's own drag order. The view is saved in the account.                                                                                                                                  |

### Households (MVP)

| ID    | Requirement                                                                                                                                                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-H1 | Any user can create a household and becomes its **Owner**.                                                                                                                                                                                                      |
| FR-H2 | A user can belong to multiple households.                                                                                                                                                                                                                       |
| FR-H3 | Invitations: **(a)** a shareable link, **(b)** a short code entered in the app, **(c)** an invitation by email. An email invitation always sends a join link; if the address already has an account, the invitee also sees it under pending invitations (D-57). |
| FR-H4 | An invitation specifies the role the invitee will get. It can expire, can be revoked, and link/code invitations can limit the number of uses. Default expiry: **7 days**.                                                                                       |
| FR-H5 | A member can leave a household. The Owner cannot leave without transferring ownership first.                                                                                                                                                                    |
| FR-H6 | The Owner can transfer ownership to another member (the old Owner becomes Admin).                                                                                                                                                                               |
| FR-H7 | The Owner can rename or delete the household. Deleting it removes all its lists, items, categories and history (after confirmation).                                                                                                                            |
| FR-H8 | Members with permission can change another member's role or permission overrides, and remove members (see RBAC).                                                                                                                                                |

### RBAC (MVP)

| ID    | Requirement                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| FR-R1 | Every household action is checked against a named permission.                                                      |
| FR-R2 | Each member has exactly one role: **Owner**, **Admin**, **Member** or **Viewer**.                                  |
| FR-R3 | A role defines **default** permissions and a **ceiling** (the most that can ever be granted to that role).         |
| FR-R4 | Per-member **overrides** can grant or revoke single permissions, but never beyond the role's ceiling.              |
| FR-R5 | Effective permissions = `ceiling ∩ ((defaults ∪ grants) − revokes)`. The Owner always has every permission.        |
| FR-R6 | Only the Owner can manage Admins (promote, demote, remove, edit overrides). Admins can manage Members and Viewers. |
| FR-R7 | Personal scope has no RBAC: the user can do everything with their own resources.                                   |
| FR-R8 | The UI hides or disables actions the user is not permitted to do. The API always enforces permissions regardless.  |

#### Permission catalog and role matrix (approved)

✅ default on · ⚪ off by default, grantable · ⛔ never allowed (outside the ceiling)

Viewing a household's lists, items, categories and members is implicit for every member. Deleting an entry needs `entry.remove`. Restoring or re-adding from history needs `history.restore` (restore also needs `entry.add`).

| Permission                                | Owner | Admin | Member | Viewer |
| ----------------------------------------- | :---: | :---: | :----: | :----: |
| `household.rename`                        |  ✅   |  ✅   |   ⛔   |   ⛔   |
| `household.delete`                        |  ✅   |  ⛔   |   ⛔   |   ⛔   |
| `household.transfer`                      |  ✅   |  ⛔   |   ⛔   |   ⛔   |
| `member.invite`                           |  ✅   |  ✅   |   ⛔   |   ⛔   |
| `member.remove`                           |  ✅   |  ✅   |   ⛔   |   ⛔   |
| `member.changeRole`                       |  ✅   |  ✅   |   ⛔   |   ⛔   |
| `member.editPermissions`                  |  ✅   |  ✅   |   ⛔   |   ⛔   |
| `list.create`                             |  ✅   |  ✅   |   ✅   |   ⚪   |
| `list.update`                             |  ✅   |  ✅   |   ✅   |   ⚪   |
| `list.delete`                             |  ✅   |  ✅   |   ⚪   |   ⚪   |
| `entry.add`                               |  ✅   |  ✅   |   ✅   |   ⚪   |
| `entry.edit`                              |  ✅   |  ✅   |   ✅   |   ⚪   |
| `entry.remove`                            |  ✅   |  ✅   |   ✅   |   ⚪   |
| `entry.check`                             |  ✅   |  ✅   |   ✅   |   ⚪   |
| `item.create`                             |  ✅   |  ✅   |   ✅   |   ⚪   |
| `item.update`                             |  ✅   |  ✅   |   ✅   |   ⚪   |
| `item.delete`                             |  ✅   |  ✅   |   ⚪   |   ⚪   |
| `category.create`                         |  ✅   |  ✅   |   ⚪   |   ⚪   |
| `category.update`                         |  ✅   |  ✅   |   ⚪   |   ⚪   |
| `category.delete`                         |  ✅   |  ✅   |   ⚪   |   ⚪   |
| `history.view`                            |  ✅   |  ✅   |   ✅   |   ✅   |
| `history.restore` (restore / re-add)      |  ✅   |  ✅   |   ✅   |   ⚪   |
| `history.delete` (delete records / clear) |  ✅   |  ✅   |   ⚪   |   ⛔   |

### Dashboard (MVP)

| ID    | Requirement                                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-D1 | Each user has a dashboard (the home screen after login).                                                                                        |
| FR-D2 | **Favorite lists**: the user can star or unstar any list they can access (personal or household) and reorder favorites. Favorites are per user. |
| FR-D3 | **Recently used lists**: the lists the user opened most recently (up to 5).                                                                     |
| FR-D4 | **Pending invitations**: accept or decline household invitations.                                                                               |
| FR-D5 | A separate **Lists** screen shows all accessible lists, grouped by Personal and each household.                                                 |

### Later phases

| ID    | Requirement                                                                         | Phase |
| ----- | ----------------------------------------------------------------------------------- | ----- |
| FR-X1 | Real-time sync: changes by other members show up without a refresh.                 | Later |
| FR-X2 | Offline mode: view lists and check/add entries offline, then sync on reconnect.     | Later |
| FR-X3 | Push notifications (e.g. "Anna added 3 items to Groceries"), configurable per user. | Later |
| FR-X4 | Buy-again suggestions based on purchase history.                                    | Later |

## 2.3 Non-functional requirements

| ID     | Category      | Requirement                                                                                                                                                                                                                                                        |
| ------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-1  | Cost          | All infrastructure must run on free tiers ($0/month). The only cost is the existing domain `korec.dev`. Any new cost needs explicit approval.                                                                                                                      |
| NFR-2  | Platform      | Installable PWA: valid manifest, service worker, maskable icons. Works on Android Chrome and iOS Safari 16.4+ (home screen).                                                                                                                                       |
| NFR-3  | UX            | Mobile-first, one-hand use, touch targets ≥ 44px, respects safe areas (notch). Desktop is supported but secondary.                                                                                                                                                 |
| NFR-4  | Performance   | The app shell loads from the service worker cache. With a warm backend, p95 API latency is < 300 ms. Backend cold start is < 3 s.                                                                                                                                  |
| NFR-5  | Sessions      | No forced re-login while the app is used at least once per 90 days.                                                                                                                                                                                                |
| NFR-6  | Security      | Passwords hashed with Argon2id. Access tokens are short-lived. Refresh tokens rotate, with reuse detection. The refresh cookie is `HttpOnly; Secure; SameSite=Strict` and first-party. Login and invite endpoints are rate-limited. OWASP ASVS L1 as the baseline. |
| NFR-7  | Authorization | Every household endpoint checks permissions on the server. Covered by automated tests (the permission matrix is tested).                                                                                                                                           |
| NFR-8  | Privacy       | GDPR basics: minimal personal data, account deletion, data export (JSON).                                                                                                                                                                                          |
| NFR-9  | Reliability   | Daily DB backups or point-in-time restore within free-tier limits. Migrations are versioned and run automatically on deploy.                                                                                                                                       |
| NFR-10 | Accessibility | WCAG 2.1 AA for contrast, labels and keyboard use.                                                                                                                                                                                                                 |
| NFR-11 | Language      | English UI. All strings live in one place, so i18n can be added later without a rewrite.                                                                                                                                                                           |
| NFR-12 | Quality       | Typed end to end (TypeScript). CI runs lint, type-check, unit, integration and E2E smoke tests on every PR.                                                                                                                                                        |
| NFR-13 | Observability | Error tracking (Sentry free tier) and structured logs for the backend and frontend.                                                                                                                                                                                |
