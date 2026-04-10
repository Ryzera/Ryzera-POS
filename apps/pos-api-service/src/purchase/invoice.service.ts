import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from '@ryzera/pos-schema';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: string) {
    return this.prisma.invoice.findMany({
      where: status ? { status: status as any } : undefined,
      include: { purchaseOrder: { include: { supplier: true, branch: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: { purchaseOrder: true },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  create(dto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateInvoiceStatusDto) {
    await this.findOne(id);
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: dto.status as any,
        ...(dto.status === 'PAID' && { paidAt: new Date() }),
      },
    });
  }
}
