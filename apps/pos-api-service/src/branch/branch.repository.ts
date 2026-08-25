import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';
import type { BranchListQueryDto } from './branch-query.schema';

const LIST_SELECT = {
    id: true,
    name: true,
    code: true,
    address: true,
    phone: true,
    email: true,
    city: true,
    manager_name: true,
    is_active: true,
    created_at: true,
    updated_at: true,
} satisfies Prisma.BranchSelect;

const DETAIL_INCLUDE = {
    _count: {
        select: { branchProducts: true, purchaseOrders: true },
    },
    users: {
        select: { id: true, user_type: true, info: { select: { first_name: true, last_name: true, email: true } } },
    },
} satisfies Prisma.BranchInclude;

@Injectable()
export class BranchRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: BranchListQueryDto) {
        const { limit, page, search, status } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.BranchWhereInput = {
            ...(status !== undefined && { is_active: status === 'ACTIVE' }),
            ...(search && {
                name: { contains: search, mode: Prisma.QueryMode.insensitive },
            }),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.branch.findMany({
                orderBy: { created_at: 'desc' },
                select: LIST_SELECT,
                skip,
                take: limit,
                where,
            }),
            this.prisma.branch.count({ where }),
        ]);

        return { items, limit, page, total };
    }

    findById(id: number) {
        return this.prisma.branch.findUnique({
            include: DETAIL_INCLUDE,
            where: { id },
        });
    }

    findByCode(companyId: number, code: string) {
        return this.prisma.branch.findUnique({
            where: { company_id_code: { company_id: companyId, code } },
        });
    }

    findByName(name: string, excludeId?: number) {
        return this.prisma.branch.findFirst({
            select: { id: true, name: true, is_active: true },
            where: {
                name: { equals: name, mode: 'insensitive' },
                is_active: true,
                ...(excludeId && { id: { not: excludeId } }),
            },
        });
    }

    create(dto: {
        name: string;
        code: string;
        company_id: number;
        address?: string;
        phone?: string;
        email?: string;
        city?: string;
        manager_name?: string;
    }) {
        return this.prisma.branch.create({
            data: dto,
            select: LIST_SELECT,
        });
    }

    update(
        id: number,
        dto: Partial<{
            name: string;
            code: string;
            address: string;
            phone: string;
            email: string;
            city: string;
            manager_name: string;
            is_active: boolean;
        }>,
    ) {
        return this.prisma.branch.update({
            data: dto,
            select: LIST_SELECT,
            where: { id },
        });
    }

    softDelete(id: number) {
        return this.prisma.branch.update({
            data: { is_active: false },
            select: LIST_SELECT,
            where: { id },
        });
    }

    reactivate(id: number) {
        return this.prisma.branch.update({
            data: { is_active: true },
            select: LIST_SELECT,
            where: { id },
        });
    }

    delete(id: number) {
        return this.prisma.branch.delete({ where: { id } });
    }
}
