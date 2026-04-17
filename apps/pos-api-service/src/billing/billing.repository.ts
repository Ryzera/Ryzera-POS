import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingRepository {
    constructor(private prisma: PrismaService) {}

    async createSale(data: any) {
        const sale = await this.prisma.getSale();
        return sale.create(data);
    }

    async findSaleById(sale_id: number) {
        const sale = await this.prisma.getSale();
        return sale.findUnique({
            where: { sale_id },
            include: { sale_items: true, payments: true },
        });
    }

    async updateSale(sale_id: number, data: any) {
        const sale = await this.prisma.getSale();
        return sale.update({
            where: { sale_id },
            data,
        });
    }

    async createPayment(data: any) {
        const payment = await this.prisma.getPayment();
        return payment.create({ data });
    }

    async findAllSales(branch_id?: string) {
        const sale = await this.prisma.getSale();
        return sale.findMany({
            where: branch_id ? { branch_id } : {},
            include: { sale_items: true, payments: true },
            orderBy: { created_at: 'desc' },
        });
    }

    async processPaymentTransaction(dto: any, sale: any) {
        const payment = await this.prisma.getPayment();
        const saleModel = await this.prisma.getSale();

        const result = await this.prisma.tx([
            payment.create({
                data: {
                    saleId: dto.sale_id,
                    payment_method: dto.payment_method,
                    amount_paid: dto.amount_paid,
                    payment_status: 'Paid',
                    transaction_reference: dto.transaction_reference,
                },
            }),
            saleModel.update({
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