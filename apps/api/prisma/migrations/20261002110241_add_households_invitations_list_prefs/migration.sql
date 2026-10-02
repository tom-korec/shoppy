-- CreateEnum
CREATE TYPE "household_role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "invitation_kind" AS ENUM ('LINK', 'CODE', 'EMAIL');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "household_id" UUID,
ALTER COLUMN "owner_user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "household_id" UUID,
ALTER COLUMN "owner_user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lists" ADD COLUMN     "household_id" UUID,
ADD COLUMN     "last_activity_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "owner_user_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "households" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_members" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "household_role" NOT NULL,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "household_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_permission_overrides" (
    "member_id" UUID NOT NULL,
    "permission" TEXT NOT NULL,
    "is_granted" BOOLEAN NOT NULL,

    CONSTRAINT "member_permission_overrides_pkey" PRIMARY KEY ("member_id","permission")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "kind" "invitation_kind" NOT NULL,
    "token_hash" TEXT,
    "code_hash" TEXT,
    "email" CITEXT,
    "role" "household_role" NOT NULL,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,
    "declined_at" TIMESTAMPTZ,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_positions" (
    "user_id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "list_positions_pkey" PRIMARY KEY ("user_id","list_id")
);

-- CreateIndex
CREATE INDEX "household_members_user_id_idx" ON "household_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "household_members_household_id_user_id_key" ON "household_members"("household_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_hash_key" ON "invitations"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_code_hash_key" ON "invitations"("code_hash");

-- CreateIndex
CREATE INDEX "invitations_household_id_idx" ON "invitations"("household_id");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_created_by_idx" ON "invitations"("created_by");

-- CreateIndex
CREATE INDEX "list_positions_list_id_idx" ON "list_positions"("list_id");

-- CreateIndex
CREATE INDEX "categories_household_id_position_idx" ON "categories"("household_id", "position");

-- CreateIndex
CREATE INDEX "items_household_id_idx" ON "items"("household_id");

-- CreateIndex
CREATE INDEX "lists_household_id_idx" ON "lists"("household_id");

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_permission_overrides" ADD CONSTRAINT "member_permission_overrides_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "household_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_positions" ADD CONSTRAINT "list_positions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_positions" ADD CONSTRAINT "list_positions_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Exactly one Owner per household (FR-H1, FR-H6).
CREATE UNIQUE INDEX "household_members_one_owner_key" ON "household_members" ("household_id") WHERE "role" = 'OWNER';

-- Categories, items and lists belong to exactly one scope: a user or a household.
ALTER TABLE "categories" ADD CONSTRAINT "categories_scope_check" CHECK (("owner_user_id" IS NULL) <> ("household_id" IS NULL));
ALTER TABLE "items" ADD CONSTRAINT "items_scope_check" CHECK (("owner_user_id" IS NULL) <> ("household_id" IS NULL));
ALTER TABLE "lists" ADD CONSTRAINT "lists_scope_check" CHECK (("owner_user_id" IS NULL) <> ("household_id" IS NULL));

-- Names are unique per household too (FR-C5, FR-I3); the per-user indexes already exist.
CREATE UNIQUE INDEX "categories_household_id_name_key" ON "categories" ("household_id", lower("name"));
CREATE UNIQUE INDEX "items_household_id_name_key" ON "items" ("household_id", lower("name"));

-- An invitation is a link, a code or an email invitation (which also has a link token).
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_kind_check" CHECK (
  ("kind" = 'LINK' AND "token_hash" IS NOT NULL AND "code_hash" IS NULL AND "email" IS NULL) OR
  ("kind" = 'CODE' AND "code_hash" IS NOT NULL AND "token_hash" IS NULL AND "email" IS NULL) OR
  ("kind" = 'EMAIL' AND "token_hash" IS NOT NULL AND "email" IS NOT NULL AND "code_hash" IS NULL)
);
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_role_check" CHECK ("role" <> 'OWNER');
