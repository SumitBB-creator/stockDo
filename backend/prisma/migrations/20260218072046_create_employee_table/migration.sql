-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ledger_account_id" TEXT,
    "relation_type" TEXT,
    "relation_name" TEXT,
    "pan" TEXT,
    "address" TEXT,
    "city" TEXT,
    "pin" TEXT,
    "state" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "gst_in" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_ledger_account_id_key" ON "employees"("ledger_account_id");
