/*
  Warnings:

  - The primary key for the `ryzera_pos_authority` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `authority_id` on the `ryzera_pos_authority` table. All the data in the column will be lost.
  - You are about to drop the column `authority_name` on the `ryzera_pos_authority` table. All the data in the column will be lost.
  - The primary key for the `ryzera_pos_branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `branch_code` on the `ryzera_pos_branch` table. All the data in the column will be lost.
  - You are about to drop the column `branch_id` on the `ryzera_pos_branch` table. All the data in the column will be lost.
  - You are about to drop the column `branch_name` on the `ryzera_pos_branch` table. All the data in the column will be lost.
  - The primary key for the `ryzera_pos_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role_id` on the `ryzera_pos_role` table. All the data in the column will be lost.
  - You are about to drop the column `role_name` on the `ryzera_pos_role` table. All the data in the column will be lost.
  - The primary key for the `ryzera_pos_role_authority` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role_authority_id` on the `ryzera_pos_role_authority` table. All the data in the column will be lost.
  - You are about to drop the column `account_locked_until` on the `ryzera_pos_user` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `ryzera_pos_user` table. All the data in the column will be lost.
  - You are about to drop the column `failed_login_attempts` on the `ryzera_pos_user` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `ryzera_pos_user` table. All the data in the column will be lost.
  - You are about to drop the column `last_failed_login` on the `ryzera_pos_user` table. All the data in the column will be lost.
  - You are about to drop the column `last_login_at` on the `ryzera_pos_user` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `ryzera_pos_user` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `ryzera_pos_user` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `ryzera_pos_user_info` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ryzera_pos_user_info` table. All the data in the column will be lost.
  - The primary key for the `ryzera_pos_user_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `IP_address` on the `ryzera_pos_user_log` table. All the data in the column will be lost.
  - You are about to drop the column `device_info` on the `ryzera_pos_user_log` table. All the data in the column will be lost.
  - You are about to drop the column `log_id` on the `ryzera_pos_user_log` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `ryzera_pos_user_log` table. All the data in the column will be lost.
  - The primary key for the `ryzera_pos_user_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_role_id` on the `ryzera_pos_user_role` table. All the data in the column will be lost.
  - You are about to drop the `Branch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BranchProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Company_Branch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SyncLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `ryzera_pos_authority` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ryzera_pos_role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roleId,authorityId]` on the table `ryzera_pos_role_authority` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `ryzera_pos_user_info` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,roleId]` on the table `ryzera_pos_user_role` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `ryzera_pos_authority` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `ryzera_pos_authority` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `ryzera_pos_branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `ryzera_pos_branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ryzera_pos_branch` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `ryzera_pos_role` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `ryzera_pos_role` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `ryzera_pos_role_authority` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `branch_id` to the `ryzera_pos_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `ryzera_pos_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `ryzera_pos_user_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `ryzera_pos_user_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ryzera_pos_user_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ryzera_pos_user_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch_id` to the `ryzera_pos_user_log` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `ryzera_pos_user_log` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `status` to the `ryzera_pos_user_log` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `ryzera_pos_user_role` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "branch_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "unit_of_measure" AS ENUM ('PCS', 'KG', 'PACK', 'LTR', 'BOX', 'MTR');

-- CreateEnum
CREATE TYPE "inventory_action" AS ENUM ('CREATE', 'UPDATE', 'SALE', 'RESTOCK', 'DELETE', 'TRANSFER', 'ADJUSTMENT', 'STOCK_TAKE', 'RETURN_FROM_CUSTOMER', 'RETURN_TO_SUPPLIER', 'WASTE_DAMAGED');

-- CreateEnum
CREATE TYPE "alert_status" AS ENUM ('PENDING', 'SEEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "purchase_order_status" AS ENUM ('DRAFT', 'SENT', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "invoice_status" AS ENUM ('UNPAID', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "transfer_status" AS ENUM ('PENDING', 'SHIPPED', 'RECEIVED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "BackupMetadata" DROP CONSTRAINT "BackupMetadata_branchId_fkey";

-- DropForeignKey
ALTER TABLE "BackupMetadata" DROP CONSTRAINT "BackupMetadata_companyId_fkey";

-- DropForeignKey
ALTER TABLE "BranchProduct" DROP CONSTRAINT "BranchProduct_branchId_fkey";

-- DropForeignKey
ALTER TABLE "BranchProduct" DROP CONSTRAINT "BranchProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "Company_Branch" DROP CONSTRAINT "Company_Branch_companyId_fkey";

-- DropForeignKey
ALTER TABLE "DailySummary" DROP CONSTRAINT "DailySummary_branchId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryLog" DROP CONSTRAINT "InventoryLog_branchId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryLog" DROP CONSTRAINT "InventoryLog_productId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryLog" DROP CONSTRAINT "InventoryLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryUser" DROP CONSTRAINT "InventoryUser_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_branchId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_createdById_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_stockAlertId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "StockAlert" DROP CONSTRAINT "StockAlert_branchId_fkey";

-- DropForeignKey
ALTER TABLE "StockAlert" DROP CONSTRAINT "StockAlert_productId_fkey";

-- DropForeignKey
ALTER TABLE "SyncLog" DROP CONSTRAINT "SyncLog_branchId_fkey";

-- DropForeignKey
ALTER TABLE "SyncLog" DROP CONSTRAINT "SyncLog_companyId_fkey";

-- DropForeignKey
ALTER TABLE "SystemSetting" DROP CONSTRAINT "SystemSetting_branchId_fkey";

-- DropForeignKey
ALTER TABLE "SystemSetting" DROP CONSTRAINT "SystemSetting_companyId_fkey";

-- DropForeignKey
ALTER TABLE "ryzera_pos_role_authority" DROP CONSTRAINT "ryzera_pos_role_authority_authorityId_fkey";

-- DropForeignKey
ALTER TABLE "ryzera_pos_role_authority" DROP CONSTRAINT "ryzera_pos_role_authority_roleId_fkey";

-- DropForeignKey
ALTER TABLE "ryzera_pos_sale" DROP CONSTRAINT "ryzera_pos_sale_branchId_fkey";

-- DropForeignKey
ALTER TABLE "ryzera_pos_sale_item" DROP CONSTRAINT "ryzera_pos_sale_item_productId_fkey";

-- DropForeignKey
ALTER TABLE "ryzera_pos_user" DROP CONSTRAINT "ryzera_pos_user_branchId_fkey";

-- DropForeignKey
ALTER TABLE "ryzera_pos_user_info" DROP CONSTRAINT "ryzera_pos_user_info_userId_fkey";

-- DropForeignKey
ALTER TABLE "ryzera_pos_user_log" DROP CONSTRAINT "ryzera_pos_user_log_userId_fkey";

-- DropForeignKey
ALTER TABLE "ryzera_pos_user_role" DROP CONSTRAINT "ryzera_pos_user_role_roleId_fkey";

-- DropForeignKey
ALTER TABLE "ryzera_pos_user_role" DROP CONSTRAINT "ryzera_pos_user_role_userId_fkey";

-- DropIndex
DROP INDEX "ryzera_pos_authority_authority_name_key";

-- DropIndex
DROP INDEX "ryzera_pos_branch_branch_code_key";

-- DropIndex
DROP INDEX "ryzera_pos_branch_branch_name_key";

-- DropIndex
DROP INDEX "ryzera_pos_role_role_name_key";

-- DropIndex
DROP INDEX "ryzera_pos_user_info_userId_key";

-- AlterTable
ALTER TABLE "ryzera_pos_authority" DROP CONSTRAINT "ryzera_pos_authority_pkey",
DROP COLUMN "authority_id",
DROP COLUMN "authority_name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "ryzera_pos_authority_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ryzera_pos_branch" DROP CONSTRAINT "ryzera_pos_branch_pkey",
DROP COLUMN "branch_code",
DROP COLUMN "branch_id",
DROP COLUMN "branch_name",
ADD COLUMN     "branchId" SERIAL NOT NULL,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "company_id" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "ryzera_pos_branch_pkey" PRIMARY KEY ("branchId");

-- AlterTable
ALTER TABLE "ryzera_pos_role" DROP CONSTRAINT "ryzera_pos_role_pkey",
DROP COLUMN "role_id",
DROP COLUMN "role_name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "ryzera_pos_role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ryzera_pos_role_authority" DROP CONSTRAINT "ryzera_pos_role_authority_pkey",
DROP COLUMN "role_authority_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ALTER COLUMN "authorityId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ryzera_pos_role_authority_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ryzera_pos_user" DROP COLUMN "account_locked_until",
DROP COLUMN "branchId",
DROP COLUMN "failed_login_attempts",
DROP COLUMN "first_name",
DROP COLUMN "last_failed_login",
DROP COLUMN "last_login_at",
DROP COLUMN "last_name",
DROP COLUMN "profile_picture",
ADD COLUMN     "branch_id" INTEGER NOT NULL,
ADD COLUMN     "company_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ryzera_pos_user_info" DROP COLUMN "phone_number",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profile_pic" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ryzera_pos_user_log" DROP CONSTRAINT "ryzera_pos_user_log_pkey",
DROP COLUMN "IP_address",
DROP COLUMN "device_info",
DROP COLUMN "log_id",
DROP COLUMN "timestamp",
ADD COLUMN     "branch_id" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT,
ADD CONSTRAINT "ryzera_pos_user_log_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ryzera_pos_user_role" DROP CONSTRAINT "ryzera_pos_user_role_pkey",
DROP COLUMN "user_role_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ryzera_pos_user_role_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Branch";

-- DropTable
DROP TABLE "BranchProduct";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "Company_Branch";

-- DropTable
DROP TABLE "InventoryLog";

-- DropTable
DROP TABLE "InventoryUser";

-- DropTable
DROP TABLE "Invoice";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "PurchaseOrder";

-- DropTable
DROP TABLE "PurchaseOrderItem";

-- DropTable
DROP TABLE "StockAlert";

-- DropTable
DROP TABLE "Supplier";

-- DropTable
DROP TABLE "SyncLog";

-- DropEnum
DROP TYPE "AlertStatus";

-- DropEnum
DROP TYPE "InventoryAction";

-- DropEnum
DROP TYPE "InvoiceStatus";

-- DropEnum
DROP TYPE "PurchaseOrderStatus";

-- CreateTable
CREATE TABLE "ryzera_pos_company" (
    "company_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_company_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_inventory_log" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changeQty" INTEGER NOT NULL,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_inventory_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sync_log" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_sync_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "status" "branch_status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "branchId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "description" TEXT,
    "price" DECIMAL(12,4) NOT NULL,
    "costPrice" DECIMAL(12,4),
    "minStock" INTEGER NOT NULL DEFAULT 5,
    "unit" "unit_of_measure" NOT NULL DEFAULT 'PCS',
    "status" "product_status" NOT NULL DEFAULT 'ACTIVE',
    "categoryId" TEXT,
    "supplierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_product" (
    "id" TEXT NOT NULL,
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "reservedQty" INTEGER NOT NULL DEFAULT 0,
    "branchId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_log" (
    "id" TEXT NOT NULL,
    "action" "inventory_action" NOT NULL,
    "changeQty" INTEGER NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "branchProductId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_alert" (
    "id" TEXT NOT NULL,
    "status" "alert_status" NOT NULL DEFAULT 'PENDING',
    "stockQty" INTEGER NOT NULL,
    "minStock" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order" (
    "id" TEXT NOT NULL,
    "status" "purchase_order_status" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "supplierId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "stockAlertId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_item" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(12,4) NOT NULL,
    "totalCost" DECIMAL(12,4) NOT NULL,
    "productId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,

    CONSTRAINT "purchase_order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "status" "invoice_status" NOT NULL DEFAULT 'UNPAID',
    "totalAmount" DECIMAL(12,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "purchaseOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer" (
    "id" TEXT NOT NULL,
    "status" "transfer_status" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "sourceBranchId" TEXT NOT NULL,
    "destinationBranchId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_item" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,

    CONSTRAINT "transfer_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "manufactureDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfflineCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfflineCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfflineBranch" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfflineBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfflineSyncLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "branchId" TEXT,
    "entity" TEXT NOT NULL,
    "syncType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "recordsSynced" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfflineSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_company_code_key" ON "ryzera_pos_company"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "supplier_name_idx" ON "supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_barcode_key" ON "product"("barcode");

-- CreateIndex
CREATE INDEX "branch_product_branchId_idx" ON "branch_product"("branchId");

-- CreateIndex
CREATE INDEX "branch_product_productId_idx" ON "branch_product"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_product_branchId_productId_key" ON "branch_product"("branchId", "productId");

-- CreateIndex
CREATE INDEX "inventory_log_branchProductId_idx" ON "inventory_log"("branchProductId");

-- CreateIndex
CREATE INDEX "stock_alert_status_idx" ON "stock_alert"("status");

-- CreateIndex
CREATE INDEX "stock_alert_productId_branchId_idx" ON "stock_alert"("productId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_order_stockAlertId_key" ON "purchase_order"("stockAlertId");

-- CreateIndex
CREATE INDEX "purchase_order_supplierId_idx" ON "purchase_order"("supplierId");

-- CreateIndex
CREATE INDEX "purchase_order_branchId_idx" ON "purchase_order"("branchId");

-- CreateIndex
CREATE INDEX "purchase_order_item_purchaseOrderId_idx" ON "purchase_order_item"("purchaseOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNo_key" ON "invoice"("invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_purchaseOrderId_key" ON "invoice"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "transfer_sourceBranchId_idx" ON "transfer"("sourceBranchId");

-- CreateIndex
CREATE INDEX "transfer_destinationBranchId_idx" ON "transfer"("destinationBranchId");

-- CreateIndex
CREATE INDEX "transfer_item_transferId_idx" ON "transfer_item"("transferId");

-- CreateIndex
CREATE UNIQUE INDEX "batch_batchNumber_key" ON "batch"("batchNumber");

-- CreateIndex
CREATE INDEX "batch_productId_idx" ON "batch"("productId");

-- CreateIndex
CREATE INDEX "batch_expiryDate_idx" ON "batch"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "OfflineCompany_code_key" ON "OfflineCompany"("code");

-- CreateIndex
CREATE INDEX "OfflineBranch_companyId_idx" ON "OfflineBranch"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "OfflineBranch_companyId_code_key" ON "OfflineBranch"("companyId", "code");

-- CreateIndex
CREATE INDEX "OfflineSyncLog_companyId_status_idx" ON "OfflineSyncLog"("companyId", "status");

-- CreateIndex
CREATE INDEX "OfflineSyncLog_branchId_status_idx" ON "OfflineSyncLog"("branchId", "status");

-- CreateIndex
CREATE INDEX "OfflineSyncLog_createdAt_idx" ON "OfflineSyncLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_authority_name_key" ON "ryzera_pos_authority"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_role_name_key" ON "ryzera_pos_role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_role_authority_roleId_authorityId_key" ON "ryzera_pos_role_authority"("roleId", "authorityId");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_info_user_id_key" ON "ryzera_pos_user_info"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_role_userId_roleId_key" ON "ryzera_pos_user_role"("userId", "roleId");

-- AddForeignKey
ALTER TABLE "ryzera_pos_sale" ADD CONSTRAINT "ryzera_pos_sale_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "ryzera_pos_branch"("branchId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_sale_item" ADD CONSTRAINT "ryzera_pos_sale_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_branch" ADD CONSTRAINT "ryzera_pos_branch_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ryzera_pos_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user" ADD CONSTRAINT "ryzera_pos_user_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ryzera_pos_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user" ADD CONSTRAINT "ryzera_pos_user_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_info" ADD CONSTRAINT "ryzera_pos_user_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_role" ADD CONSTRAINT "ryzera_pos_user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_role" ADD CONSTRAINT "ryzera_pos_user_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ryzera_pos_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_role_authority" ADD CONSTRAINT "ryzera_pos_role_authority_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ryzera_pos_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_role_authority" ADD CONSTRAINT "ryzera_pos_role_authority_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "ryzera_pos_authority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_log" ADD CONSTRAINT "ryzera_pos_user_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_log" ADD CONSTRAINT "ryzera_pos_user_log_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_inventory_log" ADD CONSTRAINT "ryzera_pos_inventory_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_inventory_log" ADD CONSTRAINT "ryzera_pos_inventory_log_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ryzera_pos_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySummary" ADD CONSTRAINT "DailySummary_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "ryzera_pos_branch"("branchId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_product" ADD CONSTRAINT "branch_product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_product" ADD CONSTRAINT "branch_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_branchProductId_fkey" FOREIGN KEY ("branchProductId") REFERENCES "branch_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alert" ADD CONSTRAINT "stock_alert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alert" ADD CONSTRAINT "stock_alert_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_stockAlertId_fkey" FOREIGN KEY ("stockAlertId") REFERENCES "stock_alert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_item" ADD CONSTRAINT "purchase_order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_item" ADD CONSTRAINT "purchase_order_item_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_sourceBranchId_fkey" FOREIGN KEY ("sourceBranchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_destinationBranchId_fkey" FOREIGN KEY ("destinationBranchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_item" ADD CONSTRAINT "transfer_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_item" ADD CONSTRAINT "transfer_item_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "transfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfflineBranch" ADD CONSTRAINT "OfflineBranch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "OfflineCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfflineSyncLog" ADD CONSTRAINT "OfflineSyncLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "OfflineCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfflineSyncLog" ADD CONSTRAINT "OfflineSyncLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "OfflineBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "OfflineCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "OfflineBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackupMetadata" ADD CONSTRAINT "BackupMetadata_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "OfflineCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackupMetadata" ADD CONSTRAINT "BackupMetadata_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "OfflineBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
