import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReturnsRepository {
    constructor(private prisma: PrismaService) {}

    async findSaleById(sale_id: number) {
        return this.prisma.ryzera_pos_sale.findUnique({
            where: { sale_id },
            include: { sale_items: true },
        });
    }

    async createReturn(data: any) {
        return this.prisma.ryzera_pos_return.create(data);
    }

    async findReturnById(return_id: number) {
        return this.prisma.ryzera_pos_return.findUnique({
            where: { return_id },
        });
    }

    async findAllReturns() {
        return this.prisma.ryzera_pos_return.findMany({
            orderBy: { created_at: 'desc' },
        });
    }
}