import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  private validateBranch(data: any) {
    if (!data.name || typeof data.name !== 'string') {
      throw new BadRequestException('name is required and must be a string');
    }
    if (data.phone !== undefined && typeof data.phone !== 'string') {
      throw new BadRequestException('phone must be a string');
    }
    if (data.address !== undefined && typeof data.address !== 'string') {
      throw new BadRequestException('address must be a string');
    }
  }

  async createBranch(data: any) {
    this.validateBranch(data);
    return this.prisma.branch.create({ data });
  }

  async getAllBranches() {
    return this.prisma.branch.findMany({
      where: { isActive: true },
    });
  }

  async getBranchById(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
    });
  }

  async updateBranch(id: string, data: any) {
    if (data.name !== undefined && typeof data.name !== 'string') {
      throw new BadRequestException('name must be a string');
    }
    return this.prisma.branch.update({ where: { id }, data });
  }

  async deleteBranch(id: string) {
    return this.prisma.branch.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
