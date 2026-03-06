-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "employerName" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "stateCode" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pin" TEXT,
    "email" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "pan" TEXT,
    "gstin" TEXT,
    "history" TEXT,
    "logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);
