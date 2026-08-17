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
import { RolesService } from './roles.service';
import {
    CreateRoleSchema,
    UpdateRoleSchema,
    CreateAuthoritySchema,
    AssignAuthoritySchema,
} from '@ryzera/pos-schema';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    // ─── Roles ────────────────────────────────────────────

    // GET /roles
    @Get('roles')
    findAllRoles() {
        return this.rolesService.findAllRoles();
    }

    // GET /roles/:id
    @Get('roles/:id')
    findOneRole(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOneRole(id);
    }

    // POST /roles
    @Post('roles')
    createRole(@Body() body: unknown) {
        const dto = CreateRoleSchema.parse(body);
        return this.rolesService.createRole(dto);
    }

    // PUT /roles/:id
    @Put('roles/:id')
    updateRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: unknown,
    ) {
        const dto = UpdateRoleSchema.parse(body);
        return this.rolesService.updateRole(id, dto);
    }

    // DELETE /roles/:id
    @Delete('roles/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteRole(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.deleteRole(id);
    }

    // ─── Authorities ──────────────────────────────────────

    // GET /authorities
    @Get('authorities')
    findAllAuthorities() {
        return this.rolesService.findAllAuthorities();
    }

    // POST /authorities
    @Post('authorities')
    createAuthority(@Body() body: unknown) {
        const dto = CreateAuthoritySchema.parse(body);
        return this.rolesService.createAuthority(dto);
    }

    // DELETE /authorities/:id
    @Delete('authorities/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteAuthority(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.deleteAuthority(id);
    }

    // ─── Assign Authority to Role ─────────────────────────

    // POST /roles/:id/authorities
    @Post('roles/:id/authorities')
    assignAuthority(
        @Param('id', ParseIntPipe) roleId: number,
        @Body() body: unknown,
    ) {
        const dto = AssignAuthoritySchema.parse(body);
        return this.rolesService.assignAuthority(roleId, dto.authorityId);
    }

    // DELETE /roles/:id/authorities/:authorityId
    @Delete('roles/:id/authorities/:authorityId')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeAuthority(
        @Param('id', ParseIntPipe) roleId: number,
        @Param('authorityId', ParseIntPipe) authorityId: number,
    ) {
        return this.rolesService.removeAuthority(roleId, authorityId);
    }
}