-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "user_type" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "log_action" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'ROLE_ASSIGNED', 'PASSWORD_CHANGED');

-- CreateEnum
CREATE TYPE "log_status" AS ENUM ('SUCCESS', 'FAILED');

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

-- CreateEnum
CREATE TYPE "bill_status" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "bill_payment_method" AS ENUM ('CASH', 'CARD', 'ONLINE', 'SPLIT');

-- CreateEnum
CREATE TYPE "sale_status" AS ENUM ('Pending', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');

-- CreateEnum
CREATE TYPE "return_type" AS ENUM ('Full', 'Partial');

-- CreateEnum
CREATE TYPE "refund_method" AS ENUM ('Cash', 'Card', 'Wallet');

-- CreateEnum
CREATE TYPE "return_status" AS ENUM ('Pending', 'Completed', 'Rejected');

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
CREATE TABLE "ryzera_pos_branch" (
    "branch_id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "manager_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_branch_pkey" PRIMARY KEY ("branch_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_user" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "branch_id" INTEGER,
    "user_type" "user_type" NOT NULL DEFAULT 'STAFF',
    "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_failed_login" TIMESTAMP(3),
    "account_locked_until" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_user_info" (
    "user_info_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone_number" TEXT,
    "address" TEXT,
    "profile_picture" TEXT,

    CONSTRAINT "ryzera_pos_user_info_pkey" PRIMARY KEY ("user_info_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_role" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ryzera_pos_role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_authority" (
    "authority_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ryzera_pos_authority_pkey" PRIMARY KEY ("authority_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_user_role" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_role_authority" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "authorityId" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_role_authority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_user_log" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "branch_id" INTEGER,
    "action" "log_action" NOT NULL,
    "status" "log_status" NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_info" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_user_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ryzera_pos_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_product" (
    "product_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2),
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "min_quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" "unit_of_measure" NOT NULL DEFAULT 'PCS',
    "status" "product_status" NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "company_id" INTEGER NOT NULL,
    "branch_id" INTEGER,
    "category_id" INTEGER,
    "supplier_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_branch_product" (
    "id" SERIAL NOT NULL,
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "reservedQty" INTEGER NOT NULL DEFAULT 0,
    "branch_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_branch_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_inventory_log" (
    "id" SERIAL NOT NULL,
    "action" "inventory_action" NOT NULL,
    "changeQty" INTEGER NOT NULL,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "branchProductId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_inventory_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_stock_alert" (
    "id" SERIAL NOT NULL,
    "status" "alert_status" NOT NULL DEFAULT 'PENDING',
    "stockQty" INTEGER NOT NULL,
    "minStock" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_stock_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_purchase_order" (
    "id" SERIAL NOT NULL,
    "status" "purchase_order_status" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "supplier_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "stockAlertId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_purchase_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_purchase_order_item" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "product_id" INTEGER NOT NULL,
    "purchaseOrder_id" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_purchase_order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_purchase_invoice" (
    "id" SERIAL NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "status" "invoice_status" NOT NULL DEFAULT 'UNPAID',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "purchaseOrder_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_purchase_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_transfer" (
    "id" SERIAL NOT NULL,
    "status" "transfer_status" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "sourceBranch_id" INTEGER NOT NULL,
    "destinationBranch_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_transfer_item" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "transfer_id" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_transfer_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_batch" (
    "id" SERIAL NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "manufactureDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_bill" (
    "bill_id" SERIAL NOT NULL,
    "bill_number" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "cashier_id" INTEGER NOT NULL,
    "status" "bill_status" NOT NULL DEFAULT 'PENDING',
    "payment_method" "bill_payment_method" NOT NULL DEFAULT 'CASH',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_bill_pkey" PRIMARY KEY ("bill_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_bill_item" (
    "bill_item_id" SERIAL NOT NULL,
    "bill_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ryzera_pos_bill_item_pkey" PRIMARY KEY ("bill_item_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sale" (
    "sale_id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "sale_status" "sale_status" NOT NULL DEFAULT 'Pending',
    "payment_status" "payment_status" NOT NULL DEFAULT 'Pending',
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_sale_pkey" PRIMARY KEY ("sale_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sale_item" (
    "sale_item_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "product_name" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2) NOT NULL,
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sale_id" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_sale_item_pkey" PRIMARY KEY ("sale_item_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_payment" (
    "payment_id" SERIAL NOT NULL,
    "payment_method" "bill_payment_method" NOT NULL,
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "payment_status" "payment_status" NOT NULL DEFAULT 'Pending',
    "transaction_reference" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sale_id" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_return" (
    "return_id" SERIAL NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_type" "return_type" NOT NULL,
    "return_amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "refund_method" "refund_method" NOT NULL,
    "status" "return_status" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sale_id" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_return_pkey" PRIMARY KEY ("return_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_return_item" (
    "return_item_id" SERIAL NOT NULL,
    "quantity_returned" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "refund_amount" DECIMAL(10,2) NOT NULL,
    "item_condition" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_id" INTEGER NOT NULL,
    "sale_item_id" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_return_item_pkey" PRIMARY KEY ("return_item_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sync_log" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER,
    "entity" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "syncedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_sync_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sync_device" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'POS',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "branch_id" INTEGER NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_sync_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sync_setting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "branch_id" INTEGER,
    "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_sync_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sync_conflict" (
    "id" SERIAL NOT NULL,
    "syncLog_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "clientData" JSONB,
    "serverData" JSONB,
    "resolution" TEXT,
    "resolvedBy" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_sync_conflict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sync_backup" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_sync_backup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sync_backup_schedule" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "frequency" TEXT NOT NULL,
    "next_run" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ryzera_pos_sync_backup_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sync_health_metric" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "latency" DOUBLE PRECISION NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,
    "uptime" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_sync_health_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_sync_audit_log" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "user_id" INTEGER,
    "branch_id" INTEGER,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_sync_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_daily_summary" (
    "id" SERIAL NOT NULL,
    "summaryDate" TIMESTAMP(3) NOT NULL,
    "totalSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalItemsSold" INTEGER NOT NULL DEFAULT 0,
    "totalDiscounts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReturns" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCustomers" INTEGER NOT NULL DEFAULT 0,
    "netProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "branch_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_daily_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_saved_report_config" (
    "id" SERIAL NOT NULL,
    "configName" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "branch_id" INTEGER,
    "categoryId" INTEGER,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_saved_report_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_report_schedule" (
    "id" SERIAL NOT NULL,
    "scheduleName" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "branch_id" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nextRunAt" TIMESTAMP(3),
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_report_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_report_delivery" (
    "id" SERIAL NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "failureReason" TEXT,
    "reportFileUrl" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schedule_id" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_report_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_audit_log" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reportType" TEXT,
    "filtersUsed" TEXT,
    "branchName" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_kpi_target" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL DEFAULT 0,
    "period_type" TEXT NOT NULL,
    "target_amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ryzera_pos_kpi_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_kpi_margin_target" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL DEFAULT 0,
    "target_gross_margin" DECIMAL(5,2) NOT NULL,
    "target_net_margin" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "ryzera_pos_kpi_margin_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_kpi_inventory_threshold" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL DEFAULT 0,
    "default_reorder_level" INTEGER NOT NULL DEFAULT 20,
    "critical_stock_level" INTEGER NOT NULL DEFAULT 5,
    "zero_sales_hours" INTEGER NOT NULL DEFAULT 24,

    CONSTRAINT "ryzera_pos_kpi_inventory_threshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_kpi_notification_rule" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL DEFAULT 0,
    "daily_target_midday" BOOLEAN NOT NULL DEFAULT true,
    "unusual_hourly_drop" BOOLEAN NOT NULL DEFAULT true,
    "zero_sales_product" BOOLEAN NOT NULL DEFAULT true,
    "low_stock_alert" BOOLEAN NOT NULL DEFAULT true,
    "out_of_stock_alert" BOOLEAN NOT NULL DEFAULT true,
    "daily_summary_notification" BOOLEAN NOT NULL DEFAULT true,
    "weekly_performance_summary" BOOLEAN NOT NULL DEFAULT false,
    "margin_below_target" BOOLEAN NOT NULL DEFAULT true,
    "check_frequency_minutes" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "ryzera_pos_kpi_notification_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_kpi_report_default" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL DEFAULT 0,
    "default_date_range" TEXT NOT NULL DEFAULT 'LAST_30_DAYS',
    "default_branch_view" TEXT NOT NULL DEFAULT 'ALL',
    "show_target_progress" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ryzera_pos_kpi_report_default_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_notification" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_scheduled_report" (
    "id" SERIAL NOT NULL,
    "report_name" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "next_run_date" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_scheduled_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_company_code_key" ON "ryzera_pos_company"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_branch_company_id_code_key" ON "ryzera_pos_branch"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_username_key" ON "ryzera_pos_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_info_user_id_key" ON "ryzera_pos_user_info"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_role_name_key" ON "ryzera_pos_role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_authority_name_key" ON "ryzera_pos_authority"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_role_userId_roleId_key" ON "ryzera_pos_user_role"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_role_authority_roleId_authorityId_key" ON "ryzera_pos_role_authority"("roleId", "authorityId");

-- CreateIndex
CREATE INDEX "ryzera_pos_supplier_name_idx" ON "ryzera_pos_supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_category_name_key" ON "ryzera_pos_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_product_sku_key" ON "ryzera_pos_product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_product_barcode_key" ON "ryzera_pos_product"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_branch_product_branch_id_product_id_key" ON "ryzera_pos_branch_product"("branch_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_purchase_order_stockAlertId_key" ON "ryzera_pos_purchase_order"("stockAlertId");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_purchase_invoice_invoiceNo_key" ON "ryzera_pos_purchase_invoice"("invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_purchase_invoice_purchaseOrder_id_key" ON "ryzera_pos_purchase_invoice"("purchaseOrder_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_batch_batchNumber_key" ON "ryzera_pos_batch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_bill_bill_number_key" ON "ryzera_pos_bill"("bill_number");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_sale_invoice_number_key" ON "ryzera_pos_sale"("invoice_number");

-- CreateIndex
CREATE INDEX "ryzera_pos_sync_log_branch_id_status_idx" ON "ryzera_pos_sync_log"("branch_id", "status");

-- CreateIndex
CREATE INDEX "ryzera_pos_sync_log_status_idx" ON "ryzera_pos_sync_log"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_sync_setting_branch_id_key_key" ON "ryzera_pos_sync_setting"("branch_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_sync_conflict_syncLog_id_key" ON "ryzera_pos_sync_conflict"("syncLog_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_daily_summary_summaryDate_branch_id_key" ON "ryzera_pos_daily_summary"("summaryDate", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_kpi_target_period_type_branch_id_key" ON "ryzera_pos_kpi_target"("period_type", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_kpi_margin_target_branch_id_key" ON "ryzera_pos_kpi_margin_target"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_kpi_inventory_threshold_branch_id_key" ON "ryzera_pos_kpi_inventory_threshold"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_kpi_notification_rule_branch_id_key" ON "ryzera_pos_kpi_notification_rule"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_kpi_report_default_branch_id_key" ON "ryzera_pos_kpi_report_default"("branch_id");

-- AddForeignKey
ALTER TABLE "ryzera_pos_branch" ADD CONSTRAINT "ryzera_pos_branch_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ryzera_pos_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user" ADD CONSTRAINT "ryzera_pos_user_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ryzera_pos_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user" ADD CONSTRAINT "ryzera_pos_user_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_info" ADD CONSTRAINT "ryzera_pos_user_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_role" ADD CONSTRAINT "ryzera_pos_user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_role" ADD CONSTRAINT "ryzera_pos_user_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ryzera_pos_role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_role_authority" ADD CONSTRAINT "ryzera_pos_role_authority_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ryzera_pos_role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_role_authority" ADD CONSTRAINT "ryzera_pos_role_authority_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "ryzera_pos_authority"("authority_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_log" ADD CONSTRAINT "ryzera_pos_user_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_log" ADD CONSTRAINT "ryzera_pos_user_log_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_product" ADD CONSTRAINT "ryzera_pos_product_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ryzera_pos_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_product" ADD CONSTRAINT "ryzera_pos_product_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_product" ADD CONSTRAINT "ryzera_pos_product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ryzera_pos_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_product" ADD CONSTRAINT "ryzera_pos_product_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "ryzera_pos_supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_branch_product" ADD CONSTRAINT "ryzera_pos_branch_product_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_branch_product" ADD CONSTRAINT "ryzera_pos_branch_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ryzera_pos_product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_inventory_log" ADD CONSTRAINT "ryzera_pos_inventory_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_inventory_log" ADD CONSTRAINT "ryzera_pos_inventory_log_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ryzera_pos_product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_inventory_log" ADD CONSTRAINT "ryzera_pos_inventory_log_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_inventory_log" ADD CONSTRAINT "ryzera_pos_inventory_log_branchProductId_fkey" FOREIGN KEY ("branchProductId") REFERENCES "ryzera_pos_branch_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_stock_alert" ADD CONSTRAINT "ryzera_pos_stock_alert_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ryzera_pos_product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_stock_alert" ADD CONSTRAINT "ryzera_pos_stock_alert_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_purchase_order" ADD CONSTRAINT "ryzera_pos_purchase_order_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "ryzera_pos_supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_purchase_order" ADD CONSTRAINT "ryzera_pos_purchase_order_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_purchase_order" ADD CONSTRAINT "ryzera_pos_purchase_order_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_purchase_order" ADD CONSTRAINT "ryzera_pos_purchase_order_stockAlertId_fkey" FOREIGN KEY ("stockAlertId") REFERENCES "ryzera_pos_stock_alert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_purchase_order_item" ADD CONSTRAINT "ryzera_pos_purchase_order_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ryzera_pos_product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_purchase_order_item" ADD CONSTRAINT "ryzera_pos_purchase_order_item_purchaseOrder_id_fkey" FOREIGN KEY ("purchaseOrder_id") REFERENCES "ryzera_pos_purchase_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_purchase_invoice" ADD CONSTRAINT "ryzera_pos_purchase_invoice_purchaseOrder_id_fkey" FOREIGN KEY ("purchaseOrder_id") REFERENCES "ryzera_pos_purchase_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_transfer" ADD CONSTRAINT "ryzera_pos_transfer_sourceBranch_id_fkey" FOREIGN KEY ("sourceBranch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_transfer" ADD CONSTRAINT "ryzera_pos_transfer_destinationBranch_id_fkey" FOREIGN KEY ("destinationBranch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_transfer" ADD CONSTRAINT "ryzera_pos_transfer_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_transfer_item" ADD CONSTRAINT "ryzera_pos_transfer_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ryzera_pos_product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_transfer_item" ADD CONSTRAINT "ryzera_pos_transfer_item_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "ryzera_pos_transfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_batch" ADD CONSTRAINT "ryzera_pos_batch_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ryzera_pos_product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_bill" ADD CONSTRAINT "ryzera_pos_bill_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ryzera_pos_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_bill" ADD CONSTRAINT "ryzera_pos_bill_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_bill" ADD CONSTRAINT "ryzera_pos_bill_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_bill_item" ADD CONSTRAINT "ryzera_pos_bill_item_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "ryzera_pos_bill"("bill_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_bill_item" ADD CONSTRAINT "ryzera_pos_bill_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ryzera_pos_product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_sale_item" ADD CONSTRAINT "ryzera_pos_sale_item_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "ryzera_pos_sale"("sale_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_sale_item" ADD CONSTRAINT "ryzera_pos_sale_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ryzera_pos_product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_payment" ADD CONSTRAINT "ryzera_pos_payment_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "ryzera_pos_sale"("sale_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_return" ADD CONSTRAINT "ryzera_pos_return_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "ryzera_pos_sale"("sale_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_return_item" ADD CONSTRAINT "ryzera_pos_return_item_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "ryzera_pos_return"("return_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_return_item" ADD CONSTRAINT "ryzera_pos_return_item_sale_item_id_fkey" FOREIGN KEY ("sale_item_id") REFERENCES "ryzera_pos_sale_item"("sale_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_sync_log" ADD CONSTRAINT "ryzera_pos_sync_log_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_sync_device" ADD CONSTRAINT "ryzera_pos_sync_device_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_sync_setting" ADD CONSTRAINT "ryzera_pos_sync_setting_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_sync_conflict" ADD CONSTRAINT "ryzera_pos_sync_conflict_syncLog_id_fkey" FOREIGN KEY ("syncLog_id") REFERENCES "ryzera_pos_sync_log"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_sync_backup" ADD CONSTRAINT "ryzera_pos_sync_backup_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_sync_backup_schedule" ADD CONSTRAINT "ryzera_pos_sync_backup_schedule_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_sync_health_metric" ADD CONSTRAINT "ryzera_pos_sync_health_metric_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_daily_summary" ADD CONSTRAINT "ryzera_pos_daily_summary_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_saved_report_config" ADD CONSTRAINT "ryzera_pos_saved_report_config_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_report_schedule" ADD CONSTRAINT "ryzera_pos_report_schedule_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_report_delivery" ADD CONSTRAINT "ryzera_pos_report_delivery_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "ryzera_pos_report_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_audit_log" ADD CONSTRAINT "ryzera_pos_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
