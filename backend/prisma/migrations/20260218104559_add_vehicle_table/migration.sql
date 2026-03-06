-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "next_service_due" TIMESTAMP(3),
    "pollution_due" TIMESTAMP(3),
    "insurance_due" TIMESTAMP(3),
    "road_tax_due" TIMESTAMP(3),
    "token_tax_due" TIMESTAMP(3),
    "national_permit_due" TIMESTAMP(3),
    "state_permit_due" TIMESTAMP(3),
    "fitness_test_due" TIMESTAMP(3),
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicle_number_key" ON "vehicles"("vehicle_number");
