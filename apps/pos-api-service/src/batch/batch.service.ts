import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { CreateBatchDto, UpdateBatchDto } from '@ryzera/pos-schema';

@Injectable()
export class BatchService {
  constructor(private prisma: PrismaService) {}

  findAll(productId?: string, expiringSoonDays?: number) {
    const cutoff = expiringSoonDays
      ? new Date(Date.now() + expiringSoonDays * 86_400_000)
      : undefined;

    return this.prisma.batch.findMany({
      where: {
        ...(productId && { productId }),
        ...(cutoff && { expiryDate: { lte: cutoff } }),
      },
      include: { product: true },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const b = await this.prisma.batch.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!b) throw new NotFoundException('Batch not found');
    return b;
  }

  create(dto: CreateBatchDto) {
    return this.prisma.batch.create({
      data: {
        ...dto,
        manufactureDate: dto.manufactureDate
          ? new Date(dto.manufactureDate)
          : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateBatchDto) {
    await this.findOne(id);
    return this.prisma.batch.update({
      where: { id },
      data: {
        ...dto,
        manufactureDate: dto.manufactureDate
          ? new Date(dto.manufactureDate)
          : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.batch.delete({ where: { id } });
  }
}
