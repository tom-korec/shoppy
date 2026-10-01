-- DropIndex
DROP INDEX "list_entries_list_id_created_at_idx";

-- CreateIndex
CREATE INDEX "list_entries_list_id_id_idx" ON "list_entries"("list_id", "id");
