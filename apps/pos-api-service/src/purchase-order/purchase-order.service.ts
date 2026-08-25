import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PurchaseOrderQueryDto } from './purchase-order-query.schema';
import { PurchaseOrderRepository } from './purchase-order.repository';

interface CreatePOItem {
  productId: number;
  quantity: number;
  unitCost: number;
}

interface CreatePODto {
  supplierId: number;
  branchId: number;
  notes?: string;
  stockAlertId?: number;
  items: CreatePOItem[];
}

interface UpdateStatusDto {
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
  userId: number;
}

interface CreateInvoiceDto {
  invoiceNo: string;
  totalAmount: number;
  dueDate?: string;
  notes?: string;
}

@Injectable()
export class PurchaseOrderService {
  constructor(private readonly poRepo: PurchaseOrderRepository) {}

  private async findOrFail(id: number) {
    const po = await this.poRepo.findById(id);
    if (!po) throw new NotFoundException(`Purchase order "${id}" not found`);
    return po;
  }

  findAll(query: PurchaseOrderQueryDto) {
    return this.poRepo.findAll(query);
  }

  findOne(id: number) {
    return this.findOrFail(id);
  }

  create(dto: CreatePODto, createdById: number) {
    return this.poRepo.create(dto, createdById);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const po = await this.findOrFail(id);

    const transitions: Record<string, string[]> = {
      DRAFT: ['SENT', 'CANCELLED'],
      SENT: ['RECEIVED', 'CANCELLED'],
      RECEIVED: [],
      CANCELLED: [],
    };

    const allowed = transitions[po.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from "${po.status}" to "${dto.status}"`,
      );
    }

    if (dto.status === 'RECEIVED') {
      return this.poRepo.receiveOrder(po, dto.userId);
    }

    return this.poRepo.updateStatus(id, dto.status);
  }

  async createInvoice(purchaseOrderId: number, dto: CreateInvoiceDto) {
    const po = await this.findOrFail(purchaseOrderId);

    if (po.status !== 'RECEIVED') {
      throw new BadRequestException(
        'Invoice can only be created for received purchase orders.',
      );
    }

    const existing =
      await this.poRepo.findInvoiceByPurchaseOrderId(purchaseOrderId);
    if (existing) {
      throw new ConflictException(
        'Invoice already exists for this purchase order.',
      );
    }

    return this.poRepo.createInvoice(purchaseOrderId, dto);
  }

  async markInvoicePaid(purchaseOrderId: number) {
    await this.findOrFail(purchaseOrderId);

    const invoice =
      await this.poRepo.findInvoiceByPurchaseOrderId(purchaseOrderId);
    if (!invoice)
      throw new NotFoundException('No invoice found for this purchase order.');
    if (invoice.status === 'PAID')
      throw new BadRequestException('Invoice is already paid.');
    if (invoice.status === 'CANCELLED')
      throw new BadRequestException('Cannot pay a cancelled invoice.');

    return this.poRepo.markInvoicePaid(purchaseOrderId);
  }
}
