-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "hsn" TEXT,
    "sac" TEXT,
    "total_qty" INTEGER NOT NULL DEFAULT 0,
    "damage_qty" INTEGER NOT NULL DEFAULT 0,
    "short_qty" INTEGER NOT NULL DEFAULT 0,
    "lower_limit" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "materials_material_id_key" ON "materials"("material_id");
