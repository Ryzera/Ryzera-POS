import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { ResolveAlertDto } from '@ryzera/pos-schema';

@Injectable()
export class StockAlertService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: string, branchId?: string) {
    return this.prisma.stockAlert.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(branchId && { branchId }),
      },
      include: { product: true, branch: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolve(id: string, dto: ResolveAlertDto) {
    const alert = await this.prisma.stockAlert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Alert not found');
    return this.prisma.stockAlert.update({
      where: { id },
      data: { status: dto.status as any },
    });
  }
}
