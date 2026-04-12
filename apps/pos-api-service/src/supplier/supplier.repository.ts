import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@ryzera/pos-database';
import type { CreateSupplierDto, UpdateSupplierDto } from '@ryzera/pos-schema';

import { SupplierListQueryDto } from './supplier-query.schema';

const LIST_SELECT = {
    id:           true,
    name:         true,
    contactName:  true,
    email:        true,
    phone:        true,
    isActive:     true,
    leadTimeDays: true,
    createdAt:    true,
} satisfies Prisma.SupplierSelect;

const DETAIL_INCLUDE = {
    _count: { select: { products: true, purchaseOrders: true } },
} satisfies Prisma.SupplierInclude;

@Injectable()
export class SupplierRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: SupplierListQueryDto) {
        const { page, limit, search, isActive } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.SupplierWhereInput = {
            ...(isActive !== undefined && { isActive }),
            ...(search && {
                OR: [
                    { name:        { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { contactName: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { email:       { contains: search, mode: Prisma.QueryMode.insensitive } },
                ],
            }),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.supplier.findMany({
                select: LIST_SELECT,
                orderBy: { name: 'asc' },
                where,
                skip,
                take: limit,
            }),
            this.prisma.supplier.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    findById(id: string) {
        return this.prisma.supplier.findUnique({
            where: { id },
            include: DETAIL_INCLUDE,
        });
    }

    findByName(name: string, excludeId?: string) {
        return this.prisma.supplier.findFirst({
            select: { id: true, name: true },
            where: {
                name: { equals: name, mode: 'insensitive' },
                isActive: true,
                ...(excludeId && { id: { not: excludeId } }),
            },
        });
    }

    create(dto: CreateSupplierDto) {
        return this.prisma.supplier.create({
            data: dto,
            select: LIST_SELECT,
        });
    }

    update(id: string, dto: UpdateSupplierDto) {
        return this.prisma.supplier.update({
            where: { id },
            data: dto,
            select: LIST_SELECT,
        });
    }

    // Soft delete — marks supplier as inactive
    softDelete(id: string) {
        return this.prisma.supplier.update({
            where: { id },
            data: { isActive: false },
            select: LIST_SELECT,
        });
    }
}