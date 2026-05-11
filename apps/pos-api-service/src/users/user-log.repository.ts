import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogAction, LogStatus } from '@ryzera/pos-database';

@Injectable()
export class UserLogRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        userId: number;
        branch_id?: number;
        action: LogAction;
        status: LogStatus;
        ip_address?: string;
        user_agent?: string;
        device_info?: string;
    }) {
        return this.prisma.userLog.create({ data });
    }

    async findByUser(userId: number) {
        return this.prisma.userLog.findMany({
            where: { userId },
            orderBy: { created_at: 'desc' },
            take: 50,
        });
    }
}