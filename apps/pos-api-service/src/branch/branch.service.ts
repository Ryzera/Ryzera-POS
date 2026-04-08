import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchService {
    constructor(private readonly prisma: PrismaService) {}

    async getAllBranches() {
        return this.prisma.branch.findMany({
            where: { is_active: true },
            orderBy: { name: 'asc' },
        });
    }

    async getBranchById(branchId: number) {
        const branch = await this.prisma.branch.findUnique({ where: { branchId } });
        if (!branch) throw new NotFoundException(`Branch ${branchId} not found`);
        return branch;
    }

    async createBranch(dto: CreateBranchDto) {
        return this.prisma.branch.create({
            data: {
                name:       dto.name,
                code:       dto.code,
                address:    dto.address,
                phone:      dto.phone,
                email:      dto.email,
                company_id: dto.company_id,
            },
        });
    }

    async deactivateBranch(branchId: number) {
        await this.getBranchById(branchId);
        return this.prisma.branch.update({
            where: { branchId },
            data:  { is_active: false },
        });
    }
}