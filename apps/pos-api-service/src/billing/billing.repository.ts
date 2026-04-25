import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingRepository {
    constructor(private prisma: PrismaService) {}

    async createSale(data: any) {
        return this.prisma.ryzera_pos_sale.create(data);
    }

    async findSaleById(sale_id: number) {
        return this.prisma.ryzera_pos_sale.findUnique({
            where: { sale_id },
            include: { sale_items: true, payments: true },
        });
    }

    async updateSale(sale_id: number, data: any) {
        return this.prisma.ryzera_pos_sale.update({
            where: { sale_id },
            data,
        });
    }

    async createPayment(data: any) {
        return this.prisma.ryzera_pos_payment.create({ data });
    }

    async findAllSales(branch_id?: number) {
        return this.prisma.ryzera_pos_sale.findMany({
            where: branch_id ? { branch_id } : {},
            include: { sale_items: true, payments: true },
            orderBy: { created_at: 'desc' },
        });
    }

    async processPaymentTransaction(dto: any, sale: any) {
        const result = await this.prisma.$transaction([
            this.prisma.ryzera_pos_payment.create({
                data: {
                    saleId: dto.sale_id,
                    payment_method: dto.payment_method,
                    amount_paid: dto.amount_paid,
                    payment_status: 'Paid',
                    transaction_reference: dto.transaction_reference,
                },
            }),
            this.prisma.ryzera_pos_sale.update({
                where: { sale_id: dto.sale_id },
                data: { sale_status: 'Completed', payment_status: 'Paid' },
            }),
        ]);

        return {
            payment_id: result[0].payment_id,
            invoice_number: sale.invoice_number,
            amount_paid: result[0].amount_paid,
            change: dto.amount_paid - sale.total_amount,
            status: 'Payment Successful',
        };
    }
}