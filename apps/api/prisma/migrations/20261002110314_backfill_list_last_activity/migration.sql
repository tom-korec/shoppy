-- Existing lists: last activity = the newest of the list's own change, entries and purchases.
UPDATE "lists" SET "last_activity_at" = GREATEST(
  "updated_at",
  COALESCE((SELECT max("updated_at") FROM "list_entries" WHERE "list_id" = "lists"."id"), "updated_at"),
  COALESCE((SELECT max("bought_at") FROM "purchase_records" WHERE "list_id" = "lists"."id"), "updated_at")
);
