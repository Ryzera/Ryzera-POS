import { Controller, Get, Post, Body, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ReturnsService } from './returns.service.js';
import { CreateReturnSchema } from './schema/create-return.schema.js';

@Controller('returns')
export class ReturnsController {
    constructor(private returnsService: ReturnsService) {}

    @Post()
    processReturn(@Body() body: unknown) {
        const result = CreateReturnSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestException(result.error.issues);
        }
        return this.returnsService.processReturn(result.data);
    }

    @Get(':id')
    getReturnById(@Param('id', ParseIntPipe) id: number) {
        return this.returnsService.getReturnById(id);
    }

    @Get()
    getAllReturns() {
        return this.returnsService.getAllReturns();
    }
}