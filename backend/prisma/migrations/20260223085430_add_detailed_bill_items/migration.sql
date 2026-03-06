-- AlterTable
ALTER TABLE "bill_items" ADD COLUMN     "balance" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "days" INTEGER DEFAULT 0,
ADD COLUMN     "from_date" TIMESTAMP(3),
ADD COLUMN     "to_date" TIMESTAMP(3);
