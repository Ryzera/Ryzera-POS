import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillDto } from '@ryzera/pos-schema';

@Injectable()
export class BillingRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(companyId: number, branchId?: number) {
        return this.prisma.bill.findMany({
            where: {
                company_id: companyId,
                ...(branchId && { branch_id: branchId }),
            },
            include: {
                cashier: {
                    select: { id: true, username: true, info: true },
                },
                branch: { select: { id: true, name: true } },
                items: {
                    include: { product: { select: { id: true, name: true, code: true } } },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async findById(id: number) {
        return this.prisma.bill.findUnique({
            where: { id },
            include: {
                cashier: { select: { id: true, username: true, info: true } },
                branch: { select: { id: true, name: true } },
                company: { select: { id: true, name: true } },
                items: {
                    include: { product: true },
                },
            },
        });
    }

    async create(dto: CreateBillDto, cashierId: number, companyId: number) {
        // Calculate totals
        const subtotal = dto.items.reduce(
            (sum, item) => sum + item.unit_price * item.quantity, 0
        );
        const discount = dto.discount || 0;
        const tax = 0;
        const total = subtotal - discount + tax;

        // Generate bill number
        const billNumber = `BILL-${Date.now()}`;

        return this.prisma.bill.create({
            data: {
                bill_number: billNumber,
                company_id: companyId,
                branch_id: dto.branch_id,
                cashier_id: cashierId,
                payment_method: dto.payment_method,
                subtotal,
                discount,
                tax,
                total,
                notes: dto.notes,
                status: 'COMPLETED',
                items: {
                    create: dto.items.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        total: item.unit_price * item.quantity,
                    })),
                },
            },
            include: {
                items: { include: { product: true } },
                branch: { select: { id: true, name: true } },
            },
        });
    }

    async updateStatus(id: number, status: string) {
        return this.prisma.bill.update({
            where: { id },
            data: { status: status as any },
        });
    }
}