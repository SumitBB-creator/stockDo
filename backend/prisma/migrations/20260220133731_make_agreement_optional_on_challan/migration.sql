-- DropForeignKey
ALTER TABLE "challans" DROP CONSTRAINT "challans_agreement_id_fkey";

-- AlterTable
ALTER TABLE "challan_items" ADD COLUMN     "damage_quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "short_quantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "challans" ADD COLUMN     "time_in" TEXT,
ALTER COLUMN "agreement_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "challans" ADD CONSTRAINT "challans_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
