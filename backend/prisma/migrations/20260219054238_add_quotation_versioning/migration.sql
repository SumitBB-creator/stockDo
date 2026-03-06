-- AlterTable
ALTER TABLE "quotations" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "quotation_versions" (
    "id" TEXT NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_versions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "quotation_versions" ADD CONSTRAINT "quotation_versions_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
