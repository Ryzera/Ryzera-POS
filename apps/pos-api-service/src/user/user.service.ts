import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        branchId: true,
        branch: { select: { name: true } },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        branchId: true,
        branch: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async assignBranch(userId: string, branchId: string | null) {
    await this.findOne(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { branchId },
    });
  }
}
