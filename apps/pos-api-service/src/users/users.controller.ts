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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
    CreateUserSchema,
    UpdateUserSchema,
    AssignRoleSchema,
    UserFilterSchema,
    JwtPayload,
} from '@ryzera/pos-schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)   // ← JWT + Roles දෙකම
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // POST /users  — ADMIN only
    @Post()
    @Roles('ADMIN')
    async create(@Body() body: unknown) {
        const dto = CreateUserSchema.parse(body);
        return this.usersService.create(dto);
    }

    // GET /users  — ADMIN, MANAGER
    @Get()
    @Roles('ADMIN', 'MANAGER')
    async findAll(@Query() query: unknown) {
        const filters = UserFilterSchema.parse(query);
        return this.usersService.findAll(filters);
    }

    // GET /users/:id  — ADMIN, MANAGER
    @Get(':id')
    @Roles('ADMIN', 'MANAGER')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    // PUT /users/:id  — ADMIN only
    @Put(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: unknown,
    ) {
        const dto = UpdateUserSchema.parse(body);
        return this.usersService.update(id, dto);
    }

    // DELETE /users/:id  — ADMIN only
    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    // POST /users/:id/roles  — ADMIN only
    @Post(':id/roles')
    @Roles('ADMIN')
    async assignRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: unknown,
    ) {
        const dto = AssignRoleSchema.parse(body);
        return this.usersService.assignRole(id, dto.roleId);
    }

    // DELETE /users/:id/roles/:roleId  — ADMIN only
    @Delete(':id/roles/:roleId')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeRole(
        @Param('id', ParseIntPipe) id: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ) {
        return this.usersService.removeRole(id, roleId);
    }

    // GET /users/:id/logs  — ADMIN, MANAGER
    @Get(':id/logs')
    @Roles('ADMIN', 'MANAGER')
    async getLogs(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.getLogs(id);
    }

    // GET /users/me  — any logged user
    @Get('me/profile')
    async getMyProfile(@CurrentUser() user: JwtPayload) {
        return this.usersService.findOne(user.userId);
    }
}