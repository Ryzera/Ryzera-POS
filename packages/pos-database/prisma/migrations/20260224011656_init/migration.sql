-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "user_type" AS ENUM ('ADMIN', 'STAFF');
CREATE TYPE "log_action" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'ROLE_ASSIGNED', 'PASSWORD_CHANGED');
CREATE TYPE "log_status" AS ENUM ('SUCCESS', 'FAILED');

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
                                        "id" SERIAL NOT NULL,
                                        "user_id" INTEGER NOT NULL,
                                        "first_name" TEXT NOT NULL,
                                        "last_name" TEXT NOT NULL,
                                        "email" TEXT,
                                        "phone_number" TEXT,
                                        "address" TEXT,
                                        "profile_picture" TEXT,
                                        CONSTRAINT "ryzera_pos_user_info_pkey" PRIMARY KEY ("id")
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
                                        "user_role_id" SERIAL NOT NULL,
                                        "userId" INTEGER NOT NULL,
                                        "roleId" INTEGER NOT NULL,
                                        CONSTRAINT "ryzera_pos_user_role_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_role_authority" (
                                             "role_authority_id" SERIAL NOT NULL,
                                             "roleId" INTEGER NOT NULL,
                                             "authorityId" INTEGER NOT NULL,
                                             CONSTRAINT "ryzera_pos_role_authority_pkey" PRIMARY KEY ("role_authority_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_user_log" (
                                       "log_id" SERIAL NOT NULL,
                                       "userId" INTEGER NOT NULL,
                                       "branch_id" INTEGER,
                                       "action" "log_action" NOT NULL,
                                       "status" "log_status" NOT NULL,
                                       "ip_address" TEXT,
                                       "user_agent" TEXT,
                                       "device_info" TEXT,
                                       "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                       CONSTRAINT "ryzera_pos_user_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_product" (
                                      "product_id" SERIAL NOT NULL,
                                      "name" TEXT NOT NULL,
                                      "code" TEXT NOT NULL,
                                      "description" TEXT,
                                      "price" DECIMAL(10,2) NOT NULL,
                                      "cost_price" DECIMAL(10,2),
                                      "quantity" INTEGER NOT NULL DEFAULT 0,
                                      "min_quantity" INTEGER NOT NULL DEFAULT 0,
                                      "company_id" INTEGER NOT NULL,
                                      "branch_id" INTEGER,
                                      "is_active" BOOLEAN NOT NULL DEFAULT true,
                                      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                      "updated_at" TIMESTAMP(3) NOT NULL,
                                      CONSTRAINT "ryzera_pos_product_pkey" PRIMARY KEY ("product_id")
);

ALTER TABLE "ryzera_pos_product" ADD CONSTRAINT "ryzera_pos_product_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ryzera_pos_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_product" ADD CONSTRAINT "ryzera_pos_product_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_company_code_key" ON "ryzera_pos_company"("code");
CREATE UNIQUE INDEX "ryzera_pos_branch_company_id_code_key" ON "ryzera_pos_branch"("company_id", "code");
CREATE UNIQUE INDEX "ryzera_pos_user_username_key" ON "ryzera_pos_user"("username");
CREATE UNIQUE INDEX "ryzera_pos_user_info_user_id_key" ON "ryzera_pos_user_info"("user_id");
CREATE UNIQUE INDEX "ryzera_pos_role_name_key" ON "ryzera_pos_role"("name");
CREATE UNIQUE INDEX "ryzera_pos_authority_name_key" ON "ryzera_pos_authority"("name");
CREATE UNIQUE INDEX "ryzera_pos_user_role_userId_roleId_key" ON "ryzera_pos_user_role"("userId", "roleId");
CREATE UNIQUE INDEX "ryzera_pos_role_authority_roleId_authorityId_key" ON "ryzera_pos_role_authority"("roleId", "authorityId");

-- AddForeignKey
ALTER TABLE "ryzera_pos_branch" ADD CONSTRAINT "ryzera_pos_branch_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ryzera_pos_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_user" ADD CONSTRAINT "ryzera_pos_user_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ryzera_pos_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_user" ADD CONSTRAINT "ryzera_pos_user_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_user_info" ADD CONSTRAINT "ryzera_pos_user_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_user_role" ADD CONSTRAINT "ryzera_pos_user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_user_role" ADD CONSTRAINT "ryzera_pos_user_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ryzera_pos_role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_role_authority" ADD CONSTRAINT "ryzera_pos_role_authority_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ryzera_pos_role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_role_authority" ADD CONSTRAINT "ryzera_pos_role_authority_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "ryzera_pos_authority"("authority_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_user_log" ADD CONSTRAINT "ryzera_pos_user_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_user_log" ADD CONSTRAINT "ryzera_pos_user_log_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "bill_status" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "payment_method" AS ENUM ('CASH', 'CARD', 'ONLINE');

CREATE TABLE "ryzera_pos_bill" (
                                   "bill_id" SERIAL NOT NULL,
                                   "bill_number" TEXT NOT NULL,
                                   "company_id" INTEGER NOT NULL,
                                   "branch_id" INTEGER NOT NULL,
                                   "cashier_id" INTEGER NOT NULL,
                                   "status" "bill_status" NOT NULL DEFAULT 'PENDING',
                                   "payment_method" "payment_method" NOT NULL DEFAULT 'CASH',
                                   "subtotal" DECIMAL(10,2) NOT NULL,
                                   "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
                                   "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
                                   "total" DECIMAL(10,2) NOT NULL,
                                   "notes" TEXT,
                                   "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   "updated_at" TIMESTAMP(3) NOT NULL,
                                   CONSTRAINT "ryzera_pos_bill_pkey" PRIMARY KEY ("bill_id")
);

CREATE TABLE "ryzera_pos_bill_item" (
                                        "bill_item_id" SERIAL NOT NULL,
                                        "bill_id" INTEGER NOT NULL,
                                        "product_id" INTEGER NOT NULL,
                                        "quantity" INTEGER NOT NULL,
                                        "unit_price" DECIMAL(10,2) NOT NULL,
                                        "total" DECIMAL(10,2) NOT NULL,
                                        CONSTRAINT "ryzera_pos_bill_item_pkey" PRIMARY KEY ("bill_item_id")
);

CREATE UNIQUE INDEX "ryzera_pos_bill_bill_number_key" ON "ryzera_pos_bill"("bill_number");

ALTER TABLE "ryzera_pos_bill" ADD CONSTRAINT "ryzera_pos_bill_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ryzera_pos_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_bill" ADD CONSTRAINT "ryzera_pos_bill_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "ryzera_pos_branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_bill" ADD CONSTRAINT "ryzera_pos_bill_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_bill_item" ADD CONSTRAINT "ryzera_pos_bill_item_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "ryzera_pos_bill"("bill_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ryzera_pos_bill_item" ADD CONSTRAINT "ryzera_pos_bill_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ryzera_pos_product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;