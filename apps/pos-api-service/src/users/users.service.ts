import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private validateEmail(email: string) {
    if (!email.includes('@')) {
      throw new BadRequestException('Email must contain @ sign');
    }
  }

  private validateUser(data: any) {
    if (!data.name || typeof data.name !== 'string') {
      throw new BadRequestException('name is required and must be a string');
    }
    if (!data.email || typeof data.email !== 'string') {
      throw new BadRequestException('email is required');
    }
    this.validateEmail(data.email);
  }

  async createUser(data: any) {
    this.validateUser(data);
    return this.prisma.user.create({ data });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: { inventoryLogs: true },
    });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { inventoryLogs: true },
    });
  }

  async updateUser(id: string, data: any) {
    if (data.email) this.validateEmail(data.email);
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
