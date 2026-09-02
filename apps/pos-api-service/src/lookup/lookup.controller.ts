import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '@ryzera/pos-database';

@ApiTags('Lookup')
@ApiBearerAuth()
@Controller('lookup')
@UseGuards(JwtAuthGuard)
export class LookupController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /lookup/categories
   * Returns all categories for the category dropdown.
   * No pagination — there are typically fewer than 100 categories.
   */
  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories for dropdown' })
  async getCategories() {
    return this.prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * GET /lookup/products?categoryId=xxx
   * Returns all ACTIVE products, optionally filtered by categoryId (UUID).
   * No pagination — front-end loads all products for the selected category.
   */
  @Get('products')
  @ApiOperation({
    summary: 'Get all products, optionally filtered by categoryId',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter products by category UUID',
  })
  async getProducts(@Query('categoryId') categoryId?: string) {
    return this.prisma.product.findMany({
      // ← unified Product model
      where: {
        status: 'ACTIVE',
        ...(categoryId ? { category_id: Number(categoryId) } : {}), // Int, not UUID
      },
      select: { id: true, name: true, category_id: true },
    });
  }
}
