import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReturnsRepository {
    constructor(private prisma: PrismaService) {}

    async findSaleById(sale_id: number) {
        const sale = await this.prisma.getSale();
        return sale.findUnique({
            where: { sale_id },
            include: { sale_items: true },
        });
    }

    async createReturn(data: any) {
        const ret = await this.prisma.getReturn();
        return ret.create(data);
    }

    async findReturnById(return_id: number) {
        const ret = await this.prisma.getReturn();
        return ret.findUnique({
            where: { return_id },
        });
    }

    async findAllReturns() {
        const ret = await this.prisma.getReturn();
        return ret.findMany({
            orderBy: { created_at: 'desc' },
        });
    }
}