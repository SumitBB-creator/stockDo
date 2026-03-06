-- CreateTable
CREATE TABLE "agreements" (
    "id" TEXT NOT NULL,
    "agreement_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "site_address" TEXT,
    "residence_address" TEXT,
    "authorized_representative" TEXT,
    "minimum_rent_period" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreement_items" (
    "id" TEXT NOT NULL,
    "agreement_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "hire_rate" DOUBLE PRECISION NOT NULL,
    "damage_recovery_rate" DOUBLE PRECISION NOT NULL,
    "short_recovery_rate" DOUBLE PRECISION NOT NULL,
    "rate_applied_as" TEXT NOT NULL DEFAULT 'Nos/Days',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreement_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agreements_agreement_id_key" ON "agreements"("agreement_id");

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_items" ADD CONSTRAINT "agreement_items_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_items" ADD CONSTRAINT "agreement_items_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
