-- CreateTable
CREATE TABLE "ryzera_pos_user" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL,
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
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "profile_picture" TEXT,

    CONSTRAINT "ryzera_pos_user_info_pkey" PRIMARY KEY ("user_info_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_role" (
    "role_id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ryzera_pos_role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_authority" (
    "authority_id" SERIAL NOT NULL,
    "authority_name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ryzera_pos_authority_pkey" PRIMARY KEY ("authority_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_user_role" (
    "user_role_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_user_role_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_role_authority" (
    "role_authority_id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "authority_id" INTEGER NOT NULL,

    CONSTRAINT "ryzera_pos_role_authority_pkey" PRIMARY KEY ("role_authority_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_user_log" (
    "log_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT NOT NULL,
    "device_info" TEXT NOT NULL,

    CONSTRAINT "ryzera_pos_user_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_username_key" ON "ryzera_pos_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_info_user_id_key" ON "ryzera_pos_user_info"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_user_info_email_key" ON "ryzera_pos_user_info"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_role_role_name_key" ON "ryzera_pos_role"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_authority_authority_name_key" ON "ryzera_pos_authority"("authority_name");

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_info" ADD CONSTRAINT "ryzera_pos_user_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_role" ADD CONSTRAINT "ryzera_pos_user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_role" ADD CONSTRAINT "ryzera_pos_user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "ryzera_pos_role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_role_authority" ADD CONSTRAINT "ryzera_pos_role_authority_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "ryzera_pos_role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_role_authority" ADD CONSTRAINT "ryzera_pos_role_authority_authority_id_fkey" FOREIGN KEY ("authority_id") REFERENCES "ryzera_pos_authority"("authority_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryzera_pos_user_log" ADD CONSTRAINT "ryzera_pos_user_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ryzera_pos_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
