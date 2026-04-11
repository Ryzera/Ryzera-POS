import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { BranchRepository } from './branch.repository';
import { CreateBranchDto, UpdateBranchDto } from '@ryzera/pos-schema';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepo: BranchRepository) {}

  findAll() {
    return this.branchRepo.findAll();
  }

  async findOne(id: string) {
    const branch = await this.branchRepo.findById(id);
    if (!branch) throw new NotFoundException(`Branch with ID "${id}" not found`);
    return branch;
  }

  async create(dto: CreateBranchDto) {
    const existing = await this.branchRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`A branch named "${dto.name}" already exists`);
    }
    return this.branchRepo.create(dto);
  }

  async update(id: string, dto: UpdateBranchDto) {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.branchRepo.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(`A branch named "${dto.name}" already exists`);
      }
    }
    return this.branchRepo.update(id, dto);
  }

  async remove(id: string) {
    const branch = await this.findOne(id);
    if (branch.status === 'INACTIVE') {
      throw new BadRequestException('Branch is already inactive');
    }
    if (branch.status === 'SUSPENDED') {
      throw new BadRequestException(
          'Cannot deactivate a suspended branch. Resolve the suspension first',
      );
    }
    return this.branchRepo.softDelete(id);
  }
}