import { Injectable, BadRequestException } from '@nestjs/common';
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
            include: {
                saleItems: {
                    include: { product: true },
                },
                payments: true,
            },
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

    // ── Check stock availability before checkout ───────────────
    async checkStockAvailability(branch_id: number, items: { product_id: number; quantity: number; product_name?: string }[]) {
        for (const item of items) {
            const branchProduct = await this.prisma.branchProduct.findUnique({
                where: {
                    branch_id_product_id: {
                        branch_id,
                        product_id: item.product_id,
                    },
                },
                include: { product: true },
            });

            const available = branchProduct?.stockQty ?? 0;
            const productName = item.product_name || branchProduct?.product?.name || `Product #${item.product_id}`;

            if (!branchProduct || available < item.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for "${productName}". Available: ${available}, Requested: ${item.quantity}`
                );
            }
        }
    }

    // ── Atomic Payment & Inventory Stock Decrement ────────────
    async processPaymentTransaction(dto: any, sale: any) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create Payment
            const payment = await tx.payment.create({
                data: {
                    sale_id:               dto.sale_id,
                    payment_method:        dto.payment_method,
                    amount_paid:           dto.amount_paid,
                    payment_status:        'Paid',
                    transaction_reference: dto.transaction_reference,
                },
            });

            // 2. Mark Sale as Completed & Paid
            await tx.sale.update({
                where: { id: dto.sale_id },
                data:  {
                    sale_status:    'Completed',
                    payment_status: 'Paid',
                    updated_at:     new Date(),
                },
            });

            // 3. Deduct Branch Stock & Create Inventory Logs
            for (const item of sale.saleItems) {
                const qtyToDeduct = Math.round(Number(item.quantity));

                let branchProduct = await tx.branchProduct.findUnique({
                    where: {
                        branch_id_product_id: {
                            branch_id:  sale.branch_id,
                            product_id: item.product_id,
                        },
                    },
                    include: { product: true },
                });

                if (!branchProduct) {
                    branchProduct = await tx.branchProduct.create({
                        data: {
                            branch_id:  sale.branch_id,
                            product_id: item.product_id,
                            stockQty:   0,
                        },
                        include: { product: true },
                    });
                }

                if (branchProduct.stockQty < qtyToDeduct) {
                    throw new BadRequestException(
                        `Cannot complete sale: Insufficient stock for "${item.product_name}". Available: ${branchProduct.stockQty}, Required: ${qtyToDeduct}`
                    );
                }

                // Decrement stock
                const updatedBranchProduct = await tx.branchProduct.update({
                    where: { id: branchProduct.id },
                    data: {
                        stockQty: { decrement: qtyToDeduct },
                        updated_at: new Date(),
                    },
                });

                // Create InventoryLog (action: SALE)
                await tx.inventoryLog.create({
                    data: {
                        action:          'SALE',
                        changeQty:       -qtyToDeduct,
                        description:     `Sold ${qtyToDeduct} ${item.unit || 'units'} via Invoice #${sale.invoice_number}`,
                        userId:          sale.user_id,
                        product_id:      item.product_id,
                        branch_id:       sale.branch_id,
                        branchProductId: branchProduct.id,
                        created_at:      new Date(),
                    },
                });

                // Check Low Stock or Out of Stock Alert
                const minStock = branchProduct.product?.min_quantity ?? 0;
                if (updatedBranchProduct.stockQty <= minStock) {
                    const existingAlert = await tx.stockAlert.findFirst({
                        where: {
                            branch_id:  sale.branch_id,
                            product_id: item.product_id,
                            status:     'PENDING',
                        },
                    });

                    if (!existingAlert) {
                        await tx.stockAlert.create({
                            data: {
                                branch_id:  sale.branch_id,
                                product_id: item.product_id,
                                stockQty:   updatedBranchProduct.stockQty,
                                minStock:   minStock,
                                status:     'PENDING',
                                updated_at: new Date(),
                            },
                        });
                    } else {
                        await tx.stockAlert.update({
                            where: { id: existingAlert.id },
                            data: {
                                stockQty:   updatedBranchProduct.stockQty,
                                updated_at: new Date(),
                            },
                        });
                    }
                }
            }

            return {
                payment_id:     payment.id,
                invoice_number: sale.invoice_number,
                amount_paid:    payment.amount_paid,
                change:         Number(dto.amount_paid) - Number(sale.total_amount),
                status:         'Payment Successful',
            };
        });
    }
}