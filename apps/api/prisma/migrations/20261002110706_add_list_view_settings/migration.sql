-- CreateEnum
CREATE TYPE "list_sort" AS ENUM ('ACTIVITY', 'CREATED', 'CUSTOM');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lists_grouped" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lists_sort" "list_sort" NOT NULL DEFAULT 'ACTIVITY';
