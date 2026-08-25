import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CategoryListQueryDto } from './category-query.schema';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  private async findOrFail(id: number) {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundException(`Category "${id}" not found`);
    return category;
  }

  private async assertNameAvailable(name: string, excludeId?: number) {
    const conflict = await this.categoryRepo.findByName(name, excludeId);
    if (conflict)
      throw new ConflictException(`Category "${name}" already exists`);
  }

  findAll(query: CategoryListQueryDto) {
    return this.categoryRepo.findAll(query);
  }

  findOne(id: number) {
    return this.findOrFail(id);
  }

  async create(dto: { name: string }) {
    await this.assertNameAvailable(dto.name);
    return this.categoryRepo.create(dto);
  }

  async update(id: number, dto: { name?: string }) {
    await this.findOrFail(id);
    if (dto.name) await this.assertNameAvailable(dto.name, id);
    return this.categoryRepo.update(id, dto);
  }

  async remove(id: number) {
    const category = await this.findOrFail(id);

    if (category.products.length > 0) {
      throw new BadRequestException(
        'Cannot delete a category that has active products. Reassign them first.',
      );
    }

    return this.categoryRepo.delete(id);
  }
}
