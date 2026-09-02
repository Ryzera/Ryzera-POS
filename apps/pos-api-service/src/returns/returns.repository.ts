import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReturnDto } from './schema/create-return.schema.js';

@Injectable()
export class ReturnsRepository {
    constructor(private prisma: PrismaService) {}

    async findSaleById(sale_id: number) {
        return this.prisma.sale.findUnique({
            where: { id: sale_id },
            include: {
                saleItems: {
                    include: { product: true },
                },
            },
        });
    }

    async processReturnTransaction(data: {
        sale: any;
        dto: CreateReturnDto;
        refund_amount: number;
        return_type: 'Full' | 'Partial';
    }) {
        const { sale, dto, refund_amount, return_type } = data;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Return record
            const returnRecord = await tx.return.create({
                data: {
                    sale_id:       dto.sale_id,
                    reason:        dto.reason,
                    refund_method: dto.refund_method,
                    return_amount: refund_amount,
                    status:        'Completed',
                    return_type,
                    updated_at:    new Date(),
                    returnItems: {
                        create: dto.items.map((returnItem) => {
                            const saleItem = sale.saleItems.find(
                                (i: any) => i.id === returnItem.sale_item_id,
                            );
                            const unitPrice = Number(saleItem?.unit_price ?? 0);
                            return {
                                sale_item_id:      returnItem.sale_item_id,
                                quantity_returned: returnItem.quantity_returned,
                                unit_price:        unitPrice,
                                refund_amount:     unitPrice * returnItem.quantity_returned,
                                item_condition:    returnItem.item_condition || 'Good',
                            };
                        }),
                    },
                },
                include: { returnItems: true },
            });

            // 2. Restock BranchProduct and create InventoryLog for each returned item
            for (const returnItem of dto.items) {
                const saleItem = sale.saleItems.find(
                    (i: any) => i.id === returnItem.sale_item_id,
                );
                if (!saleItem) continue;

                const qtyToRestock = Math.round(Number(returnItem.quantity_returned));

                let branchProduct = await tx.branchProduct.findUnique({
                    where: {
                        branch_id_product_id: {
                            branch_id:  sale.branch_id,
                            product_id: saleItem.product_id,
                        },
                    },
                    include: { product: true },
                });

                if (!branchProduct) {
                    branchProduct = await tx.branchProduct.create({
                        data: {
                            branch_id:  sale.branch_id,
                            product_id: saleItem.product_id,
                            stockQty:   qtyToRestock,
                        },
                        include: { product: true },
                    });
                } else {
                    branchProduct = await tx.branchProduct.update({
                        where: { id: branchProduct.id },
                        data: {
                            stockQty: { increment: qtyToRestock },
                            updated_at: new Date(),
                        },
                        include: { product: true },
                    });
                }

                // Create InventoryLog (action: RETURN_FROM_CUSTOMER)
                await tx.inventoryLog.create({
                    data: {
                        action:          'RETURN_FROM_CUSTOMER',
                        changeQty:       qtyToRestock,
                        description:     `Customer Return for "${saleItem.product_name}" from Invoice #${sale.invoice_number} (Reason: ${dto.reason})`,
                        userId:          sale.user_id,
                        product_id:      saleItem.product_id,
                        branch_id:       sale.branch_id,
                        branchProductId: branchProduct.id,
                        created_at:      new Date(),
                    },
                });

                // Resolve pending alert if stock is now above min_quantity
                const minStock = branchProduct.product?.min_quantity ?? 0;
                if (branchProduct.stockQty > minStock) {
                    await tx.stockAlert.updateMany({
                        where: {
                            branch_id:  sale.branch_id,
                            product_id: saleItem.product_id,
                            status:     'PENDING',
                        },
                        data: {
                            status:     'RESOLVED',
                            updated_at: new Date(),
                        },
                    });
                }
            }

            return returnRecord;
        });
    }

    async findReturnById(return_id: number) {
        return this.prisma.return.findUnique({
            where:   { id: return_id },
            include: { returnItems: true },
        });
    }

    async findAllReturns() {
        return this.prisma.return.findMany({
            include: { returnItems: true, sale: true },
            orderBy: { created_at: 'desc' },
        });
    }
}