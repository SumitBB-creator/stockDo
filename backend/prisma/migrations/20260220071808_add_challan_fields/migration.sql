-- AlterTable
ALTER TABLE "challans" ADD COLUMN     "bilty_number" TEXT,
ADD COLUMN     "driver_mobile" TEXT,
ADD COLUMN     "goods_value" DOUBLE PRECISION,
ADD COLUMN     "green_tax" DOUBLE PRECISION,
ADD COLUMN     "license_number" TEXT,
ADD COLUMN     "manual_challan_number" TEXT,
ADD COLUMN     "receiver_mobile" TEXT,
ADD COLUMN     "receiver_name" TEXT,
ADD COLUMN     "time_out" TEXT,
ADD COLUMN     "transportation_cost" DOUBLE PRECISION,
ADD COLUMN     "transporter_name" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;
