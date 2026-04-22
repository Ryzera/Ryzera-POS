-- CreateTable
CREATE TABLE "ryzera_pos_notification" (
    "notification_id" SERIAL NOT NULL,
    "branch_id" INTEGER,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryzera_pos_notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "ryzera_pos_kpi_target" (
    "kpi_id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL DEFAULT 0,
    "period_type" TEXT NOT NULL,
    "target_amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ryzera_pos_kpi_target_pkey" PRIMARY KEY ("kpi_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ryzera_pos_kpi_target_period_type_branch_id_key" ON "ryzera_pos_kpi_target"("period_type", "branch_id");
