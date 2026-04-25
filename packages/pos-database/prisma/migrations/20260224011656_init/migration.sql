-- CreateTable
CREATE TABLE "ryzera_pos_user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_user_info" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryzera_pos_user_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_authority" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_authority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_user_role" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_role_authority" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_role_authority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_user_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_user_log_pkey" PRIMARY KEY ("id")
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
    "userId" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_username_key" ON "ryzera_pos_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_info_userId_key" ON "ryzera_pos_user_info"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_info_email_key" ON "ryzera_pos_user_info"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_role_name_key" ON "ryzera_pos_role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_authority_name_key" ON "ryzera_pos_authority"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_role_userId_roleId_key" ON "ryzera_pos_user_role"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_role_authority_roleId_authorityId_key" ON "ryzera_pos_role_authority"("roleId", "authorityId");

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_info" ADD CONSTRAINT "ryzera_pos_user_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_role" ADD CONSTRAINT "ryzera_pos_user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_role" ADD CONSTRAINT "ryzera_pos_user_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ryzera_pos_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_role_authority" ADD CONSTRAINT "ryzera_pos_role_authority_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ryzera_pos_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_role_authority" ADD CONSTRAINT "ryzera_pos_role_authority_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "ryzera_pos_authority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_log" ADD CONSTRAINT "ryzera_pos_user_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_inventory_log" ADD CONSTRAINT "ryzera_pos_inventory_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ryzera_pos_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_inventory_log" ADD CONSTRAINT "ryzera_pos_inventory_log_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ryzera_pos_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
