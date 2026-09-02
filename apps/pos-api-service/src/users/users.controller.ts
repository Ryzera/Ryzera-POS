import {
    Controller, Get, Post, Put, Delete,
    Body, Param, Query, Req, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiResponse,
    ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { JwtPayload } from '@ryzera/pos-schema';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Roles('ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Create new user — ADMIN, or MANAGER (own branch, CASHIER/INVENTORY_MANAGER only)' })
    @ApiResponse({ status: 201, description: 'User created' })
    @ApiResponse({ status: 409, description: 'Username already exists' })
    async create(@Body() body: any, @Req() req: { user: JwtPayload }) {
        return this.usersService.create(body, req.user);
    }

    @Get()
    @Roles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER')
    @ApiOperation({ summary: 'Get All Users — ADMIN sees all, MANAGER/INVENTORY_MANAGER restricted to own branch (INVENTORY_MANAGER is read-only)' })
    @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
    @ApiQuery({ name: 'branch_id', required: false, type: 'number' })
    @ApiResponse({ status: 200, description: 'Users list' })
    async findAll(@Query() query: any, @Req() req: { user: JwtPayload }) {
        const scopedQuery =
            req.user.userType !== 'ADMIN'
                ? { ...query, branch_id: req.user.branchId }
                : query;
        return this.usersService.findAll(scopedQuery);
    }

    @Get('me/profile')
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile() {
        return { message: 'Profile endpoint' };
    }

    @Get(':id')
    @Roles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER')
    @ApiOperation({ summary: 'Get user by ID — MANAGER/INVENTORY_MANAGER restricted to own branch (INVENTORY_MANAGER is read-only)' })
    @ApiParam({ name: 'id', type: 'number' })
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: { user: JwtPayload },
    ) {
        return this.usersService.findOneScoped(id, req.user);
    }

    @Put(':id')
    @Roles('ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Update user — ADMIN, or MANAGER (own branch only)' })
    @ApiParam({ name: 'id', type: 'number' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
        @Req() req: { user: JwtPayload },
    ) {
        await this.usersService.findOneScoped(id, req.user); // throws if out of scope
        return this.usersService.update(id, body);
    }

    @Delete(':id')
    @Roles('ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Delete user — ADMIN, or MANAGER (own branch only)' })
    @ApiParam({ name: 'id', type: 'number' })
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: { user: JwtPayload },
    ) {
        await this.usersService.findOneScoped(id, req.user); // throws if out of scope
        return this.usersService.remove(id);
    }

    @Post(':id/roles')
    @Roles('ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Assign role to user' })
    @ApiParam({ name: 'id', type: 'number' })
    async assignRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
        @Req() req: { user: JwtPayload },
    ) {
        return this.usersService.assignRole(id, body.roleId, req.user);
    }

    @Delete(':id/roles/:roleId')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Remove role from user' })
    async removeRole(
        @Param('id', ParseIntPipe) id: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ) {
        return this.usersService.removeRole(id, roleId);
    }

    @Get(':id/logs')
    @Roles('ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Get user audit logs — MANAGER restricted to own branch' })
    @ApiParam({ name: 'id', type: 'number' })
    async getLogs(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: { user: JwtPayload },
    ) {
        await this.usersService.findOneScoped(id, req.user); // throws if out of scope
        return this.usersService.getLogs(id);
    }
}