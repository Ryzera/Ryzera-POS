import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import type { BranchListQueryDto } from './branch-query.schema';
import { BranchRepository } from './branch.repository';

@Injectable()
export class BranchService {
    constructor(private readonly branchRepository: BranchRepository) {}

    async findAll(query: BranchListQueryDto) {
        return this.branchRepository.findAll(query);
    }

    async findOne(id: number) {
        const branch = await this.branchRepository.findById(id);
        if (!branch) {
            throw new NotFoundException(`Branch #${id} not found`);
        }
        return branch;
    }

    async create(dto: {
        name: string;
        code: string;
        company_id: number;
        address?: string;
        phone?: string;
        email?: string;
        city?: string;
        manager_name?: string;
    }) {
        const existing = await this.branchRepository.findByCode(
            dto.company_id,
            dto.code,
        );
        if (existing) {
            throw new ConflictException(
                'Branch code already exists for this company',
            );
        }
        return this.branchRepository.create(dto);
    }

    async update(
        id: number,
        dto: Partial<{
            name: string;
            code: string;
            address: string;
            phone: string;
            email: string;
            city: string;
            manager_name: string;
            is_active: boolean;
        }>,
    ) {
        const branch = await this.findOne(id);

        if (!branch.is_active) {
            throw new BadRequestException('Cannot update an inactive branch.');
        }

        if (dto.name) {
            const existing = await this.branchRepository.findByName(dto.name, id);
            if (existing) {
                throw new ConflictException('Branch name already exists');
            }
        }

        return this.branchRepository.update(id, dto);
    }

    async reactivate(id: number) {
        const branch = await this.findOne(id);

        if (branch.is_active) {
            throw new BadRequestException('Branch is already active.');
        }

        return this.branchRepository.reactivate(id);
    }

    async remove(id: number) {
        const branch = await this.findOne(id);

        if (!branch.is_active) {
            throw new BadRequestException('Branch is already inactive.');
        }

        return this.branchRepository.softDelete(id);
    }
}
