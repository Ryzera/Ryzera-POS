import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { AdjustStockDto } from '@ryzera/pos-schema';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getBranchStock(branchId: string) {
    return this.prisma.branchProduct.findMany({
      where: { branchId },
      include: { product: { include: { category: true } } },
      orderBy: { product: { name: 'asc' } },
    });
  }

  async adjustStock(dto: AdjustStockDto, userId: string) {
    const bp = await this.prisma.branchProduct.findUnique({
      where: {
        branchId_productId: {
          branchId: dto.branchId,
          productId: dto.productId,
        },
      },
    });

    const currentQty = bp?.stockQty ?? 0;
    const newQty = currentQty + dto.changeQty;
    if (newQty < 0) throw new BadRequestException('Insufficient stock');

    return this.prisma.$transaction(async (tx) => {
      const updated = bp
        ? await tx.branchProduct.update({
            where: {
              branchId_productId: {
                branchId: dto.branchId,
                productId: dto.productId,
              },
            },
            data: { stockQty: newQty },
          })
        : await tx.branchProduct.create({
            data: {
              branchId: dto.branchId,
              productId: dto.productId,
              stockQty: newQty,
            },
          });

      await tx.inventoryLog.create({
        data: {
          action: dto.action as any,
          changeQty: dto.changeQty,
          description: dto.description,
          userId,
          productId: dto.productId,
          branchId: dto.branchId,
          branchProductId: updated.id,
        },
      });

      // Check and create stock alert if below minStock
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });
      if (product && newQty <= product.minStock) {
        await tx.stockAlert.create({
          data: {
            productId: dto.productId,
            branchId: dto.branchId,
            stockQty: newQty,
            minStock: product.minStock,
          },
        });
      }

      return updated;
    });
  }

  getLogs(branchId?: string, productId?: string) {
    return this.prisma.inventoryLog.findMany({
      where: {
        ...(branchId && { branchId }),
        ...(productId && { productId }),
      },
      include: { product: true, user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
