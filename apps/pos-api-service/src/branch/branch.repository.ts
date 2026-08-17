import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from '@ryzera/pos-schema';

@Injectable()
export class BranchRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(companyId?: number) {
        return this.prisma.branch.findMany({
            where: companyId ? { company_id: companyId } : {},
            include: {
                company: { select: { id: true, name: true } },
                _count: { select: { users: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async findById(id: number) {
        return this.prisma.branch.findUnique({
            where: { id },
            include: { company: true },
        });
    }

    async findByCode(companyId: number, code: string) {
        return this.prisma.branch.findUnique({
            where: { company_id_code: { company_id: companyId, code } },
        });
    }

    async create(dto: CreateBranchDto) {
        return this.prisma.branch.create({
            data: dto,
            include: { company: { select: { id: true, name: true } } },
        });
    }

    async update(id: number, dto: UpdateBranchDto) {
        return this.prisma.branch.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: number) {
        return this.prisma.branch.delete({ where: { id } });
    }
}