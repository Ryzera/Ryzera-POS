import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BranchService } from './branch.service';
import { CreateBranchSchema, UpdateBranchSchema } from '@ryzera/pos-schema';

@Controller('branches')
@UseGuards(AuthGuard('jwt'))
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    // GET /branches?companyId=1
    @Get()
    findAll(@Query('companyId') companyId?: string) {
        return this.branchService.findAll(
            companyId ? parseInt(companyId) : undefined,
        );
    }

    // GET /branches/:id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.branchService.findOne(id);
    }

    // POST /branches
    @Post()
    create(@Body() body: unknown) {
        const dto = CreateBranchSchema.parse(body);
        return this.branchService.create(dto);
    }

    // PUT /branches/:id
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: unknown,
    ) {
        const dto = UpdateBranchSchema.parse(body);
        return this.branchService.update(id, dto);
    }

    // DELETE /branches/:id
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.branchService.remove(id);
    }
}