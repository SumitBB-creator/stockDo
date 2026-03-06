/*
  Warnings:

  - You are about to drop the column `address` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `gst_in` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `customers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "customers_email_key";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "address",
DROP COLUMN "email",
DROP COLUMN "gst_in",
DROP COLUMN "phone",
ADD COLUMN     "ledger_account_id" TEXT,
ADD COLUMN     "office_address" TEXT,
ADD COLUMN     "office_city" TEXT,
ADD COLUMN     "office_country" TEXT,
ADD COLUMN     "office_email" TEXT,
ADD COLUMN     "office_fax" TEXT,
ADD COLUMN     "office_gst" TEXT,
ADD COLUMN     "office_phone" TEXT,
ADD COLUMN     "office_pin" TEXT,
ADD COLUMN     "office_state" TEXT,
ADD COLUMN     "pan" TEXT,
ADD COLUMN     "relation_name" TEXT,
ADD COLUMN     "relation_type" TEXT,
ADD COLUMN     "site_address" TEXT,
ADD COLUMN     "site_city" TEXT,
ADD COLUMN     "site_country" TEXT,
ADD COLUMN     "site_email" TEXT,
ADD COLUMN     "site_fax" TEXT,
ADD COLUMN     "site_gst" TEXT,
ADD COLUMN     "site_phone" TEXT,
ADD COLUMN     "site_pin" TEXT,
ADD COLUMN     "site_state" TEXT;
