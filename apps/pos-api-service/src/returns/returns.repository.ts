import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReturnsRepository {
    constructor(private prisma: PrismaService) {}

    async findSaleById(sale_id: number) {
        return this.prisma.sale.findUnique({
            where: { id: sale_id },
            include: { saleItems: true },
        });
    }

    async createReturn(data: any) {
        return this.prisma.return.create(data);
    }

    async findReturnById(return_id: number) {
        return this.prisma.return.findUnique({
            where: { id: return_id },
        });
    }

    async findAllReturns() {
        return this.prisma.return.findMany({
            orderBy: { created_at: 'desc' },
        });
    }
}