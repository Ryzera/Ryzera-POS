import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // adjust to your actual PrismaService path
import { AuditLogQueryDto, PaginatedAuditLogDto } from './auditlog.dto';
import { Prisma } from '@ryzera/pos-database'; // adjust import path to your Prisma client output

@Injectable()
export class AuditLogService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * getLogs(userId) — the method mentioned in your notes.
     * Extended here with filters + pagination so it maps directly to the
     * "User → View Activity / Audit Logs" screen.
     */
    async getLogs(userId: number, query: AuditLogQueryDto): Promise<PaginatedAuditLogDto> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }

        const { action, status, from, to, page, limit } = query;

        const where: Prisma.UserLogWhereInput = {
            userId,
            ...(action && { action }),
            ...(status && { status }),
            ...((from || to) && {
                created_at: {
                    ...(from && { gte: new Date(from) }),
                    ...(to && { lte: new Date(to) }),
                },
            }),
        };

        const [rows, total] = await this.prisma.$transaction([
            this.prisma.userLog.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { branch: { select: { name: true } } },
            }),
            this.prisma.userLog.count({ where }),
        ]);

        return {
            data: rows.map((row) => ({
                id: row.id,
                action: row.action,
                status: row.status,
                ip_address: row.ip_address,
                user_agent: row.user_agent,
                device_info: row.device_info,
                created_at: row.created_at,
                branch_name: row.branch?.name ?? null,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
}