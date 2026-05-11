import { Injectable, NotFoundException } from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { CreateBillDto } from '@ryzera/pos-schema';

@Injectable()
export class BillingService {
    constructor(private readonly repo: BillingRepository) {}

    async findAll(companyId: number, branchId?: number) {
        return this.repo.findAll(companyId, branchId);
    }

    async findOne(id: number) {
        const bill = await this.repo.findById(id);
        if (!bill) throw new NotFoundException(`Bill #${id} not found`);
        return bill;
    }

    async create(dto: CreateBillDto, cashierId: number, companyId: number) {
        return this.repo.create(dto, cashierId, companyId);
    }

    async cancel(id: number) {
        await this.findOne(id);
        return this.repo.updateStatus(id, 'CANCELLED');
    }
}