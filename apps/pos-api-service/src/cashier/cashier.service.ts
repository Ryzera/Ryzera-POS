import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // ⚠️ path eka verify karanna
import * as bcrypt from 'bcryptjs';
import { CreateCashierDto } from './dto/create-cashier.schema';
import { UpdateCashierDto } from './dto/update-cashier.schema';

@Injectable()
export class CashierService {
    constructor(private prisma: PrismaService) {}

    // ── List cashiers — role-scoped ──────────────────────
    async findAll(userType: string, userBranchId: number | null, userCompanyId: number) {
        const where: any = { company_id: userCompanyId };

        // Non-admin (Branch Manager/Staff) → own branch witharai
        if (userType !== 'ADMIN') {
            where.branch_id = userBranchId;
        }

        return this.prisma.user.findMany({
            where,
            include: { user_info: true, branch: true },
            orderBy: { created_at: 'desc' },
        });
    }

    // ── Filter by specific branch (Admin only) ────────────
    async findByBranch(branchId: number, userCompanyId: number) {
        return this.prisma.user.findMany({
            where: { company_id: userCompanyId, branch_id: branchId },
            include: { user_info: true, branch: true },
            orderBy: { created_at: 'desc' },
        });
    }

    // ── Create cashier ────────────────────────────────────
    async create(dto: CreateCashierDto, userCompanyId: number) {
        const existing = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });
        if (existing) throw new ConflictException('Username already exists');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.user.create({
            data: {
                username:   dto.username,
                password:   hashedPassword,
                company_id: userCompanyId,
                branch_id:  dto.branch_id,
                user_type:  dto.user_type,
                status:     'ACTIVE',
                updated_at: new Date(),
                user_info: {
                    create: {
                        first_name:   dto.first_name,
                        last_name:    dto.last_name,
                        email:        dto.email,
                        phone_number: dto.phone_number,
                        address:      dto.address,
                    },
                },
            },
            include: { user_info: true, branch: true },
        });
    }

    // ── Update cashier ────────────────────────────────────
    async update(id: number, dto: UpdateCashierDto) {
        const user = await this.prisma.user.findUnique({ where: { user_id: id } });
        if (!user) throw new NotFoundException('Cashier not found');

        return this.prisma.user.update({
            where: { user_id: id },
            data: {
                branch_id:  dto.branch_id,
                status:     dto.status,
                updated_at: new Date(),
                user_info: {
                    update: {
                        first_name:   dto.first_name,
                        last_name:    dto.last_name,
                        email:        dto.email,
                        phone_number: dto.phone_number,
                        address:      dto.address,
                    },
                },
            },
            include: { user_info: true, branch: true },
        });
    }

    // ── Soft delete (deactivate) — hard delete NEVER ──────
    async deactivate(id: number) {
        const user = await this.prisma.user.findUnique({ where: { user_id: id } });
        if (!user) throw new NotFoundException('Cashier not found');

        return this.prisma.user.update({
            where: { user_id: id },
            data: { status: 'INACTIVE', updated_at: new Date() },
        });
    }
}