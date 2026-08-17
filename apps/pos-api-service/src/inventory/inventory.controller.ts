import {
    Controller, Get, Post, Put, Delete,
    Body, Param, Query, ParseIntPipe,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductSchema, UpdateProductSchema } from '@ryzera/pos-schema';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    // GET /inventory
    @Get()
    findAll(
        @Query('companyId') companyId?: string,
        @Query('branchId') branchId?: string,
    ) {
        return this.inventoryService.findAll(
            companyId ? parseInt(companyId) : undefined,
            branchId ? parseInt(branchId) : undefined,
        );
    }

    // GET /inventory/:id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryService.findOne(id);
    }

    // POST /inventory
    @Post()
    @Roles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER')
    create(@Body() body: unknown) {
        const dto = CreateProductSchema.parse(body);
        return this.inventoryService.create(dto);
    }

    // PUT /inventory/:id
    @Put(':id')
    @Roles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
        const dto = UpdateProductSchema.parse(body);
        return this.inventoryService.update(id, dto);
    }

    // DELETE /inventory/:id
    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryService.remove(id);
    }
}