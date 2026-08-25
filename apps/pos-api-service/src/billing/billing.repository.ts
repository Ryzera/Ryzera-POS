import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingRepository {
    constructor(private prisma: PrismaService) {}

    async createSale(data: any) {
        const { sale_items, ...restData } = data.data;

        return this.prisma.sale.create({
            data: {
                ...restData,
                updated_at: new Date(),
                saleItems: {
                    create: sale_items,
                },
            },
            include: { saleItems: true },
        });
    }

    async findSaleById(sale_id: number) {
        return this.prisma.sale.findUnique({
            where:   { id: sale_id },
            include: { saleItems: true, payments: true },
        });
    }

    async updateSale(sale_id: number, data: any) {
        return this.prisma.sale.update({
            where: { id: sale_id },
            data:  {
                ...data,
                updated_at: new Date(),
            },
        });
    }

    async createPayment(data: any) {
        return this.prisma.payment.create({ data });
    }

    async findAllSales(branch_id?: number) {
        return this.prisma.sale.findMany({
            where:   branch_id ? { branch_id } : undefined,
            include: { saleItems: true, payments: true },
            orderBy: { created_at: 'desc' },
        });
    }

    async processPaymentTransaction(dto: any, sale: any) {
        const result = await this.prisma.$transaction([
            this.prisma.payment.create({
                data: {
                    sale_id:               dto.sale_id,
                    payment_method:        dto.payment_method,
                    amount_paid:           dto.amount_paid,
                    payment_status:        'Paid',
                    transaction_reference: dto.transaction_reference,
                },
            }),
            this.prisma.sale.update({
                where: { id: dto.sale_id },
                data:  {
                    sale_status:    'Completed',
                    payment_status: 'Paid',
                    updated_at:     new Date(),
                },
            }),
        ]);

        return {
            payment_id:     result[0].id,
            invoice_number: sale.invoice_number,
            amount_paid:    result[0].amount_paid,
            change:         Number(dto.amount_paid) - Number(sale.total_amount),
            status:         'Payment Successful',
        };
    }
}