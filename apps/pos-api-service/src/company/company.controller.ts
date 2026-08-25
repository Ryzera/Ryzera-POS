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
    Req,
    ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';
import { CreateCompanySchema, UpdateCompanySchema, JwtPayload } from '@ryzera/pos-schema';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags(' Company')
@ApiBearerAuth('JWT-auth')
@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    // GET /companies
    // ADMIN sees all companies. Anyone else only ever sees their own.
    @Get()
    async findAll(@Req() req: { user: JwtPayload }) {
        const { userType, companyId } = req.user;

        if (userType === 'ADMIN') {
            return this.companyService.findAll();
        }

        const company = await this.companyService.findOne(companyId);
        return [company];
    }

    // GET /companies/:id
    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: { user: JwtPayload },
    ) {
        const { userType, companyId } = req.user;

        if (userType !== 'ADMIN' && id !== companyId) {
            throw new ForbiddenException('You cannot access another company');
        }

        return this.companyService.findOne(id);
    }

    // POST /companies
    @Post()
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    create(@Body() body: unknown) {
        const dto = CreateCompanySchema.parse(body);
        return this.companyService.create(dto);
    }

    // PUT /companies/:id
    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
        const dto = UpdateCompanySchema.parse(body);
        return this.companyService.update(id, dto);
    }

    // DELETE /companies/:id
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.companyService.remove(id);
    }
}