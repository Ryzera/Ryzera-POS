import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { BranchStatus } from '@ryzera/pos-database';
import type { CreateBranchDto, UpdateBranchDto } from '@ryzera/pos-schema';

import { BranchListQueryDto } from './branch-query.schema';
import { BranchRepository } from './branch.repository';

@Injectable()
export class BranchService {
    constructor(private readonly branchRepo: BranchRepository) {}

    private async findOrFail(id: string) {
        const branch = await this.branchRepo.findById(id);
        if (!branch) {
            throw new NotFoundException(`Branch with ID "${id}" not found`);
        }
        return branch;
    }

    private async assertNameAvailable(name: string, excludeId?: string) {
        const conflict = await this.branchRepo.findByName(name, excludeId);
        if (conflict) {
            throw new ConflictException(`A branch named "${name}" already exists`);
        }
    }

    findAll(query: BranchListQueryDto) {
        return this.branchRepo.findAll(query);
    }

    findOne(id: string) {
        return this.findOrFail(id);
    }

    async create(dto: CreateBranchDto) {
        await this.assertNameAvailable(dto.name);
        return this.branchRepo.create(dto);
    }

    async update(id: string, dto: UpdateBranchDto) {
        const branch = await this.findOrFail(id);

        if (branch.status === BranchStatus.INACTIVE) {
            throw new BadRequestException(
                'Cannot update an inactive branch. Reactivate it first.',
            );
        }

        if (dto.name) {
            await this.assertNameAvailable(dto.name, id);
        }

        return this.branchRepo.update(id, dto);
    }

    async remove(id: string) {
        const branch = await this.findOrFail(id);

        if (branch.status === BranchStatus.INACTIVE) {
            throw new BadRequestException('Branch is already inactive.');
        }

        if (branch.status === BranchStatus.SUSPENDED) {
            throw new BadRequestException(
                'Cannot deactivate a suspended branch. Resolve the suspension first.',
            );
        }

        return this.branchRepo.softDelete(id);
    }
}