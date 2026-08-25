import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AdjustStockDto,
  AssignProductToBranchDto,
} from '@ryzera/pos-schema';
import type {
  BranchProductQueryDto,
  InventoryLogQueryDto,
  StockAlertQueryDto,
} from './inventory-query.schema';
import { InventoryRepository } from './inventory.repository';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  // ── BranchProduct ──────────────────────────────────────────

  findAllBranchProducts(query: BranchProductQueryDto) {
    return this.inventoryRepo.findAllBranchProducts(query);
  }

  async findBranchProduct(branchId: number, productId: number) {
    const bp = await this.inventoryRepo.findBranchProduct(branchId, productId);
    if (!bp)
      throw new NotFoundException(
        `Product "${productId}" not found in branch "${branchId}"`,
      );
    return bp;
  }

  async assignProductToBranch(dto: AssignProductToBranchDto) {
    const existing = await this.inventoryRepo.findBranchProduct(
      Number(dto.branchId),
      Number(dto.productId),
    );
    if (existing)
      throw new ConflictException(
        'Product is already assigned to this branch.',
      );
    return this.inventoryRepo.assignProductToBranch(dto);
  }

  // ── Stock Adjustment ───────────────────────────────────────

  async adjustStock(
    branchId: number,
    productId: number,
    userId: number,
    dto: AdjustStockDto,
  ) {
    const bp = await this.inventoryRepo.findBranchProduct(branchId, productId);
    if (!bp)
      throw new NotFoundException(
        `Product "${productId}" not found in branch "${branchId}"`,
      );

    const resultingQty = bp.stockQty + dto.changeQty;
    if (resultingQty < 0) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${bp.stockQty}, Requested change: ${dto.changeQty}`,
      );
    }

    return this.inventoryRepo.adjustStock(
      bp.id,
      branchId,
      productId,
      userId,
      dto,
    );
  }

  // ── Inventory Logs ─────────────────────────────────────────

  findAllLogs(query: InventoryLogQueryDto) {
    return this.inventoryRepo.findAllLogs(query);
  }

  // ── Stock Alerts ───────────────────────────────────────────

  findAllAlerts(query: StockAlertQueryDto) {
    return this.inventoryRepo.findAllAlerts(query);
  }

  async resolveAlert(id: number) {
    return this.inventoryRepo.updateAlertStatus(id, 'RESOLVED');
  }

  async markAlertSeen(id: number) {
    return this.inventoryRepo.updateAlertStatus(id, 'SEEN');
  }
}
