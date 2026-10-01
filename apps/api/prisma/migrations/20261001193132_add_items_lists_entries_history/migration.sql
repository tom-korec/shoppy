-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" UUID,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lists" (
    "id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "archived_at" TIMESTAMPTZ,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_entries" (
    "id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "item_id" UUID,
    "text" TEXT,
    "category_id" UUID,
    "note" TEXT,
    "checked_at" TIMESTAMPTZ,
    "checked_by" UUID,
    "added_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "list_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_records" (
    "id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "item_id" UUID,
    "name_snapshot" TEXT NOT NULL,
    "category_snapshot" TEXT,
    "note" TEXT,
    "bought_by" UUID,
    "bought_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "purchase_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "items_owner_user_id_idx" ON "items"("owner_user_id");

-- CreateIndex
CREATE INDEX "items_category_id_idx" ON "items"("category_id");

-- CreateIndex
CREATE INDEX "items_created_by_idx" ON "items"("created_by");

-- CreateIndex
CREATE INDEX "lists_owner_user_id_idx" ON "lists"("owner_user_id");

-- CreateIndex
CREATE INDEX "lists_created_by_idx" ON "lists"("created_by");

-- CreateIndex
CREATE INDEX "list_entries_list_id_created_at_idx" ON "list_entries"("list_id", "created_at");

-- CreateIndex
CREATE INDEX "list_entries_item_id_idx" ON "list_entries"("item_id");

-- CreateIndex
CREATE INDEX "list_entries_category_id_idx" ON "list_entries"("category_id");

-- CreateIndex
CREATE INDEX "list_entries_checked_by_idx" ON "list_entries"("checked_by");

-- CreateIndex
CREATE INDEX "list_entries_added_by_idx" ON "list_entries"("added_by");

-- CreateIndex
CREATE INDEX "purchase_records_list_id_bought_at_id_idx" ON "purchase_records"("list_id", "bought_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "purchase_records_item_id_idx" ON "purchase_records"("item_id");

-- CreateIndex
CREATE INDEX "purchase_records_bought_by_idx" ON "purchase_records"("bought_by");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_entries" ADD CONSTRAINT "list_entries_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_entries" ADD CONSTRAINT "list_entries_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_entries" ADD CONSTRAINT "list_entries_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_entries" ADD CONSTRAINT "list_entries_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_entries" ADD CONSTRAINT "list_entries_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_records" ADD CONSTRAINT "purchase_records_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_records" ADD CONSTRAINT "purchase_records_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_records" ADD CONSTRAINT "purchase_records_bought_by_fkey" FOREIGN KEY ("bought_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Item names are unique per scope, case-insensitively (FR-I3).
CREATE UNIQUE INDEX "items_owner_user_id_name_key" ON "items" ("owner_user_id", lower("name"));

-- An entry is either a catalog item or a one-time entry with its own text (FR-L4, FR-L5).
-- Only one-time entries carry their own category; catalog entries use the item's.
ALTER TABLE "list_entries"
  ADD CONSTRAINT "list_entries_item_or_text_check" CHECK (("item_id" IS NULL) <> ("text" IS NULL)),
  ADD CONSTRAINT "list_entries_category_one_time_check" CHECK ("item_id" IS NULL OR "category_id" IS NULL),
  ADD CONSTRAINT "list_entries_checked_check" CHECK ("checked_by" IS NULL OR "checked_at" IS NOT NULL);
