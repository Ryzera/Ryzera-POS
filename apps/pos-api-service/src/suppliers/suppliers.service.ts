import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  private validateEmail(email: string) {
    if (!email.includes('@')) {
      throw new BadRequestException('Email must contain @ sign');
    }
  }

  private validatePhone(phone: string) {
    if (!/^\d{10}$/.test(phone)) {
      throw new BadRequestException('Invalid Phone number');
    }
  }

  async createSupplier(data: any) {
    if (data.email) this.validateEmail(data.email);
    if (data.phone) this.validatePhone(data.phone);
    return this.prisma.supplier.create({ data });
  }

  async getAllSuppliers() {
    return this.prisma.supplier.findMany({
      where: { isActive: true },
      include: { products: true },
    });
  }

  async getSupplierById(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: { products: true },
    });
  }

  async updateSupplier(id: string, data: any) {
    if (data.email) this.validateEmail(data.email);
    if (data.phone) this.validatePhone(data.phone);
    return this.prisma.supplier.update({ where: { id }, data });
  }

  async deleteSupplier(id: string) {
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
