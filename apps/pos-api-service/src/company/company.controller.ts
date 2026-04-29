import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';
import { CreateCompanySchema, UpdateCompanySchema } from '@ryzera/pos-schema';

@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    // GET /companies
    @Get()
    findAll() {
        return this.companyService.findAll();
    }

    // GET /companies/:id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.companyService.findOne(id);
    }

    // POST /companies
    @Post()
    create(@Body() body: unknown) {
        const dto = CreateCompanySchema.parse(body);
        return this.companyService.create(dto);
    }

    // PUT /companies/:id
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: unknown,
    ) {
        const dto = UpdateCompanySchema.parse(body);
        return this.companyService.update(id, dto);
    }

    // DELETE /companies/:id
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.companyService.remove(id);
    }
}