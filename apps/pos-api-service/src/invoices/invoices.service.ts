import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async getAllInvoices() {
    return this.prisma.invoice.findMany({
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            branch: true,
            items: { include: { product: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getInvoiceById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            branch: true,
            items: { include: { product: true } },
          },
        },
      },
    });
  }

  async getInvoiceByOrderId(purchaseOrderId: string) {
    return this.prisma.invoice.findUnique({
      where: { purchaseOrderId },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            branch: true,
            items: { include: { product: true } },
          },
        },
      },
    });
  }

  async getInvoicesByBranch(branchId: string) {
    return this.prisma.invoice.findMany({
      where: {
        purchaseOrder: { branchId },
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            branch: true,
            items: { include: { product: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async updateInvoiceStatus(id: string, status: string, paidAt?: string) {
    const validStatuses = ['UNPAID', 'PAID', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('invalid status');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: status as any,
        paidAt:
          status === 'PAID' ? (paidAt ? new Date(paidAt) : new Date()) : null,
      },
      include: {
        purchaseOrder: {
          include: { supplier: true, branch: true },
        },
      },
    });
  }
}
