import { Body, Controller, Get, Param, ParseIntPipe, Post, BadRequestException } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnSchema, CreateReturnDto } from './dto/create-return.dto';

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