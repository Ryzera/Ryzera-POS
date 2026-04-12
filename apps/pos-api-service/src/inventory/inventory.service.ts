import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AssignProductToBranchDto,
  AdjustStockDto,
} from '@ryzera/pos-schema';

import {
  BranchProductQueryDto,
  InventoryLogQueryDto,
  StockAlertQueryDto,
} from './inventory-query.schema';
import { InventoryRepository } from './inventory.repository';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  // ── BranchProduct ──────────────────────────────────────────────

  findAllBranchProducts(query: BranchProductQueryDto) {
    return this.inventoryRepo.findAllBranchProducts(query);
  }

  async findBranchProduct(branchId: string, productId: string) {
    const bp = await this.inventoryRepo.findBranchProduct(branchId, productId);
    if (!bp)
      throw new NotFoundException(
        `Product "${productId}" not found in branch "${branchId}"`,
      );
    return bp;
  }

  async assignProductToBranch(dto: AssignProductToBranchDto) {
    // Prevent duplicate assignment
    const existing = await this.inventoryRepo.findBranchProduct(
      dto.branchId,
      dto.productId,
    );
    if (existing)
      throw new ConflictException(
        'Product is already assigned to this branch.',
      );
    return this.inventoryRepo.assignProductToBranch(dto);
  }

  // ── Stock Adjustment ───────────────────────────────────────────

  async adjustStock(
    branchId: string,
    productId: string,
    userId: string,
    dto: AdjustStockDto,
  ) {
    const bp = await this.inventoryRepo.findBranchProduct(branchId, productId);
    if (!bp)
      throw new NotFoundException(
        `Product "${productId}" not found in branch "${branchId}"`,
      );

    const resultingQty = bp.stockQty + dto.changeQty;
    if (resultingQty < 0)
      throw new BadRequestException(
        `Insufficient stock. Available: ${bp.stockQty}, Requested change: ${dto.changeQty}`,
      );

    return this.inventoryRepo.adjustStock(
      bp.id,
      branchId,
      productId,
      userId,
      dto,
    );
  }

  // ── Inventory Logs ─────────────────────────────────────────────

  findAllLogs(query: InventoryLogQueryDto) {
    return this.inventoryRepo.findAllLogs(query);
  }

  // ── Stock Alerts ───────────────────────────────────────────────

  findAllAlerts(query: StockAlertQueryDto) {
    return this.inventoryRepo.findAllAlerts(query);
  }

  async resolveAlert(id: string) {
    return this.inventoryRepo.updateAlertStatus(id, 'RESOLVED');
  }

  async markAlertSeen(id: string) {
    return this.inventoryRepo.updateAlertStatus(id, 'SEEN');
  }
}
