import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { BranchRepository } from './branch.repository';
import { CreateBranchDto, UpdateBranchDto } from '@ryzera/pos-schema';

@Injectable()
export class BranchService {
    constructor(private readonly branchRepository: BranchRepository) {}

    async findAll(companyId?: number) {
        return this.branchRepository.findAll(companyId);
    }

    async findOne(id: number) {
        const branch = await this.branchRepository.findById(id);
        if (!branch) throw new NotFoundException(`Branch #${id} not found`);
        return branch;
    }

    async create(dto: CreateBranchDto) {
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

    async update(id: number, dto: UpdateBranchDto) {
        await this.findOne(id);
        return this.branchRepository.update(id, dto);
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.branchRepository.delete(id);
    }
}