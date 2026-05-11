import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from '@ryzera/pos-schema';

@Injectable()
export class CompanyRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.company.findMany({
            include: { _count: { select: { branches: true, users: true } } },
            orderBy: { created_at: 'desc' },
        });
    }

    async findById(id: number) {
        return this.prisma.company.findUnique({
            where: { id },
            include: { branches: true },
        });
    }

    async findByCode(code: string) {
        return this.prisma.company.findUnique({ where: { code } });
    }

    async create(dto: CreateCompanyDto) {
        return this.prisma.company.create({ data: dto });
    }

    async update(id: number, dto: UpdateCompanyDto) {
        return this.prisma.company.update({ where: { id }, data: dto });
    }

    async delete(id: number) {
        return this.prisma.company.delete({ where: { id } });
    }
}