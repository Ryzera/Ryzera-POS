import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() data: any) {
    return this.categoriesService.createCategory(data);
  }

  @Get()
  findAll() {
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.updateCategory(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }
}
