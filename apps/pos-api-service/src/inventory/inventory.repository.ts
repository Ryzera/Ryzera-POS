import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from '@ryzera/pos-schema';

@Injectable()
export class InventoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(companyId?: number, branchId?: number) {
        return this.prisma.product.findMany({
            where: {
                ...(companyId && { company_id: companyId }),
                ...(branchId && { branch_id: branchId }),
            },
            include: {
                company: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async findById(id: number) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                company: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
            },
        });
    }

    async create(dto: CreateProductDto) {
        return this.prisma.product.create({ data: dto });
    }

    async update(id: number, dto: UpdateProductDto) {
        return this.prisma.product.update({ where: { id }, data: dto });
    }

    async delete(id: number) {
        return this.prisma.product.delete({ where: { id } });
    }
}