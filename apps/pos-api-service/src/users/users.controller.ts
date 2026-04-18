import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    // POST /users  → Admin only
    @Roles('ADMIN')
    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    // GET /users  → Admin only
    @Roles('ADMIN')
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    // GET /users/:id  → Admin only
    @Roles('ADMIN')
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.usersService.findOne(id);
    }

    // PATCH /users/:id  → Admin only
    @Roles('ADMIN')
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    // PATCH /users/:id/role  → Admin only
    @Roles('ADMIN')
    @Patch(':id/role')
    assignRole(@Param('id') id: number, @Body('role') role: string) {
        return this.usersService.assignRole(id, role);
    }

    // DELETE /users/:id  → Soft deactivate, Admin only
    @Roles('ADMIN')
    @Delete(':id')
    deactivate(@Param('id') id: number) {
        return this.usersService.deactivate(id);
    }

    // GET /users/:id/logs  → Admin only
    @Roles('ADMIN')
    @Get(':id/logs')
    getLogs(@Param('id') id: number) {
        return this.usersService.getUserLogs(id);
    }
}