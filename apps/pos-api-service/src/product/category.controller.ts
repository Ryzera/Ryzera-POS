import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private cat: CategoryService) {}

  @Get() findAll() {
    return this.cat.findAll();
  }
  @Post() create(@Body('name') name: string) {
    return this.cat.create(name);
  }
  @Put(':id') update(@Param('id') id: string, @Body('name') name: string) {
    return this.cat.update(id, name);
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.cat.remove(id);
  }
}
