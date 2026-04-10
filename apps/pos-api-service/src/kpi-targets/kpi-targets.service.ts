import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKpiTargetDto } from './schemas/create-kpi-target.schema';

@Injectable()
export class KpiTargetsService {
    constructor(private readonly prisma: PrismaService) {}

    async setTarget(dto: CreateKpiTargetDto) {
        return this.prisma.kpiTarget.upsert({
            where: {
                period_type_branch_id: {
                    period_type: dto.period_type,
                    branch_id: dto.branch_id ?? 0,
                },
            },
            update: { target_amount: dto.target_amount },
            create: {
                period_type: dto.period_type,
                target_amount: dto.target_amount,
                branch_id: dto.branch_id ?? 0,
            },
        });
    }

    async getTargetProgress(branchId?: number) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [target, salesResult] = await Promise.all([
            this.prisma.kpiTarget.findFirst({
                where: {
                    period_type: 'Monthly',
                    branch_id: branchId ?? 0,
                },
            }),
            this.prisma.ryzera_pos_sale.aggregate({
                _sum: { total_amount: true },
                where: {
                    sale_date: { gte: startOfMonth },
                    ...(branchId ? { branchId } : {}),
                },
            }),
        ]);

        const current = Number(salesResult._sum.total_amount ?? 0);
        const targetAmount = Number(target?.target_amount ?? 0);
        const percentage = targetAmount > 0 ? Math.round((current / targetAmount) * 100) : 0;
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - today.getDate();
        const amountRemaining = Math.max(0, targetAmount - current);

        return { current, targetAmount, percentage, daysRemaining, amountRemaining };
    }
}