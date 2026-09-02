import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ISyncRepository } from './sync.repository.interface';

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
}

/**
 * Stores and retrieves sync records using Prisma ORM.
 * All database queries are centralised here so that the service layer
 * never needs to know which database or ORM we use.
 */
@Injectable()
export class SyncRepository implements ISyncRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: any) {
    return this.prismaService.syncLog.create({
      data: {
        branch_id: data.branch_id ?? data.branchId ?? null,
        entity: data.entity,
        payload: data.payload,
        status: data.status,
        error: data.error,
        attempts: data.attempts,
        // Completed online pushes need a completion timestamp for latency metrics.
        syncedAt: data.syncedAt ?? (data.status === 'SYNCED' ? new Date() : null),
      },
    });
  }

  async countByStatus(status: string) {
    return this.prismaService.syncLog.count({ where: { status } });
  }

  async findById(id: number) {
    return this.prismaService.syncLog.findUnique({ where: { id } });
  }

  async updateStatus(
    id: number,
    status: string,
    error?: string | null,
    syncedAt?: Date,
    incrementAttempts = false,
  ) {
    const updateData: any = { status };
    if (error !== undefined) updateData.error = error;
    if (syncedAt !== undefined) updateData.syncedAt = syncedAt;
    if (incrementAttempts) {
      updateData.attempts = { increment: 1 };
    }
    return this.prismaService.syncLog.update({
      where: { id },
      data: updateData,
    });
  }

  async updateLogPayload(id: number, payload: any) {
    return this.prismaService.syncLog.update({
      where: { id },
      data: { payload },
    });
  }

  async findAll(filters?: { branch_id?: number; limit?: number }) {
    const where: any = {};
    if (filters?.branch_id) where.branch_id = filters.branch_id;

    return this.prismaService.syncLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: filters?.limit || 250,
    });
  }

  async getMetricsData(since: Date, branchId?: number) {
    const where: any = {
      // Include every sync attempt in the analytics window so throughput and
      // distribution totals match Recent Sync Activity, including FAILED and
      // PENDING records. The service uses status to calculate latency only for
      // completed records.
      created_at: { gte: since },
    };
    if (branchId) where.branch_id = branchId;

    return this.prismaService.syncLog.findMany({
      where,
      select: {
        entity: true,
        status: true,
        branch_id: true,
        created_at: true,
        syncedAt: true,
        updated_at: true,
      },
    });
  }

  async getSyncStats(since: Date, branchId?: number) {
    const where: any = { created_at: { gte: since } };
    if (branchId) where.branch_id = branchId;

    const total = await this.prismaService.syncLog.count({ where });
    const synced = await this.prismaService.syncLog.count({ where: { ...where, status: 'SYNCED' } });
    const failed = await this.prismaService.syncLog.count({ where: { ...where, status: 'FAILED' } });

    return { total, synced, failed };
  }

  async getEntityDistribution(since: Date, branchId?: number) {
    const where: any = { created_at: { gte: since } };
    if (branchId) where.branch_id = branchId;

    return this.prismaService.syncLog.groupBy({
      by: ['entity'],
      where,
      _count: true,
    });
  }

  async getBranchComparison(since: Date) {
    return this.prismaService.syncLog.groupBy({
      by: ['branch_id'],
      where: { created_at: { gte: since } },
      _count: {
        _all: true,
      },
    });
  }

  //  findMany method - handles both object and string input
  async findMany(condition: any) {
    let whereClause = condition;

    // If condition is a simple string like 'PENDING'
    if (typeof condition === 'string') {
      whereClause = { status: condition };
    }
    // If condition has a 'where' property from old code
    else if (condition && condition.where) {
      whereClause = condition.where;
    }

    // Clean up where clause to match Prisma schema
    if (whereClause && typeof whereClause === 'object') {
      if ('branchId' in whereClause) {
        whereClause.branch_id = whereClause.branchId;
        delete whereClause.branchId;
      }
      if ('companyId' in whereClause) {
        delete whereClause.companyId;
      }
    }

    return this.prismaService.syncLog.findMany({
      where: whereClause,
    });
  }

  // Delete record by ID
  async deleteById(id: number) {
    return this.prismaService.syncLog.delete({ where: { id } });
  }

  // Prune old successful logs
  async deleteOldLogs(dateLimit: Date) {
    return this.prismaService.syncLog.deleteMany({
      where: {
        status: 'SYNCED',
        created_at: { lt: dateLimit }
      }
    });
  }

  async getConflicts(branch_id?: number) {
    return (this.prismaService as any).syncConflict.findMany({
      where: {
        status: 'PENDING',
        ...(branch_id ? { syncLog: { branch_id } } : {}),
      },
      include: { syncLog: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findConflictById(id: number) {
    return (this.prismaService as any).syncConflict.findUnique({
      where: { id },
      include: { syncLog: true },
    });
  }

  async updateConflictStatus(id: number, status: string, resolution: string) {
    return (this.prismaService as any).syncConflict.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt: new Date()
      }
    });
  }

  // --- Priority 4.1: Device Management ---
  async registerDevice(data: any) {
    return (this.prismaService as any).syncDevice.create({ data });
  }

  async getDevices(branch_id?: number) {
    return (this.prismaService as any).syncDevice.findMany({
      where: branch_id ? { branch_id } : {},
      include: { branch: { select: { name: true, city: true } } },
      orderBy: { lastSeen: 'desc' },
    });
  }

  async findDeviceById(id: number) {
    return (this.prismaService as any).syncDevice.findUnique({
      where: { id },
      include: { branch: { select: { name: true, code: true } } },
    });
  }

  async updateDeviceStatus(id: number, status: string) {
    return (this.prismaService as any).syncDevice.update({
      where: { id },
      data: { status },
    });
  }

  async heartbeat(id: number) {
    return (this.prismaService as any).syncDevice.update({
      where: { id },
      data: { lastSeen: new Date() },
    });
  }

  async getBranchHealthStats(since: Date) {
    const failedLogs = await this.prismaService.syncLog.groupBy({
      by: ['branch_id'],
      where: { status: 'FAILED', created_at: { gte: since } },
      _count: true,
    });
    
    const conflicts = await (this.prismaService as any).syncConflict.findMany({
      where: { status: 'PENDING' },
      include: { syncLog: { select: { branch_id: true } } }
    });

    return { failedLogs, conflicts };
  }

  // --- Audit Logging ---
  async createAuditLog(data: any) {
    try {
      return await (this.prismaService as any).syncAuditLog.create({ data });
    } catch (err) {
      return null;
    }
  }

  async getAuditLogs(filters: any) {
    try {
      const where: any = {};
      if (filters.branch_id) where.branch_id = Number(filters.branch_id);

      const logs = await (this.prismaService as any).syncAuditLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });
      
      const users = await this.prismaService.user.findMany({
        select: { id: true, username: true }
      }).catch(() => []);
      
      const userMap = new Map<number, string | null>(
        users.map((u) => [u.id, u.username] as [number, string | null]),
      );
      
      return (logs || []).map((log: any) => ({
        ...log,
        user_name: log.user_id ? userMap.get(log.user_id) : 'System Admin'
      }));
    } catch (err) {
      return [];
    }
  }

  async seedAuditLogs() {
    const now = Date.now();
    const dayMs = 1000 * 60 * 60 * 24;
    const branches = await this.getAllBranches();
    const users = await this.prismaService.user.findMany({
      select: { id: true },
      orderBy: { id: 'asc' },
      take: 1,
    });
    const userId = users[0]?.id;
    const actions = [
      ['Full System Snapshot Generated', 'Disaster Recovery'],
      ['Branch Sync Success', 'Sync Engine'],
      ['Conflict Resolved: server_wins', 'Inventory'],
      ['Offline Dashboard Backup Generated', 'Disaster Recovery'],
      ['Device Registered', 'Device Management'],
      ['Admin Force Retry Sync', 'Sync Engine'],
      ['Sync Failed: Network timeout during push', 'Sales'],
      ['Conflict Detected & Prevented', 'Sync Engine'],
      ['Configuration Updated', 'System Protocol'],
      ['Device Approved', 'Device Management'],
    ] as const;
    const dummyLogs = actions.map(([action, module], index) => ({
      action,
      module,
      branch_id: branches.length > 0 ? branches[index % branches.length].id : null,
      ...(userId && index % 3 === 0 ? { user_id: userId } : {}),
      created_at: new Date(now - dayMs * (index + 0.1)),
    }));
    await (this.prismaService as any).syncAuditLog.createMany({ data: dummyLogs });
    return { success: true, message: 'Seeded branch-aware audit logs' };
  }

  async seedSyncLogs() {
    const branches = await this.getAllBranches();
    const entities = ['Billing', 'Inventory', 'SalesReturn', 'Customer'];
    const logs: any[] = [];
    const now = Date.now();
    const dayMs = 1000 * 60 * 60 * 24;

    for (const branch of branches) {
      const numRecords = 8;
      for (let i = 0; i < numRecords; i++) {
        // Generate fresh records for TODAY and within the last few hours
        const timeOffset = i < 4 ? (i * 20 * 60 * 1000) : (Math.random() * 2 * dayMs);
        const createdAt = new Date(now - timeOffset);
        // Create mostly SYNCED, with some PENDING and 2-3 FAILED per batch
        const isFailed = i === 2 || i === 5;
        const isPending = i === 1;
        const status = isFailed ? 'FAILED' : (isPending ? 'PENDING' : 'SYNCED');
        const entity = entities[i % entities.length];
        
        let payload: any = {};
        if (entity === 'Billing') {
          payload = {
            invoice_number: `BILL-OFFLINE-${Math.floor(100000 + Math.random() * 900000)}`,
            cashier: `${branch.name} cashier`,
            branch: branch.name,
            total_amount: Math.floor(450 + Math.random() * 3500),
            payment_method: Math.random() > 0.5 ? 'CASH' : 'LANKA_QR',
            items: [
              { name: 'Basmati Rice 5kg', qty: 1, price: 1100.00 },
              { name: 'Keells Fresh Milk 1L', qty: 2, price: 350.00 }
            ],
            offline_buffered: true,
            offline_timestamp: createdAt.toISOString()
          };
        } else if (entity === 'Inventory') {
          payload = {
            action: 'OFFLINE_STOCKTAKE',
            productName: 'Araliya Keeri Samba 5kg',
            adjusted_quantity: -1,
            reason: 'Physical count variance while offline',
            branch: branch.name
          };
        } else if (entity === 'SalesReturn') {
          payload = {
            return_id: `RET-${Math.floor(10000 + Math.random() * 90000)}`,
            returned_item: 'Anchor Butter 500g',
            refund_amount: 1150.00,
            reason: 'Damaged seal returned by customer',
            branch: branch.name
          };
        } else {
          payload = {
            action: 'CUSTOMER_OFFLINE_SYNC',
            customerName: 'Nimal Perera',
            phone: '0771234567',
            branch: branch.name
          };
        }

        const errorMsg = isFailed ? (
          i % 3 === 0 ? 'Network socket timeout during batch push' :
          i % 3 === 1 ? 'Customer loyalty database connection dropped' :
          'Product barcode SKU invalid or price mismatch'
        ) : null;

        logs.push({
          branch_id: branch.id,
          entity: entity,
          payload: payload,
          status: status,
          error: errorMsg,
          attempts: isFailed ? 3 : 1,
          created_at: createdAt,
          syncedAt: status === 'SYNCED' ? new Date(createdAt.getTime() + 2000) : null,
          updated_at: createdAt
        });
      }
    }
    
    await this.prismaService.syncLog.createMany({ data: logs });

    // Also populate 3 realistic Sync Conflicts for the Conflict Resolver UI!
    const createdLogs = await this.prismaService.syncLog.findMany({ take: 5, orderBy: { id: 'desc' } });
    if (createdLogs.length >= 3) {
      await (this.prismaService as any).syncConflict.createMany({
        data: [
          {
            syncLog_id: createdLogs[0].id,
            localData: { source: 'offline-client', branch_id: createdLogs[0].branch_id, stock: 150, price: 1100.00 },
            serverData: { source: 'central-server', branch_id: createdLogs[0].branch_id, stock: 120, price: 1150.00, updated_by: 'System Admin' },
            status: 'PENDING',
            created_at: new Date()
          },
          {
            syncLog_id: createdLogs[1].id,
            localData: { source: 'offline-client', branch_id: createdLogs[1].branch_id, discount: 10, total: 2700.00 },
            serverData: { source: 'central-server', branch_id: createdLogs[1].branch_id, discount: 0, total: 3000.00, note: 'Central value is newer' },
            status: 'PENDING',
            created_at: new Date(Date.now() - 3600000)
          },
          {
            syncLog_id: createdLogs[2].id,
            localData: { source: 'offline-client', branch_id: createdLogs[2].branch_id, loyalty_points: 450 },
            serverData: { source: 'central-server', branch_id: createdLogs[2].branch_id, loyalty_points: 380 },
            status: 'PENDING',
            created_at: new Date(Date.now() - 7200000)
          }
        ],
        skipDuplicates: true
      }).catch(() => {});
    }

    return { success: true, message: `Successfully seeded ${logs.length} realistic offline sync logs, errors, and conflicts for all branches!` };
  }

  async getAllBranches() {
    return this.prismaService.branch.findMany();
  }

  // --- Settings Management ---
  async getSettings(branchId?: number) {
    const rows = await (this.prismaService as any).syncSetting.findMany({
      where: branchId
        ? { OR: [{ branch_id: null }, { branch_id: branchId }] }
        : { branch_id: null },
      orderBy: [{ branch_id: 'asc' }, { key: 'asc' }],
    });

    if (!branchId) return rows;

    // Global values are defaults; a branch-scoped row with the same key wins.
    const merged = new Map<string, any>();
    for (const row of rows) merged.set(row.key, row);
    return Array.from(merged.values());
  }

  async saveSettings(settings: Array<{key: string, value: string}>, branchId?: number) {
    // Upsert each setting
    const results: any[] = [];
    for (const setting of settings) {
      const existing = await (this.prismaService as any).syncSetting.findFirst({
        where: { key: setting.key, branch_id: branchId ?? null }
      });

      if (existing) {
        results.push(await (this.prismaService as any).syncSetting.update({
          where: { id: existing.id },
          data: { value: String(setting.value) }
        }));
      } else {
        results.push(await (this.prismaService as any).syncSetting.create({
          data: {
            key: setting.key,
            value: String(setting.value),
            branch_id: branchId ?? null,
            scope: branchId ? 'BRANCH' : 'GLOBAL'
          }
        }));
      }
    }
    return results;
  }

  async getDeltaProducts(sinceDate: Date, branchId?: number) {
    const filters: any = {
      updated_at: { gt: sinceDate },
    };
    if (branchId) filters.branch_id = branchId;

    return this.prismaService.product.findMany({
      where: filters,
    });
  }

  async getDeltaData(sinceDate: Date, branchId?: number) {
    const productFilters: any = { updated_at: { gt: sinceDate } };
    const billFilters: any = { created_at: { gt: sinceDate } };
    const logFilters: any = { created_at: { gt: sinceDate } };

    if (branchId) {
      productFilters.branch_id = branchId;
      billFilters.branch_id = branchId;
      logFilters.branch_id = branchId;
    }

    const [products, bills, inventoryLogs, settings] = await Promise.all([
      this.prismaService.product.findMany({ where: productFilters, take: 500 }),
      this.prismaService.bill.findMany({ where: billFilters, include: { items: true }, take: 500 }),
      (this.prismaService as any).inventoryLog.findMany({ where: logFilters, take: 500 }),
      (this.prismaService as any).syncSetting.findMany({
        where: branchId ? { OR: [{ branch_id: branchId }, { branch_id: null }] } : {},
      }),
    ]);

    return {
      products,
      bills,
      inventoryLogs,
      settings,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Applies an offline billing payload to the merged Billing module's Sale
   * contract. This adapter belongs to Sync; the Billing module is unchanged.
   */
  async applyBillPayload(payload: any, branchId?: number | null, _companyId?: number | null) {
    return this.prismaService.$transaction(async (tx) => {
      const invoiceNumber =
        payload.invoice_number ||
        payload.bill_number ||
        (payload.id ? `BILL-OFFLINE-${payload.id}` : `BILL-OFFLINE-${Date.now()}`);
      const effectiveBranchId = Number(branchId || payload.branch_id || payload.branchId || 1);
      const effectiveUserId = Number(payload.user_id || payload.userId || payload.cashier_id || 1);
      const existingSale = await tx.sale.findUnique({
        where: { invoice_number: invoiceNumber },
      });

      if (existingSale) return existingSale;

      const items = Array.isArray(payload.saleItems)
        ? payload.saleItems
        : Array.isArray(payload.items)
          ? payload.items
          : [];
      const subtotal = payload.subtotal !== undefined
        ? Number(payload.subtotal)
        : items.reduce((acc: number, item: any) => acc + Number(item.unit_price || item.price || 0) * Number(item.quantity || item.qty || 1), 0);
      const discount = Number(payload.discount_amount ?? payload.discount ?? 0);
      const tax = Number(payload.tax_amount ?? payload.tax ?? 0);
      const total = payload.total_amount !== undefined
        ? Number(payload.total_amount)
        : payload.total !== undefined
          ? Number(payload.total)
          : subtotal - discount + tax;

      const sale = await tx.sale.create({
        data: {
          invoice_number: invoiceNumber,
          branch_id: effectiveBranchId,
          user_id: effectiveUserId,
          sale_status: (payload.sale_status as any) || 'Completed',
          payment_status: (payload.payment_status as any) || 'Paid',
          subtotal,
          discount_amount: discount,
          tax_amount: tax,
          total_amount: total,
          created_at: payload.created_at ? new Date(payload.created_at) : new Date(),
        },
      });

      for (const item of items) {
        const productId = Number(item.product_id || item.productId || 1);
        const qty = Number(item.quantity || item.qty || 1);
        const unitPrice = Number(item.unit_price || item.price || 0);
        const itemSubtotal = Number(item.subtotal ?? qty * unitPrice);
        const itemTotal = Number(item.total_amount ?? item.total ?? itemSubtotal);
        const product = await tx.product.findUnique({ where: { id: productId } });

        await tx.saleItem.create({
          data: {
            sale_id: sale.id,
            product_id: productId,
            product_name: String(item.product_name || item.productName || product?.name || `Product ${productId}`),
            quantity: qty,
            unit: (item.unit || product?.unit || 'PCS') as any,
            unit_price: unitPrice,
            cost_price: Number(item.cost_price || item.costPrice || 0),
            discount_percent: Number(item.discount_percent || 0),
            discount_amount: Number(item.discount_amount || 0),
            tax_percent: Number(item.tax_percent || 0),
            tax_amount: Number(item.tax_amount || 0),
            subtotal: itemSubtotal,
            total_amount: itemTotal,
          },
        });

        try {
          const branchProduct = await tx.branchProduct.findUnique({
            where: { branch_id_product_id: { branch_id: effectiveBranchId, product_id: productId } },
          });
          if (branchProduct) {
            await tx.branchProduct.update({
              where: { id: branchProduct.id },
              data: { stockQty: { decrement: Math.round(qty) } },
            });
            await tx.inventoryLog.create({
              data: {
                action: 'SALE',
                changeQty: -Math.round(qty),
                description: `Offline Sale #${invoiceNumber}`,
                userId: effectiveUserId,
                product_id: productId,
                branch_id: effectiveBranchId,
                branchProductId: branchProduct.id,
              },
            });
          }
        } catch {
          // Stock linkage is optional for a sale replay; preserve the sale record.
        }
      }

      return sale;
    });
  }

  async applyProductPayload(payload: any, branchId?: number | null, companyId?: number | null) {
    return this.prismaService.$transaction(async (tx) => {
      const effectiveCompanyId = companyId || payload.company_id || payload.companyId || 1;
      const effectiveBranchId = branchId || payload.branch_id || payload.branchId || null;

      if (payload.id) {
        const existing = await tx.product.findUnique({ where: { id: Number(payload.id) } });
        if (existing) {
          return tx.product.update({
            where: { id: Number(payload.id) },
            data: {
              name: payload.name ?? existing.name,
              price: payload.selling_price ?? payload.price ?? existing.price,
              cost_price: payload.cost_price ?? existing.cost_price,
              quantity: payload.quantity ?? existing.quantity,
              updated_at: new Date(),
            },
          });
        }
      }

      return tx.product.create({
        data: {
          name: payload.name || `Product-${Date.now()}`,
          code: payload.code || payload.sku || `PRD-${Date.now()}`,
          sku: payload.sku || `SKU-${Date.now()}`,
          price: Number(payload.selling_price || payload.price || 0),
          cost_price: payload.cost_price ? Number(payload.cost_price) : null,
          quantity: Number(payload.quantity || 0),
          company_id: effectiveCompanyId,
          branch_id: effectiveBranchId,
        },
      });
    });
  }
}
