-- CreateTable
CREATE TABLE "favorite_lists" (
    "user_id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_lists_pkey" PRIMARY KEY ("user_id","list_id")
);

-- CreateTable
CREATE TABLE "list_visits" (
    "user_id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "last_opened_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "list_visits_pkey" PRIMARY KEY ("user_id","list_id")
);

-- CreateIndex
CREATE INDEX "favorite_lists_list_id_idx" ON "favorite_lists"("list_id");

-- CreateIndex
CREATE INDEX "list_visits_user_id_last_opened_at_idx" ON "list_visits"("user_id", "last_opened_at" DESC);

-- CreateIndex
CREATE INDEX "list_visits_list_id_idx" ON "list_visits"("list_id");

-- AddForeignKey
ALTER TABLE "favorite_lists" ADD CONSTRAINT "favorite_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_lists" ADD CONSTRAINT "favorite_lists_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_visits" ADD CONSTRAINT "list_visits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_visits" ADD CONSTRAINT "list_visits_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
