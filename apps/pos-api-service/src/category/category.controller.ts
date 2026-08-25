import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { CategoryListQueryDto } from './category-query.schema';
import { CategoryListQuerySchema } from './category-query.schema';
import { CategoryService } from './category.service';

const CreateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
});

const UpdateCategorySchema = CreateCategorySchema.partial();

type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated category list' })
  findAll(
    @Query(new ZodValidationPipe(CategoryListQuerySchema))
    query: CategoryListQueryDto,
  ) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category detail with active products',
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a category' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Beverages' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 409, description: 'Name conflict' })
  create(
    @Body(new ZodValidationPipe(CreateCategorySchema)) dto: CreateCategoryDto,
  ) {
    return this.categoryService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Beverages' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 409, description: 'Name conflict' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateCategorySchema)) dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a category (only if no active products)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 400, description: 'Has active products' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
