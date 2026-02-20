-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('Pending', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Card', 'Split');

-- CreateEnum
CREATE TYPE "ReturnType" AS ENUM ('Full', 'Partial');

-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('Cash', 'Card', 'Wallet');

-- CreateTable
CREATE TABLE "ryzera_pos_sale" (
    "sale_id" SERIAL NOT NULL,
    "sale_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoice_number" TEXT NOT NULL,
    "sale_status" "SaleStatus" NOT NULL,
    "payment_status" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "tax_amount" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_sale_pkey" PRIMARY KEY ("sale_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sale_item" (
    "sale_item_id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "cost_price" DOUBLE PRECISION NOT NULL,
    "discount_percent" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "tax_percent" DOUBLE PRECISION NOT NULL,
    "tax_amount" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saleId" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_sale_item_pkey" PRIMARY KEY ("sale_item_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_payment" (
    "payment_id" SERIAL NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL,
    "transaction_reference" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saleId" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_return" (
    "return_id" SERIAL NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_type" "ReturnType" NOT NULL,
    "return_amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "refund_method" "RefundMethod" NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "saleId" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_return_pkey" PRIMARY KEY ("return_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_return_item" (
    "return_item_id" SERIAL NOT NULL,
    "quantity_returned" DOUBLE PRECISION NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "refund_amount" DOUBLE PRECISION NOT NULL,
    "item_condition" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnId" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_return_item_pkey" PRIMARY KEY ("return_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_sale_invoice_number_key" ON "ryzera_pos_sale"("invoice_number");

-- AddForeignKey
ALTER TABLE "ryzera_pos_sale_item" ADD CONSTRAINT "ryzera_pos_sale_item_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "ryzera_pos_sale"("sale_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_payment" ADD CONSTRAINT "ryzera_pos_payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "ryzera_pos_sale"("sale_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_return" ADD CONSTRAINT "ryzera_pos_return_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "ryzera_pos_sale"("sale_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_return_item" ADD CONSTRAINT "ryzera_pos_return_item_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "ryzera_pos_return"("return_id") ON DELETE RESTRICT ON UPDATE CASCADE;
