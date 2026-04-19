import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PurchaseOrderQueryDto } from './purchase-order-query.schema';
import { PurchaseOrderRepository } from './purchase-order.repository';

interface CreatePOItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

interface CreatePODto {
  supplierId: string;
  branchId: string;
  notes?: string;
  stockAlertId?: string;
  items: CreatePOItem[];
}

interface UpdateStatusDto {
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
  userId: string;
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

  private async findOrFail(id: string) {
    const po = await this.poRepo.findById(id);
    if (!po) throw new NotFoundException(`Purchase order "${id}" not found`);
    return po;
  }

  findAll(query: PurchaseOrderQueryDto) {
    return this.poRepo.findAll(query);
  }

  findOne(id: string) {
    return this.findOrFail(id);
  }

  create(dto: CreatePODto, createdById: string) {
    return this.poRepo.create(dto, createdById);
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
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

  async createInvoice(purchaseOrderId: string, dto: CreateInvoiceDto) {
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

  async markInvoicePaid(purchaseOrderId: string) {
    await this.findOrFail(purchaseOrderId);

    const invoice =
      await this.poRepo.findInvoiceByPurchaseOrderId(purchaseOrderId);
    if (!invoice) {
      throw new NotFoundException('No invoice found for this purchase order.');
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid.');
    }

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay a cancelled invoice.');
    }

    return this.poRepo.markInvoicePaid(purchaseOrderId);
  }
}
