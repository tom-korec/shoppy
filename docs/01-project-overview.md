# 1. Project overview

## What it is

**Shoppy** is a shopping-list app built as a Progressive Web App (PWA). It is meant to be installed on a phone's home screen and used mostly on mobile. Users keep personal lists and can also join one or more **households**, where lists, items and categories are shared among members. Access inside a household is controlled by role-based permissions (RBAC).

This is a personal project. Everything must run on **free tiers** (the only cost is the existing domain `korec.dev`). It will live at **https://shoppy.korec.dev**.

## Goals

- Fast, mobile-first list management: open the app, add or check items in a few taps.
- Shared households with fine-grained, per-action permissions.
- A reusable **item catalog** per user and per household, so common items are not retyped every time.
- **One-time entries** for ad-hoc things that don't belong in the catalog, which can be promoted to the catalog later.
- **Purchase history**: checked entries move to history (who bought them and when). They can be restored to the list or re-added as a copy. Deleting an entry removes it completely.
- **Bulk actions** on entries and history records.
- A **personal dashboard** showing favorite lists, recently used lists and pending invitations.
- Long-lived sessions, so there is no daily re-login on mobile.
- Installable PWA, with a zero-cost deployment.

## Non-goals (MVP)

These are planned for later phases (see [Roadmap](04-roadmap.md)) and are **not** in the MVP:

- Real-time sync between devices and members
- Offline mode
- Push notifications
- "Buy again" suggestions

Not planned at all, for now:

- Native mobile apps (App Store / Play Store)
- Sharing personal lists with individual users (sharing happens only through households)
- Moving a list between personal and household scope
- Per-list permissions (permissions apply at household level)
- Languages other than English
- Sign in with Apple (needs a paid Apple Developer account)

## Glossary

| Term                    | Meaning                                                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **User**                | A person with an account (email/password and/or Google).                                                                                                                                   |
| **Household**           | A group of users sharing lists, items and categories. It has exactly one Owner. A user can belong to many households.                                                                      |
| **Scope**               | Who owns a resource: either a single **user** (personal) or a **household**. Items, categories and lists all have exactly one scope.                                                       |
| **Item**                | Reusable catalog entry (name, description, category) within a scope.                                                                                                                       |
| **Category**            | Grouping for items (name + icon) within a scope. A predefined set is seeded for every new user and household, and can be customized.                                                       |
| **List**                | A shopping list (name + icon) within a scope.                                                                                                                                              |
| **Entry**               | One line on a list. It either references a catalog **Item** or is a **one-time entry** (free text). It carries a free-text **note**, which also holds the quantity (e.g. "2 kg, organic"). |
| **One-time entry**      | An entry without a catalog item. It can be **promoted** to a catalog item.                                                                                                                 |
| **Purchase record**     | A history record created when an entry is checked as bought. It stores who bought it and when.                                                                                             |
| **Check**               | Mark an entry as bought: it moves from the list into history.                                                                                                                              |
| **Delete (entry)**      | Remove an entry permanently. Nothing goes to history.                                                                                                                                      |
| **Restore**             | Move a history record back onto the list. It is removed from history.                                                                                                                      |
| **Re-add**              | Add a new entry to the list from a history record. The record stays in history.                                                                                                            |
| **Role**                | Owner, Admin, Member or Viewer. It sets the default permissions and the upper limit ("ceiling") of permissions a member can have.                                                          |
| **Permission override** | A per-member grant or revoke of a permission, limited by the role's ceiling.                                                                                                               |
| **Favorite**            | A list pinned by a user to their dashboard (per user).                                                                                                                                     |
